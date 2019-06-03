var mongoose = require('mongoose');
var bookSchema = new mongoose.Schema({
												id			:  Number,
												title  		:  String,
												course		:  String,
												author 		:  String,
												publisher   :  String,
												branch		:  String,
												semester	:  Number,
												price       :  Number,
									});
module.exports = mongoose.model("book" , bookSchema);
