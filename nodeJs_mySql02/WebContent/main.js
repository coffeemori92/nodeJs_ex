var http = require("http");
var fs = require("fs");
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var db = mysql.createConnection({
	host 	 : 'localhost',
	user 	 : 'root',
	password : '1234',
	database : 'nodejs_ex'
});

db.connect();

var app = http.createServer(function(req, res){
	
	var _url = req.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	var title = queryData.id;
	var id = queryData.id + ".txt";
	
	if(pathname === "/"){
		if(queryData.id === undefined){
			db.query("SELECT * FROM topic", function(err, rs){
				var title = 'Welcome';
				var desc = "Hello, Node.js";
				var list = template.list(rs);
				var html = template.HTML(title, list, `<h2>${title}</h2><p>${desc}</p>`, 
				`<a href = "/create">create</a>`);
				res.writeHead(200);
				res.end(html);
			});
		}else{
			db.query("SELECT * FROM topic", function(err, rs){
				if(err) throw err;
				db.query("SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?" , [queryData.id], function(err2, rs2){
					if(err2) throw err2;
					var title = rs2[0].title;
					var desc = rs2[0].description;
					var list = template.list(rs);
					var html = template.HTML(title, list, `<h2>${title}</h2><p>${desc}</p><p>by ${rs2[0].name}</p>`, 
					`<a href = "/create">create</a> <a href = "/update?id=${queryData.id}">update</a> 
							 <form action = "delete_process" method = "post">
							 	<input type = "hidden" name = "id" value = "${queryData.id}">
							 	<input type = "submit" value = "delete">
							 </form>
							 `);
					res.writeHead(200);
					res.end(html);
				});
			});
		}
	}else if(pathname === "/create"){
		db.query("SELECT * FROM topic", function(err, rs){
			db.query("SELECT * FROM author", function(err2, rs2){
				var title = 'WEB - create';
				var list = template.list(rs);
				var html = template.HTML(title, list, `
						<form action = "/create_process" method = "post">
							<p>
								<input type = "text" name = "title" placeholder = "title">
							</p>
							<p>
								<textarea name = "desc" placeholder = "description"></textarea>
							</p>
							<p>
								${template.authorSelect(rs2)}
							</p>
							<p>
								<input type = "submit" value = "Submit">
							</p>
						</form>	
					`, ``);
				res.writeHead(200);
				res.end(html);
			});
		});
	}else if(pathname === "/create_process"){
		var body = "";
		
		req.on("data", function(data){
			body = body + data;
		});
		
		req.on("end", function(){
			var post = qs.parse(body);
			db.query("INSERT INTO topic (title, description, created, author_id) " +
					"VALUES (?, ?, NOW(), ?)", [post.title, post.desc, post.author],
					function(err, rs){
				if(err) throw err;
				res.writeHead(302, {Location:`/?id=${rs.insertId}`});
				res.end();
			});
		});
	}else if(pathname === "/update"){
		db.query("SELECT * FROM topic", function(err, rs){
			if(err) throw err;
			db.query("SELECT * FROM topic WHERE id = ?", [queryData.id], function(err2, rs2){
				if(err2) throw err2;
				db.query("SELECT * FROM author", function(err3, rs3){
					if(err3) throw err3;
					var title = rs2[0].title;
					var desc = rs2[0].description;
					var list = template.list(rs);
					var html = template.HTML(title, list, `
							<form action = "/update_process" method = "post">
								<input type = "hidden" name = "id" value = "${rs2[0].id}">
								<p>
									<input type = "text" name = "title" value = "${title}">
								</p>
								<p>
									<textarea name = "desc">${desc}</textarea>
								</p>
								<p>
									${template.authorSelect(rs3, rs2[0].author_id)}
								</p>
								<p>
									<input type = "submit" value = "Update">
								</p>
							</form>	
						`, `<a href = "/create">create</a> <a href = "/update?id=${rs2[0].id}">update</a>`);
					res.writeHead(200);
					res.end(html);
				});
			});
		});
	}else if(pathname === "/update_process"){
		
		var body = "";
		
		req.on("data", function(data){
			body = body + data;
		});
		
		req.on("end", function(){
			var post = qs.parse(body);
			
			db.query("UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?", [post.title, post.desc, post.author, post.id], 
					function(err, rs){
				if(err) throw err;
				res.writeHead(302, {Location:`/?id=${post.id}`});
				res.end();
			});
		});
	}else if(pathname === "/delete_process"){
		
		var body = "";
		
		req.on("data", function(data){
			body = body + data;
		});
		
		req.on("end", function(){
			var post = qs.parse(body);
			
			db.query("DELETE FROM topic WHERE id = ?", [post.id], 
					function(err, rs){
				if(err) throw err;
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