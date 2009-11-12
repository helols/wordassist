load("pwe/io.js");
load("pwe/template.js");

var tpl = readFile("pwe/template/global.tpl");
var jstObj = TrimPath.parseTemplate(tpl);


var data ={
	SERVICE: arguments[0],
	FILENAME: arguments[1],
	VERSION: arguments[2],
	DOMAIN: arguments[3],
};

var file = arguments[4];
var res= jstObj.process(data);

writeFile(file, res);

