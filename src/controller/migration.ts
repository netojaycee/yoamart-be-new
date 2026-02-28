// @ts-nocheck
import { RequestHandler } from "express";
import Product from "#/model/product";

/**
 * Admin-only endpoint to migrate product types
 * POST /api/product/migrate-types
 * 
 * This endpoint updates all products without a 'type' field to type: "regular"
 * Only accessible by admins
 */
export const migrateProductTypes: RequestHandler = async (req, res) => {
    try {
        console.log("🔗 Starting product type migration...");

        // Get count of products without type field
        const productsWithoutType = await Product.countDocuments({
            type: { $exists: false },
        });

        console.log(`📊 Found ${productsWithoutType} products without type field`);

        if (productsWithoutType === 0) {
            return res.status(200).json({
                message: "✅ All products already have type field. No migration needed.",
                productsUpdated: 0,
                productsWithType: await Product.countDocuments({ type: { $exists: true } }),
                totalProducts: await Product.countDocuments(),
            });
        }

        // Update all products without type to type: "regular"
        const result = await Product.updateMany(
            { type: { $exists: false } },
            { $set: { type: "regular" } }
        );

        // Verify the update
        const totalProducts = await Product.countDocuments();
        const productsWithType = await Product.countDocuments({
            type: { $exists: true },
        });

        console.log(`✅ Migration successful!`);
        console.log(`   - Modified: ${result.modifiedCount} products`);
        console.log(`   - Total products: ${totalProducts}`);
        console.log(`   - Products with type: ${productsWithType}`);

        res.status(200).json({
            message: "✅ Product type migration completed successfully!",
            productsUpdated: result.modifiedCount,
            productsWithType,
            totalProducts,
            success: true,
        });

    } catch (error) {
        console.error("❌ Migration failed:", error);
        res.status(500).json({
            message: "❌ Migration failed",
            error: error.message,
            success: false,
        });
    }
};
