var express = require('express');
var template = require('./lib/template.js');
var db = require('./lib/db.js');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var topic = require('./lib/topic.js');
var bodyParser = require('body-parser')
var compression = require('compression')
var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get('*', function(req, res, next){
	db.query("SELECT * FROM topic", function(err, rs){
		if(err) throw err;
		req.list = rs;
		next();
	});
});

// route, routing
app.get('/', function (req, res) {
	var title = 'Welcome';
	var desc = "Hello, Node.js";
	var list = template.list(req.list);
	var html = template.HTML(title, list, `
	<h2>${title}</h2><p>${desc}</p>
	<img src = "/images/hello.jpg" style = "width:500px; height:400px; display:block;">
	`, 
	`<a href = "/create">create</a>`);
	res.send(html);
});

app.get('/page/:id', function (req, res) {
	db.query("SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?" , [req.params.id], function(err2, rs2){
		if(err2) throw err2;
		var title = rs2[0].title;
		var desc = rs2[0].description;
		var list = template.list(req.list);
		var html = template.HTML(title, list, `<h2>${sanitizeHtml(title)}</h2><p>${sanitizeHtml(desc)}</p><p>by ${sanitizeHtml(rs2[0].name)}</p>`, 
		`<a href = "/create">create</a> <a href = "/update/${req.params.id}">update</a> 
				 <form action = "/delete_process" method = "post">
				 	<input type = "hidden" name = "id" value = "${req.params.id}">
				 	<input type = "submit" value = "delete">
				 </form>
				 `);
		res.send(html);
	});
});

app.get('/create', function (req, res) {
	db.query("SELECT * FROM author", function(err2, rs2){
		var title = 'WEB - create';
		var list = template.list(req.list);
		var html = template.HTML(sanitizeHtml(title), list, `
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
		res.send(html);
	});
});

app.post('/create_process', function (req, res) {	
	var post = req.body;
	
	db.query("INSERT INTO topic (title, description, created, author_id) " +
			"VALUES (?, ?, NOW(), ?)", [post.title, post.desc, post.author],
			function(err, rs){
		if(err) throw err;
		res.redirect(`/page/${rs.insertId}`);
	});
});

app.get('/update/:id', function (req, res) {
	db.query("SELECT * FROM topic WHERE id = ?", [req.params.id], function(err2, rs2){
		if(err2) throw err2;
		db.query("SELECT * FROM author", function(err3, rs3){
			if(err3) throw err3;
			var title = rs2[0].title;
			var desc = rs2[0].description;
			var list = template.list(req.list);
			var html = template.HTML(sanitizeHtml(title), list, `
					<form action = "/update_process" method = "post">
						<input type = "hidden" name = "id" value = "${rs2[0].id}">
						<p>
							<input type = "text" name = "title" value = "${sanitizeHtml(title)}">
						</p>
						<p>
							<textarea name = "desc">${sanitizeHtml(desc)}</textarea>
						</p>
						<p>
							${template.authorSelect(rs3, rs2[0].author_id)}
						</p>
						<p>
							<input type = "submit" value = "Update">
						</p>
					</form>	
				`, `<a href = "/create">create</a> <a href = "/update/${rs2[0].id}">update</a>`);
			res.send(html);
		});
	});
});

app.post('/update_process', function (req, res) {
	var post = req.body;
	
	db.query("UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?", [post.title, post.desc, post.author, post.id], 
			function(err, rs){
		if(err) throw err;
		res.redirect(`/page/${post.id}`);
	});
});

app.post('/delete_process', function (req, res) {
	var post = req.body;
	
	db.query("DELETE FROM topic WHERE id = ?", [post.id], 
			function(err, rs){
		if(err) throw err;
		res.redirect("/");
	});
});

app.use(function(req, res, next) {
	  res.status(404).send('Sorry cant find that!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

/*var http = require("http");
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db.js');
var topic = require('./lib/topic.js');
var author = require('./lib/author.js');

var app = http.createServer(function(req, res){
	
	var _url = req.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	
	if(pathname === "/"){
		if(queryData.id === undefined){
			topic.home(req, res);
		}else{
			topic.page(req, res);
		}
	}else if(pathname === "/create"){
		topic.create(req, res);
	}else if(pathname === "/create_process"){
		topic.create_process(req, res);
	}else if(pathname === "/update"){
		topic.update(req, res);
	}else if(pathname === "/update_process"){
		topic.update_process(req, res);
	}else if(pathname === "/delete_process"){
		topic.delete_process(req, res);
	}else if(pathname === "/author"){
		author.home(req, res);
	}else if(pathname === "/author/create_process"){
		author.create_process(req, res);
	}else if(pathname === "/author/update"){
		author.update(req, res);
	}else if(pathname === "/author/update_process"){
		author.update_process(req, res);
	}else if(pathname === "/author/delete_process"){
		author.delete_process(req, res);
	}else{
		res.writeHead(404);
		res.end('Not found');
	}
	
});
app.listen(3000);*/