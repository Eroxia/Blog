 var Threads = require( 'threads_a_gogo' );
function fibo(n){
	return n>1 ? fibo( n-1 ) + fibo( n-2 ) : 1; 
}
var t = Threads.create().eval(fibo);
t.eval( 'fibo(35)' , function( err, result ){
	if( err ){
		throw errl
	}
	console.log( 'fibo(35) = ' + result );
});
console.log('not blobk');
