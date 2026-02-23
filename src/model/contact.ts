import { Model, model, ObjectId, Schema } from "mongoose";

interface Contacts {
    _id: ObjectId;
    name: string;
    subject: string;
    message: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema = new Schema<Contacts>({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }

}, { timestamps: true });

export default model("Contact", contactSchema) as Model<Contacts>;