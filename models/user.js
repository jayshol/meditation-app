'use strict';

const mongoose = require('mongoose');
const {Badge} = require('./badges');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
	userName: {type: String, required: true, unique:true},
	password: {type: String, required: true},
	registeredForCurrenttChallenge : {type:Boolean},
	lastMeditated: {type:Date},
	streak: {type: Number},
	active:{type:Boolean},
	isRegisteredForNextChallenge:{type:Boolean},
	numberOfDaysMeditated: {type:Number},
	badges:[{type:Schema.Types.ObjectId, ref:"Badge"}],
	registeredChallenges:[{challengeName: {type:String}, status:{type:String}}]
});

userSchema.methods.serialize = function(){
	return {
		userName : this.userName || ''
	};
}

userSchema.methods.validatePassword = function(password){
	return bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = function(password){
	return bcrypt.hash(password, 10);
}

const User = mongoose.model("User", userSchema);

module.exports = {User};


