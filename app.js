// express 模块
var express = require('express')
var app = express()
//
var fs = require('fs')
// 导入multer模块
var multer = require('multer')
// 

// 设置文件上传路径
var uploadpath = './public/uploads/'
var headername;
// 

// 文件存储引擎
var stroage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadpath)
    },
    filename:function(req,file,cb){
        // cb(null,Date.now+'-',file.originalname)

        var arr = file.originalname.split('.')
        var ext = arr[arr.length-1];
        headername = req.session.user.username+'-'+Date.now()+'.'+ext;
        cb(null,headername)

    }

   
})
// 

var upload = multer({
    storage:stroage,
    limits:{
        // 文件大小限制
        fileSize:1024*1024*10
    },
    // 设置只可上传图片
    fileFilter:function(req,file,cb){
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb('只能上传图片', false);
        }
    }
});



// 导入模板引擎模块
var artTemplate = require('express-art-template')
// 

// 注册模板引擎
app.engine('html', artTemplate)
// 

// 导入数据库模块
var mongoose = require('mongoose')
// 

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/bloguser', { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('数据库连接失败')
    }
    else {
        console.log('数据库连接成功');
    }
})
// 

// 自己的模块
var tools = require('./modules/db/tools')
// 


// 设计用户表结构
var Schema = mongoose.Schema
var bloguserSchema = new Schema({
    username: String,
    password: String,
    headerurl:{
        type:String,
        default:'/uploads/timg.jpg'
    }
})
//

// 设计博客发文表结构
var blogSchema = new Schema({
    title: String,
    tag: Array,
    article: String,
    athuor: String,
    date: String,
    count: Number,
    reply: Array
})

// 

// 将表结构发布为模型

var blogUser = mongoose.model('user', bloguserSchema)

var blog = mongoose.model('blog', blogSchema)
// 

// 加载 express-session 会话模块
var session = require('express-session')
// 

// 加载connect-mongo模块
// connet-mongo 程序运行的时候，app对象会自动替我们管理session的 存储、更新、删除
// 会把session 存储到MongoDB数据库中

var mongostore = require('connect-mongo')(session)

// 

// 使用use挂载express-session之后，会自动生成http请求session对象，保存在 req.session 中，在登录注册时通过req.session来存储和访问会话数据
app.use(session({
    //添加session的配置信息
    secret: 'mylogin',
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    },
    store: new mongostore({
        // 连接数据库
        url: 'mongodb://127.0.0.1/bloguser'
    })
}));
// 


// 加载并使用会话闪存模块   依赖express-session模块
var flash = require('connect-flash')
app.use(flash())
// 

// 导入md5模块
var md5 = require('md5')
// 

// 能够获取post请求信息
app.use(express.urlencoded({ extends: false }))

// 公开资源
app.use(express.static('public'))
// 

app.post('/upload/header',upload.single('headerimg'),(req,res)=>{
    var headerurl = '/uploads/'+headername;
    console.log(uploadpath+headername);
    
    if(fs.existsSync(uploadpath+headername)){
        blogUser.findOne({_id:req.session.user._id},(err,user)=>{
            if(user.headerurl != '/uploads/timg.jpg'){
                fs.unlinkSync('./public'+user.headerurl);
            }
            user.headerurl = headerurl;
            user.save(()=>{
                req.session.user.headerurl = headerurl;
                res.redirect('/')
            })
        })
    }
    else{
        res.send('上传失败')
    }
})

app.get('/edit/userinfo',(req,res)=>{
    res.render('userinfo.html');
});
app.post('/edit/userinfo',(req,res)=>{
    res.redirect('/')
});

// 编辑用户头像
app.get('/edit/user/header/:name',(req,res)=>{
    var sesuser = req.session.user
    res.render('changeimg.html',{sesuser});
});
//首页
app.get('/', (req, res) => {
    var sesuser = req.session.user

    // page 显示当前的页码
    var page = (req.query.page || 1) * 1;

    // 设置每页要显示的信息数
    var show_count = 5
    // console.log(sesuser)
    blog.find({}).skip((page - 1) * show_count).limit(show_count).exec((err, data) => {
        console.log(data.length)
        data = data.reverse()
        blog.countDocuments((err, count) => {
            var allPages = parseInt(count / show_count)+1

            res.render('index.html', {
                sesuser, 
                data, 
                page,
                allPages,
                show_count
            }
            )
        })
    })

})
//

// 登录
app.post('/load', (req, res) => {
    blogUser.findOne({ username: req.body.username }, (err, user) => {
        // console.log(user)
        if (!user) {
            res.send('用户名不存在')
        }
        else if (md5(req.body.password) != user.password) {
            res.send('密码错误')
        }
        else {
            // 登录成功时 把查询到的user信息添加到session保存或更新到数据库中
            req.session.user = user;
            var sesuser = req.session.user
            res.redirect('/');
        }
    })
})

// 

// 退出登录
app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});
// 


// 注册
// app.get('/enj',(req,res)=>{
//     res.render('index.html')
// })

app.post('/enj', (req, res) => {
    // console.log(req.body)

    // 同名判断
    blogUser.findOne({ username: req.body.username }, (err, data) => {
        if (data) {
            req.flash('error', '用户名已存在！')
            res.render('index.html', {
                error: req.flash('error').toString()
            })
            // res.send('用户名已存在')
        }
        else {
            // 密码加密
            req.body.password = md5(req.body.password);

            var blogusers = new blogUser(req.body)
            blogusers.save(err => {
                if (err) {
                    res.send('注册失败')
                }
                else {
                    res.redirect('/')
                }
            })
        }
    })
    // 

})
// 

// 发布页面
app.get('/fabu', (req, res) => {
    // req.session.user = user;
    var sesuser = req.session.user
    // console.log(req.session.user)
    res.render('fabu.html', { sesuser })
})


// 存档接口

app.get('/memery', (req, res) => {
    var sesuser = req.session.user
    // console.log(req.session.user)
    blog.find({},(err,data)=>{
        res.render('memery.html', {sesuser,data})
    })
})

// 标签接口
app.get('/mark', (req, res) => {
    var sesuser = req.session.user
    // console.log(req.session.user)
    blog.find({},(err,data)=>{
        var tag = {
            tagArr:[]
        }
        for(var i = 0;i<data.length;i++){
        //   console.log(data[i].tag);
          for(var j = 0;j<data[i].tag.length;j++){
            //   console.log(data[i].tag[j])
              tag.tagArr.push(data[i].tag[j])
          }
        }
        // console.log(tag.tagArr) //未去重的所有标签数组


        // 将数组中的标签去重
        var tagarr = []

        for(var k=0;k<tag.tagArr.length;k++){
            if(tagarr.indexOf(tag.tagArr[k]) == -1){
                tagarr.push(tag.tagArr[k])
            }
        }
        // console.log(tagarr)

        res.render('mark.html', { sesuser,data,tagarr})
    })
   
})

// 发表文章接口

app.get('/publish', (req, res) => {
    var count = 0
    // console.log(req.query)
    // res.send('稍等，我在测试')
    var fabiao = new blog(req.query)
    fabiao.athuor = req.session.user.username
    fabiao.date = tools.dateFormat(new Date())
    fabiao.count = count
    // console.log(req.session.user.username)
    console.log(fabiao)
    fabiao.save((err) => {
        if (err) {
            res.send('文章发表失败')
        }
    })
    res.redirect('/')
})


// 留言页面接口
app.get('/reply', (req, res) => {
    var sesuser = req.session.user
    // res.render('reply.html',{sesuser})

    var id = req.query.id
    var reg = /\"/g
    id = id.replace(reg, '')
    //    console.log(id)



    blog.findOne({ _id: id }, (err, data) => {
        var count = data.count
        blog.updateOne({ _id: id }, { count: ++count }, (err) => {
        })


        // console.log(data)
        res.render('reply.html', { data, sesuser })
    })
    // blog.findOne()
})
// 


// 个人空间接口
app.get('/perInfo', (req, res) => {
    var sesuser = req.session.user
    console.log(sesuser)
    blog.find({ athuor: sesuser.username }, (err, data) => {  //根据当前登录用户名查找出博客
        console.log(data)
        res.render('perInfo.html', { sesuser, data })
    })
})
// 


// 博客作者信息
app.get('/authorInfo', (req, res) => {
    var sesuser = req.session.user
    var athuor = req.query.name
    // var reg = /\"/g
    // id = id.replace(reg,'')
    // console.log(req.query.name)
    blog.find({ athuor: athuor }, (err, data) => {
        // console.log(data)
        res.render('authorInfo.html', { sesuser, data })
    })
})
// 

// 留言接口
app.get('/answer', (req, res) => {
    var reply = {}
    var id = req.query.id
    var reg = /\"/g
    id = id.replace(reg, '')
    // console.log(typeof req.query.answer)
    reply.answertxt = req.query.answer
    reply.answerman = req.session.user.username
    reply.answertime = tools.dateFormat(new Date())
    // console.log(reply)

    var sesuser = req.session.user
    blog.findOne({ _id: id }, (err, data) => { //根据id找到当前点击的博客
        data.reply.push(reply)
        blog.updateOne({ _id: id }, { reply: data.reply }, (err) => {
            // console.log(data)
            res.render('reply.html', { data: JSON.parse(JSON.stringify(data)), sesuser })
        })
    })

})
// 


// 编辑接口
app.get('/redact', (req, res) => {
    var sesuser = req.session.user
    var id = req.query.id
    var reg = /\"/g
    id = id.replace(reg, '')
    console.log(req.query.id)
    blog.findOne({ _id: id }, (err, data) => {
        console.log(data)
        res.render('bianji.html', { sesuser, data })
    })
})

// 发布更改过的博文
app.get('/updateblog', (req, res) => {
    console.log(req.query)
})
// 

// 删除接口
app.get('/del', (req, res) => {
    var sesuser = req.session.user
    var id = req.query.id
    console.log(req.query.id)
    var reg = /\"/g
    id = id.replace(reg, '')

    blog.deleteOne({ _id: id }, (err) => {
        res.redirect('/')
    })
})


// 通过标签跳转
app.get('/taglink',(req,res)=>{
    // console.log(req.query.tagname);

    var sesuser = req.session.user
    var aboutMark = []
    blog.find({},(err,data)=>{
        for(var i = 0;i<data.length;i++){
            // console.log(data[i].tag)

            if(data[i].tag.includes(req.query.tagname)){
                aboutMark.push(data[i])
            }
        }
        console.log(aboutMark)

        res.render('aboutmark.html',{aboutMark,sesuser})
    })
    
})
// 


// 模糊搜索

app.get('/search',(req,res)=>{

    var sesuser = req.session.user
    var a = req.query.searchtxt
    blog.find({
        // 多条件模糊查询
        $or:[  
            {title:{$regex:req.query.searchtxt,$options:'$i'}}, 
            {tag:{$regex:req.query.searchtxt,$options:'$i'}},
            {article:{$regex:req.query.searchtxt,$options:'$i'}},
            {athuor:{$regex:req.query.searchtxt,$options:'$i'}},
        ]
    }).exec((err,data)=>{
        res.render('secresult.html',{data,sesuser,a})
    });
})

// 

app.listen(3000, () => console.log('blog服务器已启动'))