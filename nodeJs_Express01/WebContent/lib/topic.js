var template = require('./template.js');
var db = require('./db.js');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.home = function(req, res){
	db.query("SELECT * FROM topic", function(err, rs){
		var title = 'Welcome';
		var desc = "Hello, Node.js";
		var list = template.list(rs);
		var html = template.HTML(title, list, `<h2>${title}</h2><p>${desc}</p>`, 
		`<a href = "/create">create</a>`);
		res.send(html);
	});
}

exports.page = function(req, res){
	db.query("SELECT * FROM topic", function(err, rs){
		if(err) throw err;
		db.query("SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?" , [req.params.id], function(err2, rs2){
			if(err2) throw err2;
			var title = rs2[0].title;
			var desc = rs2[0].description;
			var list = template.list(rs);
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
}

exports.create = function(req, res){
	db.query("SELECT * FROM topic", function(err, rs){
		db.query("SELECT * FROM author", function(err2, rs2){
			var title = 'WEB - create';
			var list = template.list(rs);
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
}

exports.create_process = function(req, res){
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
			res.redirect(`/page/${rs.insertId}`);
		});
	});
}

exports.update = function(req, res){
	db.query("SELECT * FROM topic", function(err, rs){
		if(err) throw err;
		db.query("SELECT * FROM topic WHERE id = ?", [req.params.id], function(err2, rs2){
			if(err2) throw err2;
			db.query("SELECT * FROM author", function(err3, rs3){
				if(err3) throw err3;
				var title = rs2[0].title;
				var desc = rs2[0].description;
				var list = template.list(rs);
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
}

exports.update_process = function(req, res){
	var body = "";
	
	req.on("data", function(data){
		body = body + data;
	});
	
	req.on("end", function(){
		var post = qs.parse(body);
		
		db.query("UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?", [post.title, post.desc, post.author, post.id], 
				function(err, rs){
			if(err) throw err;
			res.redirect(`/page/${post.id}`);
		});
	});
}

exports.delete_process = function(req, res){
	var body = "";
	
	req.on("data", function(data){
		body = body + data;
	});
	
	req.on("end", function(){
		var post = qs.parse(body);
		
		db.query("DELETE FROM topic WHERE id = ?", [post.id], 
				function(err, rs){
			if(err) throw err;
			res.redirect("/");
		});
	});
}