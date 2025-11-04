const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async(email, title, body) => {
    console.log(email,title,body);
    console.log(process.env.MAIL_HOST, process.env.MAIL_USER, process.env.MAIL_PASS);

    try{
        const transproter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_HOST,
                pass: process.env.MAIL_PASS
            }
        });
        let info = await transproter.sendMail({
            from: `Roomly`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        return info;
    }
    catch(error){
        console.log(`Error in Sending Mail: `,error);
    }
}

module.exports = {mailSender};