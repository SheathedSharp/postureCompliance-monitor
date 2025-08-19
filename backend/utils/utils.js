const formatDate = function(time, t = true){
    var date = new Date(time);
 
    var year = date.getFullYear(),
        month = date.getMonth()+1,//月份是从0开始的
        day = date.getDate(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    var newTime = t ? year + '-' +
                (month < 10? '0' + month : month) + '-' +
                (day < 10? '0' + day : day) + ' ' +
                (hour < 10? '0' + hour : hour) + ':' +
                (min < 10? '0' + min : min) + ':' +
                (sec < 10? '0' + sec : sec) 
                : year + '-' +
                (month < 10? '0' + month : month) + '-' +
                (day < 10? '0' + day : day)
 
    return newTime;         
}

module.exports = {
    formatDate
}