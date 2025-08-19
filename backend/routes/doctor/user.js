const express = require('express')
const router = express.Router()
const md5 = (value)=>require('crypto').createHash("md5").update(value).digest("hex")
const auth = require('../../utils/auth')
// const connection = require("../../database")
const query = require("../../utils/mysql")

// 医护人员注册接口
router.post("/signup", function(req, res){
    console.log(req.body)
    console.log(md5(req.body.password))
    // 创建新的用户数据
    var doctor = {
        phone: req.body.phone,
        password: md5(req.body.password)
    }
    // 插入数据库
    new Promise((resolve, reject)=>{
        query(`select * from doctor where phone = "${doctor.phone}" limit 1`, (err, data)=>{
            console.log(err, data)
            if(data.length > 0) reject("手机号已注册")
            else resolve()
        })
    })
    .then((e)=>{
        query(`insert into doctor (phone, password) values ("${doctor.phone}", "${doctor.password}")`, (err, data)=>{
            console.log(err, data)
            if(err) Promise.reject(err)
            else Promise.resolve(data)
        })
    })
    // 完成后
    .then((e)=>{
        res.end(JSON.stringify({code: 1, msg: "注册成功"}))
    }, (e)=>{
        res.end(JSON.stringify({code: 0, msg: "注册失败"+JSON.stringify(e)}))
    })
})
// 医护人员登录接口
router.post("/signin", function(req, res){
    console.log(req.body)
    console.log(md5(req.body.password))
    // 创建新的用户数据
    var doctor = {
        phone: req.body.phone,
        password: md5(req.body.password)
    }
    // 搜索数据库
    new Promise((resolve, reject)=>{
        query(`select * from doctor where phone = "${doctor.phone}" and password = "${doctor.password}" limit 1`, (err, data)=>{
            console.log(err, data)
            if(data.length > 0){
                res.end(JSON.stringify({code: 1, msg: "登录成功", data: {token: auth.enToken(data[0].id)}}))
            }
            else{
                res.end(JSON.stringify({code: 0, msg: "登录失败"}))
            }
        })
    })
})
router.post("/valid", function(req, res){
    console.log(req.body)
    let token = req.body.token
    let data = auth.deToken(token)
    if(!data){
        res.end(JSON.stringify({code: 0, msg: "token验证失败"}))
    }
    else if(data == 2){
        res.end(JSON.stringify({code: 2, msg: "登录凭证过期,请重新登录"}))
    }
    else{
        res.end(JSON.stringify({code: 1, msg: "token验证成功", data}))
    }
})
router.post("/info", function(req, res){
    console.log(req.body)
    let token = req.body.token
    let data = auth.deToken(token)
    if(!data){
        res.end(JSON.stringify({code: 0, msg: "token验证失败"}))
    }
    else if(data == 2){
        res.end(JSON.stringify({code: 2, msg: "登录凭证过期,请重新登录"}))
    }
    else{
        // "data": {
        //     "id": 14,
        //     "time": 1658593910863
        // }
        new Promise((resolve, reject)=>{
            query(`select * from doctor where id = ${data.id}`, (err, data)=>{
                if(data.length > 0){
                    resolve(data[0])
                }
                else{
                    reject({err, data})
                }
            })
        })
        .then((e)=>{
            res.send({data: e})
            res.end()
        }, (e)=>{
            res.send({data: e})
            res.end()
        })
    }
})
router.post("/tokentest", function(req, res){
    console.log(req.body)
    let token = req.body.token
    let data = auth.deToken(token)
    if(!data){
        res.end(JSON.stringify({code: 0, msg: "token验证失败"}))
    }
    else if(data == 2){
        res.end(JSON.stringify({code: 2, msg: "登录凭证过期,请重新登录"}))
    }
    else{
        res.end(JSON.stringify({code: 1, msg: "token验证成功", data}))
    }
})

module.exports = router