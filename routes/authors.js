const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Books = require('../models/books')

//All authors route
router.get('/', async (req, resp) => {

    let searchOptions = {}
    if(req.query.name != null && req.query.name!='') {
        searchOptions.name= new RegExp(req.query.name,'i') 
    }

    try {
        const authors = await Author.find(searchOptions)
        resp.render('authors/index', { authors: authors, searchOptions:req.query })
    } catch (error) {
        
        resp.redirect('/')
    }
})

//New author form
router.get('/new', (req, resp) => {
    resp.render('authors/new', { author: new Author() })
})

//Create author
router.post('/', async (req, resp) => {

    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()
        resp.redirect(`authors/${newAuthor.id}`)
       
    } catch (err) {
        resp.render('authors/new', {
            author: author,
            errorMessage: 'Error while creating author.'
        })
        
    }

    // author.save((err,newAuthor)=>{
    //     if(err){
    //         req.render('authoer/new',{
    //             author:author,
    //             errorMessage : 'Error while creating author.'
    //         })
    //     }
    //     else
    //     {
    //         // res.redirect(`authors/${newAuthor.id}`)
    //         resp.redirect(`authors`)
    //     }
    // })
})

router.get('/:id',async(req,resp)=>{
    // resp.send('Show author:'+req.params.id)
    try
    {
        const author = await Author.findById(req.params.id)
        const books = await Books.find({author:author.id}).limit(6).exec()
        resp.render('authors/show',{
            author: author,
            booksByAuthor: books
        })
    }
    catch(err)
    {
        
        resp.redirect('/')
    }
})

router.get('/:id/edit',async (req,resp)=>{
    try {
        const author = await Author.findById(req.params.id)

        resp.render('authors/edit', { author:author })
    } catch (error) {
        req.redirect('/autors')
    }
})

router.put('/:id',async (req,resp)=>{
    
    let author

    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        resp.redirect(`/authors/${author.id}`)
        
    } catch (err) {
        

        if(author==null)
        {
            resp.redirect('/')
        }
        else
        {
            resp.render('authors/edit', {
                author: author,
                errorMessage: 'Error while updating author.'
            })
        }
        
    }
})

router.delete('/:id',async(req,resp)=>{
    let author

    try {
        author = await Author.findById(req.params.id)
        
        await author.remove()

        resp.redirect('/authors')
        
    } catch (err) {
        

        if(author==null)
        {
            resp.redirect('/')
        }
        else
        {
            resp.redirect(`/authors/${author.id}`)
        }        
    }
})

module.exports = router