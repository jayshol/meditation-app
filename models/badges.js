'use strict';

const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema({
	name: {type:String, required:true},
	imageUrl:{type:String, required:true}
});

 const Badge = mongoose.model("Badge", badgeSchema);

 module.exports = {Badge};