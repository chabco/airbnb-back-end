var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.post('/signup', (req, res, next)=> {
	// someone wants to sign up here!!
	// first of all, check to see if data is valid
	const {first, last, email, password } = req.body;
	if ((!first) || (!last) || (!email) || (!password)){
		// STOP. BYE!
		res.json({
			msg: "invalidData"
		})
		return;
	}
		// if we get this far, the data is valid, see if the user is in the db
		const checkUserQuery = `SELECT * FROM users WHERE email = ?`
		db.query(checkUserQuery, [email], (err, results) => {
			if(err){throw err}; // FULL STOP!!
			if(results.length > 0){
				// this email has been used, STOP!
				res.json({
					msg: "userExists"
				})
			} else {
				// this email has NOT been used and is added to the database
				const insertUserQuery = ` INSERT INTO users (first, last, email, password) VALUES (?, ?, ?, ?)`

				// turn the password into something evil for db storage
				const salt = bcrypt.genSaltSync(10);
				const hash = bcrypt.hashSync(password, salt);

				db.query(insertUserQuery, [first, last, email, hash], (err2) => {
					if(err2){throw err2}
					// Yay!
					res.json({
						msg: "userAdded"
					})
				});
			}
		})
})

module.exports = router;
