const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
const {User} = require('./models/user');
const {Audio} = require('./models/audio');
const {Badge} = require('./models/badges');
const {Challenge} = require('./models/challenge');

const jsonParser = bodyParser.json();
const app = express();
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/users/:id', (req, res) => {
		User
		.findById(req.params.id)
		.populate('badges')
		.then(user => res.json(user))
		.catch(err => {
			console.log(err);
			res.status(500).json({'error':'Something went horribly awry.'});
		});
});

app.put('/users/:id', (req, res) => {
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

	User
	.findByIdAndUpdate(req.body.id, {$set : toUpdate})
	.then(user => res.status(204).end())
	.catch(err => res.status(500).json({message:'Internal server error'}));

});

app.get('/audios', (req, res) => {
	Audio
	.find()
	.then(audios => res.json(audios))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error': 'Something went wrong.'});
	});
});

app.get('/badges/:name', (req, res) => {
	Badge
	.findOne({name: req.params.name})
	.then(badge => res.json(badge))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error':'Something went wrong.'});
	});
});

app.get('/challenges/:name', (req, res) => {
	Challenge
	.findOne({name: req.params.name})
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

app.put('/challenges/:id', (req, res)=> {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
	const message = `Request path is (${req.params.id}) and request body id
					(${req.body.id}) should match`;
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

	Challenge
	.findByIdAndUpdate(req.params.id)
	.then(challenge => res.status(204).end())
	.catch(err => res.status(500).json({message: 'Internal server error'}));
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