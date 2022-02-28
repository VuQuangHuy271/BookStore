const express = require('express')
const session = require('express-session')
const app = express()

const { insertObject , getAllDocuments, FindAllDocumentsByName, checkUserRole, FindDocumentsByEmail, FindDocumentsByPhone, FindDocumentsById} = require('./databaseHandler')
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: '12121121@adas', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))
app.use(express.static('public'))
const adminController = require('./controllers/admin')
//cac request co chua /admin se di den controller admin
app.use('/admin', adminController)

app.get('/inforProduct', async (req,res)=>{
    const id = req.query.id
    const results = await FindDocumentsById("Products", id)
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
    const searchInputH = req.query.txtSearchHome
    const collectionName = "Products"
    const results = await getAllDocuments(collectionName)
    const resultSearch = await FindAllDocumentsByName(searchInputH)
    //2.hien thu du lieu qua HBS
    if(searchInputH == null)
    {         
        res.render('index', {products: results, customerI: customer})       
    }else{   
        if(resultSearch.length != 0)
        {                 
            res.render('index', {products : resultSearch, customerI: customer})
        }else {
            const messageSH = " Khong tim thay"
            res.render('index', {products: results, messSH : messageSH, customerI: customer})
        }
    }   
    
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


app.post('/buy',requiresLoginCustomer, async (req,res)=>{
    const id = req.body.txtId
    const results = await FindDocumentsById("Products", id)
    let cart = req.session["cart"]
    //chua co gio hang trong session, day se la sp dau tien
    if(!cart){
        let dict = {}
        dict[id] = 1
        req.session["cart"] = dict
        console.log("Ban da mua:" + results.name + ", so luong: " + dict[id])
    }else{
        dict = req.session["cart"]
        //co lay product trong dict
        var oldProduct = dict[id]
        //kiem tra xem product da co trong Dict
        if(!oldProduct)
            dict[id] = 1
        else{
            dict[id] = parseInt(oldProduct) +1
        }
        req.session["cart"] = dict
        console.log("Ban da mua:" + results.name + ", so luong: " + dict[id])
    }
    res.redirect('/')
})

app.get('/Cart',async (req,res)=>{
    const cart = req.session["cart"]
    let sum = 0;
    let quantity = 0
    let ship = 0;
    let totalC = 0;
    //Mot array chua cac san pham trong gio hang
    let spDaMua = []
    //neu khach hang da mua it nhat 1 sp
    if(cart){
        const dict = req.session["cart"]       
        for(var id in dict) {
            const results = await FindDocumentsById("Products", id)   
            console.log(dict[id])
            const total = dict[id] * results.price
            spDaMua.push({name: results.name, price: results.price, picURL: results.picURL, total: total, soLuong: dict[id]})   
         }
        for (let i = 0; i < spDaMua.length; i++){
            sum += spDaMua[i].total;
            quantity += spDaMua[i].soLuong;
            console.log(sum)
        }      
    }
    const subtotal = sum;
    if(quantity > 0 && quantity < 10)
    {
        ship = 10
    }else{
        ship = 5
    }
    totalC = sum - ship
    res.render('Cart',{products:spDaMua, subtotal: subtotal, ship: ship, totalC: totalC})
})

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)