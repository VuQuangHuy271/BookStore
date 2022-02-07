const express = require('express')
const session = require('express-session')
const app = express()
const { insertObject , getAllDocuments, FindDocumentsByname, checkUserRole, FindDocumentsByEmail} = require('./databaseHandler')
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: '12121213@adas', cookie: { maxAge: 180 * 60 *1000 }, saveUninitialized: false, resave: false }))
app.use(express.static('public'))
const adminController = require('./controllers/admin')
//cac request co chua /admin se di den controller admin
app.use('/admin', adminController)

app.get('/login', async (req,res)=>{
    res.render('login')
}) 

app.post('/login',async (req,res)=>{
    const emailInput = req.body.txtLName
    const passInput = req.body.txtLPass
    const role = await checkUserRole(emailInput, passInput)
    if (role == -1) {
        res.redirect('/login')
    } else if (role == "Customer"){
        const results = await FindDocumentsByEmail(emailInput)
        req.session["Customer"] = {
            name: results.name,
            email: emailInput,
            role: role
        }
        res.redirect('/')
    }
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
    const roleC = "Customer";
    // if(isNaN(phoneInput)==true){
    //     const errorMessage = "Gia phai la so!"
    //     const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput} 
    //     res.render('register', {error: errorMessage , oldValues:oldValues})
    //     return;
    // }
    if(phoneInput.length >= 12 || phoneInput.length < 9)
    {
        const errorDes="do dai cua chuoi tu 9 - 12";
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC} 
        res.render('register', {errorD: errorDes,  oldValues:oldValues})
        return;
    }
    if(passwordInput != confirmInput)
    {
        const errorConfirm = "Sai mật khẩu"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorCon: errorConfirm,  oldValues:oldValues}) 
        return;
    }
    const newC =  {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
    const collectionName = "Users"
    insertObject(collectionName, newC)
    res.redirect('login')
}) 
app.get('/', async (req,res)=>{
    customer = req.session["Customer"]
    const results = await getAllDocuments("Products")   
    res.render('index', {products : results, customerI: customer})
})


function requiresLoginCustomer(req,res,next){
    if(req.session["Customer"]){
        return next()
    }else{
        res.redirect('/login')
    }
}

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)