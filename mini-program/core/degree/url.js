// const HOST_URL = "http://172.16.69.60:8002"
const HOST_URL = "https://ylsh.top:8002"

module.exports = {
  postRecord: function(){
    return HOST_URL+"/patient/record/uploadRecord"
  }
}