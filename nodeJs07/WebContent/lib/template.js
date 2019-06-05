module.exports = {
		
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