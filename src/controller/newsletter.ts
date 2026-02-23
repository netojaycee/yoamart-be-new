import newsletter from "#/model/newsletter";
import axios from "axios";
import { RequestHandler } from "express";

export const createNewsletter: RequestHandler = async (req, res) => {
    try {
        const { email, captcha } = req.body;
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captcha}`
        );

        if (!response.data.success) {
            return res.status(403).json({ message: "Invalid captcha" })
        }
        // Save the message to the Contact model
        const newNewsletter = new newsletter({ email });
        await newNewsletter.save();

        

        res.status(200).json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing:", error);
        res.status(500).json({ message: "Failed to subscribe" });
    }
};
