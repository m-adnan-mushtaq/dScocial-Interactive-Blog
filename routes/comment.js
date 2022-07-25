const express=require('express')
const { default: mongoose } = require('mongoose')
const router=express.Router()
const {ensureAuth}=require('../middlewares/ensureAuth')
const app=express()
app.use(express.json())
const Comment=require('../models/Comment')
const Post=require('../models/Post')



//----------- edit a comment--------------------------
router.put('/edit',async(req,res)=>{
    const {comment,commentId,post}=req.body
    try {
        // update the comment asynchronulsy
        await Comment.updateOne({_id:commentId},{
            comment
        },{new:true})
        req.flash('success','Updated Content Successfully!')
        res.redirect(`/posts/${post}`)
    } catch (error) {
        req.flash('err_msg','Something Went Wrong')
        res.redirect(`/posts/${post}`)
    }
    /// 
})

// ---------------------------deleting a comment--------------------
router.delete('/delete/:id',async (req,res)=>{
    const {post}=req.body
    try {
        // delete the comment asynchronulsy
        await Comment.deleteOne({_id:req.params.id})

        // update the posts comment array
        await Post.findOneAndUpdate({_id:req.body.post},
            { $pull: { comments: req.params.id} 
            }
        )

        req.flash('success','Deleted Successfully!')
        res.redirect(`/posts/${post}`)
    } catch (error) {
        req.flash('err_msg','Something Went Wrong')
        res.redirect(`/posts/${post}`)
    }
})
//----------------- create post comment route--------------------
// post a new comment
router.post('/:id/create',ensureAuth,async(req,res)=>{
    // now create a new comment
    try {
        
        // create the new post
        const comment=await Comment.create({
            comment:req.body.comment,
            author:req.user._id,
            post:req.params.id
        })
        // also push the newly created comment in relavent post
        await Post.findOneAndUpdate({_id:req.body.post},
            { $push: { comments: comment._id} 
            },
            {new:true}
        )
        req.flash('success','New Comment Posted!')
        res.redirect(`/posts/${req.params.id}#submitForm`)
    } catch (error) {
        console.log(error);
        req.flash('error','Failed to make comment, Try again!')
        res.redirect(`/posts/${req.params.id}#submitForm`)
    }
})


module.exports=router