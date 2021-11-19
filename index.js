require('babel-register')({
  presets: [ 'react' ]
})

const express = require('express'),
  mongodb = require('mongodb'),
  app = express(),
  bodyParser = require('body-parser'),
  validator = require('express-validator'),
  logger = require('morgan'),
  errorHandler = require('errorhandler'),
  compression = require('compression'),
  url = 'mongodb://localhost:27017/board',
  ReactDOMServer = require('react-dom/server'),
  React = require('react')


const Header = React.createFactory(require('./components/header.jsx')),
  Footer = React.createFactory(require('./components/footer.jsx')),
  MessageBoard = React.createFactory(require('./components/board.jsx'))

mongodb.MongoClient.connect(url, (err, db) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  app.set('view engine', 'hbs')

  app.use(compression())
  app.use(logger('dev'))
  app.use(errorHandler())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(validator())
  app.use(express.static('public'))

  app.use((req, res, next) => {
    req.messages = db.collection('messages')
    return next()
  })

  app.get('/messages', (req, res, next) => {
    req.messages.find({}, {sort: {_id: -1}}).toArray((err, docs) => {
      if (err) return next(err)
      return res.json(docs)
    })
  })

  var request=require('request');

  app.get('/messages', (req, res) => {
   
    request(
      'https://api.voxqube.com:7000/api/v2/voices/list',
      (err, response, body) => {
        if (err) return res.status(500).send({ message: err })        
        //res.send(body)
       var data=JSON.parse(body)
        db.collection('messages').insert(data, (err, result) => {
         // if (error) throw error;
          console.log(data);
       
      })
      }
    )
   
   
    
  })
 
  app.post('/messages', (req, res, next) => {
    console.log(req.body)
    req.checkBody('providerLanguage', 'Invalid providerLanguage in body').notEmpty()
    req.checkBody('language', 'Invalid language in body').notEmpty()
    req.checkBody('name', 'Invalid name in body').notEmpty()
    req.checkBody('sex', 'Invalid sex in body').notEmpty()
    let newMessage = {
      providerLanguage: req.body.providerLanguage,
      language: req.body.language,
      name: req.body.name,
      id: req.body.id,
      sex: req.body.sex,
      provider: req.body.provider
    }
    let errors = req.validationErrors()
    if (errors) return next(errors)
    req.messages.insert(newMessage, (err, result) => {
      if (err) return next(err)
      return res.json(result.ops[0])
    })
  })

  app.get('/', (req, res, next) => {
    req.messages.find({}, {sort: {_id: -1}}).toArray((err, docs) => {
      if (err) return next(err)
      res.render('index', {
        header: ReactDOMServer.renderToString(Header()),
        footer: ReactDOMServer.renderToString(Footer()),
        messageBoard: ReactDOMServer.renderToString(MessageBoard({messages: docs})),
        props: '<script type="text/javascript">var messages='+JSON.stringify(docs)+'</script>'
        // props: '<script type="text/javascript">var messages='+JSON.stringify({})+'</script>'
        // messageBoard: ReactDOMServer.renderToString(MessageBoard({messages: [{_id:1, language: 'RUS', providerLanguage: 'ru-RUS', name: 'Valeriy', sex: 'male', provider: 'yandex'}]}))
      })
    })
  })

  app.listen(3000)
})
