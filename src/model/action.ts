import { Model, model, Schema, Types } from "mongoose";

interface ActionDocument {
    batchId: Types.ObjectId;
    alertId?: Types.ObjectId;
    actionType: "REMOVED_FROM_SHELF" | "DISPOSED" | "RETURNED_TO_SUPPLIER" | "RECOUNTED" | "OTHER";
    quantityAffected: number;
    performedBy: string;
    performedAt: Date;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const actionSchema = new Schema<ActionDocument>({
    batchId: {
        type: Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
    },
    alertId: {
        type: Schema.Types.ObjectId,
        ref: "Alert",
    },
    actionType: {
        type: String,
        enum: ["REMOVED_FROM_SHELF", "DISPOSED", "RETURNED_TO_SUPPLIER", "RECOUNTED", "OTHER"],
        required: true,
    },
    quantityAffected: {
        type: Number,
        required: true,
    },
    performedBy: {
        type: String,
        required: true,
    },
    performedAt: {
        type: Date,
        default: () => new Date(),
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

export default model<ActionDocument>("Action", actionSchema) as Model<ActionDocument>;
