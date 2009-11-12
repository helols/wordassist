Trex.install("install Trex.Plugin",
	function(editor, toolbar, sidebar, canvas, config){
		var _initializedId = editor.getInitializedId();
		
		var _plugins = {};
		for(var item in Trex.Plugin) {
			var _name = Trex.Plugin[item]['__Identity'];
			if (_name) {
				var cfg = TrexConfig.getPlugin(_name, config);
				if (Trex.available(cfg, _name + _initializedId)) {
					_plugins[_name] = new Trex.Plugin[item](editor, cfg);
				}
			}
		}
		
		editor.getPlugin = function() {
			if(arguments.length == 0){
				return _plugins;	
			}else{
				return _plugins[arguments[0]];
			}
		};
	}
);

Trex.Plugin = {};
