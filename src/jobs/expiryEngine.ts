// @ts-nocheck
import Batch from "#/model/batch";
import Alert from "#/model/alert";
import AlertRule from "#/model/alertRule";
import Notification from "#/model/notification";
import { updateProductQuantityFromBatches } from "#/utils/inventorySync";

/**
 * Calculate days between two dates
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  const diffMs = time1 - time2;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Main expiry engine function - runs via cron job
 * Updates batch statuses and creates alerts based on expiry dates and rules
 */
export async function runExpiryEngine() {
  try {
    console.log("🔄 Expiry Engine: Starting... " + new Date().toISOString());

    // Get all active alert rules
    const alertRules = await AlertRule.find({ active: true });
    if (alertRules.length === 0) {
      console.log("⚠️  No active alert rules found. Creating default...");
      const defaultRule = new AlertRule({
        ruleName: "Default",
        daysBeforeExpiry: 3,
        active: true,
      });
      await defaultRule.save();
      alertRules.push(defaultRule);
    }

    // Get all batches that need checking (ACTIVE, NEAR_EXPIRY, EXPIRED)
    const batches = await Batch.find({
      status: { $in: ["ACTIVE", "NEAR_EXPIRY", "EXPIRED"] },
    }).populate("productId");

    console.log(`📦 Found ${batches.length} batches to process`);

    let batchesUpdated = 0;
    let alertsCreated = 0;
    const productsToSync = new Set<string>();

    for (const batch of batches) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysToExpiry = getDaysDifference(batch.expiryDate, today);

      // Determine new batch status
      let newStatus = batch.status;

      if (daysToExpiry < 0) {
        newStatus = "EXPIRED";
      } else if (daysToExpiry <= 3) {
        // Default threshold, can be customized per rule
        newStatus = "NEAR_EXPIRY";
      } else {
        newStatus = "ACTIVE";
      }

      // Update batch status if changed
      if (newStatus !== batch.status) {
        await Batch.findByIdAndUpdate(batch._id, { status: newStatus });
        productsToSync.add(batch.productId.toString()); // Mark product for sync
        batchesUpdated++;
        console.log(
          `📊 Batch ${batch._id.toString().slice(0, 8)}: ${batch.status} → ${newStatus} (${daysToExpiry} days)`,
        );
      }

      // Check if we should create an alert
      for (const rule of alertRules) {
        const shouldAlert =
          (newStatus === "NEAR_EXPIRY" &&
            daysToExpiry <= rule.daysBeforeExpiry) ||
          (newStatus === "EXPIRED" && daysToExpiry < 0);

        if (shouldAlert) {
          // Check if recent alert already exists (dedup within 24 hours)
          const recentAlert = await Alert.findOne({
            batchId: batch._id,
            ruleId: rule._id,
            createdAt: {
              $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          });

          if (!recentAlert) {
            // Create new alert
            const alert = await Alert.create({
              batchId: batch._id,
              ruleId: rule._id,
              alertType: newStatus === "EXPIRED" ? "EXPIRED" : "NEAR_EXPIRY",
              alertDate: new Date(),
              acknowledged: false,
            });

            // Create notification records for each channel (EMAIL, IN_APP)
            await Notification.create([
              {
                alertId: alert._id,
                channel: "EMAIL",
                status: "PENDING",
              },
              {
                alertId: alert._id,
                channel: "IN_APP",
                status: "PENDING",
              },
            ]);

            alertsCreated++;
            console.log(
              `🚨 Alert created: ${alert.alertType} for batch ${batch._id.toString().slice(0, 8)}`,
            );
          }
        }
      }
    }
    // Auto-sync product quantities for all affected products
    for (const productId of productsToSync) {
      await updateProductQuantityFromBatches(productId);
    }

    console.log(`✅ Expiry Engine Complete:`);
    console.log(`   📊 Batches updated: ${batchesUpdated}`);
    console.log(`   🚨 Alerts created: ${alertsCreated}`);
    console.log(`   📦 Products synced: ${productsToSync.size}`);
    console.log(`   ⏰ Finished at: ${new Date().toISOString()}`);

    return {
      batchesUpdated,
      alertsCreated,
      productsSynced: productsToSync.size,
    };
  } catch (error) {
    console.error("❌ Expiry Engine Error:", error);
    throw error;
  }
}

/**
 * Get summary of expiry status across all batches
 */
export async function getExpirySummary() {
  try {
    const summary = {
      total: await Batch.countDocuments(),
      active: await Batch.countDocuments({ status: "ACTIVE" }),
      nearExpiry: await Batch.countDocuments({ status: "NEAR_EXPIRY" }),
      expired: await Batch.countDocuments({ status: "EXPIRED" }),
      removed: await Batch.countDocuments({ status: "REMOVED" }),
      disposed: await Batch.countDocuments({ status: "DISPOSED_RETURNED" }),
    };

    return summary;
  } catch (error) {
    console.error("❌ Error getting expiry summary:", error);
    throw error;
  }
}
