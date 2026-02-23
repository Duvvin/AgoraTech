const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Usuario = mongoose.model('usuarios')
const passport = require("passport")

router.get('/registro', (req, res) => {
    res.render("usuarios/registro")
})

router.post('/registro/criar', (req, res) => {
    let erros = []

    let nome = req.body.nome
    let email = String(req.body.email || "").trim().toLowerCase()
    let senha = req.body.senha

    if(!nome) erros.push({erro: "Nome Inválido"})
    
    if(!email || !validator.isEmail(email)) erros.push({erro: "Seu email não é válido, tente outro"})

    if(!senha || !validator.isStrongPassword(senha)) erros.push({erro: "Senha não atende aos requisitos"})

    if(senha != req.body.senha2) erros.push({erro: "As senhas não coincidem"})

    if(erros.length > 0) {
        res.render("usuarios/registro", { erros: erros })
    }
    
        else {
            Usuario.findOne({email: req.body.email}).then((usuario) => {
                if(usuario) {
                    req.flash("error_msg", "Já existe uma conta com esse email, tente outro")
                    res.redirect("/usuarios/registro")
                } else {
                    const newUser = new Usuario ({
                        nome: nome,
                        email: email,
                        senha: senha
                    })

                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(newUser.senha, salt, (erro, hash) => {
                            if(erro) {
                                req.flash("error_msg", "Houve um erro ao salvar o usuário")
                                res.redirect("/usuarios/registro")
                            }
                            newUser.senha = hash

                            newUser.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso")
                                res.redirect("/usuarios/registro")
                            }).catch((err) => {
                                req.flash("error_msg", "Houve um erro ao salvar o usuário")
                                res.redirect("/usuarios/registro")
                            })
                        })
                    })
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/usuarios/registro")
            })
        }
})

// Rota de Login

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

// LogOut

router.get("/logout", async (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err)

        req.flash("success_msg", "Deslogado com sucesso")
        res.redirect("/")
    })
})

module.exports = router