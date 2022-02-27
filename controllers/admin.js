const express = require('express')

const { insertObject , getAllDocuments, FindAllDocumentsByName, FindDocumentsByid, DeleteDocumentsByid, checkUserRole, FindDocumentsByEmail} = require('../databaseHandler')

const router = express.Router()
//neu request la: /admin
router.get('/',(req,res)=>{
    res.render('view')
})
router.get('/loginAdmin', async (req,res)=>{
    res.render('loginAdmin')
}) 
router.post('/loginAdmin', async (req,res)=>{
    const emailInputA = req.body.txtLEmailA
    const passInputA = req.body.txtLPassA
    const role = await checkUserRole(emailInputA, passInputA)
    console.log(role)
    if (role == -1) {
        res.redirect('/admin/loginAdmin')
    } else if (role == "Staff"){
        const results = await FindDocumentsByEmail(emailInputA)
        req.session["Staff"] = {
            name: results.name,
            email: emailInputA,
            role: role
        }
        res.redirect('/admin/view')
    }
    else if (role == "Admin"){
        const results = await FindDocumentsByEmail(emailInputA)
        req.session["Admin"] = {
            name: results.name,
            email: emailInputA,
            role: role
        }
        res.redirect('/admin/view')
    }
}) 
//neu request la: /admin/addUser
router.get('/addUser',(req,res)=>{
    res.render('addUser')
})
router.get('/updateProfile', async (req,res)=>{
    res.render('updateProfile')
}) 
router.get('/delete',async (req,res)=>{
    const id = req.query.id
    DeleteDocumentsByid("Products", id)
        res.redirect('/admin/view')
    
})
router.get('/addBooks', async (req,res)=>{
    res.render('addBooks')
}) 
router.post('/addbook',async (req,res)=>{   
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
    if(descriptionInput.length >= 100 || descriptionInput.length < 0)
    {
        const errorDes="do dai cua chuoi tu 0 - 10";
        const oldValues = {name:nameInput,price:priceInput,picURL:picURLInput, description: descriptionInput}
        res.render('addBooks', {errorD : errorDes,  oldValues:oldValues})
        return;
    }
    const newP = {name: nameInput,price:Number.parseFloat(priceInput), description: descriptionInput, picURL:picURLInput}
    insertObject("Products",newP)
    res.redirect('/admin/view')
})
router.get('/editBooks', async (req,res)=>{
    const id = req.query.id  
    const productToEdit = await FindDocumentsByid("Products", id)
    res.render('editBooks', {product : productToEdit})
}) 

router.post('/editBooks',async (req,res)=>{
    //lấy dữ liệu 
    const nameEdit = req.body.txtName
    const priceEdit = req.body.txtPrice
    const picURLEdit = req.body.txtPicURL
    const descriptionEdit=req.body.txtDescription
    //lấy id để từ id đó sửa các giá trị khác
    const id = req.body.txtId
    const dbo = await FindDocumentsByid("Products", id)
    await dbo.collection("Products").updateOne({_id : ObjectId(id)}, { $set: {name : nameEdit, price : priceEdit, picURL : picURLEdit, description : descriptionEdit} })
    res.redirect('/view')
})

//Submit add User
router.post('/addUser',(req,res)=>{
    const name = req.body.txtNameA
    const email = req.body.txtEmailA
    const role = req.body.txtRoleA
    const password= req.body.txtPassA
    const objectToInsert = {
        name: name,
        email: email,
        role: role,
        password: password
    }
    insertObject("Users",objectToInsert)
    res.redirect('/admin/view')
})
router.get('/view', requiresLoginAdminAStaff, async (req,res)=>{
    //1.lay du lieu 
    if(req.session["Admin"])
    {
        admin = req.session["Admin"]
    }else{
        admin = req.session["Staff"]
    }
    const searchInput = req.query.txtSearch
    const collectionName = "Products"
    const results = await getAllDocuments(collectionName)
    const resultSearch = await FindAllDocumentsByName(searchInput)
    //2.hien thu du lieu qua HBS
    if(searchInput == null)
    {          
        res.render('view', {products: results, admin: admin})       
    }else{   
        if(resultSearch.length != 0)
        {                 
            res.render('view', {products: resultSearch, admin: admin})
        }else {
            const messageS = " Khong tim thay"
            res.render('view', {products: results, messS : messageS, admin: admin})
        }
    }  
})

function requiresLoginAdmin(req,res,next){
    if(req.session["Admin"]){
        return next()
    }else{
        res.redirect('/login')
    }
}
function requiresLoginAdminAStaff(req,res,next){
    if(req.session["Admin"] || req.session["Staff"]){
        return next()
    }else{
        res.redirect('/admin/loginAdmin')
    }
}
module.exports = router;