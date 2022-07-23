const Post=require('../models/Post')

// find some random posts and assing it to the req object
module.exports=async function randomPosts(req,res,next) {
    try {
        let randomPosts=await Post.aggregate([
            {$match:{approved:true}},
            { $sample: { size: 3 } } 
        ])
         randomPosts = randomPosts.map(doc => Post.hydrate(doc))
        req.randomPosts=randomPosts
        next()
        
    } catch (error) {
        next(error)
    }
    // find some random posts
    
}