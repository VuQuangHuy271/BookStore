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
    const name = req.body.txtName
    const role = req.body.Role
    const pass= req.body.txtPassword
    const objectToInsert = {
        userName: name,
        role:role,
        password: pass
    }
    insertObject("Users",objectToInsert)
    res.render('adminIndex')
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
module.exports = router;