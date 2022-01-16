const express = require('express')
const app = express()
const { insertObject , getAllDocuments, FindDocumentsByname} = require('./databaseHandler')
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const adminController = require('./controllers/admin')
//cac request co chua /admin se di den controller admin
app.use('/admin', adminController)

app.get('/login', async (req,res)=>{
    res.render('login')
}) 
app.get('/loginAdmin', async (req,res)=>{
    res.render('loginAdmin')
}) 
app.get('/', async (req,res)=>{
    const results = await getAllDocuments("Products")
    res.render('index', {products : results})
})

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)