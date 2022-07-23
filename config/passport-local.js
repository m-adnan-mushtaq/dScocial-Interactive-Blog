const LocalStrategy=require('passport-local').Strategy
const passport=require('passport')
const User=require('../models/User')
// local strategy for our database users
module.exports=function(){
    passport.use(
        new LocalStrategy({usernameField:'email'},async (email,password,done)=>{
            try {
                // search the user by it's email in your data base
                const foundUser= await User.findOne({email}).exec()
                if(!foundUser)
                    return done(null,false,{message:'Email is not registered yet!'})
                // if a userfounds match it's password
                const match = await foundUser.comparePassword(password)
                if(!match)
                    return done(null,false,{message:'Password is incorrent!, Try again!'})
                // then if password matches done serialize it    
                else    
                    return done(null,foundUser)
            } catch (error) {
                return done(error)
            }
        })

        // passport serialize and deserialize
        // serialize user
        )
        passport.serializeUser( function(user,done) {
            // here serialize user's id
            done(null,user.id)
        })
        // deserialize user
        passport.deserializeUser(async function(id,done) {
            try {
                const user= await User.findById(id).exec()
                done(null,user)
            } catch (error) {
                console.log(error);
            }
        })
}