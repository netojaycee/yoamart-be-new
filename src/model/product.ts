import { Model, model, Schema, Types } from "mongoose";

interface ProductDocument{
    // _id: Types.ObjectId;
    name: string;
    categoryId?: Types.ObjectId;
    brandId: Types.ObjectId;
    image: string[];
    price: number;
    quantity: number;
    description: string;
    topSelling: number;
    discount: number;
    isFeatured: boolean;
    isHot: boolean;
    inStock: boolean;
    type: "regular" | "perishable";
}

const productSchema = new Schema<ProductDocument>({
    name:{
        type: String,
        required: true,
    },
    categoryId:{
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: false,
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
      },
      image: {
        type: [String],
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    // quantity: Auto-calculated from ACTIVE batches. No longer manually set.
    // When creating product, do NOT send quantity
    // It will be auto-updated when batches are created/updated
    quantity:{
        type: Number,
        default: 0,  // Auto-synced from batches, not manually set
    },
    description:{
        type: String,
        required: true
    },
    topSelling:{
        type: Number,
        default: 0
    },
    discount:{
        type: Number,
        default: 0
    },
    isFeatured:{
        type: Boolean,
        default: false
    },
    isHot:{
        type: Boolean,
        default: false
    },
    inStock:{
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        enum: ["regular", "perishable"],
        default: "regular",
        required: true
    }
}, {timestamps: true});

export default model("Product", productSchema) as Model<ProductDocument>;
