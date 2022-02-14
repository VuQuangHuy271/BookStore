const express = require('express')
const session = require('express-session')
const app = express()

const { insertObject , getAllDocuments, FindDocumentsByname,getInforDocuments, checkUserRole, FindDocumentsByEmail, FindDocumentsByPhone} = require('./databaseHandler')
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: '12121121@adas', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))
app.use(express.static('public'))
const adminController = require('./controllers/admin')
//cac request co chua /admin se di den controller admin
app.use('/admin', adminController)

app.get('/login', async (req,res)=>{
    res.render('login')
}) 
app.get('/updateProfile', async (req,res)=>{
    res.render('updateProfile')
}) 
app.get('/addBooks', async (req,res)=>{
    // const nameInput = req.body.txtName
    // const priceInput = req.body.txtPrice
    // const picURLInput = req.body.txtPicURL
    // const categoryInput = req.body.txtCategory

    // if(isNaN(priceInput)==true){
    //     //Khong phai la so, bao loi, ket thuc ham
    //     const errorMessage = "Price must be number!"
    //     const oldValues = {name:nameInput,price:priceInput,picURL:picURLInput, category: categoryInput}
    //     res.render('addBooks',{error:errorMessage,oldValues:oldValues})
    //     return;
    // }
    // const newP = {name:nameInput,price:Number.parseFloat(priceInput),
    //                 picURL:picURLInput, category: categoryInput}
    
    // const collectionName = "Products"
    // //const collectionName = "Products_backup"
    // insertObjectToCollection(collectionName,newP)   
    // res.redirect('adminViewBooks')
    res.render('addBooks')
}) 
app.get('/editBooks', async (req,res)=>{
    res.render('editBooks')
}) 
app.get('/adminViewBooks', async (req,res)=>{
    // //1. lay du lieu tu Mongo
    // const collectionName = "Products"
    // const results = await getAllDocumentsFromCollection(collectionName)
    // //2. hien thi du lieu qua HBS
    // res.render('adminViewBooks',{products:results})
    res.render('adminViewBooks')
}) 
app.get('/inforProduct', async (req,res)=>{
    const results = await getInforDocuments("Products")
    res.render('inforProduct', {products : results})

}) 
app.get('/allProduct', async (req,res)=>{
    const results = await getAllDocuments("Products")
    res.render('allProduct', {products : results})
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
    const resultEmail = await FindDocumentsByEmail(emailInput)
    const resultPhone = await FindDocumentsByPhone(phoneInput)
    if(isNaN(phoneInput)==true){
        const errorMessage = "Số điện thoại của bạn không đúng định dạng!!"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorNa: errorMessage , oldValues:oldValues})
        return;
    }
    if(resultPhone != null)
    {
        errorEmail = "Phone number đã được sử dụng"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorPhones: errorEmail,  oldValues:oldValues})
        return;
    }
    if(resultEmail != null)
    {
        errorEmail = "Email đã được sử dụng"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorE: errorEmail,  oldValues:oldValues})
        return;
    }
    if(phoneInput.length >= 12 || phoneInput.length < 9)
    {
        const errorDes="do dai cua sdt tu 10 - 12";
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

app.get('/updateProfile',requiresLoginCustomer, async (req,res)=>{
    customer = req.session["Customer"]
    const email = FindDocumentsByEmail(Customer.email)
    const results = FindDocumentsByEmail(email)
    res.render('updateProfile', {profile: results, customerI: customer})
})
function requiresLoginCustomer(req,res,next){
    if(req.session["Customer"]){
        return next()
    }else{
        res.redirect('/login')
    }
}
app.get('/adminViewBooks',async (req,res)=>{

})


const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)