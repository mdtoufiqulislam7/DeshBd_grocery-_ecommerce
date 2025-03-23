const sendEmail = require("../config/sendEmail");
const UserModel =require("../models/user");

const bcrypt = require("bcryptjs");
const verifyEmailTemplate = require("../utilis/verifyEmailTemplae");
const generateAccessToken = require("../utilis/genarateRefreshToken");
const generateRefreshToken = require("../utilis/genarateRefreshToken");
const uploadImageCloudnary = require("../utilis/uploadImage");
const generatedOtp = require("../utilis/generateOtp");
const forgotPasswordTemplate = require("../utilis/forgetPasswordTemplate");

// user registation Controller
exports.registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input fields
        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({
                message: "Provide email, name, and password",
                error: true,
                success: false
            });
        }

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists",
                error: true,
                success: false
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user payload
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword
        });

        // Save user to the database
        const savedUser = await newUser.save();

        // Generate verification email URL
        const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser?._id}`;

        // Send verification email
        const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "Verify email from DeshBd",
            html : verifyEmailTemplate({
                name,
                url :verifyEmailUrl
            })
        })

        if (!verifyEmail) {
            return res.status(500).json({
                message: "User registered, but email sending failed",
                error: true,
                success: false
            });
        }

        // Success response
        return res.status(201).json({
            message: "User registration successful",
            data: savedUser,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};
// email verification controller 
exports.verifyEmailController = async (req,res)=>{

    const {code}= req.body

    const code_varify = await UserModel.findOne({_id:code})
    if(!code_varify){
        res.status(400).json({
            message:"invalid code",
            error:true,
            success:false
        })
    }

    const updateUser = await UserModel.updateOne({_id:code},{
        verify_email:true
    })

    return res.status(200).json({
        message:"verify successfully",
        data:updateUser
    })
}
// User Login Controller 
exports.loginUserController = async(req,res)=>{

   try {

    
    const {email,password} = req.body;

    if ( !email?.trim() || !password?.trim()) {
        return res.status(400).json({
            message: "Provide email  and password",
            error: true,
            success: false
        });
    }

    const user = await UserModel.findOne({email})
    if(!user){
        res.status(400).json({
            message:"user not found",
            error:true,
            success:false
        })
    }

    if(user.status !== 'active'){
        res.status(401).json({
            message:"Contact to Admin",
            error:true,
            success:false
        })
    }

    const checkpassword = await bcrypt.compare(password,user.password)
    if(!checkpassword){
        res.status(403).json({
            message: "check your password",
            error:true,
            success:false
        })

    }

    const accessToken = await generateAccessToken(user._id)
    const refreshToken = await generateRefreshToken(user._id)

    const cookieOption = {
        httpOnly :true,
        secure : true,
        sameSite: 'None'
    }
    res.cookie("accessToken",accessToken,cookieOption);
    res.cookie("refreshToken",refreshToken,cookieOption);

    const saveRefreshCookie = await UserModel.findByIdAndUpdate(user._id,{refresh_token:refreshToken})
    const updateLastDayLogin = await UserModel.findByIdAndUpdate(user?._id,{
        last_login_date : new Date()
    })

    return res.status(200).json({
        message: "Login successfully ",
        error:false,
        success:true,
        data:{
            accessToken,
            refreshToken
        }
    })



   } catch (error) {
    return res.status(500).json({
        message: error.message || error,
        error:true,
        success:false
    })
    
   }
}
exports.userLogout = async(req,res)=>{

    try {
        
        const userid = req.userId //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.clearCookie("accessToken",cookiesOption)
        res.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return res.status(203).json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(501).json({
            message:error.message || error,
            error: true,
            success: false
        })
    }

}
//profile image upload 
exports.uploadProfileImage = async(req,res)=>{

    try {
        const userid = req.userId
        const image = req.file
        const upload = await uploadImageCloudnary(image)

        const uploadimagedata = await UserModel.findByIdAndUpdate(userid ,{
            avater:upload.url
        })

        return res.status(200).json({
            message:"profile image upload",
            _id:userid,
            profilePicture:upload.url,
            error:false,
            success:true
        })

        
    } catch (error) {
        res.status(400).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}
//userDetaisUpdate
exports.userUpdateDetails = async(req,res)=>{
    try {
        const userId = req.userId
    const {name,email,password,mobile}=req.body
    let hashedPassword = ""
    if(password){
        hashedPassword = await bcrypt.hash(password, 10); 
    }
    const updateuser = await UserModel.findByIdAndUpdate(userId,{
        ...(name && {name:name}),
        ...(email && {email:email}),
        ...(password && {password:hashedPassword}),
        ...(mobile && {mobile:mobile}),
        
    })

    return res.status(201).json({
        message: "update succcessfully ",
        data:updateuser
    })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            success:false
        })
    }
}
//forgetPassword
exports.userForgetPassword = async(req,res)=>{

   try {
    const {email}= req.body
    const user = await UserModel.findOne({email})

    if(!user){
        return res.json({
            message:"invalid Email ",
            error:true,
            success:false
        })
    }
    
    const otp = generatedOtp()
    const expireTime = new Date() + 60*60*1000 

    const updateuser = await UserModel.findByIdAndUpdate(user._id,{
        forgot_password_otp:otp,
        forgot_password_expiry:expireTime
    })

    await sendEmail({
        sendTo : email,
        subject : "Forget Password OTP from DeshBd",
        html : forgotPasswordTemplate({
                name:user.name,
                otp:otp
            })
    })

    return res.status(201).json({
        message:"otp send successfully"
    })
   } catch (error) {

    return res.status(500).json({
        message: error.message || error,
        error:true,
        success: false
    })
    
   }

   

}
//forgetpasswordOtp verify
exports.verifyForgetPasswordOtp = async(req,res)=>{
    try {
        const {email,otp} = req.body

        if(!email && !otp){
            return res.status(400).json({
                message: "requied to give email and otp"
            })
        }
        const user = await UserModel.findOne({email})
        if(!user){

            return res.status(401).json({
                message:"this email not found ",
                error:true,
                success:false
            })
      
        }
        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}
//reset password
exports.resetPassword = async(req,res)=>{
    try {
        const {email,Newpassword,ConfimPassword} = req.body
        if(!email && !Newpassword && !ConfimPassword){
            return res.status(401).json({
                message:"require to email password confirmpassword",
                error:true,
                success:false
            })
        }
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(402).json({
                message:"email not found",
                error:true,
                success:false
            })
        }
        if(Newpassword !== ConfimPassword){
            return res.status(402).json({
                message:"new password and confirmpassword not same",
                error:true,
                success:false
            })
        }


        const  hashedPassword = await bcrypt.hash(Newpassword, 10);
        const update = await UserModel.findByIdAndUpdate(user._id,{
            password:hashedPassword
        })

        return res.status(201).json({
            message:"updated user password ",
            error:false,
            success:true
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}
//user Details 
exports.userDetails = async(req,res)=>{
    try {
        const userId = req.userId
        const userDetails = await UserModel.findById(userId).select('-password -refresh_token')
        return res.json({
            message : 'user details',
            data : userDetails,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}
