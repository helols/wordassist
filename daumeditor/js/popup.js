var DEVELLIBS = [
	"global.js",
	"lib/firebug/firebugx.js",
	"trex/lib/txlib.js",
	"trex/lib/hyperscript.js",
	"trex/lib/template.js",
	"trex/lib/dgetty.js",
	"trex/lib/xgetty.js",
	"trex/lib/rubber.js",
	"trex/lib/swfobject.js",
	"trex/trex.js",
	"trex/common/markup.js",
	"trex/common/domutil.js",
	"trex/common/ajax.js",
	"trex/common/utils.js",
	"trex/common/observable.js",
	"trex/common/flash.js",
	"common.js",
	'' /*dummy*/
];

(function() {
	var _importScript = function(filename) { 
		if (filename) {
			document.write('<script type="text/javascript" src="/daumeditor/js/' + filename + "?ver=" + new Date().getTime().toString() + '" charset="utf-8"></s' + 'cript>');
		}
	};
	for(var i=0; i<DEVELLIBS.length; i++) {
		_importScript(DEVELLIBS[i]);
	}
})();
