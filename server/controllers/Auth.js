const OTP = require('../models/Otp');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const otpGenerator = require('otp-generator');
const becrypt = require('bcrypt');
const {mailSender} = require('../utils/mailSender');
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
require('dotenv').config();

const generateOtp = async() =>{
    const otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    });
    
}

const sendotp = async(req,res,next)=>{
    try{
        const {email} = req.body;
        console.log(email);

        const isUserExist = await User.findOne({email:email});
        if(isUserExist){
            return res.status(401).json({
                success:false,
                message:"User with this email already exists"
            })
        }

        const otp = await generateOtp();

        await OTP.create({email,otp});
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp:otp
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending otp"
        })
    }
}