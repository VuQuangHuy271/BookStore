const express = require('express')
const { insertObject , getAllDocuments, FindDocumentsByname} = require('../databaseHandler')
const router = express.Router()
//neu request la: /admin
router.get('/',(req,res)=>{
    res.render('adminIndex')
})

//neu request la: /admin/addUser
router.get('/addUser',(req,res)=>{
    res.render('addUser')
})

//Submit add User
router.post('/addUser',(req,res)=>{
    const name = req.body.txtRAName
    const role = req.body.txtRole
    const pass= req.body.txtRAPass
    const objectToInsert = {
        email: name,
        role: role,
        password: pass
    }
    insertObject("Users",objectToInsert)
    res.redirect('/')
})
router.get('/view', async (req,res)=>{
    //1.lay du lieu 
    const searchInput = req.query.txtSearch
    const collectionName = "Products"
    const results = await getAllDocuments(collectionName)
    const resultSearch = await FindDocumentsByname(searchInput)
    //2.hien thu du lieu qua HBS
    if(searchInput == null)
    {   
        
        res.render('view', {products: results})       
    }else{   
        if(resultSearch.length != 0)
        {                 
            res.render('view', {products: resultSearch})
        }else {
            const messageS = " Khong tim thay"
            res.render('view', {products: results, messS : messageS})
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
module.exports = router;