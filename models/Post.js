const mongoose=require('mongoose')
const {Schema}=mongoose
const postShcema=Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    coverImageType:{
        type:String,
        required:true,
        validate: {
            validator: function(v) {
              return /image\/*/.test(v);
            },
        }
    },
    coverImage:{
        type:Buffer,
        required:true
    },
    approved:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:'Comment'
        }
    ]
})



// because image are stores as buffer data so html support buffer images but we have to write in this format
postShcema.virtual('coverImageUrl').get(function(){
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
      }
})

module.exports=new mongoose.model('Post',postShcema)