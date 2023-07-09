const express = require('express')
const router = express.Router()
const Book = require('../models/books')
const Author = require('../models/author')


//Get All Books
router.get('/', (req, resp) => {
    resp.send('All books')
})

//New Book
router.get('/new', async (req, resp) => {
    try {
        const authors = await Author.find({})
        const book = new Book()
        resp.render('books/new', { authors: authors, book: book })
    } catch (error) {
        resp.redirect('/books')
    }
})

//Create Book
router.post('/', async (req, resp) => {
    const book = new Book({
        title:req.body.title,
        author:req.body.author,
        publishDate:new Date(req.body.publishDate),
        pageCount:req.body.pageCount,
        description:req.body.description
    })
})

module.exports = router