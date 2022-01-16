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
app.get('/register', async (req,res)=>{
    res.render('register')
}) 
app.post('/register', async (req,res)=>{
    const nameInput = req.body.txtName
    const phoneInput = req.body.txtPhone
    const emailInput = req.body.txtEmail
    const genderInput = req.body.txtGender
    const cityInput = req.body.txtCity
    const countryInput = req.body.txtCountry
    const passwordInput = req.body.txtPassword
    const confirmInput = req.body.txtConfirm
    // if(isNaN(phoneInput)==true){
    //     const errorMessage = "Gia phai la so!"
    //     const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput} 
    //     res.render('register', {error: errorMessage , oldValues:oldValues})
    //     return;
    // }
    if(phoneInput.length >= 12 || phoneInput.length < 9)
    {
        const errorDes="do dai cua chuoi tu 9 - 12";
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput} 
        res.render('register', {errorD: errorDes,  oldValues:oldValues})
        return;
    }
    if(passwordInput != confirmInput)
    {
        const errorConfirm = "Sai mật khẩu"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput}
        res.render('register', {errorCon: errorConfirm,  oldValues:oldValues}) 
        return;
    }
    const newC =  {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput}
    const collectionName = "AccountOfCustomer"
    insertObject(collectionName, newC)
    res.redirect('login')
}) 
app.get('/', async (req,res)=>{
    const results = await getAllDocuments("Products")
    res.render('index', {products : results})
})

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)