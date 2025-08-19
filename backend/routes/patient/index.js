const express = require('express')
const router = express.Router()
const userRouter = require('./user')
const recordRouter = require('./record')

router.use("/user", userRouter)
router.use("/record", recordRouter)

module.exports = router