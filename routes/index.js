const express = require('express')
const router = express.Router()
const Book = require('../models/books')

router.get('/', async (req,resp)=>{
    let books
    try{
        books= await Book.find().sort({createAt:'desc'}).limit(10).exec()
    }catch(err)
    {
        console.error(err)
        books=[]
    }
    resp.render('index',{books:books})
})

module.exports = router