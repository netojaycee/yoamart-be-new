import { Model, model, ObjectId, Schema } from "mongoose";

interface Newsletters {
    _id: ObjectId;

    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const newsletterSchema = new Schema<Newsletters>({

    email: {
        type: String,
        required: true
    }

}, { timestamps: true });

export default model("Newsletter", newsletterSchema) as Model<Newsletters>;