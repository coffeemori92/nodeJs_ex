var fs = require('fs');

// readFileSync
/*console.log('A');
var result = fs.readFileSync('sample.txt', 'UTF-8');
console.log(result);
console.log('C');*/

//readFile
console.log('A');
fs.readFile('sample.txt', 'UTF-8', function(err, result){
	console.log(result);
});
console.log('C');