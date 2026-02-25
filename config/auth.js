//Carregando Módulos
const local = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model de Usuário
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')

// Validação do Login
module.exports = function(passport){
    passport.use(new local({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario) {
                return done(null, false, {message: "Nenhuma conta registrada nesse e-mail"})
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id).lean()
            done(null, usuario)
        
        } catch (err) {
            done(err, null)
        }
    })
}