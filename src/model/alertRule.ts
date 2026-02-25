import { Model, model, Schema } from "mongoose";

interface AlertRuleDocument {
    ruleName: string;
    daysBeforeExpiry: number;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const alertRuleSchema = new Schema<AlertRuleDocument>({
    ruleName: {
        type: String,
        unique: true,
        required: true,
    },
    daysBeforeExpiry: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default model<AlertRuleDocument>("AlertRule", alertRuleSchema) as Model<AlertRuleDocument>;
