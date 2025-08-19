import * as http from "./http.js"

export const valid = (token)=>{
    return http.post("/doctor/user/valid", {
        token
    })
}
export const signup = (info)=>{
    return http.post("/doctor/user/signup", {
        phone: info.phone, 
        password: info.password
    })
}
export const signin = (info)=>{
    return http.post("/doctor/user/signin", {
        phone: info.phone, 
        password: info.password
    })
}
// localStorage.setItem("token", "123456")
// localStorage.removeItem("token")