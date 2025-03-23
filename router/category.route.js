const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer')
const auth = require('../middleware/auth')
const { createCategory } = require('../controller/category.controller')


router.post('/createcategory',auth,upload.single("image"),createCategory)



module.exports = router