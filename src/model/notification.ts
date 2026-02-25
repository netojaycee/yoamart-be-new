import { Model, model, Schema, Types } from "mongoose";

interface NotificationDocument {
    alertId: Types.ObjectId;
    channel: "EMAIL" | "WHATSAPP" | "IN_APP";
    status: "PENDING" | "SENT" | "FAILED";
    sentAt?: Date;
    errorMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const notificationSchema = new Schema<NotificationDocument>({
    alertId: {
        type: Schema.Types.ObjectId,
        ref: "Alert",
        required: true,
    },
    channel: {
        type: String,
        enum: ["EMAIL", "WHATSAPP", "IN_APP"],
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "SENT", "FAILED"],
        default: "PENDING",
    },
    sentAt: {
        type: Date,
    },
    errorMessage: {
        type: String,
    },
}, { timestamps: true });

export default model<NotificationDocument>("Notification", notificationSchema) as Model<NotificationDocument>;
