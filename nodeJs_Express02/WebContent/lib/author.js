var template = require('./template.js');
var db = require('./db.js');
var qs = require('querystring');
var url = require('url');
var sanitizeHtml = require('sanitize-html');

exports.home = function(req, res){
	db.query("SELECT * FROM topic", function(err, rs){
		db.query("SELECT * FROM author", function(err2, rs2){
			var title = 'author';
			var list = template.list(rs);
			var html = template.HTML(title, list, `
					<style>
						table{
							border-collapse:collapse;
						}
						td{
							border : 1px solid black;
						}
					</style>
					${template.authorTable(rs2)}
					<form action = "/author/create_process" method = "post">
					<p>
						<input type = "text" name = "name" placeholder = "name">
					</p>
					<p>
						<textarea name = "profile" placeholder = "profile"></textarea>
					</p>
					<p>
						<input type = "submit" value = "Submit">
					</p>
				</form>
			`, 
			``);
			res.writeHead(200);
			res.end(html);
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
		db.query("INSERT INTO author (name, profile) " +
				"VALUES (?, ?)", [post.name, post.profile],
				function(err, rs){
			if(err) throw err;
			res.writeHead(302, {Location:`/author`});
			res.end();
		});
	});
}

exports.update = function(req, res){
	db.query("SELECT * FROM topic", function(err, rs){
		db.query("SELECT * FROM author", function(err2, rs2){
			var _url = req.url;
			var queryData = url.parse(_url, true).query;
			db.query("SELECT * FROM author WHERE id = ?", [queryData.id], function(err3, rs3){
				var title = 'author';
				var list = template.list(rs);
				var html = template.HTML(title, list, `
						<style>
							table{
								border-collapse:collapse;
							}
							td{
								border : 1px solid black;
							}
						</style>
						${template.authorTable(rs2)}
						<form action = "/author/update_process" method = "post">
							<input type = "hidden" name = "id" value = "${queryData.id}">
						<p>
							<input type = "text" name = "name" value = "${sanitizeHtml(rs3[0].name)}">
						</p>
						<p>
							<textarea name = "profile">${sanitizeHtml(rs3[0].profile)}</textarea>
						</p>
						<p>
							<input type = "submit" value = "Update">
						</p>
					</form>
				`, 
				``);
				res.writeHead(200);
				res.end(html);
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
		db.query("UPDATE author SET name = ?, profile = ? WHERE id = ?", 
				[post.name, post.profile, post.id],
				function(err, rs){
			if(err) throw err;
			res.writeHead(302, {Location:`/author`});
			res.end();
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
		db.query("DELETE FROM topic WHERE author_id = ?", [post.id], function(err2, rs2){
			if(err2) throw err2;
			db.query("DELETE FROM author WHERE id = ?", 
					[post.id],
					function(err, rs){
				if(err) throw err;
				res.writeHead(302, {Location:`/author`});
				res.end();
			});
		});
	});
}