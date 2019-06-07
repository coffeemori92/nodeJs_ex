var express = require('express');
var template = require('./lib/template.js');
var db = require('./lib/db.js');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var topic = require('./lib/topic.js');
var bodyParser = require('body-parser')
var compression = require('compression')
var topicRouter = require('./routes/topic.js');
var indexRouter = require('./routes/index.js');
var helmet = require('helmet')

var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet())

app.get('*', function(req, res, next){
	db.query("SELECT * FROM topic", function(err, rs){
		if(err) throw err;
		req.list = rs;
		next();
	});
});

app.use('/', indexRouter);
app.use('/topic', topicRouter);

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