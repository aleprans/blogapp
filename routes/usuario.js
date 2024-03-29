const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

router.get('/registro', (req, res) => {
  res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 3) {
    erros.push({text: 'Nome inválido!'})
  }

  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null || req.body.email.length < 3) {
    erros.push({text: 'Email inválido!'})
  }

  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null || req.body.senha.length < 4) {
    erros.push({text: 'Senha inválida!'})
  }

  if(req.body.senha2 != req.body.senha) {
    erros.push({text: 'Confirmação de senha inválida!'})
  }

  if(erros.length > 0) {
    res.render('usuarios/registro', {erros})
  }else {
    Usuario.findOne({email: req.body.email})
      .then( usuario => {
        if(usuario) {
          req.flash('error_msg', 'Email já cadastrado!')
          res.redirect('/usuarios/registro')
        }else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha
          })

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if(erro) {
                req.flash('error_msg', 'Erro ao salvar o usuário!')
                res.redirect('/')
              }else {
                novoUsuario.senha = hash
                novoUsuario.save()
                  .then(() => {
                    req.flash('success_msg', 'Usuário salvo com sucesso!')
                    res.redirect('/')
                  })
                  .catch(e => {
                    req.flash('error_msg', 'Erro ao salvar usuário!')
                    res.redirect('/usuarios/registro')
                  })
              }
            })
          })
        }
      })
      .catch( e => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
      })
  }
})

router.get('/login', (req, res) => {
  res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true
  })(req, res, next) 
  
})

router.get('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success_msg', 'Deslogado com sucesso!')
    res.redirect('/')
  })
})

module.exports = router