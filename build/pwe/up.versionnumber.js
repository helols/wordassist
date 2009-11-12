load("pwe/io.js");

var buildFile = arguments[0];
var buildType = arguments[1] || "release";
var out = readFile(buildFile, "utf-8");

var matches = (/release\.current\.version=([\d]+)\.([\d]+)\.([\d]+)/g).exec(out);
var majorVer = matches[1]; 
var minorVer = matches[2];
var releaseVer = matches[3];

print("current version : " + majorVer + "." + minorVer + "." + releaseVer); 

var nextVersion = "";
if(buildType == "minor") {
	nextVersion = majorVer + "." + (parseInt(minorVer) + 1) + ".0";
} else if(buildType == "major") {
	nextVersion = (parseInt(majorVer) + 1) + ".0.0";
} else {
	nextVersion = majorVer + "." + minorVer + "." + (parseInt(releaseVer) + 1);
}

print("next version : " + nextVersion);

out = out.replace(/release\.current\.version=[\d\.]+/g, "release.current.version=" + nextVersion);
out = out.replace(/release\.next\.version=[\d\.]+/g, "release.next.version=" + nextVersion);

writeFile(buildFile, out, false);

