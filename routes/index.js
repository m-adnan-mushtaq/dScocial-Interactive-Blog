const express=require('express')
const router=express.Router()
const Post=require('../models/Post')
const nodemailer=require('nodemailer')

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
router.route('/contact')
.get((req,res)=>{
    res.render('contact',{user:req.user})
}).post(async(req,res)=>{
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_ADDRESS, // generated ethereal user
              pass: process.env.EMAIL_PASSWORD, // generated ethereal password
            },
            tls:{
                rejectUnauthorized:false
              }
          });

          // now send email
           await transporter.sendMail({
            from: '"Adnan Malik 😎", dSocial@gmail.com"', // sender address
            to: req.body.email, // list of receivers
            subject: "Thanks for reaching us!", // Subject line
            text: "Please Provide Your feedback!", // plain text body
            html: `
            <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">
            <h1 style="color:#1a6dfb"> Hi ${req.body.fname+" "+req.body.lname} </h1>
            Your query <i>" ${req.body.message} " </i>  received!✅.
            <p>We will respond to you as soon as possible! 🤗 </p> 

            <h5 style="color:#2fb380;margin:2em;">Provide Your feedback! and share your use experience with us 😍! </h5>
            </div>
            `, // html body
          });
          req.flash('success','Thanks for contacting Us!')
          res.redirect('/contact')
        
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

// ------------ about us page---------------
router.get('/about',(req,res)=>{
    res.render('about',{user:req.user})
})



module.exports=router