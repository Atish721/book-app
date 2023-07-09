const express = require('express')
const router = express.Router()
const Author = require('../models/author')

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
        console.log(error)
        resp.redirect('/')
    }
})

//New author
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
        // res.redirect(`authors/${newAuthor.id}`)
        resp.redirect(`authors`)
    } catch (err) {
        resp.render('authors/new', {
            author: author,
            errorMessage: 'Error while creating author.'
        })
        console.log(err)
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

module.exports = router