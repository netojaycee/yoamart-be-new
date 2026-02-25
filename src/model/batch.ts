import { Model, model, Schema, Types } from "mongoose";

interface BatchDocument {
    productId: Types.ObjectId;
    expiryDate: Date;
    productionDate?: Date;
    quantityTotal: number;
    quantityAvailable: number;
    status: "ACTIVE" | "NEAR_EXPIRY" | "EXPIRED" | "REMOVED" | "DISPOSED_RETURNED";
    createdAt?: Date;
    updatedAt?: Date;
}

const batchSchema = new Schema<BatchDocument>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    productionDate: {
        type: Date,
    },
    quantityTotal: {
        type: Number,
        required: true,
    },
    quantityAvailable: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "NEAR_EXPIRY", "EXPIRED", "REMOVED", "DISPOSED_RETURNED"],
        default: "ACTIVE",
    },
}, { timestamps: true });

export default model<BatchDocument>("Batch", batchSchema) as Model<BatchDocument>;
