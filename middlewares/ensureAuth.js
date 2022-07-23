module.exports={

    redirectAuth:function(req,res,next) {
        if (req.isAuthenticated()) {
            res.redirect('/users/dashboard')
            return
        }
        next()
        return
    },
    ensureAuth:function(req,res,next) {
        if (!req.isAuthenticated()) {
           req.flash('err_msg','Please Sign in to view resources!') 
           res.redirect('/users/sign-in')
           return
        }
        next()
        return
    }


}
