const express = require('express')
const router=express.Router()
const passport=require('passport')

// all models
const User=require('../models/User')
const Post=require('../models/Post')
const Comment=require('../models/Comment')


const {redirectAuth,ensureAuth}=require('../middlewares/ensureAuth')
const { pagination } = require('../middlewares/pagination')
const randomPosts = require('../middlewares/randomPosts')
const popularPosts = require('../middlewares/popularPosts')

//--------------- view posts specific by user--------------------
router.get('/view/:id',pagination('user'),randomPosts,(req,res)=>{
    let {posts,total_pages,next,previous,current_page,countIndex} = req.resObj
   
    res.render('posts/user_posts',{user:req.user,posts,total_pages,next,previous,current_page,countIndex,author:req.author,randomPosts:req.randomPosts})
})

//------- sign up route--------------------
router.route('/sign-up')
.get(redirectAuth,(req,res)=>{
    const user=new User()
    res.render('log/signUp',{user})
}).post(redirectAuth,async(req,res)=>{
    const {name,email,password}=req.body
    const userDoc=new User({
        name,email,password
    })
    if (!name || !email || !password) {
        req.flash('err_msg','Please Fill all the fields!')
        res.render('log/signUp',{user:userDoc})
        return
    }
    try {
        userDoc.password=await userDoc.hashPassword(password)
        // save user to the database
        await  userDoc.save()
        req.flash('success','Succfully Created Account, Please Sign In to Continue')
        res.status(201).redirect('/users/sign-in')
    } catch (error) {
        req.flash('err_msg','Error while creating your account, Try again!')
        res.render('log/signUp',{user:userDoc})
    }
})

router.route('/sign-in').
get(redirectAuth,(req,res)=>{
    const user=new User()
    res.render('log/signIn',{user})
})
.post(redirectAuth,(req,res,next)=>{
    try {
        
            // serialize user to the database
    passport.authenticate('local',{
        failureRedirect:'/users/sign-in',
        failureFlash:true,
        failureMessage:'Sign in failed! Try again!',
        successFlash:true,
        successMessage:'Successfully! Logged in, Now Enjoy Your Journey on dSocial!',
        successRedirect:'/users/dashboard'
    })(req,res,next)
    } catch (error) {
        res.render('error',{
            error:{
                code:500,
                title:'Internal Server Error',
                message:'Something Went Wrong! Try  again later or report our problem!'
            }
        })
    }
    

})

//------------------ google sign in route-------------------

router.get('/google',redirectAuth, passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',(req,res,next)=>{
    try {
        
        // serialize user to the database
        passport.authenticate('google',{
            failureRedirect:'/users/sign-in',
            failureFlash:true,
            failureMessage:'Sign in failed! Try again!',
            successFlash:true,
            successMessage:'Successfully! Logged in, Now Enjoy Your Journey on dSocial!',
            successRedirect:'/users/dashboard'
        })(req,res,next)
        } catch (error) {
            res.status(500).send({
                error:error.message
            })
        }
})

//----------------------- dashboard route has to show user'sepcific popular posts and his comments------------------

//----------------- dashboard route----------------
router.get('/dashboard',ensureAuth,popularPosts("user"),showComments,async(req,res)=>{
    try {
         // get the all posts overview
    let filter={}
    if (req.user.name!=='Admin') {
        filter.autor=req.user._id
    }
    const allPosts=await Post.find(filter).exec()
    // count
    const summary={
        totalPosts:allPosts.length,
        approvedPosts:(allPosts.filter(post=>post.approved)).length,
        pendingPosts:(allPosts.filter(post=>!post.approved)).length,
        popularPosts:req.popularPosts,
        comments:req.comments

    }
        res.render('dashboard/overview',{user:req.user,summary})
    } catch (error) {
        console.log(error);
        res.render('error',{
            error:{
                code:500,
                title:'Internal Server Error',
                message:'Something Went Wrong! Try  again later or report our problem!'
            }
        })
        
    }
})






//--------------- see profile route--------------
router.get('/dashboard/profile',ensureAuth,(req,res)=> res.render('dashboard/profile',{user:req.user}))
// logout route
router.get('/logout',ensureAuth,(req,res)=>{
        req.logOut((err)=>{
            if (err) {
                res.send(err)
                
            }
            req.flash('success','Logged out Successfully!')
                res.redirect('/users/sign-in')
        })
    
})

//--------------------- find user specific comments-------------
 async function showComments(req,res,next){
        let filter={}
        if(req.user.name!='Admin'){
            filter.author=req.user._id
        }
        try {
            // find comments
            const comments=await Comment.find(filter).populate('author').exec()
            req.comments=comments
            next()
            
            }
        catch (error) {
            next(error)
        }
    }
    

module.exports=router