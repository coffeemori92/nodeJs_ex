var http = require("http");
var fs = require("fs");
var url = require('url');

var app = http.createServer(function(req, res){
	
	var _url = req.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	var title = queryData.id;
	var id = queryData.id + ".txt";
	
	if(pathname === "/"){
		if(queryData.id === undefined){
			var title = 'Welcome';
			var desc = "Hello, Node.js";
			var template = `
				<!doctype html>
				<html>
				<head>
				  <title>WEB1 - ${title}</title>
				  <meta charset="utf-8">
				</head>
				<body>
				  <h1><a href="/">WEB</a></h1>
				  <ol>
				    <li><a href="/?id=HTML">HTML</a></li>
				    <li><a href="/?id=CSS">CSS</a></li>
				    <li><a href="/?id=JavaScript">JavaScript</a></li>
				  </ol>
				  <h2>${title}</h2>
				  <p>${desc}</p>
				</body>
				</html>
			`;
			res.writeHead(200);
			res.end(template);
		}else{
			fs.readFile(`data/${id}`, 'UTF-8', function(err, data){
				var desc = data;
				var template = `
					<!doctype html>
					<html>
					<head>
					  <title>WEB1 - ${title}</title>
					  <meta charset="utf-8">
					</head>
					<body>
					  <h1><a href="/">WEB</a></h1>
					  <ol>
					    <li><a href="/?id=HTML">HTML</a></li>
					    <li><a href="/?id=CSS">CSS</a></li>
					    <li><a href="/?id=JavaScript">JavaScript</a></li>
					  </ol>
					  <h2>${title}</h2>
					  <p>${desc}</p>
					</body>
					</html>
				`;
				res.writeHead(200);
				res.end(template);
			});
		}
	}else{
		res.writeHead(404);
		res.end('Not found');
	}
	
});
app.listen(3000);