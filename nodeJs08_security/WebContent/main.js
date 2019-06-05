var http = require("http");
var fs = require("fs");
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var template = {
		
		HTML : function(title, list, body, control){
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
			  ${control}
			  ${body}
			</body>
			</html>
			`;
		},
		
		list : function(filelist){
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
				
				var list = template.list(filelist);
				var html = template.HTML(title, list, `<h2>${title}</h2><p>${desc}</p>`, 
						`<a href = "/create">create</a>`);
				res.writeHead(200);
				res.end(html);
			});
		}else{
			fs.readdir("./data", function(err, filelist){
				fs.readFile(`data/${id}`, 'UTF-8', function(err, data){
					var desc = data;
					var sanitizedTitle = sanitizeHtml(title);
					var sanitizedDesc = sanitizeHtml(desc);
					var list = template.list(filelist);
					var html = template.HTML(title, list, `<h2>${sanitizedTitle}</h2><p>${sanitizedDesc}</p>`, 
							`<a href = "/create">create</a> <a href = "/update?id=${sanitizedTitle}">update</a> 
							 <form action = "delete_process" method = "post">
							 	<input type = "hidden" name = "id" value = "${sanitizedTitle}">
							 	<input type = "submit" value = "delete">
							 </form>
							 `);
					res.writeHead(200);
					res.end(html);
				});
			});
		}
	}else if(pathname === "/create"){
		fs.readdir("./data", function(err, filelist){
			
			var title = 'WEB - create';
			
			var list = template.list(filelist);
			var html = template.HTML(title, list, `
				<form action = "/create_process" method = "post">
					<p>
						<input type = "text" name = "title" placeholder = "title">
					</p>
					<p>
						<textarea name = "desc" placeholder = "description"></textarea>
					</p>
					<p>
						<input type = "submit" value = "Submit">
					</p>
				</form>	
			`, ``);
			res.writeHead(200);
			res.end(html);
		});
	}else if(pathname === "/create_process"){
		
		var body = "";
		
		req.on("data", function(data){
			body = body + data;
		});
		
		req.on("end", function(){
			var post = qs.parse(body);
			var title = post.title;
			var _title = title + ".txt";
			var desc = post.desc;
			fs.writeFile(`data/${_title}`, desc, "UTF-8", function(err){
				res.writeHead(302, {Location:`/?id=${title}`});
				res.end();
			});
		});
	}else if(pathname === "/update"){
		fs.readdir("./data", function(err, filelist){
			fs.readFile(`data/${id}`, 'UTF-8', function(err, data){
				var desc = data;
				var list = template.list(filelist);
				var html = template.HTML(title, list, `
					<form action = "/update_process" method = "post">
						<input type = "hidden" name = "id" value = "${title}">
						<p>
							<input type = "text" name = "title" value = "${title}">
						</p>
						<p>
							<textarea name = "desc">${desc}</textarea>
						</p>
						<p>
							<input type = "submit" value = "Update">
						</p>
					</form>	
				`, 
						`<a href = "/create">create</a> <a href = "/update?id=${title}">update</a>`);
				res.writeHead(200);
				res.end(html);
			});
		});
	}else if(pathname === "/update_process"){
		
		var body = "";
		
		req.on("data", function(data){
			body = body + data;
		});
		
		req.on("end", function(){
			var post = qs.parse(body);
			var id = post.id;
			var _id = id + ".txt";
			var title = post.title;
			var _title = title + ".txt";
			var desc = post.desc;
			fs.rename(`data/${_id}`, `data/${_title}`, function(err){
				fs.writeFile(`data/${_title}`, desc, "UTF-8", function(err){
					res.writeHead(302, {Location:`/?id=${title}`});
					res.end();
				});
			});
		});
	}else if(pathname === "/delete_process"){
		
		var body = "";
		
		req.on("data", function(data){
			body = body + data;
		});
		
		req.on("end", function(){
			var post = qs.parse(body);
			var id = post.id;
			var _id = id + ".txt";
			fs.unlink(`data/${_id}`, function(err){
				res.writeHead(302, {Location: "/"});
				res.end();
			});
		});
	}else{
		res.writeHead(404);
		res.end('Not found');
	}
	
});
app.listen(3000);