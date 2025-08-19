const mysql = require('mysql2');
var pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password_here',
    database: process.env.DB_NAME || 'ble_degree'
});

/**
*封装方法
* @params(String) sql - mysql语句
* @params(Array)  params - 填充mysql占位符的参数队列
* @params(Function) callback - 数据回调函数
*/
var query = function(){
    const sql = arguments[0]
    const params = arguments.length == 2 ? [] : arguments[1]
    const callback = arguments.length == 2 ? arguments[1] : arguments[2]
    pool.getConnection(function(err,connection){
        if(err){
            callback(err,null)
        }else{
            connection.query(sql, params, function(err,results){
                callback(err,results)//结果回调
                connection.release()//释放连接回连接池
            })
        }
    })
}

module.exports = query