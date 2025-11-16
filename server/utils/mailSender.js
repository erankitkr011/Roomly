const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async(email, title, body) => {
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        let info = await transporter.sendMail({
            from: `Roomly <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        console.log("Email sent successfully:", info.messageId);
        return info;
    }
    catch(error){
        console.log(`Error in Sending Mail: `,error);
        throw error;
    }
}

module.exports = {mailSender};