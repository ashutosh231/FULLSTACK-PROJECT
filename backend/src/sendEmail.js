import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

export const sendEmail = async (to, subject, text) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
        throw new Error("Email configuration missing. Set EMAIL_USER and EMAIL_PASS in .env");
    }
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        await transporter.sendMail({
            from: `"CreatorConnect" <${emailUser}>`, 
            to: to,
            subject: subject,
            text: text
        });
    } catch (error) {
        throw new Error("Failed to send email");
    }
};

// sendEmail("adiashut0@gmail.com", "Test Email", "This is a test email from CreatorConnect").then(() => {
//     console.log("Email sent successfully");
// }).catch((error) => {
//     console.error("Error sending email:", error.message);
// });