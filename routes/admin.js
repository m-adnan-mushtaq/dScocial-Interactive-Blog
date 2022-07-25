// ------------------@admin routes include manage posts and manage users---

const express=require('express')
const router=express.Router()
const { ensureAuth } = require('../middlewares/ensureAuth')
const User=require('../models/User')
const Post=require('../models/Post')
const Comment=require('../models/Comment')
const { pagination }=require('../middlewares/pagination')

//----------------------------- manage users--------------

router.get('/users',ensureAuth,ensureAdmin,async (req,res)=>{
    // show all users registerd
    try {

        const users=await User.find().exec()
        res.render('dashboard/admin/users',{users,user:req.user})
        
    } catch (error) {
        req.flash('err_msg','Something Went Wrong, Try again Later!')
        res.render('error',{
            error:{
                code:500,
                title:'Internal Server Error',
                message:'Something Went Wrong! Try  again later or report our problem!'
            }
        })
        console.log(error);
    }
    
})

// delete------------------------------------users-----------------------------------
// delete user and his all comments he made
router.delete('/users/:id',ensureAuth,ensureAdmin,async(req,res)=>{
    try {
        // find user and delte one
        await User.deleteOne({_id:req.params.id}).exec()
        // and find comments and delete all comments
        await Comment.deleteMany({autor:req.params.id})
        req.flash('success','User Delete Succesfully!')
        res.redirect('/admin/manage/users')
        
    } catch (error) {
        req.flash('err_msg',error.message)
        res.redirect('/admin/manage/users')
    }
})


//--------------------- get all posts user---------------------------------------
router.get('/posts',ensureAuth,ensureAdmin,pagination('',{approved:false}),async(req,res)=>{
    try {
        let { posts, total_pages, next, previous, current_page, countIndex } = req.resObj
        res.render('dashboard/admin/posts', {
            user: req.user, posts, total_pages, next, previous, current_page, countIndex,
        })
        
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

//------------------------- approve post-----------------------------
router.put('/posts/:id',ensureAuth,ensureAdmin,async(req,res)=>{
    try {
        await Post.findOneAndUpdate({_id:req.params.id},{
            approved:true
        }).exec()
        req.flash('success','Done! Post Approved!')
        res.redirect('/admin/manage/posts')
    } catch (error) {
        req.flash('err_msg','Something Went Wrong, Try again Later!')
        res.redirect('/admin/manage/posts')
        console.log(error.message);
        
    }
    
})

// ensure admin
function ensureAdmin(req,res,next) {
    if (req.user.name=='Admin') {
        next()
        return
    }
    else{
        req.flash('err_msg','Authorization Failed!, Page is only for Admins!')
        res.redirect('/users/dashboard')
    }
}
module.exports=router
