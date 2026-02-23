import contact from "#/model/contact";
import { contactAdminEmail } from "#/utils/mail";
import axios from "axios";
import { RequestHandler } from "express";

export const createContact: RequestHandler = async (req, res) => {
    try {
        const { name, email, subject, message, captcha } = req.body;
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captcha}`
        );

        if (!response.data.success) {
            return res.status(403).json({ message: "Invalid captcha" })
        }
        // Save the message to the Contact model
        const newContact = new contact({ name, email, subject, message });
        await newContact.save();

        await contactAdminEmail(name, email, subject, message);


        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
