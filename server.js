const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/signUp', (req, res) => {
	res.sendFile(__dirname + '/views/signUp.html');
});

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/views/login.html');
});

app.get('/homePage', (req, res) => {
	res.sendFile(__dirname + '/views/homePage.html');
});

app.get('/userProfile', (req, res) => {
	res.sendFile(__dirname + '/views/profile.html');
});

app.get('/dashboard', (req, res) => {
	res.sendFile(__dirname + '/views/dashboard.html');
});

app.get('/21-day-challenge', (req, res) => {
	res.sendFile(__dirname + "/views/21-day-challenge.html");
});

let server;

function runServer(){
	const port = process.env.PORT || 8080;
	return new Promise((resolve, reject) => {
		server = app.listen(port, () => {
			console.log(`Your app is listening at port ${port}`);
			resolve(server);
		}).on('error', err =>{
			reject(err);
		});
	});
}

function closeServer(){
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
}

if(require.main === module){
	runServer().catch(err => console.error(err));
};


module.exports = {app, runServer, closeServer};