importPackage(java.lang);
load("pwe/io.js");

var document = {
	write: function(){ }
};

var path = arguments[0];
var compressor = arguments[1];

var files = listFiles(path+ "_orig/");
for (var i = 0; i < files.length; i++) {
	var file = files[i].toString().split("\\\\").pop();
	if (file.indexOf(".esc.js") > -1) {
		var input = path+ "_orig/" + file;
		var output = path + file.substring(0, file.indexOf(".esc.js")) + ".js";
		var cmd = "java -jar " + compressor + " --line-break 1000 " + input + " -o " + output;
		print(cmd);
		Runtime.getRuntime().exec(cmd);
	}
}		