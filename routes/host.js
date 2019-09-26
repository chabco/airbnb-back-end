var express = require('express');
var router = express.Router();
var db = require('../db');

const fs = require('fs');

//    post('/host/homes')
// middleware
router.post('/homes', (req, res)=>{
    console.log(req.body);

    
    
    console.log(req.file);

    if (!res.locals.logginIn) {
        res.json ({
            msg:"badToken"
        })
        return;
    }


    const { title,location, guests, pricePerNight, details, amenities, token } = req.body


    const f = req.file;
    const finalFilePath = f.destination+'/'+Date.now()+f.originalname;
    const filePathForDb = finalFilePath.slice(8)
    fs.rename(f.path, finalFilePath, (err) => {
        if(err) {throw err}
    })

    const insertHomeQuery = `INSERT INTO homes (uid, title, location, guests, pricePerNight, details, amenities, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const dbValues = [res.locals.uid, title, location, guests, pricePerNight, details, amenities, filePathForDb]
    db.query (insertHomeQuery, dbValues, (err) => {
        if(err) throw err;
        res.json({
            msg: "homeAdded"
        })
    })
    // res.json(req.body);
});

module.exports = router;