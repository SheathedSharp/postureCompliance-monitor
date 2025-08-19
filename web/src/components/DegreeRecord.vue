<template>
    <div class="degreerecord">
        <div class="chart-container">
            <div class="chart" ref="recordEchart"></div>
            <a v-if="currentRecordId" target="_blank" class="downLoadIcon" :href="`https://ylsh.top:8002/doctor/record/download?id=${currentRecordId}`">
                <img :src="downLoadIcon" />
            </a>
        </div>
        <div class="alert">
            <img :src="alertImg" alt="">
        </div>
        <div class="status" ref="alertEchart"></div>
        <div class="recordlist">
            <div class="recorditem" v-for="item in recordlist" :key="item.id" @click="draw(item.id)">
                <span :title="item.remark">{{formatTime(new Date(item.starttime))}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from "echarts"
import * as http from "@/utils/http"
import {formatTime} from "@/utils/util"
import alertAlert from "@/assets/alert_alert.png"
import alertNormal from "@/assets/alert_normal.png"
import downLoadIcon from "@/assets/download.png"
export default {
    mounted(){
        this.recordEchart = echarts.init(this.$refs.recordEchart)
        this.alertEchart = echarts.init(this.$refs.alertEchart)
        http.post("/doctor/record/recordlist", {
            patientid: this.patientid
        })
        .then(e=>{
            this.recordlist = e.data
        })
    },
    methods:{
        draw(id){
            this.currentRecordId = id
            this.recordEchart.showLoading()
            this.alertEchart.showLoading()
            if(this.cancel) {
                this.cancel.cancel()
            }
            this.cancel = this.$axios.CancelToken.source()
            // let loading = this.$loading.service({fullscreen: true, background: "rgba(0,0,0,0.2)"})
            http.post("/doctor/record/recorddetail", {
                recordid: id
            }, {}, this.cancel.token)
            .then((e)=>{
                console.log(e)
                this.recorddata = e.data
                // this.recorddata.record.settings = JSON.parse(this.recorddata.record.settings)
                // Check if settings is a string before parsing
                if (typeof this.recorddata.record.settings === 'string') {
                    this.recorddata.record.settings = JSON.parse(this.recorddata.record.settings)
                }
                this.recorddata.detail = this.recorddata.detail.map((i)=>{
                    // i.data = JSON.parse(i.data)
                    // Check if data is a string before parsing
                    if (typeof i.data === 'string') {
                        i.data = JSON.parse(i.data)
                    }
                    
                    // Initialize data if it's null or undefined
                    if (!i.data) {
                        i.data = { x: 0, y: 0, z: 0 }
                        i.alert = false
                        return i
                    }
                    
                    let temp_x = (i.data.x+3600-this.recorddata.record.settings.init_x)%3600
                    let temp_y = (i.data.y+3600-this.recorddata.record.settings.init_y)%3600
                    let temp_z = (i.data.z+3600-this.recorddata.record.settings.init_z)%3600
                    i.data.x = temp_x > 1800 ? (temp_x - 3600)/10 : temp_x/10
                    i.data.y = temp_y > 1800 ? (temp_y - 3600)/10 : temp_y/10
                    i.data.z = temp_z > 1800 ? (temp_z - 3600)/10 : temp_z/10
                    i.alert = Math.abs(i.data.x) > this.recorddata.record.settings.degree/10
                        || Math.abs(i.data.y) > this.recorddata.record.settings.degree/10
                        || Math.abs(i.data.z) > this.recorddata.record.settings.degree /10
                    if(this.recorddata.detail.filter(i=>i.alert).length / this.recorddata.detail.length > 0.05){
                        this.recordAlert = "警报"
                        this.alertImg = alertAlert
                    }else{
                        this.recordAlert = "正常"
                        this.alertImg = alertNormal
                    }
                    return i
                })
                console.log(this.recorddata.detail)
            })
            .then(()=>{
                this.recordEchart.setOption({
                    grid: {
                        containLabel: true
                    },
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                    },
                    dataZoom: {
                        // type: 'inside'
                        type: 'slider'
                    },
                    xAxis: {
                        data: this.recorddata.detail.map((item, i)=>{
                            return formatTime(new Date(new Date(this.recorddata.record.starttime).getTime()+i*1000))
                        })
                    },
                    yAxis: {
                        x: 'center',
                        type: 'value',
                        minInterval: 0.5,
                        splitLine: {
                            lineStyle: {
                            type: 'dashed'
                            }
                        },
                        axisTick: {
                            length: 6,
                            lineStyle: {
                            type: 'dashed'
                            }
                        }
                    },
                    series: [
                        {
                        data: this.recorddata.detail.map(i=>i.data.x),
                        type: 'line',
                        smooth: true
                        },
                        {
                        data: this.recorddata.detail.map(i=>i.data.y),
                        type: 'line',
                        smooth: true
                        },
                        {
                        data: this.recorddata.detail.map(i=>i.data.z),
                        type: 'line',
                        smooth: true
                        },
                        {
                            name: '',
                            type: 'line',
                            smooth: true,
                            data: new Array(this.recorddata.detail.length).fill(-20),
                            lineStyle: {
                                color: "#de7975",
                                type: "dashed"
                            }
                        },
                        {
                            name: '',
                            type: 'line',
                            smooth: true,
                            data: new Array(this.recorddata.detail.length).fill(20),
                            lineStyle: {
                                color: "#de7975",
                                type: "dashed"
                            }
                        }
                    ]
                })
                this.alertEchart.setOption({
                    series: [
                        {
                            type: 'pie',
                            radius: ['50%', '70%'],
                            avoidLabelOverlap: false,
                            label: {
                                show: false,
                                position: 'center',
                                formatter: '{b}{d}%',
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '16',
                                }
                            },
                            data: [
                                {value: this.recorddata.detail.filter(i=>i.alert).length, name: '警告', label: {color: '#FFFFFF'}, itemStyle: {color: '#FF5A5F'}},
                                {value: 0, name: '提示', label: {color: '#000000'}, itemStyle: {color: '#FFE681'}},
                                {value: this.recorddata.detail.filter(i=>i.alert===false).length, name: '正常', label: {color: '#FFFFFF'}, itemStyle: {color: '#8ED081'}}
                            ]
                        }
                    ]
                })
            })
            .then(()=>{
                this.cancel = null
                this.recordEchart.hideLoading()
                this.alertEchart.hideLoading()
                // loading.close()
            })
            .catch((e)=>{
                console.log(e)
            })
        },
        downLoad(){
            if(this.currentRecordId){
                http.get(`/doctor/record/download?id=${this.currentRecordId}`)
            }
        }
    },
    data(){
        return {
            formatTime: formatTime,
            recordEchart: null,
            alertEchart: null,
            recordlist: null,
            recorddata: {
                id: 1
            },
            cancel: null,
            recordAlert: "",
            alertImg: alertNormal,
            downLoadIcon,
            currentRecordId: undefined
        }
    },
    props: {
        patientid: {
            type: Number,
            require: true
        }
    }
}
</script>

<style scoped>
    .degreerecord{

        display: grid;
        grid-template-rows: 152px 151px 187px;
        grid-template-columns: 471px 152px;
        gap: 10px;
    }
    .chart-container{
        position: relative;
        grid-row: 1 / 3;
    }
    .chart{
        background: white;
        border-radius: 10px;
        height: 100%;
        overflow: hidden;
    }
    .status{
        background: lightblue;
        border-radius: 10px;
        background: rgb(151, 195, 250);
        overflow: hidden;
    }
    .alert{
        background: lightblue;
        border-radius: 10px;
        background: rgb(151, 195, 250);
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .recordlist{
        background: lightcoral;
        grid-column: 1 / 3;
        border-radius: 10px;
        background: rgb(129, 180, 249);
    }
    .recordlist{
        display: flex;
        flex-wrap: wrap;
        padding: 10px;
        box-sizing: border-box;
        overflow: scroll;
    }
    .recorditem{
        width: 140px;
        height: 25px;
        line-height: 25px;
        text-align: center;
        font-size: 12px;
        margin-right: 8px;
        margin-bottom: 8px;
        background: rgb(50, 145, 177);
        border-radius: 3px;
        cursor: pointer;
    }
    .recorditem:hover{
        background: rgb(161, 221, 241);
    }
    .downLoadIcon{
        height: 16px;
        width: 16px;
        position: absolute;
        right: 5px;
        top: 5px;
    }
    .downLoadIcon img{
        width: 100%;
        height: 100%;
    }
</style>