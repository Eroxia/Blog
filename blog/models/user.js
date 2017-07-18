var mongodb = require('./db');

var crypto = require('crypto');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

//save user address
User.prototype.save = function(callback) {
	var md5 = crypto.createHash( 'md5' );
	email_MD5 = md5.update( this.email.toLowerCase()).digest('hex'),
	head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";

	// will save database of user file 
	var user = {
		name     : this.name,
		password : this.password,
		email    : this.email,
		head     : head
	};
	//open database
	mongodb.open(function (err, db) {
		if(err){
			return callback(err);
		}
		//read users 
		db.collection('users', function(err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert( user, {
				safe: true
			}, function (err, user) {
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, user[0]);
			});
		});
	});
};


// read user message
User.get = function( name, callback ){
//open database 
	mongodb.open( function ( err , db ){
		if( err ){
			return callback( err );
		}
		//read users
		db.collection( 'users', function( err, collection ){
			if( err ){
				mongodb.close();
				return callback( err );
			}
			//find name value is name file
			collection.findOne({
				name: name
			}, function ( err, user){
				mongodb.close();
				if( err ){
					return callback( err );
				}
				callback( null, user);// OK return finded user message
			});
		});
	});
};