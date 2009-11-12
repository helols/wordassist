load("pwe/io.js");

var document = {
	write: function(){ }
};

var mergedFile = arguments[0];
var inputPath = arguments[1]? arguments[1]: "workingcopy";
var inputFile = arguments[2]? arguments[2]: "/css/editor.css";
print(inputPath + inputFile + " => " + mergedFile);

function getCssText(filename){
	print(filename);
	var orig = readFile(filename, "utf-8");
	orig = orig.replace(/\/\*[\s\S]*?\*\//g, "");
	orig = orig.replace(/@import\s+url\(([\.\/\w_]+)\);?\n?/g, function(full, importFile){
		return getCssText(filename.replace(/[\w_]+\.css/, importFile));
	});
	return orig;
}

var mergedText = getCssText(inputPath + inputFile);
writeFile(mergedFile, mergedText);
