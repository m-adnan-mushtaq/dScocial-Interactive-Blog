const Post=require('../models/Post')
const Comment=require('../models/Comment')
// get the popular posts on behalf of the comment count and limit to 4
module.exports=function popularPosts(constrains="") {
    return async function(req,res,next) {
        try {
            let pipelineArr=[{
                $match:{approved:true}
            }]
            if (constrains=="user" && req.user.name!="Admin") {
             pipelineArr=[
                    {
                        $match:{author:req.user._id,approved:true}
                    }
                ]
            }

            pipelineArr=pipelineArr.concat(
                [
                    {$unset:['content']},
                    { 
                       $addFields: {
                          numberOfComments: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: 0} }
                       },
                    },
                    { $sort: {"numberOfComments":-1} },
                    {$limit:4}
                 ]
            )
            // get the popular posts
            let popularPosts=await Post.aggregate(pipelineArr)
             popularPosts=popularPosts.map(doc => Post.hydrate(doc))
             req.popularPosts=popularPosts
            next()
        } catch (error) {
            next(error)
        }
    }
}
