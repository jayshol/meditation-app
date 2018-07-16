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
		
	}); //root test
}); // Main describe