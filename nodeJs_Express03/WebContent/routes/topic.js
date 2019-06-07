var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var db = require('../lib/db.js');
var bodyParser = require('body-parser');
var compression = require('compression');
var sanitizeHtml = require('sanitize-html');

router.get('/create', function (req, res) {
	db.query("SELECT * FROM author", function(err2, rs2){
		var title = 'WEB - create';
		var list = template.list(req.list);
		var html = template.HTML(title, list, `
				<form action = "/topic/create_process" method = "post">
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

router.post('/create_process', function (req, res) {	
	var post = req.body;
	
	db.query("INSERT INTO topic (title, description, created, author_id) " +
			"VALUES (?, ?, NOW(), ?)", [post.title, post.desc, post.author],
			function(err, rs){
		if(err) throw err;
		res.redirect(`/topic/${rs.insertId}`);
	});
});

router.post('/delete_process', function (req, res) {
	var post = req.body;
	
	db.query("DELETE FROM topic WHERE id = ?", [post.id], 
			function(err, rs){
		if(err) throw err;
		res.redirect("/");
	});
});

router.get('/:id', function (req, res) {
	db.query("SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?" , [req.params.id], function(err2, rs2){
		if(err2) throw err2;
		var title = rs2[0].title;
		var desc = rs2[0].description;
		var list = template.list(req.list);
		var html = template.HTML(title, list, `<h2>${sanitizeHtml(title)}</h2><p>${sanitizeHtml(desc)}</p><p>by ${sanitizeHtml(rs2[0].name)}</p>`, 
		`<a href = "/topic/create">create</a> <a href = "/topic/update/${req.params.id}">update</a> 
				 <form action = "/topic/delete_process" method = "post">
				 	<input type = "hidden" name = "id" value = "${req.params.id}">
				 	<input type = "submit" value = "delete">
				 </form>
				 `);
		res.send(html);
	});
});

router.post('/update_process', function (req, res) {
	var post = req.body;
	
	db.query("UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?", [post.title, post.desc, post.author, post.id], 
			function(err, rs){
		if(err) throw err;
		res.redirect(`/topic/${post.id}`);
	});
});

router.get('/update/:id', function (req, res) {
	db.query("SELECT * FROM topic WHERE id = ?", [req.params.id], function(err2, rs2){
		if(err2) throw err2;
		db.query("SELECT * FROM author", function(err3, rs3){
			if(err3) throw err3;
			var title = rs2[0].title;
			var desc = rs2[0].description;
			var list = template.list(req.list);
			var html = template.HTML(sanitizeHtml(title), list, `
					<form action = "/topic/update_process" method = "post">
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
				`, `<a href = "/topic/create">create</a> <a href = "/topic/update/${rs2[0].id}">update</a>`);
			res.send(html);
		});
	});
});

module.exports = router;