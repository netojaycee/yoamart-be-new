import { ObjectId, Schema, model } from "mongoose";

interface DriverDocument {
    _id: ObjectId;
    name: string;
    phone: string;
}

const driverSchema = new Schema<DriverDocument>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
}, { timestamps: true })

const DriverModel = model("Driver", driverSchema)
export default DriverModel;