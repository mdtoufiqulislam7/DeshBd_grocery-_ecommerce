const express = require('express')
const auth = require('../middleware/auth')
const { createUserAddress, getUserAddress } = require('../controller/address.controller')
const router = express.Router()


router.post('/address/postaddress',auth,createUserAddress)
router.get('/address/getaddress',auth,getUserAddress)

module.exports = router