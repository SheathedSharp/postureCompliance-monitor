const express = require('express')
const router = express.Router()
const auth = require('../../utils/auth')
const query = require("../../utils/mysql")

router.post('/patientlist', function(req, res){
    new Promise((resolve, reject)=>{
        query("select * from patient", function(err, data){
            if(data){
                resolve(data)                
            }
            else{
                reject(err)
            }
        })
    })
    .then((e)=>{
        res.end(JSON.stringify({data: e, code: 1, msg: "success"}))
    }, (e)=>{
        res.end(JSON.stringify({data: e, code: 0, msg: "err"}))
    })
})
router.post('/patientdetail', function(req, res){
    var id = req.body.patientid
    new Promise((resolve, reject)=>{
        query(`select * from patient where id = "${id}"`, function(err, data){
            // console.log(data[0])
            if(data[0]){
                resolve(data[0])
            }
            else{
                reject(err)
            }
        })
    })
    .then((e)=>{
        res.end(JSON.stringify({data: e, code: 1, msg: "success"}))
    }, (e)=>{
        res.end(JSON.stringify({data: e, code: 0, msg: "err"}))
    })
})
module.exports = router