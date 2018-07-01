'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Meditation-app API resource', function(){
	before(function(){
		return runServer();
	});

	after(function(){
		return closeServer();
	});

	describe('Root test', function(){
		it('should return index.html', function(){
			return chai.request(app)
			.get('/')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

		it('should return signUp.html', function(){
			return chai.request(app)
			.get('/signUp')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

		it('should return login.html', function(){
			return chai.request(app)
			.get('/login')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

		it('should return home page', function(){
			return chai.request(app)
			.get('/homePage')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

		it('should return profile page', function(){
			return chai.request(app)
			.get('/userProfile')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

	/*	it('should return dashboard page', function(){
			return chai.request(app)
			.get('/dashboard')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		}); */

		it('should return 21-day challenge page', function(){
			return chai.request(app)
			.get('/21-day-challenge')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});
	}); //root test
}); // Main describe