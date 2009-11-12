/**
 * This is wrapper of swfobject 2.2
 */
Trex.Flash = {
	DEFAULT:{
		flashvar: {
			debug:"false"
		},
		paraObj:{
			allowscriptaccess: "always",
			quality: "low",
			menu: "false",
			scale: "noscale",
			salign: "tl",
			loop: "false"
		},
		attrObj:{
			bgcolor: "#FFFFFF"
		}
	},
	minFlashVer:"9.0.28",
	load: function(src, elId, flashId, options){
		/* options = {
		 * 		width
		 * 		height
		 * 		flashVarObj
		 * 		paraObj
		 * 		attrObj
		 * }
		 */
		var _flashvarObj = $tx.extend({}, Trex.Flash.DEFAULT.flashvar );		
		var _paraObj = $tx.extend({}, Trex.Flash.DEFAULT.paraObj );		
		var _attrObj = $tx.extend({}, Trex.Flash.DEFAULT.attrObj );
		
		var _options = options?options:{};
		$tx.extend( _flashvarObj, _options.flashvarObj );	
		$tx.extend( _paraObj, _options.paraObj );	
		$tx.extend( _attrObj, _options.attrObj );
		_attrObj.id = _attrObj.name = flashId;
		
		swfobject.embedSWF(
			src,
			elId,
			_options.width ? _options.width:"0",	
			_options.height ? _options.height:"0",	
			this.minFlashVer,
			false,
			_flashvarObj,
			_paraObj,
			_attrObj
		);
	},
	get: function(id){
		return swfobject.getObjectById(id);
	},
	getPlayerVersion: function(){
		return swfobject.getFlashPlayerVersion();
	},
	hasPlayerVersion: function(version){
		return swfobject.hasFlashPlayerVersion(version);
	}
}
