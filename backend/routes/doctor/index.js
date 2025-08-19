const express = require('express')
const router = express.Router()
const userRouter = require('./user')
const patientRouter = require('./patient')
const recordRouter = require('./record')
const chatRouter = require('./chat')

router.use("/user", userRouter)
router.use("/patient", patientRouter)
router.use("/record", recordRouter)
router.use("/chat", chatRouter)

module.exports = router