load("pwe/io.js");

EDITOR_PROJECT_NAME = "__UNDEFINED__";
var document = {
	write: function(){ }
};
if (!arguments[1]) {
	load("workingcopy/js/editor.js");
}else{
	load(arguments[1] + arguments[2] );
}
var mergedFile = arguments[0];
print(mergedFile);

var out = '';
for( var i = 0 ; i < DEVELLIBS.length; i++){
	if(DEVELLIBS[i] === "" || DEVELLIBS[i] === "lib/firebug/firebug.js") {
		continue;
	}
	var _filename = arguments[1] + '/js/' + DEVELLIBS[i];
	if(exists(_filename)) {
		var out = readFile(_filename, "utf-8");
		writeFile(mergedFile, out);
	}
}