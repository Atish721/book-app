

const express = require('express')
const router = express.Router()
// const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/books')
const Author = require('../models/author')

// const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']


//Get All Books
router.get('/', async (req, resp) => {

    let query = Book.find()

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }

    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try {

        const books = await query.exec()

        resp.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {

        resp.redirect('/')
    }

})

//New Book
router.get('/new', async (req, resp) => {
    renderNewPage(resp, new Book())
})

//Create Book
router.post('/', async (req, resp) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })

    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        resp.redirect(`/books/${newBook.id}`)

    } catch (error) {
        // if (book.coverImageName != null) {
        //      removeBookCover(book.coverImageName)
        // }

        renderNewPage(resp, book, true)
    }
})

// function removeBookCover(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.error(err)
//     })
// }


//Show book route
router.get('/:id', async (req, resp) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        resp.render('books/show', { book: book })
    } catch (error) {
        resp.redirect('/')
    }
})

//Edit book routes
router.get('/:id/edit', async (req, resp) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(resp, book)
    }
    catch {
        resp.redirect('/')
    }
})


//Update Book
router.put('/:id', async (req, resp) => {

    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save()

        resp.redirect(`/books/${book.id}`)
    } catch (error) {
    
        if (book != null) {
            renderEditPage(resp, book, true)
        }
        else {
            redirect('/')
        }
    }
})


//Delete book page
router.delete('/:id',async(req,resp)=>{
    let book

    try
    {
        book = await Book.findById(req.params.id)
        await book.remove()

        resp.redirect('/books')
    }
    catch
    {
        if(book != null)
        {
            resp.render('books/show',{
                book:book,
                errorMessage:'Could not remove book'
            })
        }
        else
        {
            resp.redirect('/')
        }

    }
})

async function renderNewPage(resp, book, hasError = false) {
    renderFormPage(resp, book, 'new', hasError)
}

async function renderEditPage(resp, book, hasError = false) {
    renderFormPage(resp, book, 'edit', hasError)
}

async function renderFormPage(resp, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = { authors: authors, book: book }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error while updating book'
            }
            else {
                params.errorMessage = 'Error while creating book'
            }
        }
        // const book = new Book()
        resp.render(`books/${form}`, params)
    } catch (error) {

        resp.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return

    const cover = JSON.parse(coverEncoded)

    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router

