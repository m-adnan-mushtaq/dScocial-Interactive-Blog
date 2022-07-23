const mongoose=require('mongoose')
const {Schema}=mongoose

// create the comment model
const commentSchema=Schema({
    comment:{
        type:String,
        required:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:'Post',
        required:true
    }
})

module.exports=new mongoose.model('Comment',commentSchema)