'use strict';

const mongoose = require('mongoose');

const audioSchema = mongoose.Schema({
	name : {type:String, required: true},
	url: {type:String, required:true},
	imageUrl:{type:String, required: true}
});

 const Audio = mongoose.model("Audio", audioSchema);
 module.exports = {Audio};