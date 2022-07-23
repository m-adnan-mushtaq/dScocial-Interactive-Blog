const mongoose=require('mongoose')
const Post=require('./Post')
const bcrypt=require('bcrypt')
// create user Schema
const userShema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    googleId:{
        type:String
    },
    picUrl:{
        type:String,
        default:'/dashboard/img/undraw_profile.svg'
    }
})


// hash the user password
userShema.methods.hashPassword=async (password)=>{
    // hash the password
    try {
        return await bcrypt.hash(password,10)
    } catch (error) {
        return error
    }
}


// compare password with typed password
userShema.methods.comparePassword=async(password)=>{
    try {
        return await bcrypt.compare(password,this.password)
    } catch (error) {
        return error
    }
}


// pre methods
userShema.pre('deleteOne',async function (next) {
    try {
        // now find user
        const containsPosts=await Post.find({author:this.getQuery()._id}).exec()

        if(containsPosts.length>0){
            const err = new Error("Couldn't Perform Action, b/c User Contains Post, Make Sure to Delete Post First!");
            next(err)
            return
        }
        next()
        
    } catch (error) {
        next(error)
    }
})
module.exports= mongoose.model('User',userShema)