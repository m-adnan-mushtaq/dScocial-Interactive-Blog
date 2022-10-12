// pagination handler
const Post = require('../models/Post')
const User = require('../models/User')

//---------------- pagination only for all posts---------------
function pagination(constrains='',query={approved:true}) {
    const limit=6
    
    
    // we can also specify the pagination based on model parameters  but in  my  case it will always going to be Post Model
    return async (req, res, next) => {
        let filter={...query}
         // if usser type anything in search box
         if (req.query.search!=="" && req.query.search != null) {
            filter={
                ...filter,
                $or: [{ title:new RegExp(req.query.search.trim(),'ig') }, { content:new RegExp(req.query.search.trim(),'ig')}]
            }
         }
         if (constrains==='user') {
            filter.author=req.params.id
            // also find that user
            req.author=await User.findById(req.params.id)
         }
        try {
            await pages_setup(req,res,limit,filter)
            next()
        }
        catch (error) {
            res.send(error)
            console.log(error);
        }
    }
}

// now work on dashboard pagination functions where req.user is always going to be held
 function dashboard_pagination(query={}) {
let limit=6
    // we can also specify the pagination based on model parameters  but in  my  case it will always going to be Post Model
    return async (req, res, next) => {
        let filter={...query}
       if (req.user.name!='Admin') {
        filter.author=req.user._id

       }
    //    console.trace('Show me',req.user);
    //    console.log(filter);
       if (req.query.search!=="" && req.query.search != null) {
        filter={
            ...filter,
            $or: [{ title:new RegExp(req.query.search.trim(),'ig') }, { content:new RegExp(req.query.search.trim(),'ig')}]
        }
     }
        try {
            await pages_setup(req,res,limit,filter)
            next()
        }
        catch (error) {
            res.send(error)
            console.log(error);
        }
    }
}

// function pagination_setup_handler
async function pages_setup(req, res,limit,filter) {
    let page = parseInt(req.query.page) || 1
    try {
        let startIndex = (page - 1) * limit
        let endIndex = page * limit
        let resObj = {}

        // prevpage info
        if (startIndex > 1) {
            resObj.previous = page - 1
        }
       
        
        
        // calcualte the total count 
        const count=await Post.countDocuments(filter).exec()
        // get the specific Posts
        const foundPosts = await Post.find(filter).limit(limit).skip(startIndex).populate('author').exec()
        if (endIndex < count) {
            resObj.next = page + 1
        }
        // get the total no of page
        resObj.total_pages = Math.ceil(count / limit)
        resObj.posts = foundPosts
        resObj.current_page = page - 1
        resObj.countIndex = startIndex
        req.resObj = resObj
    }
    catch (error) {
        throw new Error(error)
    }
}

// now work on dashboard pagination functions where req.user is always going to be held


module.exports={pagination,dashboard_pagination}