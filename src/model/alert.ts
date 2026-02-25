import { Model, model, Schema, Types } from "mongoose";

interface AlertDocument {
    batchId: Types.ObjectId;
    ruleId: Types.ObjectId;
    alertType: "NEAR_EXPIRY" | "EXPIRED";
    alertDate: Date;
    acknowledged: boolean;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const alertSchema = new Schema<AlertDocument>({
    batchId: {
        type: Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
    },
    ruleId: {
        type: Schema.Types.ObjectId,
        ref: "AlertRule",
        required: true,
    },
    alertType: {
        type: String,
        enum: ["NEAR_EXPIRY", "EXPIRED"],
        required: true,
    },
    alertDate: {
        type: Date,
        default: () => new Date(),
    },
    acknowledged: {
        type: Boolean,
        default: false,
    },
    acknowledgedAt: {
        type: Date,
    },
    acknowledgedBy: {
        type: String,
    },
}, { timestamps: true });

export default model<AlertDocument>("Alert", alertSchema) as Model<AlertDocument>;
