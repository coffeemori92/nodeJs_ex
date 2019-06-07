var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var db = require('../lib/db.js');
var bodyParser = require('body-parser');
var compression = require('compression');
var sanitizeHtml = require('sanitize-html');

//route, routing
router.get('/', function (req, res) {
	var title = 'Welcome';
	var desc = "Hello, Node.js";
	var list = template.list(req.list);
	var html = template.HTML(title, list, `
	<h2>${title}</h2><p>${desc}</p>
	<img src = "/images/hello.jpg" style = "width:500px; height:400px; display:block;">
	`, 
	`<a href = "/topic/create">create</a>`);
	res.send(html);
});

module.exports = router;