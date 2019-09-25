var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const randToken = require('rand-token');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send("HELLO");
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
				const insertUserQuery = ` INSERT INTO users (first, last, email, password, token) VALUES (?, ?, ?, ?, ?)`

				// turn the password into something evil for db storage
				const salt = bcrypt.genSaltSync(10);
				const hash = bcrypt.hashSync(password, salt);
				const token = randToken.uid(50);

				db.query(insertUserQuery, [first, last, email, hash, token], (err2) => {
					if(err2){throw err2}
					// Yay!
					res.json({
						msg: "userAdded",
						token,
						email,
						first
					})
				});
			}
		})
	})

	router.post('/login', (req, res) => {
		// console.log(req.body);
		const { email, password } = req.body;
		// first. check db for this email
		const getEmail = `SELECT * FROM users WHERE email = ?`;

		db.query(getEmail, [email], (err, results) => {
			if (err) {throw err} // STOP
			// check to see if there is result
			if (results.length > 0) {
				// found user!!
				const theUser = results[0];
				// NOW let's see if password is correct
				const isValidPass = bcrypt.compareSync(password, theUser.password)

				if (isValidPass) {
					const token = randToken.uid(50);
					const updateUserTokenQuery = `UPDATE users SET token = ? WHERE email = ?`
					db.query(updateUserTokenQuery, [token, email], (err) => {
						if (err) {throw err} // STOP
					})
					res.json({
						msg: "loggedIn",
						first: theUser.first,
						email: theUser.email,
						token
				})
			} else {
				// liar liar pants on fire
				res.json({
					msg: "badPass"
				})
			}
		} else {
			// no match
			res.json({
				msg: "noEmail"
			})
		}
	})
})

module.exports = router;
