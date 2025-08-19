<template>
    <div class="nav_">
        <div class="nav-item" @click="navItemClick(item, i)" :class="{active: index==i}" v-for="(item, i) in list" :key="item.name">
            <div class="icon"></div>
            <div class="name">{{item.name}}</div>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
        }
    },
    props: {
        index: {
            default: 0,
            
        },
        list: {
            default: []
        },
        navItemClick: {
            type: Function
        }
    },
    methods: {

    }
}
</script>

<style scoped>
    .nav_{
        height: 100%;
        width: 100%;
        padding-top: 17px;
    }
    .nav-item{
        height: 45px;
        display: flex;
        padding-left: 19px;
        align-items: center;
        margin-bottom: 12px;
        position: relative;
        cursor: pointer;
    }
    .active, .nav-item:hover{
        background: linear-gradient(270deg, rgba(255,255,255,0.7300) 0%, rgba(255,255,255,0) 100%);

    }
    .active::before{
        position: absolute;
        left: 0;
        content: "";
        width: 5px;
        height: 15px;
        background: #00FFED;
    }
    .active::after{
        position: absolute;
        content: "";
        height: 1px;
        width: 100%;
        left: 0;
        bottom: 0;
        background: linear-gradient(270deg, #FFFFFF 0%, rgba(255,255,255,0) 100%);

    }
    .nav-item .icon{
        /* background: lightgrey; */
        width: 38px;
        height: 38px;
        margin-right: 10px;
    }
    .nav-item .name{
        font-size: 15px;
        font-weight: 100;
        color: white;
        font-family: PingFang SC-Thin, PingFang SC;
    }
</style>