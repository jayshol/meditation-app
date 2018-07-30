const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require('passport');
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
const {User} = require('./models/user');
const {Audio} = require('./models/audio');
const {Badge} = require('./models/badges');
const {Challenge} = require('./models/challenge');

const {router:userRouter } = require('./userRouter');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const jsonParser = bodyParser.json();
const app = express();
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use('/api/users/', userRouter);
app.use('/api/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', {session:false});

app.get('/api/protected', jwtAuth, (req, res) => {
	return res.json({
		data:'rosebud'
	});
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/users/:id',jwtAuth, (req, res) => {
		User
		.findById(req.params.id)
		.populate('badges')
		.then(user => res.json(user))
		.catch(err => {
			console.log(err);
			res.status(500).json({'error':'Something went horribly awry.'});
		});
});

app.put('/users/:id', jwtAuth, (req, res) => {
	if(!(req.params.id && req.body._id && req.params.id === req.body._id)){
		const message = `Request path id (${req.params.id}) and request body id (${req.body._id})
						must match`;
		console.error(message);
		return res.status(400).json({message:message});
	}

	const toUpdate = {};
	const updatableFields = ['registeredForCurrenttChallenge',
							 'lastMeditated',
							 'streak',
							 'active',
							 'isRegisteredForNextChallenge',
							 'numberOfDaysMeditated',
							 'badges',
							 'registeredChallenges'];

	updatableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field];
		}
	});
	console.log(toUpdate);
	User
	.findByIdAndUpdate(req.body._id, {$set : toUpdate})
	.then(user => res.status(204).end())
	.catch(err => res.status(500).json({message:err.message}));

});

app.get('/audios', jwtAuth, (req, res) => {
	Audio
	.find()
	.then(audios => res.json(audios))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error': 'Something went wrong.'});
	});
});

app.get('/badges/:name', jwtAuth, (req, res) => {
	Badge
	.findOne({name: req.params.name})
	.then(badge => res.json(badge))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error':'Something went wrong.'});
	});
});

app.get('/challenges/:name', jwtAuth, (req, res) => {
	Challenge
	.findOne({name: req.params.name})
	.populate('registeredUsers')
	.then(challenge => res.json(challenge))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error':'Something went wrong.'});
	});
});

app.post('/challenges', jsonParser, (req, res) => {
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

app.put('/challenges/:id', jwtAuth, (req, res)=> {
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

app.use("*", function(req, res){
	res.status(404).json({message: 'Not Found'});
});


let server;

function runServer(databaseUrl, port = PORT){
	
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if(err){
				return reject(err);
			}
			console.log("connected to database");
			server = app.listen(port, () => {
				console.log(`Your app is listening at port ${port}`);
				resolve();
			})
				.on('error', err =>{
					mongoose.disconnect();
					reject(err);
			});
		});		
	});
}

function closeServer(){
	return mongoose.disconnect().then(() =>{
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if(err){
					reject(err);
					return;
				}
				resolve();
			});
		});
	});
}

if(require.main === module){
	runServer(DATABASE_URL).catch(err => console.error(err));
};


module.exports = {app, runServer, closeServer};