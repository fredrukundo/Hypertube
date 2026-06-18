const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        /*
        console.log("EMAIL SENDING:");
        console.log("To:", to);
        console.log("Subject:", subject);
        */

        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html,
        });

        //console.log("EMAIL SENT SUCCESSFULLY:", info.messageId);

        return info;

    } catch (error) {
        //console.log("EMAIL ERROR:", error);
        //throw error;
    }
};

module.exports = { sendEmail };