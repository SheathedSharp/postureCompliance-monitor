const express = require('express')
const router = express.Router()
const auth = require('../../utils/auth')
const query = require("../../utils/mysql")
const {formatDate} = require('../../utils/utils')
const ExcelJS = require('exceljs');

router.post('/recordlist', function(req, res){
    let patient_id = req.body.patientid
    new Promise((resolve, reject)=>{
        query(`SELECT * FROM degree_record where patient_id = '${patient_id}' order by id desc`, (err, data)=>{
            console.log(err,data)
            res.send(data)
            resolve()
        })
    })
    .then(()=>{
        res.end()
    })
})
router.post('/recorddetail', function(req, res) {
    let ret = {};
    console.log(req.body.recordid);
    let record_id = req.body.recordid;

    new Promise((resolve, reject) => {
        query(`SELECT * FROM degree_record WHERE id = ?`, [record_id], (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            if (!data || !data[0]) {
                reject(new Error('Record not found'));
                return;
            }
            // 确保数据可以被序列化
            ret.record = JSON.parse(JSON.stringify(data[0]));
            resolve();
        });
    })
    .then(() => {
        return new Promise((resolve, reject) => {
            query(`SELECT * FROM degree_record_detail WHERE record_id = ? order by id`, [record_id], (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                // 确保数据可以被序列化
                ret.detail = JSON.parse(JSON.stringify(data));
                resolve();
            });
        });
    })
    .then(() => {
        // 使用 json 方法替代 send
        res.json(ret);
    })
    .catch(error => {
        console.error('Error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error'
        });
    });
});

router.patch('/recorddetail', function(req, res){
    const ret = {};
    const record_id = req.body.recordid;
    const remark = req.body.remark;

    new Promise((resolve, reject) => {
        query('UPDATE degree_record SET remark = ? WHERE id = ?', [remark, record_id], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
    .then(() => {
        // 在 Promise 内部发送响应
        res.send({ message: 'Record updated successfully' });
    })
    .catch((error) => {
        res.status(500).send({ error: 'Error updating record' });
    });
});


router.get('/download', function(req, res){
    let record_id = req.query.id
    let name = ``
    let columns = [
      { header: '序号', key: 'id', width: 10 },
      { header: 'x轴角度', key: 'x', width: 10 },
      { header: 'y轴角度', key: 'y', width: 10 },
      { header: 'z轴角度', key: 'z', width: 10 },
      { header: '三轴最大偏转角度', key: 'max', width: 10 },
      { header: '警戒', key: 'warnTag', width: 10 },,
      { header: '时间', key: 'time', width: 35 },
      { header: '初始化三轴角度', key: 'xyz', width: 30 },
      { header: '预警角度', key: 'warnDegree', width: 10 }
    ]
    let rows = []
    let settings
    let startTime
    new Promise((resolve, reject)=>{
        query(`SELECT * FROM degree_record WHERE id = ${record_id}`, (err, data)=>{
            let record = data[0]
            settings = JSON.parse(record.settings)
            startTime = new Date(record.starttime)
            name = `记录时间：${formatDate(record.starttime)}`
            rows.push({xyz: `x轴:${settings.init_x/10};y轴:${settings.init_y/10};z轴:${settings.init_z/10}`, warnDegree: settings.degree/10})
            resolve()
        })
    })
    .then(()=>{
        return new Promise((resolve, reject)=>{
            query(`SELECT * FROM degree_record_detail WHERE record_id = '${record_id}' order by id`, (err, data)=>{
                data.forEach((i, ind)=>{
                    i.data = JSON.parse(i.data)
                    let temp_x = (i.data.x+3600-settings.init_x)%3600
                    let temp_y = (i.data.y+3600-settings.init_y)%3600
                    let temp_z = (i.data.z+3600-settings.init_z)%3600
                    i.data.x = temp_x > 1800 ? (temp_x - 3600)/10 : temp_x/10
                    i.data.y = temp_y > 1800 ? (temp_y - 3600)/10 : temp_y/10
                    i.data.z = temp_z > 1800 ? (temp_z - 3600)/10 : temp_z/10
                    i.alert = Math.abs(i.data.x) > settings.degree/10
                        || Math.abs(i.data.y) > settings.degree/10
                        || Math.abs(i.data.z) > settings.degree /10
                    rows.push({
                        id: i.id, 
                        x: i.data.x, 
                        y: i.data.y, 
                        z: i.data.z, 
                        max: Math.max(i.data.x, i.data.y, i.data.z),
                        warnTag: i.alert ? '是': '否',
                        time: formatDate(new Date(startTime.getTime()+1000*(ind-1)))
                    })
                })
                resolve()
            })
        })
    })
    .then(()=>{
        // 将 Workbook 输出到文件流并发送给客户端
        let excel = createExcel(name, columns, rows)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'record.xlsx');
        return excel.xlsx.write(res)
          .then(() => {
            res.status(200).end();
          });
    })
    
})
function createExcel(name, columns, rows){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('');
    worksheet.columns = columns
    rows.forEach(row => {
      worksheet.addRow(row);
    })
    return workbook
}
module.exports = router