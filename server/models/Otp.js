const mongoose = require('mongoose');
const {mailSender} = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            required: true,
            expires: 5*60,
        }
    }
);

const verification = async(email,otp) => {
    try{
        console.log('Sending email to ',email);
        const mailResponse = await mailSender(email, "Verification Email from Roomly", emailTemplate(otp));
        console.log(`Email Sent Successfully!`, mailResponse);
    }
    catch(error){
        console.error("Error occurred while sending mail: ",error.message);
    }
};

otpSchema.pre('save', async function (next){
    try{
        console.log('Preapering to send email to: ', this.email);
        await verification(this.email, this.otp);

        next();
    }
    catch(error){
        console.error("Error in prev-save hook: ", error.message);
        next(error);
    }
})

module.exports = mongoose.model("OTP",otpSchema);