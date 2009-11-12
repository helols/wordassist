load("pwe/io.js");

var fileName = arguments[0];
var serviceName =  arguments[1];
var editorVer =  arguments[2];
var extensionVer =  arguments[3];
var cssVer =  arguments[4];
var charset =  arguments[5];

var out = readFile(fileName, charset);
out = out.replace(new RegExp("#serviceName","gim"), serviceName);
out = out.replace(new RegExp("#editorVersion","gim"), editorVer);
out = out.replace(new RegExp("#extensionVersion","gim"), extensionVer);
out = out.replace(new RegExp("#cssVersion","gim"), cssVer);

writeFile(fileName, out, false);
	
