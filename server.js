if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressLayoutes = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')

const indexRoutes = require('./routes/index')
const authorRoutes = require('./routes/authors')
const bookRoutes = require('./routes/books')

//Port
const port = process.env.PORT || 3000


//Middleware
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayoutes)
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

//Database connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => {
    console.log('Connected to Mongoose')
})

//Routes
app.use('/', indexRoutes)
app.use('/authors', authorRoutes)
app.use('/books', bookRoutes)


app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`)
})