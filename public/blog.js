var lis = document.querySelectorAll('.list')
var as = document.querySelectorAll('.list>a')
var p = document.querySelector('.side>p')
var sidediv = document.querySelector('.side')

// p.innerHTML = as[0].innerHTML;

console.log(lis)
console.log(as)
// for(var i = 0;i<lis.length;i++){
//     lis[i].index = i
//     lis[i].onclick = function(){
//         p.innerHTML = as[this.index].innerHTML
//         for(var j = 0;j<lis.length;j++){
//             as[j].classList.remove('addstyle')
//         }
//         as[this.index].classList.add('addstyle')
//     }
// }

// 点击登录

var aLoad = document.querySelector('.onload')
var aEnj = document.querySelector('.enj')

var loaddiv = document.querySelector('.loaddiv')
var enjdiv = document.querySelector('.enjdiv')

var forcover = document.querySelector('.forcover')

forcover.classList.add('adddisplay')


aLoad.onclick = function(){
    loaddiv.classList.add('addtop')
    enjdiv.classList.remove('addtop')
    forcover.classList.remove('adddisplay')
    forcover.style.height = document.body.offsetHeight + 'px';
    // console.log(document.body.offsetHeight)
}

// 点击注册

aEnj.onclick = function(){
    enjdiv.classList.add('addtop')
    loaddiv.classList.remove('addtop')
    forcover.classList.remove('adddisplay')
    forcover.style.height = document.body.offsetHeight + 'px';
    // console.log(document.body.offsetHeight)
}

forcover.onclick = function(){
    this.classList.add('adddisplay')
}

loaddiv.onclick = function(ev){
    ev.stopPropagation()
}

enjdiv.onclick = function(ev){
    ev.stopPropagation()
}


var enjtxt = document.querySelector('.enjtxt')

enjtxt.onclick = function(){
    enjdiv.classList.add('addtop')
    loaddiv.classList.remove('addtop')
}


var btn_enj = document.querySelector('.btnenj')
var user = document.querySelector('.user')
var password = document.querySelector('.password')
var conpassword = document.querySelector('.conpassword')
// 两次密码不相同判断
btn_enj.onclick = function(ev){
    if(password.value != conpassword.value){
        ev.preventDefault()
        alert('两次密码不一致！')
    }
    if(user.value == '' || password.user == ''){
        alert('用户名或密码不能为空！')
    }
}

var mustload = document.querySelector('.mustload')

console.log(mustload)
mustload.onclick = function(){
    // console.log('haahahha')
    loaddiv.classList.add('addtop')
    enjdiv.classList.remove('addtop')
    forcover.classList.remove('adddisplay')
    forcover.style.height = document.body.offsetHeight + 'px';
}