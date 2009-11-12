load("pwe/io.js");

var document = {
	write: function(){ }
};

var path = arguments[0];
var files = listFiles(arguments[1] + "/js");
for (var i = 0; i < files.length; i++) {
	var file = files[i].toString().split("\\\\").pop();
	if(file.indexOf("editor_") > -1) {
	
		load(arguments[1] + "/js/" + file);
		var mergedFile = path + "/" + file;
		for( var j = 0 ; j < PROJECTLIBS.length; j++){
			if(PROJECTLIBS[j] === "" || PROJECTLIBS[j] === "lib/firebug/firebug.js") {
				continue;
			}
			var _filename = arguments[1] + '/js/' + PROJECTLIBS[j];
			if (exists(_filename)) {
				var out = readFile(_filename, "utf-8");
				writeFile(mergedFile, out);
			}
		}
	}
}	
