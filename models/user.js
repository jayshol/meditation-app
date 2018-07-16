'use strict';

const mongoose = require('mongoose');
const {Badge} = require('./badges');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
	userName: {type: String, required: true},
	password: {type: String},
	registeredForCurrenttChallenge : {type:Boolean},
	lastMeditated: {type:Date},
	streak: {type: Number},
	active:{type:Boolean},
	isRegisteredForNextChallenge:{type:Boolean},
	numberOfDaysMeditated: {type:Number},
	badges:[{type:Schema.Types.ObjectId, ref:"Badge"}],
	registeredChallenges:[{challengeName: {type:String}, status:{type:String}}]
});

const User = mongoose.model("User", userSchema);

module.exports = {User};


