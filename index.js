require('dotenv').config()

const express=require('express')
const mongoose=require('mongoose')
const passport=require('passport')
const session=require('express-session')
const methodOverride=require('method-override')
const flash=require('express-flash')
const app=express()
// local strategy
require('./config/passport-local')()
require('./config/passport-google')()

// connect to mongoose
mongoose.connect(process.env.MONGO_CLOUD_URL).then(()=>console.log('MongoDB is connected!')).catch(e=>{console.log(e.message); process.abort()});

// express setup
app.use(express.urlencoded({extended: true,limit:'10mb'}))
app.set('view engine','ejs')
app.use('*/css',express.static(__dirname+'/public/css'))
app.use('*/js',express.static(__dirname+'/public/js'))
app.use(express.static(__dirname+'/public'))


//--------------- EXPRESS SESSION SETUP-----------------------------
app.use(session({
    secret:process.env.SESSION_SECRET_KEY,
    saveUninitialized:false,
    resave:true
}))
//----- ----------------- PASSPORT SETUP ----------------------------
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
// use method override for making put,delete requests
app.use(methodOverride('_method'))


// ------------ GLOBAL MIDDLEWARE HANDLING FOR DISPLAYING MESSAGE TO CLIENT----------------
app.use((req,res,next)=>{
    res.locals.err_msg=req.flash('err_msg')
    res.locals.error=req.flash('error')
    res.locals.success=req.flash('success')
    next()
})

//------------------------------ ROUTES---------------------

//-------------- GLOBAL ERROR HANDLER-----------------
app.use((err, req, res, next) => {
    res.render('error',{
        error:{
            code:500,
            title:'Internal Server Error',
            message:'Something Went Wrong! Try  again later or report our problem!'
        }
    })
 })
///----------------------- @gethome Route----------------------
app.use('/',require('./routes/index'))

///----------------------- @posts Route----------------------
app.use('/posts',require('./routes/posts'))

///----------------------- @users Route----------------------
app.use('/users',require('./routes/users'))

///----------------------- @comments Route----------------------
app.use('/comments',require('./routes/comment'))

///----------------------- @Admin Route----------------------
app.use('/admin/manage',require('./routes/admin'))



//--------------------- 404 page---------------
app.get('/*',(req,res)=>res.render('404'))




app.listen(process.env.PORT || 3000 , ()=>console.log('Server is runing at http://localhost:3000/'))