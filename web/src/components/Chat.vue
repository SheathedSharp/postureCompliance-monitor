<template>
    <div class="chat">
        <div class="content"></div>
        <div class="tools"></div>
        <div class="input">
            <textarea class="chat-input" v-model="message" />
        </div>
        <div class="send" @click="sendMessage">发送</div>
    </div>
</template>

<script>
export default {
    // data(){
    //     return{
    //         message: "",
    //         ws: new WebSocket('ws://localhost:8001')
    //     }
    // },
    // methods: {
    //     sendMessage(){
    //         this.ws.send(this.message)
    //     }
    // }
}
</script>

<style scoped>
    .chat{
        height: 100%;
        width: 100%;
        border-radius: 10px;
        overflow: scroll;
    }
    .content{
        height: 333px;
        width: 100%;
        background: rgb(75, 117, 178);
        border-radius: 10px;
    }
    .tools{
        height: 32px;
    }
    .input{
        height: 110px;
        background: rgb(255, 255, 255);
        border-radius: 10px;
    }
    .send{
        width: 76px;
        height: 25px;
        line-height: 25px;
        text-align: center;
        font-size: 15px;
        font-weight: 300;
        border-radius: 5px;
        background: rgb(255, 255, 255);
        color: black;
        margin-top: 6px;
        margin-left: auto;
        cursor: pointer;
    }
    .send:hover{
        background:rgb(171, 231, 240);
    }
    .input{
        padding: 10px;
    }
    .chat-input{
        width: 100%;
        height: 100%;
        resize: none;
    }
</style>