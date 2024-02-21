const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const {eAdmin} = require('../helpers/eAdmin')

require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

var erros = []

router.get('/', (req, res) => {
  res.render('admin/index')
})

router.get('/categorias', (req, res) => {
  erros = []
  Categoria.find().sort({date: 'desc'}).lean()
    .then((categorias) => {
      res.render('admin/categorias', {categorias})
    })
    .catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar categorias!')
      res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
  erros = []
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 3) {
    erros.push({text: 'Nome inválido ou muito pequeno!'})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length < 3) {
    erros.push({text: 'Slug inválido oumuito pequeno!'})
  }

  if(erros.length > 0) {
    res.render('admin/addcategorias', {erros})
  }else {
    const novaCategoria = {
     nome: req.body.nome,
      slug: req.body.slug
    }
  
    new Categoria(novaCategoria).save()
      .then(() => {
        console.log('Categoria salva com sucesso!')
        req.flash('success_msg', 'Categoria criada com sucesso!')
        res.redirect('/admin/categorias')
      })
      .catch((err) => {
        console.log('Erro ao salvar categoria: '+err)
        req.flash('error_msg', 'Houve um erro ao salvar a categoria!')
        res.redirect('/admin')
      })
  }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  erros = []
  Categoria.findOne({_id:req.params.id}).lean()
    .then(categoria => 
      res.render('admin/editcategoria', {categoria}))
    .catch(err => {
      console.log(err)
      req.flash('error_msg', 'Essa categoria não existe')
      res.redirect('/adim/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
  erros = []
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 3) {
    erros.push({text: 'Nome inválido ou muito pequeno!'})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length < 3) {
    erros.push({text: 'Slug inválido oumuito pequeno!'})
  }

  if(erros.length > 0) {
    res.render('admin/addcategorias', {erros})
  }else {
    Categoria.findOne({_id: req.body.id})
      .then(categoria => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save()
          .then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
          })
          .catch(err => {
            req.flash('error_msg', 'Houve um erro ao salvar os dados!')
            res.redirect('/admin/categorias')
          })
      })
      .catch(err => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria!')
        res.redirect('/admin/categorias')
      })
  }
})

router.get('/categorias/delete/:id', eAdmin,(req, res) => {
  erros = []
  Categoria.findOneAndDelete({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Categoria deletada com sucesso!')
      res.redirect('/admin/categorias')
    })
    .catch(err => {
      req.flash('error_msg', 'erro ao deletar categoria!')
      res.redirect('/admin/categorias')
    })
})

router.get('/postagens', (req, res) => {
  erros = []
  Postagem.find().populate('categoria').sort({data: 'desc'}).lean()
    .then(postagens => {
      res.render('admin/postagens', {postagens})
    })
    .catch(e => {
      req.flash('error_msg', 'Erro ao listar as postagens!')
      res.redirect('/admin')
    })
})

router.get('/postagem/add', eAdmin, (req, res) => {
  erros = []
  Categoria.find().lean()
    .then(categorias => {
      res.render('admin/addpostagem', {categorias})
    })
    .catch(e => {
      req.flash('error_msg', 'Houve um erro ao carrear o formulario!')
      res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {

  erros = []

  if(req.body.categoria == '0') {
    erros.push({text: 'Categoria inválida!'})
  }

  if(erros.length > 0 ){
    res.render('admin/addpostagem', {erros})
  }else {
    const novapostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      slug: req.body.slug,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    }
 
    new Postagem(novapostagem).save()
      .then(() => {
        req.flash('success_msg', 'Postagem criada com sucesso!')
        res.redirect('/admin/postagens')
      })
      .catch((e) => {
        req.flash('error_msg', 'Erro ao criar postagem')
        res.redirect('/admin/postagens')
      })
  }
})

router.get('/postagens/edit/:id', (req, res) => {
  erros = []
  Postagem.findOne({_id: req.params.id}).lean()
    .then((postagem) => {
      Categoria.find().lean()
        .then(categorias => {
          res.render('admin/editpostagem', {categorias, postagem})
        })
        .catch(e => {
          req.flash('error_msg', 'Error ao carregar as categorias!')
          res.redirect('admin/postagens')
        })
    })
    .catch(err => {
      console.log(err)
      req.flash('error_msg', 'Essa postagem não existe')
      res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', (req, res) => {
  erros = []
  if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length < 3) {
    erros.push({text: 'Titulo inválido ou muito pequeno!'})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length < 3) {
    erros.push({text: 'Slug inválido oumuito pequeno!'})
  }

  if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null || req.body.descricao.length < 3) {
    erros.push({text: 'descricao inválido oumuito pequeno!'})
  }

  if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length < 3) {
    erros.push({text: 'conteudo inválido oumuito pequeno!'})
  }

  if(erros.length > 0) {
    res.render('admin/addpostagem', {erros})
  }else {
    Postagem.findOne({_id: req.body.id})
      .then(postagem => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save()
          .then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
          })
          .catch(err => {
            req.flash('error_msg', 'Houve um erro ao salvar os dados!')
            res.redirect('/admin/postagens')
          })
      })
      .catch(err => {
        req.flash('error_msg', 'Houve um erro ao editar a postagem!')
        res.redirect('/admin/postagens')
      })
  }
})

router.get('/postagens/delete/:id', eAdmin, (req, res) => {
  erros = []
  Postagem.findOneAndDelete({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Postagem deletada com sucesso!')
      res.redirect('/admin/postagens')
    })
    .catch(err => {
      req.flash('error_msg', 'erro ao deletar postagem!')
      res.redirect('/admin/postagens')
    })
})

module.exports = router