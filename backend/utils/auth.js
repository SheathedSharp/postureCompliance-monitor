const Base64 = require('js-base64').Base64
const secret = "ylsh"   //配置密钥
const HMACSHA256 = (value, secret="")=>require('crypto')
                    .createHash("sha256", "ylsh").update(value).digest("hex") // 相关加密知识见 https://zhuanlan.zhihu.com/p/373375331
module.exports  = {
    // 采用JWT token方式 生成token字符串， 
    // JWT结构: JWTString = Base64url(Header).Base64url(Payload).HMACSHA256(Base64url(Header).Base64url(Payload),secret)
    // Base64url将Base64编码字符中的'+'和'/'分别替换成'-'和'_', 另外把末尾填充的‘=’去掉;其他都一样, 前者更加安全
    // js-base64模块中的Base64.encode()方法的第二个参数设置是否是urlsafe, 这里设置为true
    enToken: function(userId){
        let headerBase64 = Base64.encode(JSON.stringify({alg: "HS256", typ: "JWT"}), true)
        let payloadBase64 = Base64.encode(JSON.stringify({
            id: userId,
            logintime: new Date().getTime()
        }), true)
        let token = `${headerBase64}.${payloadBase64}.${HMACSHA256(`${headerBase64}.${payloadBase64}`, secret)}`
        // console.log(token)
        return token
    },
    deToken: function(token){
        let [headerBase64, payloadBase64, HMACstr] = token.split(".")
        let headerJson = Base64.decode(headerBase64)
        let payloadJson = Base64.decode(payloadBase64)
        // console.log(headerJson, payloadJson, HMACSHA256(`${headerBase64}.${payloadBase64}`, secret))
        if(HMACSHA256(`${headerBase64}.${payloadBase64}`, secret) == HMACstr){
            // token验证通过, 返回载荷
            let data = JSON.parse(payloadJson)
            if((new Date().getTime() - data.logintime)/(1000*60*60) > 24){
                console.log("登录凭证过期")
                return 2
            }
            else return data
        }
        else{
            // token验证不通过, 返回false
            return 0
        }
    }
}
let token = module.exports.enToken(2)
module.exports.deToken(token)