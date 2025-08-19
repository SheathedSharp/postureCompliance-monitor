const express = require('express')
const router = express.Router()
const md5 = (value)=>require('crypto').createHash("md5").update(value).digest("hex")
const auth = require('../../utils/auth')
const query = require("../../utils/mysql")
const {formatDate} = require('../../utils/utils')
const axios = require('axios')

const login = async (js_code)=>{
    return await axios("https://api.weixin.qq.com/sns/jscode2session", {
        params: {
            appid: "wx1d82c2e4ef15dbe3",
            secret: "3e657855855f32cb68f7b734ec952c2a",
            js_code,
            grant_type: "authorization_code"
        }
    })
}
const patientCheckIn = (openid)=>{
    return new Promise((resolve, reject)=>{
        query(`select * from patient where openid = "${openid}"`, function(err, data){
            if(data){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    .then(data=>{
        if(data.length > 0){
            return new Promise((resolve, reject)=>{
                query(
                    `UPDATE patient SET lastlogintime=? where openid=?`,
                    [formatDate(new Date(), true), openid],
                    function(err, data){
                        if(data){
                            resolve(data)
                        }else{
                            reject(err)
                        }
                    }
                )
            })
        }else{
            return new Promise((resolve, reject)=>{
                query(
                    `insert into patient (createtime, lastlogintime, openid) values (?, ?, ?)`,
                    [formatDate(new Date(), true), formatDate(new Date(), true), openid],
                    function(err, data){
                        if(data){
                            resolve(data)
                        }else{
                            reject(err)
                        }
                    }
                )
            })
        }
    })
}
const getUserIdByOpenid = (openid)=>{
    return new Promise((resolve, rejcet)=>{
        query(`select * from patient where openid = "${openid}"`, function(err, data){
            if(data && data.length > 0){
                resolve(data[0].id)
            }else{
                reject(err || data.length)
            }
        })
    })
}
// 保存错误日志到数据库
const saveErrorLogToDatabase = (error, timestamp) => {
  // 转换错误信息为JSON字符串
  const errorMessage = JSON.stringify(error);

  return new Promise((resolve, reject) => {
    query(
      `INSERT INTO error_logs (error_message, timestamp) VALUES (?, STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'))`,
      [errorMessage, timestamp],
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};


// 
router.post('/test', function(req, res){
    console.log("success")
    res.end()
})
// 患者小程序登录接口
router.post('/login', function(req, res){
    const js_code = req.body.code
    login(js_code)
    .then(e=>{
        if(e.data.session_key && e.data.openid){
            return e
        }else{
            return Promise.reject(e)
        }
    })
    .then(e=>{
        return patientCheckIn(e.data.openid)
        .then(()=>e)
    })
    .then(e=>{
        return getUserIdByOpenid(e.data.openid)
        .then(id=>{
            return {...e, id}
        })
    })
    .then(e=>{
        let data = {
            ...e.data,
            id: e.id
        }
        res.send({code: 1, data})
    })
    .catch(e=>{
        res.send({code: 0, data: e.data})
    })
    .finally(e=>{
        res.end()
    })
})
router.get('/info', function(req, res){
    const {userid} = req.query
    new Promise((resolve, reject)=>{
        query(`SELECT * FROM patient where id = '${userid}'`, (err, data)=>{
            if(data && data.length){
                resolve(data[0])
            }else{
                reject(err)
            }
        })
    })
    .then(e=>{
        res.send({code: 1, data: e})
    })
    .catch(e=>{
        res.send({code: 0})
    })
    .finally(e=>{
        res.end()
    })
})
router.post('/edit_info', function(req, res){
    const {userid, info} = req.body
    let update_str = ""
    Object.keys(info).forEach(i=>{
        update_str += `${i}='${info[i]}',`
    })
    update_str = update_str.slice(0, -1)
    console.log(`UPDATE patient SET ${update_str} where id = '${userid}'`)
    new Promise((resolve, reject)=>{
        query(`UPDATE patient SET ${update_str} where id = '${userid}'`, (err, data)=>{
            console.log(data)
            if(data){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    .then(e=>{
        res.send({code: 1, data: e})
    })
    .catch(e=>{
        console.log(e)
        res.send({code: 0})
    })
    .finally(e=>{
        res.end()
    })
})

// 小程序端发送错误日志的接口
router.post('/log-error', function (req, res) {
  const { error, timestamp } = req.body;
  // 在这里将错误日志保存到数据库或文件中
  saveErrorLogToDatabase(error, timestamp)
    .then(() => {
      res.status(200).send('Error logged successfully');
    })
    .catch((err) => {
      console.error('Failed to log error:', err);
      res.status(500).send('Failed to log error');
    });
});

// 接受蓝牙已成功连接信息接口
router.post('/bluetooth-conn', function(req, res){
    console.log("success")
    const data = req.body; // 获取请求体中的数据
	console.log(data); // 打印接收到的数据
    res.sent('info is accepted')
})


module.exports = router