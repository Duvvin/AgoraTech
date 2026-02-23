// Carregando módulos
    const express = require('express')
    const { engine } = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    const app = express()
    const admin = require('./routes/admin')
    const path = require("path")
    const session = require('express-session')
    const flash = require('connect-flash')
    const dayjs = require('dayjs')
    const usuarios = require('./routes/usuario')
    require('dayjs/locale/pt-br')
    const passport = require("passport")
    require("./config/auth")(passport)

// Configurações
    // Modelo de Data
    dayjs.locale('pt-br')
    // Sessão
        app.use(session({
            secret: "cursonode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    // BodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', engine({
            defaultLayout: 'main',
            helpers: {
                formatDateTime: function(data) {
                    return dayjs(data).format('DD/MM/YYYY [às] HH:mm')
                }
            }
        }))
        app.set('view engine', 'handlebars')
    //  Mongoose
        mongoose.promise = global.Promise
        mongoose.connect('mongodb://localhost/blog')
        .then(() => {
            console.log('Conectado com banco de dados')
        }).catch((err) => {
            console.log('Houve um erro: '+err)
        })
    // Public
        app.use(express.static(path.join(__dirname,"public")))
// Rotas
    app.use('/', admin)
    app.use('/usuarios', usuarios)
// Outros
    const PORT = 8081
    app.listen(PORT,() => {
        console.log('Servidor Rodando')
    })
