const express = require("express");
const bodyParser = require("body-parser");

const {Audio} = require('./models/audio');
const {Badge} = require('./models/badges');
const passport = require('passport');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const jsonParser = bodyParser.json();
passport.use(localStrategy);
passport.use(jwtStrategy);

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {session:false});

router.get('/audios', jwtAuth, (req, res) => {
	Audio
	.find()
	.then(audios => res.json(audios))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error': 'Something went wrong.'});
	});
});

router.get('/badges/:name', jwtAuth, (req, res) => {
	Badge
	.findOne({name: req.params.name})
	.then(badge => res.json(badge))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error':'Something went wrong.'});
	});
});

module.exports = {router};


