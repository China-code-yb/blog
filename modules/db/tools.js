// 时间格式化
function dateFormat(date) {
    var d = null;
    if (date instanceof Date) {
        d = date;
    } else {
        if (typeof date == "number" || typeof date == "string") {
            d = new Date(date);
        } else {
            console.log('你输入的值有误 请重新输入')
        }
    }
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();

    var hours = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();

    function  retuen(r) {
        if(r<10){
          return   r ='0'+ r;
        }else{
            return r;
        }
    }
    m=retuen(m);
    day=retuen(day);
    hours=retuen(hours);
    minute=retuen(minute);
    second=retuen(second);
    return `${y}年${m}月${day}日 ${hours}:${minute}:${second}`
}


function dateOffset(targetTime) {
    var nowTime = new Date();
    // 时间间隔：秒
    var offsetTime = (nowTime.getTime() - targetTime)/1000;

    var SEC = 1;
    var MIN = 60;
    var HOUR = MIN*60;
    var DAY = HOUR*24;  

    var days = Math.floor(offsetTime / DAY);
    var hours = Math.floor(offsetTime % DAY / HOUR);
    var minutes = Math.floor(offsetTime % DAY % HOUR / MIN);
    var seconds = Math.floor(offsetTime % DAY % HOUR % MIN / SEC);

    var str = ''
    if (offsetTime <= MIN) {
        //一分钟以内
        str = '刚刚';
    }else if (offsetTime <= HOUR) {
        // 一小时以内
        str = minutes + '分钟前';
    }else if (offsetTime <= DAY)  {
        //一天以内
        str = hours + '小时前';
    }else{
        //超过一天
        str = days + '天前';
    }
    return str;
}

//ip地址
function ipFormat(str){
    // ::ffff:127.0.0.1
    var reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    var arr = reg.exec(str);
    return arr[0];
}

// id的处理
function idFormat(id) {
    return id.replace(/\"/g,'');
}

module.exports = {
    dateFormat,
    ipFormat,
    idFormat,
    dateOffset
};