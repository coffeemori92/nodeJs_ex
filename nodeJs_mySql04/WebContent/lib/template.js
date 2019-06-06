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
			  <a href = "/author">author</a>
			  ${list}
			  ${control}
			  ${body}
			</body>
			</html>
			`;
		},
		
		list : function(rs){
			var list = "<ol>";
			var i = 0;
			while(i < rs.length){
				list = list + `<li><a href = "/?id=${rs[i].id}" >${rs[i].title}</a></li>`;
				i = i + 1;
			}
			
			list = list + '</ol>';
			
			return list;
		},
		
		authorSelect : function(rs2, author_id){
			var tag = "";
			var i = 0;
			while(i < rs2.length){
				var selected = "";
				if(rs2[i].id === author_id){
					selected = "selected";
				}
				tag += `<option value = "${rs2[i].id}" ${selected}>${rs2[i].name}</option>`;
				i++;
			}
			
			return `<select name = "author">
						${tag}
					</select>`;
		},
		
		authorTable : function(rs2){
			var tag = "<table>";
			var i = 0;
			while(i < rs2.length){
				tag += `
					<tr>
						<td>${rs2[i].name}</td>
						<td>${rs2[i].profile}</td>
						<td><a href = "/author/update?id=${rs2[i].id}">update</a></td>
						<td>
							<form action = "/author/delete_process" method = "post">
								<input type = "hidden" name = "id" value = "${rs2[i].id}">
								<input type = "submit" value = "delete">
							</form>
						</td>
					</tr>
				`;
				
				i++;
			}
			tag += "</table>";
			
			return tag;
		}
}