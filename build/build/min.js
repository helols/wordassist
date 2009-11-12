load("js/jsmin.js", "js/writeFile.js");

// arguments
var inFile = arguments[0];
var outFile = arguments[1] || inFile.replace(/\.js$/, ".min.js");

var script = readFile(inFile);

var header = '/***************************/';

if(script.match(/\/\*(.|\n)*?\*\//)){
	header = script.match(/\/\*([\\s]|[^\\s])*?\*\//)[0];	
}

var minifiedScript = jsmin('', script, 3);

writeFile( outFile, header + minifiedScript );
