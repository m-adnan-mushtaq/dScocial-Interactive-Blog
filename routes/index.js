const express=require('express')
const router=express.Router()
const Post=require('../models/Post')

const popularPosts=require('../middlewares/popularPosts')
//------------- get posts and send it------------------------
router.get('/',popularPosts(),async(req,res)=>{
    try {
        // get all posts
        const recentPosts=await Post.find({approved:true}).populate('author').sort([['createdAt',-1]]).limit(4).exec()
        // now get all only three posts
        const allPosts=await Post.find({approved:true}).populate('author').limit(3).exec()
        res.render('index',{user:req.user,recentPosts,allPosts, popularPosts: req.popularPosts})
    } catch (error) {
        res.status(500).send(error.messge)
        console.log(error);
    }
    
})

// ------------ contact us page---------------
router.get('/contact',(req,res)=>{
    res.render('contact',{user:req.user})
})

// ------------ about us page---------------
router.get('/about',(req,res)=>{
    res.render('about',{user:req.user})
})



module.exports=router