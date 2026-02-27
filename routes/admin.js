const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const { eAdmin } = require("/Projetos/APPBlog/helpers/eAdmin")
const multer = require('multer')
const { storage, fileFilter } = require('../config/multer')
const upload = multer({ storage,
                        fileFilter,
                        limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    } })
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "vduarte735@gmail.com",
        pass: "zaew ezuo bfao mqeu",
    }
})
// Pagina inicial
router.get('/', async (req, res) => {
    try {
        const categorias = await Categoria.find().lean()
        const postagens = await Postagem.find().lean()

        res.render('admin/index', {
            categorias,
            postagens
        })
    } catch(err) {
        req.flash("error_msg", "Houve um erro: " + err)
        res.redirect('/')
      }
})

//Pagina principal de posts
router.get('/posts', eAdmin, async (req, res) => {
    try {
        const categorias = await Categoria.find().lean()
        const postagens = await Postagem.find().lean()

        res.render('admin/posts', {
        categorias,
        postagens
    })
    } catch (err) {
        req.flash("error_msg", "Houve um erro: " + err)
        res.redirect('admin/posts')
    }
})

//Pagina de posts por categoria
router.get('/src_posts/:id', eAdmin, async (req, res) => {
    try {
        const categorias = await Categoria.find().lean()
        const catAtual = req.params.id
        const postagens = await Postagem.find({ categoria: catAtual }).lean()

        res.render('admin/src_posts', {
            categorias,
            catAtual,
            postagens
        })

    } catch (err) {
        req.flash("error_msg", "Houve um erro: " + err)
        res.redirect('/posts')
    }
})

// Form Add Posts
router.get('/posts/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário: "+err)
        res.redirect('/posts')
    })
})

//Add Post Page
router.post("/posts/add/success", upload.single('file'), eAdmin, async (req, res) => {
    
    erros = []

    const titulo = req.body.titulo
    const descricao = req.body.descricao
    const conteudo = req.body.conteudo
    const categoria = req.body.categoria
    const img = req.file ? req.file.filename : null

    if(!titulo) erros.push({ erro: "Você precisa definir um título" })
        if(titulo.length < 5) erros.push({ erro: "Seu título é muito curto" })
            
    
    if(!descricao) erros.push({ erro: "Você precisa inserir uma descrição" })

    if(descricao.length < 5) erros.push({ erro: "Sua descrição é muito curta"})

    if(!conteudo) erros.push({ erro: "Você precisa adicionar um conteudo"})

    if(!categoria) erros.push({ erro: "Voce precisa selecionar uma categoria"})

    if(erros.length > 0) return res.render("/posts/add", { erros: erros })
    
    const novoPost = {
        titulo: titulo,
        descricao: descricao,
        conteudo: conteudo,
        categoria: categoria,
        img: img
    }

    await new Postagem(novoPost)
        .save()
        .then(async() => {
            const users = await Usuario.find().lean()
            const emails = users.map(user => user.email)
            transporter.sendMail({
                from: "AgoraTech <vduarte735@gmail.com>",
                bcc: emails,
                subject: novoPost.titulo,
                html: novoPost.conteudo
            })
            req.flash("success_msg", "Postagem criada com Sucesso!")
            res.redirect('/posts')
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao salvar postagem"+err)
            res.redirect('/posts')
        })
})

// Rota de remoção de posts
router.post('/posts/del', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem excluída com sucesso")
        res.redirect('/posts')
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao tentar deletar a postagem")
        res.redirect("/posts")
    })
})

//Pagina de categorias
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({data: 'desc'}).lean().then((categorias) => {
        categorias.forEach(cat => {
            cat.dataFormatada = cat.data.toLocaleDateString('pt-BR')
        })
        res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar as categorias")
        res.redirect('/')
    })
})

// Rota para categoria editada // Redirecionando à aba categorias
router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save()
        .then(() => {
            req.flash("succes_msg", "Categoria salva com sucesso!")
            res.redirect("/categorias")
      }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro ao salvar a categoria"+err)
            res.redirect('/categorias')
      })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar essa categoria")
        res.redirect('/categorias')
    })
})

// Rota para formulário de edição
router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean()
    .then((categoria) => {
        res.render("admin/edit", {categoria: categoria})
  }).catch((err) => {
    req.flash("error_msg", "Não foi possível editar esta categoria")
    req.redirect('admin/categorias')
    })
})

// Rota para deletar categoria
router.post('/categorias/del', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria excluída com sucesso")
        res.redirect('/categorias')
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao tentar deletar a categoria")
        res.redirect("/categorias")
    })
})

// Adicionar Categoria
router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

// Categoria Adicionada
router.post('/categorias/nova', eAdmin, (req, res) => {

    let erros = []

    const nome = req.body.nome
    const slug = req.body.slug

    if (!nome) {
        erros.push({ erro: "Você precisa definir um nome" })
    }

    if (nome && nome.length < 3) {
        erros.push({ erro: "Seu nome precisa ter ao menos 3 caracteres" })
    }

    if (!slug) {
        erros.push({ erro: "Você precisa descrever esta categoria" })
    }

    if (slug && slug.length < 10) {
        erros.push({ erro: "Sua descrição é muito curta. Mínimo 10 caracteres" })
    }

    if (erros.length > 0) {
        return res.render("admin/addcategorias", { erros: erros })
    }

    const novaCat = {
        nome: nome,
        slug: slug
    }

    new Categoria(novaCat)
        .save()
        .then(() => {
            req.flash("success_msg", "Categoria criada com Sucesso!")
            res.redirect('/categorias')
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao salvar categoria")
            res.redirect('/')
        })
})


module.exports = router