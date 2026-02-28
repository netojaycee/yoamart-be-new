# Product Type Migration Guide

## Overview
This guide explains how to migrate existing products to have the new `type` field that separates regular (website) products from perishable (physical store) products.

## Changes Made

### 1. **Product Model** (`src/model/product.ts`)
- ✅ Added `type` field (enum: "regular" | "perishable")
- ✅ Made `categoryId` optional (not required)
- ✅ Default type: "regular"

### 2. **Product Controller** (`src/controller/product.ts`)
- ✅ `createProduct()` - Accepts `type` field (optional, defaults to "regular")
- ✅ `updateProduct()` - Can update `type` field
- ✅ `getAllProducts()` - Can filter by `type` query parameter

### 3. **Batch Controller** (`src/controller/batch.ts`)
- ✅ `createBatch()` - Validates product is type "perishable" before creation
- ✅ Rejects batch creation for "regular" products

### 4. **Order Controller** (`src/controller/order.ts`)
- ✅ `createOrder()` - Only allows orders for "regular" products
- ✅ Rejects orders for "perishable" products
- ✅ Uses direct quantity reduction (no FEFO for regular products)

---

## Running the Migration

### Prerequisites
- Node.js and npm installed
- `ts-node` available (or install: `npm install -D ts-node`)
- MongoDB connection string in `.env` (MONGO_URI)

### Step 1: Run the Migration Script

```bash
# Using ts-node
npx ts-node scripts/migrateProductTypes.ts
```

Or using npm script (if added to package.json):
```bash
npm run migrate:types
```

### Step 2: Expected Output

```
🔗 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 25 products without type field

✅ Migration successful!
   - Modified: 25 products
   - Matched: 25 products

📈 Verification:
   - Total products: 50
   - Products with type: 50

🎉 All products successfully migrated!

🔌 Disconnected from MongoDB
```

---

## Migration Logic

The script:
1. ✅ Connects to MongoDB using `MONGO_URI` from `.env`
2. ✅ Counts products without a `type` field
3. ✅ Updates all products to `type: "regular"` (existing inventory products)
4. ✅ Verifies all products now have the `type` field
5. ✅ Gracefully disconnects from the database

---

## After Migration

### Creating New Products

**Regular Products (Website):**
```json
{
  "name": "Coca Cola 500ml",
  "price": 2.50,
  "categoryId": "507f1f77bcf86cd799439011",
  "description": "Refreshing cola",
  "image": ["url"],
  "type": "regular"
}
```

**Perishable Products (Physical Store):**
```json
{
  "name": "Fresh Milk",
  "price": 1.50,
  "description": "Pasteurized milk",
  "image": ["url"],
  "type": "perishable"
  // Note: categoryId is OPTIONAL for perishable products
}
```

### Fetching Products

**Website Products Only:**
```
GET /api/product?type=regular
```

**Perishable Products (Admin):**
```
GET /api/product?type=perishable
```

**All Products (Admin):**
```
GET /api/product
```

---

## Troubleshooting

### Script Fails to Connect
- ✅ Verify `MONGO_URI` is set in `.env`
- ✅ Check MongoDB is running and accessible
- ✅ Verify connection string is correct

### No Products Updated
- ✅ All products may already have the `type` field
- ✅ Check your database directly:
  ```bash
  db.products.find({ type: { $exists: false } }).count()
  ```

### Process Hangs
- ✅ It may still be processing large datasets
- ✅ Wait a few minutes for completion
- ✅ Check database logs for issues

---

## Rolling Back (If Needed)

If you need to remove the `type` field and revert:

```bash
# MongoDB shell or client
db.products.updateMany({}, { $unset: { type: "" } })
```

Or modify `scripts/migrateProductTypes.ts` and run a reverse script.

---

## Next Steps

1. ✅ Run the migration script
2. ✅ Test creating regular products (with category)
3. ✅ Test creating perishable products (without category)
4. ✅ Test batch creation (only for perishable)
5. ✅ Test orders (only for regular products)
6. ✅ Update frontend to handle the separation

Happy migrating! 🚀
