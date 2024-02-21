const express = require("express")
const {engine} = require("express-handlebars")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const path = require("path")
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const db = require('./config/db')

const admin = require("./routes/admin")
const usuarios = require('./routes/usuario')

require('./models/Postagem')
const Postagem = mongoose.model('postagens')

require('./models/Categoria')
const Categoria = mongoose.model('categorias')

const passport = require('passport')
require('./config/auth')(passport)

//Configurações
  //Sessão
    app.use(session({
      secret: 'securit',
      resave: true,
      saveUninitialized: true
    }))
    //sempre abaixo da session
    app.use(passport.initialize()) 
    app.use(passport.session()) 
    // ***********
    app.use(flash())
  // Middleware
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      res.locals.error = req.flash('error')
      res.locals.user = req.user || null
      next()
    })
  //body-Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
  //HandleBars
    app.engine("handlebars", engine({defaultLayout: "main"}))
    app.set("view engine", "handlebars")
  //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI)
      .then(() => console.log('Conectado ao mongoDB'))
      .catch((err) => console.log("Erro ao se conectar ao mongoDB: "+err))
  //Public
    app.use(express.static(path.join(__dirname,"public")))
//Rotas
  app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({date: 'desc'})
      .then(postagens => {
        res.render('index', {postagens})
      })
      .catch(e => {
        req.flash('error_msg', 'Houve um erro interno!' )
        res.redirect('/404')
      })
  })
  app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean()
      .then(postagem => {
        if(postagem) {
          res.render('postagem/index', {postagem})
        }else {
          req.flash('error_msg', 'Essa postagem não existe!')
          res.redirect('/')
        }
      })
      .catch(e => {
        req.flash('error_msg', 'Erro interno')
        res.redirect('/')
      })
  })

  app.get('/categorias', (req, res) => {
    Categoria.find().lean()
      .then(categorias => {
        res.render('categoria/index', {categorias})
      })
      .catch(e => {
        req.flash('error_msg', 'Erro interno')
        res.redirect('/')
      })
  })

  app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean()
      .then( categoria => {
        if(categoria) {
          Postagem.find({categoria: categoria._id}).lean()
            .then( postagens => {
              res.render('categoria/postagens', {postagens, categoria})
            })
            .catch(e => {
              req.flash('error_msg', 'Erro interno')
              res.redirect('/')
            })
        }else {
          req.flash('error_msg', 'Essa categoria não existe!')
          res.redirect('/')
        }
      })
      .catch(e => {
        req.flash('error_msg', 'Erro interno')
        res.redirect('/')
      })
  })

  app.get('/404', (req, res) => {
    res.send('Erro 404!')
  })

  app.use("/admin", admin)
  app.use('/usuarios', usuarios)
//Outros
const PORT = process.env.PORT || 8081
console.log(PORT)
app.listen(PORT, () => {console.log("Servidor rodando")})