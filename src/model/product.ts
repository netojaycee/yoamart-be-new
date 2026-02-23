import { Model, model, Schema, Types } from "mongoose";

interface ProductDocument{
    // _id: Types.ObjectId;
    name: string;
    categoryId: Types.ObjectId;
    brandId: Types.ObjectId;
    image: string[];
    price: number;
    quantity: number;
    description: string;
    topSelling: number;
    discount: number;
    isFeatured: boolean;
    isHot: boolean;
    inStock: boolean
}

const productSchema = new Schema<ProductDocument>({
    name:{
        type: String,
        required: true,
    },
    categoryId:{
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
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
    quantity:{
        type: Number,
        required: true,
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
    }
}, {timestamps: true});

export default model("Product", productSchema) as Model<ProductDocument>;
