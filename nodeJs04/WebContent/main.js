var http = require("http");
var fs = require("fs");
var url = require('url');

function templateHTML(title, list, body){
	return  `
	<!doctype html>
	<html>
	<head>
	  <title>WEB1 - ${title}</title>
	  <meta charset="utf-8">
	</head>
	<body>
	  <h1><a href="/">WEB</a></h1>
	  ${list}
	  ${body}
	</body>
	</html>
	`;
}

function templateList(filelist){
	var list = "<ol>";
	var i = 0;
	while(i < filelist.length){
		var strArray = `${filelist[i]}`.split('.');
		list = list + "<li><a href = '/?id=" + strArray[0] + "'>" + strArray[0] + "</a></li>";
		i = i + 1;
	}
	
	list = list + '</ol>';
	
	return list;
}

var app = http.createServer(function(req, res){
	
	var _url = req.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	var title = queryData.id;
	var id = queryData.id + ".txt";
	
	if(pathname === "/"){
		if(queryData.id === undefined){
			fs.readdir("./data", function(err, filelist){
				
				var title = 'Welcome';
				var desc = "Hello, Node.js";
				
				var list = templateList(filelist);
				var template = templateHTML(title, list, `<h2>${title}</h2><p>${desc}</p>`);
				res.writeHead(200);
				res.end(template);
			});
		}else{
			fs.readdir("./data", function(err, filelist){
				fs.readFile(`data/${id}`, 'UTF-8', function(err, data){
					var desc = data;
					var list = templateList(filelist);
					var template = templateHTML(title, list, `<h2>${title}</h2><p>${desc}</p>`);
					res.writeHead(200);
					res.end(template);
				});
			});
		}
	}else{
		res.writeHead(404);
		res.end('Not found');
	}
	
});
app.listen(3000);