import * as axios from "axios"
// const baseURL = "https://ylsh.top:8002"
const baseURL = "http://localhost:8000"


export const post = (path="", data={}, header={}, cancelToken)=>{
    header["Content-Type"] = !header["Content-Type"] ? "application/x-www-form-urlencoded" : header["Content-Type"]
    return axios({
        method: "post",
        url: baseURL+path,
        // url: path,
        data,
        header,
        cancelToken
    })
}
export const get = (path="", header={}, cancelToken)=>{
    return axios({
        method: "get",
        url: baseURL+path,
        // url: path,
        header,
        cancelToken
    })
}
 