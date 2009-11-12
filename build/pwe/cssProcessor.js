importPackage(java.lang);
load("pwe/io.js");

EDITOR_PROJECT_NAME = "__UNDEFINED__";
var document = {
	write: function(){ }
};
var path = arguments[0];
var out = arguments[1];


var buffer = new java.lang.StringBuffer();
var jq = new File(path);
var reader = new BufferedReader(new FileReader(jq));
var line = null;
var buffer = new java.lang.StringBuffer(jq.length());
while( (line = reader.readLine()) != null) {
	var s = trim(line + "");
	if((s.indexOf(".") == 0) && (s.lastIndexOf(",") == s.length - 1)){
		buffer.append("#tx_trex_container " + s);
	}else if((s.indexOf(".") == 0) && (s.lastIndexOf(",") != s.length - 1)){
		var token = line.split(",");
		var output = [];
		for(var i = 0; i < token.length; i++){
			output.push("#tx_trex_container " + token[i]);
		}
		var r = output.join(",");  
		buffer.append(r);
	}else{
		buffer.append(line);
	}
	buffer.append("\n");
}
reader.close();
writeFile(out, buffer.toString());
	
function trim(s){
	return s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};