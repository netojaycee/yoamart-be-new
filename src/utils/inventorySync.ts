// @ts-nocheck
import Batch from "#/model/batch";
import Product from "#/model/product";

/**
 * Calculate and update product quantity based on sum of all ACTIVE batches
 * This is the source of truth for inventory
 */
export async function updateProductQuantityFromBatches(productId: string) {
    try {
        const batches = await Batch.find({
            productId,
            status: "ACTIVE",
        });

        const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { quantity: totalQuantity },
            { new: true }
        );

        console.log(`✅ Product ${productId} quantity updated to ${totalQuantity}`);
        return updatedProduct;
    } catch (error) {
        console.error(`❌ Error updating product quantity for ${productId}:`, error);
        throw error;
    }
}

/**
 * Reduce product inventory using FEFO (First Expired, First Out) approach
 * Takes items from the oldest expiring batch first
 */
export async function reduceInventoryFEFO(productId: string, quantityToReduce: number) {
    try {
        // Get all ACTIVE batches sorted by expiry date (oldest first)
        const batches = await Batch.find({
            productId,
            status: "ACTIVE",
        }).sort({ expiryDate: 1 });

        if (batches.length === 0) {
            throw new Error(`No active batches found for product ${productId}`);
        }

        let remainingQtyToReduce = quantityToReduce;
        const batchesUpdated: any[] = [];

        // Iterate through batches from oldest expiring to newest
        for (const batch of batches) {
            if (remainingQtyToReduce <= 0) break;

            // Determine how much to take from this batch
            const reduceFromBatch = Math.min(remainingQtyToReduce, batch.quantityAvailable);

            // Update batch quantity
            batch.quantityAvailable -= reduceFromBatch;

            // If batch is now empty, mark as REMOVED
            if (batch.quantityAvailable === 0) {
                batch.status = "REMOVED";
            }

            await batch.save();
            batchesUpdated.push({
                batchId: batch._id,
                quantityReduced: reduceFromBatch,
                newQuantity: batch.quantityAvailable,
                newStatus: batch.status,
            });

            remainingQtyToReduce -= reduceFromBatch;
        }

        // Update product quantity from remaining ACTIVE batches
        await updateProductQuantityFromBatches(productId);

        console.log(`✅ FEFO Reduction: Product ${productId}, ${quantityToReduce} units removed`);

        return {
            productId,
            totalReduced: quantityToReduce,
            batchesAffected: batchesUpdated,
        };
    } catch (error) {
        console.error(`❌ Error reducing inventory with FEFO:`, error);
        throw error;
    }
}

/**
 * Get inventory summary for a product (including batch breakdown)
 */
export async function getProductInventorySummary(productId: string) {
    try {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        const batches = await Batch.find({ productId }).sort({ expiryDate: 1 });

        const summary = {
            productId,
            productName: product.name,
            totalQuantity: product.quantity,
            batches: batches.map((b) => ({
                batchId: b._id,
                expiryDate: b.expiryDate,
                quantityAvailable: b.quantityAvailable,
                status: b.status,
            })),
            activeBatches: batches.filter((b) => b.status === "ACTIVE").length,
            nearExpiryBatches: batches.filter((b) => b.status === "NEAR_EXPIRY").length,
            expiredBatches: batches.filter((b) => b.status === "EXPIRED").length,
        };

        return summary;
    } catch (error) {
        console.error(`❌ Error getting inventory summary:`, error);
        throw error;
    }
}
