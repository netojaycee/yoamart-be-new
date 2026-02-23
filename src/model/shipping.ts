import { Model, Schema, model, ObjectId } from "mongoose";

interface Shipping {
    _id: ObjectId;
    orderId: ObjectId;
    driverId: ObjectId;
    deliveryDate: Date;
    shippedDate: Date;
    expectedDeliveryDate: Date;
}

const shippingSchema = new Schema<Shipping>({
    driverId: { type: Schema.Types.ObjectId, required: true, ref: "Driver" },
    deliveryDate: { type: Date, required: false },
    shippedDate: { type: Date, required: false },
    expectedDeliveryDate: { type: Date, required: true },
    orderId: { type: Schema.Types.ObjectId, required: true, ref: "Order" },
}, { timestamps: true });

export default model("Shipping", shippingSchema) as Model<Shipping>;