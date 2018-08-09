const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require('passport');
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
//const {User} = require('./models/user');
//const {Audio} = require('./models/audio');
//const {Badge} = require('./models/badges');
//const {Challenge} = require('./models/challenge');

const {router:userRouter } = require('./userRouter');
const {router:challengeRouter} = require('./challengeRouter');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
const {router:materialRouter} = require('./materialRouter');

const jsonParser = bodyParser.json();
const app = express();
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use('/api/users/', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/challenges', challengeRouter);
app.use('/api/materials/', materialRouter);

const jwtAuth = passport.authenticate('jwt', {session:false});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
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