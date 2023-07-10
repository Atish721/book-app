const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/books')
const Author = require('../models/author')

const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//Get All Books
router.get('/', async (req, resp) => {

    let query = Book.find()

    if(req.query.title != null && req.query.title != '')
    {
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }

    if(req.query.publishedBefore != null && req.query.publishedBefore != '')
    {
        query = query.lte('publishDate',req.query.publishedBefore)
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != '')
    {
        query = query.gte('publishDate',req.query.publishedAfter)
    }

    try {

        const books = await query.exec()

        resp.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        console.error(error)
        resp.redirect('/')
    }

})

//New Book
router.get('/new', async (req, resp) => {
    renderNewPage(resp, new Book())
})

//Create Book
router.post('/', upload.single('cover'), async (req, resp) => {

    const fileName = req.file != null ? req.file.filename : null

    console.log('req', req.body)
    console.log('fileName', fileName)

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        // resp.render(`books/${newBook.id}`)
        resp.redirect(`books`)
    } catch (error) {
        console.log(error)
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }

        renderNewPage(resp, book, true)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(resp, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = { authors: authors, book: book }
        if (hasError) {
            params.errorMessage = 'Error while creating book'
        }
        // const book = new Book()
        resp.render('books/new', params)
    } catch (error) {
        console.log(error)
        resp.redirect('/books')
    }
}

module.exports = router