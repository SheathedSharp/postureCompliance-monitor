const express = require('express')
const router = express.Router()
const auth = require('../../utils/auth')
const query = require("../../utils/mysql")
const {formatDate} = require('../../utils/utils')
const queryPromise = function(sql, params){
    return new Promise((resolve, reject)=>{
        if(params)
            query(sql, params, function(err,data){
                // console.log(err,data)
                if(data){
                    resolve(data)
                }else{
                    reject(err)
                }
            })
        else{
            query(sql, function(err,data){
                // console.log(err,data)
                if(data){
                    resolve(data)
                }else{
                    reject(err)
                }
            })
        }
    })
}
router.post('/uploadRecord', function(req, res){
    console.log(req.body)
    const patient_id = Number(req.body.userid)
    const starttime = Number(req.body.starttime)
    const settings = req.body.setting
    const device_id = Number(req.body.device_id)
    const record = JSON.parse(req.body.record)
    if(!patient_id){res.end()}
    new Promise((resolve, reject)=>{
        query(
            'insert into degree_record (patient_id, starttime, stopdetail, settings, device_id) values (?, ?, ?, ?, ?)',
            [
                patient_id,
                formatDate(starttime),
                JSON.stringify([]),
                settings,
                device_id
            ],
            function(err, data){
                if(data){
                    resolve(data.insertId)
                }else{
                    reject(err)
                }
            }
        )
    })
    .then(id=>{
        return queryPromise('begin')
        .then(e=>{
            return id
        })
    })
    .then(async (id)=>{
        for(let i = 0; i < record.length; i++){
            await queryPromise(
                'insert into degree_record_detail (record_id, data) values (?, ?)',
                [
                    id, 
                    JSON.stringify(record[i])
                ]
            )
            if(i % 1000 == 0 || i == record.length - 1){
                await queryPromise('commit')
            }
        }
    })
    .finally(()=>{
        res.end()
    })
})
module.exports = router