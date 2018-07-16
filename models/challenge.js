const mongoose = require("mongoose");
const {User} = require('./user');
const Schema = mongoose.Schema;


const challengeSchema = mongoose.Schema({
	name:{type:String},
	registeredUsers:[{type:Schema.Types.ObjectId, ref:"User"}],
	startDate:{type:Date},
	endDate:{type:Date},
	status: {type:String}
});

const Challenge = mongoose.model("Challenge", challengeSchema);
module.exports = {Challenge};