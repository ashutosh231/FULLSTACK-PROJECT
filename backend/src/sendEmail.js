import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"CreatorConnect" <${EMAIL_USER}>`, 
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