var express = require('express');
var router = express.Router();


Post = require( '../models/post.js');
Comment = require( '../models/comment.js' );

var crypto = require('crypto'),
User = require('../models/user.js');

/* GET home page. */

router.get('/', function( req, res ) {
	Post.getAll( null, function( err, posts){
		if( err ){
			posts = [];
		}
    	res.render( 'index', {
 			title   : 'home',
 			user    : req.session.user,
 			posts   : posts, 
 			success : req.flash( 'success' ).toString(),
 			error   : req.flash( 'error' ).toString()
 		 });
  	});
});

router.get( '/reg', checkNotLogin);
router.get('/reg', function(req, res ) {
  res.render( 'reg', { 
  	title   : 'Register',
  	user    : req.session.user,
  	success : req.flash( 'success' ).toString(),
  	error   : req.flash( 'error' ).toString()
  });
});


router.post('/reg', checkNotLogin );
router.post('/reg', function( req, res ){

		var	name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
			//examine user enter twice password 
		if( password_re != password ){
			req.flash ( 'error', 'twice password no agree with' );
			return res.redirect('/reg');
		}

		//generate password value of md5
		var md5 = crypto.createHash( 'md5' );
			password = md5.update( req.body.password ).digest('hex');
		var newUser = new User ({
			name: req.body.name,
			password: req.body.password,
			email: req.body.email
		});

		//examine name value 
		User.get( newUser.name, function ( err, user){
			if ( user ){
				req.flash( 'error', 'user is already exist!');
				return res.redirect('/reg'); //return reg page
			}
			//if not exist so add new user
			newUser.save( function ( err, user ){
				if( err ){
					req.flash( 'err',err ) ;
					return res.redirect('/reg');
				}
				req.session.user = user;  //user message save for session
				req.flash( 'success', ' register success!'); 
				res.redirect('/');  //register success return home page
			});
		});
	});

router.get( '/login', checkNotLogin );
router.get( '/login', function( req, res ) {
  res.render('login', {
  	title   : 'login',
  	user    : req.session.user,
  	success : req.flash( 'success' ).toString(),
  	error   : req.flash( 'error' ).toString()
  });
});

router.post('/login', checkNotLogin );
router.post('/login', function( req, res ) {
	//generate md5 password of value
	var password = req.body.password;
	// examie name is not exist
	User.get( req.body.name, function( err, user ){
		if( !user ){
			req.flash( 'error', 'user not exist!');
			return res.redirect( '/login' );
		}
	//checkout twice password 
		if( user.password != password ){
			req.flash( 'error', 'password error');
			return res.redirect( '/login');
		}
	//sava session
	req.session.user = user;
	req.flash('success','login success!');
	res.redirect('/');
	});
});

router.get( '/post', checkLogin);
router.get( '/post', function(req, res) {
  res.render('post', {
   	title   : 'post',
   	user    : req.session.user,
   	success : req.flash( 'success' ).toString(),
   	error   : req.flash( 'error' ).toString()
	});
});

router.post( '/post', checkLogin);
router.post( '/post', function( req, res ){
	var currentUser = req.session.user,
		tags = [ req.body.tag1, req.body.tag2, req.body.tag3 ],
		post = new Post( currentUser.name, req.body.title, req.body.title, tags, req.body.post );
	post.save( function ( err ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( '/');
		}
		req.flash( 'success', 'post success');
		res.redirect( '/' );
	});
});

router.get( '/logout', checkLogin );
router.get( '/logout', function(req, res){
	req.session.user = null;
	req.flash( 'success', 'logout success!');
	res.redirect( '/login' );
});

router.get( '/upload', checkLogin);
router.get( '/upload', function( req, res){
	res.render( 'upload', {
		title   : 'file upload',
		user    : req.session.user,
		success : req.flash( 'success' ).toString(),
		error   : req.flash( 'error' ).toString()
	});
});

router.get( '/archive', function( req, res ){
	Post.getArchive( function( err, posts ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect('/');
		}
		res.render( 'archive', {
			title: 'filing',
			posts: posts,
			user : req.session.user,
			success: req.flash( 'success' ).toString(),
			error  : req.flash( 'error' ).toString()
		});
	});
});

router.get( '/tags', function( req, res){
	Post.getTags( function( err, posts ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( '/' );
		}
		res.render( 'tags',{
			title: 'tag',
			posts: posts,
			user : req.session.user,
			success : req.flash( 'success' ).toString(),
			error : req.flash( 'error' ).toString()
		});
	});
});

router.get( '/tags/:tag', function( req, res ){
	Post.getTag( req.params.tag, function( err, posts ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( '/');
		}
		res.render( 'tag', {
			title : "TAG" + req.params.tag,
			posts : posts,
			user  : req.session.user,
			success : req.flash( 'success' ).toString(),
			error : req.flash( 'error' ).toString()
		});
	});
});

router.get( '/links', function( req, res){
	res.render( 'links',{
		title: "links",
		user: req.session.user,
		success : req.flash( 'success' ).toString(),
		error : req.flash( 'error' ).toString()
	});
});


router.get( '/search', function( req, res ){
	Post.search( req.query.keyword, function( err, posts ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( '/' );
		}
		res.render( 'search', {
			title : "SEARCH:" + req.query.keyword,
			posts : posts,
			user  : req.session.user,
			success : req.flash( 'success' ).toString(),
			error : req.flash( 'error' ).toString()
		});
	});
});

router.get( '/u/:name', function( req, res ){
	User.get( req.params.name, function( err, user ){
		if( !user ){
			req.flash( 'error', 'user not found');
			return res.redirect('/');
		}
		Post.getAll( user.name, function( err, posts ){
			if( err ){
				req.falsh( 'error',err );
				return res.redirect('/');
			}
			res.render( 'user', {
				title   : user.name,
				posts   : posts,
				user    : req.session.user,
				success : req.flash( 'success' ).toString(),
				error   : req.flash( 'error' ).toString()
			});
		});
	});
});

router.get( '/u/:name/:day/:title', function( req, res ){
	Post.getOne( req.params.name, req.params.day, req.params.title, function( err, post ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect('/');
		}
		res.render ( 'article', {
			title   : req.params.title,
			post    : post,
			user    : req.session.user,
			success : req.flash( 'success' ).toString(),
			error   : req.flash( 'error' ).toString() 
		});
	});
});

router.post( '/u/:name/:day/:title', function( req,res ){
	var date = new Date(),
		time = date.getFullYear() + "-" + ( date.getMonth() +1 ) + "-" + date.getDate()+
		"" + date.getHours() + ":" + ( date.getMinutes()<10 ? '0' + date.getMinutes() :
		date.getMinutes() );
/*
	var md5 = crypto.createHash( 'md5' ),
		email_MD5 = md5.update( req.body.email.toLowerCase()).digest( 'hex' ),
		head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
		*/
	var comment = {
		name    : req.body.name,
		email   : req.body.email,
		website : req.body.website,
		time    : time,
		content : req.body.content 
	};
	var newComment = new Comment( req.params.name, req.params.day, req.params.title, comment);

	newComment.save( function( err ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( 'back');
		}
		req.flash( 'success', 'comment success!');
		res.redirect( 'back' );
	});
});

router.get( '/edit/:name/:day/:title', checkLogin );
router.get( '/edit/:name/:day/:title', function( req, res ){
	var currentUser = req.session.user;
	Post.edit( currentUser.name, req.params.day, req.params.title, function( err, post ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( 'back' );
		}
		res.render( 'edit', {
			title   : 'edit',
			post    : post,
			user    : req.session.user,
			success : req.flash( 'success' ).toString(),
			error   : req.flash( 'error' ).toString()
		});
	});
});

router.post( '/edit/:name/:day/:title', checkLogin );
router.post( '/edit/:name/:day/:title', function( req, res ){
	var currentUser = req.session.user;
	Post.update( currentUser.name, req.params.day, req.params.title, req.body.post, 
		function( err ){
			var url = '/u/' + req.params.name + "/" + req.params.day + "/" + req.params.title;
			if( err ){
				req.flash( 'error', err );
				return res.redirect( url );
			}
			req.flash( 'success', 'edit success!');
			res.redirect(url);
	});
});

router.get( '/remove/:name/:day/:title', checkLogin);
router.get( '/remove/:name/:day/:title', function( req, res ){
	var currentUser = req.session.user;
	Post.remove( currentUser.name, req.params.day, req.params.title, function( err ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( 'back' );
		}
		req.flash('success', 'delete success!');
		res.redirect('/');
	});
});


router.get( '/reprint/:name/:day/:title', checkLogin );
router.get( '/reprint/:name/:day/:title', function( req, res){
	Post.edit( req.params.name, req.params.day, req.params.title, function( err, post ){
		if( err ){
			req.flash( 'error', err );
			return res.redirect( back );
		}
		var currentUser = req.session.user,
			reprint_from = { name: post.name,
							 day: post.time.day,
							 title: post.title },
			reprint_to = { name:currentUser, };
		Post.reprint( reprint_from, reprint_to, function( err, post ){
			if( err ){
				req.flash( 'error', err );
				return res.redirect( 'back');
			}
			req.flash( 'success', 'retransmission success');
			res.redirect('/'); 
		});
	});
});




router.use( function( req, res ){
	res.render('404');
});


function checkLogin( req, res, next ){
	if( !req.session.user ){
		req.flash( 'error', 'please login!');
		res,redirect( '/login' );
	}
	next();
}


function checkNotLogin( req, res, next ){
	if( req.session.user ){
		req.flash( 'error', 'already login');
		res.redirect( 'back');
	}
	next();
}


module.exports = router;
 