module.exports = {
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.eAdmin === 1) {
            return next()
        }
        req.flash("error_msg", "Você deve estar logado como ADMIN para acessar esse recurso")
        res.redirect("/usuarios/login")
    }
}