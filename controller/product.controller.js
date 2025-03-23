const productModel = require('../models/product')
const userModel = require('../models/user')


exports.createProduct= async(req,res)=>{
    try {
        userId = req.userId
        const {} = req.body
    } catch (error) {
        return res.status(500).json({
            message:error.massege || error,
            error:true,
            success:false
        })
    }
}