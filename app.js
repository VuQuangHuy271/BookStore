const express = require('express')
const session = require('express-session')
const app = express()

const { insertObject , getAllDocuments, FindDocumentsByname,FindDocumentsByid, checkUserRole, FindDocumentsByEmail, FindDocumentsByPhone} = require('./databaseHandler')
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: '12121121@adas', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))
app.use(express.static('public'))
const adminController = require('./controllers/admin')
//cac request co chua /admin se di den controller admin
app.use('/admin', adminController)

app.get('/inforProduct', async (req,res)=>{
    const id = req.query.id
    const results = await FindDocumentsByid("Products", id)
    res.render('inforProduct', {products : results})

}) 
app.get('/allProduct', async (req,res)=>{
    const results = await getAllDocuments("Products")
    res.render('allProduct', {products : results})
})
app.get('/login', async (req,res)=>{
    res.render('login')
})
app.post('/login',async (req,res)=>{
    const emailInput = req.body.txtLName
    const passInput = req.body.txtLPass
    const role = await checkUserRole(emailInput, passInput)
    console.log(role)
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
    const email = FindDocumentsByEmail(customer.email)
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

app.post('/product',async (req,res)=>{   
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const descriptionInput = req.body.txtDescription
    const picURLInput = req.body.txtPicURL
    if(isNaN(priceInput)==true){
        const errorMessage = "Gia phai la so!"
        const oldValues = {name:nameInput,price:priceInput,picURL:picURLInput, description: descriptionInput} 
        res.render('addBooks', {error:errorMessage , oldValues:oldValues})
        return;
    }
    if(descriptionInput.length >= 10 || descriptionInput.length < 0)
    {
        const errorDes="do dai cua chuoi tu 0 - 10";
        const oldValues = {name:nameInput,price:priceInput,picURL:picURLInput, description: descriptionInput}
        res.render('addBooks', {errorD : errorDes,  oldValues:oldValues})
        return;
    }
    const newP = {name: nameInput,price:Number.parseFloat(priceInput), description: descriptionInput, picURL:picURLInput}
    const dbo = await getDatabase()
    const result = await dbo.collection("Products").insertOne(newP)
    console.log("The newly inserted id value is: ", result.insertedId.toHexString());
    res.redirect('/view')
})

app.get('/Cart',requiresLoginCustomer, async (req,res)=>{
    res.render('Cart')
})


const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)