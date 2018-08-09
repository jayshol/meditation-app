const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');

const {Challenge} = require('./models/challenge');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session:false});

const jsonParser = bodyParser.json();
const router = express.Router();

router.get('/:name', jwtAuth, (req, res) => {
	Challenge
	.findOne({name: req.params.name})
	.populate('registeredUsers')
	.then(challenge => res.json(challenge))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error':'Something went wrong.'});
	});
});

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['name', 'registeredUsers', 'startDate', 'endDate', 'status'];
	for(let i=0;i<requiredFields.length; i++){
		const field = requiredFields[i];
		if(!(field in req.body)){
			const message = `Missing \`${field} \` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const challenge = Challenge.create({
		name : req.body.name,
		registeredUsers : req.body.registeredUsers,
		startDate : req.body.startDate,
		endDate : req.body.endDate,
		status : req.body.status
	});
	res.status(201).json(challenge);
});

router.put('/:id', jwtAuth, (req, res)=> {
	if(!(req.params.id && req.body._id && req.params.id === req.body._id)){
	const message = `Request path is (${req.params.id}) and request body id
					(${req.body._id}) should match`;
	console.error(message);
	return res.status(400).json({message: message});
	}

	const updatableFields = ['registeredUsers', 'status'];
	const toUpdate = {};

	updatableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field];
		}
	});
	console.log(toUpdate);
	Challenge
	.findByIdAndUpdate(req.body._id, { $set: toUpdate})
	.then(challenge => res.status(204).end())
	.catch(err => res.status(500).json({message: err.message}));
});

module.exports = {router};