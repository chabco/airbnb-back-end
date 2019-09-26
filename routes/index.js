var express = require('express');
var router = express.Router();
var multer  = require('multer') // because urlencoded can't handle multiform stuff like files
var upload = multer({ dest: './public/images' }) // hand multiform an object
var db = require('../db');


router.post('*', upload.single('locationImage'), (req, res, next)=>{
	const token = req.body.token
	const getUserIdQuery = `SELECT id FROM users WHERE token = ?`;
    db.query(getUserIdQuery, [token], (err, results)=>{
        if(results.length === 0){
			res.locals.logginIn = false;
        } else {
			res.locals.logginIn = true;
			res.locals.uid = results[0].id;
			// res.locals.file = req.file;
		}
		next(); // send user on to next route
    })
})

module.exports = router;
