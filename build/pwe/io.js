importPackage(java.io);

function writeFile( file, stream) {
	var append = false;
	if(arguments.length == 2){
		append = true;
	}else{
		append = arguments[2];
	}
	
	var buffer = new PrintWriter( new FileWriter( file, append) );
	buffer.print( stream );
	buffer.close();
}

function read( file ) {
	var jq = new File(file);
	if (jq.exists()) {
		var reader = new BufferedReader(new FileReader(jq));
		var line = null;
		var buffer = new java.lang.StringBuffer(jq.length());
		while ((line = reader.readLine()) != null) {
			buffer.append(line);
			buffer.append("\n");
		}
		reader.close();
		return buffer.toString();
	} else {
		return "";
	}
}

function exists( file ) {
	var jq = new File(file);
	return jq.exists();
}

function listFiles(directory){
	var dir = new File(directory);
	var files = dir.listFiles();
	var out = [];
	for(var i = 0 ; i <files.length; i++){
		if(files[i].isFile()){
			out.push(files[i]);
		}
	}	
	return out;
}



