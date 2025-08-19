var schedule = require('node-schedule')
const query = require("../utils/mysql")
const {formatDate} = require('../utils/utils')

function daily_news_script(){
	const hour = 18
	const minute = 0
	const second = 0
	const cron = `${second} ${minute} ${hour} * * *`
	// const testCron = '57 * * * *'
	const job = schedule.scheduleJob(cron, function(){
	    console.log('这是定时执行的命令，当前时间是'+new Date().toString())
	    generate()
	})
	return job
}

function generate(){
	const now = new Date()
	const last = new Date(now.getTime()-86400000)
	return new Promise((resolve, reject)=>{
		query(`SELECT * from degree_record where starttime between ${formatDate(last)} and ${formatDate(now)}`, function(err, data){
		// query(`SELECT * from degree_record where starttime between '2022-09-10 00:20:00' AND '2022-09-10 00:21:00'`, function(err, data){
			if(data){
				resolve(data)
			}else{
				reject(err)
			}
		})
	})
	.then(e=>{	// 将记录按患者聚集
		const records = Array.from(e)
		const patients = {}
		records.forEach(i=>{
			if(patients[i.patient_id]){
				patients[i.patient_id].records.push(i)
			}else{
				patients[i.patient_id] = {}
				patients[i.patient_id].records = [i]
			}
		})
		return patients
	})
	.then(async e=>{ // 获取患者出院小结
		const patients = e
		let keys = Object.keys(patients)
		for(let i = 0; i < keys.length; i++){
			await new Promise((resolve, reject)=>{
				query(`SELECT * from patient where id = '${keys[i]}'`, function(err, data){
					// console.log(err, data)
					if(data && data[0]){
						patients[keys[i]].patient_dialog = data[0].dialog
						console.log(patients[keys[i]].patient_dialog)
						resolve(data)
					}else{
						reject(err)
					}
				})
			})
		}
		return patients
	})
	.then(async e=>{ // 获取记录的详细内容，用于后续计算
		const patients = e
		let keys = Object.keys(patients)
		for(let i = 0; i < keys.length; i++){
			patients[keys[i]].records_details = []
			let records = patients[keys[i]].records
			for(let j = 0; j < records.length; j++){
				await new Promise((resolve, reject)=>{
					query(`SELECT * from degree_record_detail where record_id = '${records[j].id}'`, function(err, data){
						if(data){
							patients[keys[i]].records_details[j] = Array.from(data)
							resolve()
						}else{
							reject(err)
						}
					})
				})
			}
		}
		return patients
	})
	.then(e=>{ // 处理数据，产生info_raw
		const patients = e
		let keys = Object.keys(patients)
		for(let i = 0; i < keys.length; i++){
			let records = patients[keys[i]].records
			patients[keys[i]].info_raw = []
			records.forEach((item, index)=>{
				let data = preDealWithDetail({record: item, detail: patients[keys[i]].records_details[index]})
				// console.log(data.detail)
				patients[keys[i]].info_raw.push(...data.detail)
			})
		}
		return patients
	})
	.then(e=>{ // 通过info_raw产生info简报内容
		const patients = e
		let keys = Object.keys(patients)
		for(let i = 0; i < keys.length; i++){
			let info = {}
			info["总时间(s)"] = patients[keys[i]].info_raw.length
			info["体位保持时间(s)"] = patients[keys[i]].info_raw.filter(i=>!i.warn_tag).length
			patients[keys[i]].info = info
			console.log(info)
		}
		return patients
	})
	.then(async (e)=>{ // 最后插入数据库
		e = Object.keys(e).map(i=>{
			return {
				...e[i],
				patient_id: e[i].records[0].patient_id
			}
		})
		const news_list = e
		for(let j = 0; j < news_list.length; j++){
			let i = news_list[j]
			await new Promise((resolve, reject)=>{
				query(`INSERT into daily_news (patient_id, patient_dialog, createtime, info) values ('${i.patient_id}', '${i.patient_dialog}', ' ${formatDate(new Date())}', '${JSON.stringify(i.info)}')`, function(err, data){
					// console.log(err, data)
					if(data){
						resolve(data)
					}else{
						reject(err)
					}
				})
			})
		}
		return
	})
	.catch(e=>{
		console.log(e)
	})
	.finally(e=>{
		console.log("finally")
	})
}

const preDealWithDetail = (data)=>{
  data.record.settings = JSON.parse(data.record.settings)
  data.record.starttime = new Date(data.record.starttime)
  data.detail.forEach(i=>{
    i.data = JSON.parse(i.data)
    let temp_x = (i.data.x+3600-data.record.settings.init_x)%3600
    let temp_y = (i.data.y+3600-data.record.settings.init_y)%3600
    let temp_z = (i.data.z+3600-data.record.settings.init_z)%3600
    i.data.x = temp_x > 1800 ? (temp_x - 3600)/10 : temp_x/10
    i.data.y = temp_y > 1800 ? (temp_y - 3600)/10 : temp_y/10
    i.data.z = temp_z > 1800 ? (temp_z - 3600)/10 : temp_z/10
    i.warn_tag = Math.abs(i.data.x) > data.record.settings.degree/10 || Math.abs(i.data.y) > data.record.settings.degree/10 || Math.abs(i.data.z) > data.record.settings.degree/10
  })
  return data
}

module.exports = daily_news_script
