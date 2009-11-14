window.$stop = {};

/*---- Trex.I.JobObservable ------------------------------------------------------*/
Trex.I.JobObservable = Trex.Faculty.create({
	jobObservers: {},
	observeJob: function(name, observer) {
		if(!this.jobObservers[name]) {
			this.jobObservers[name] = [];
		}
		this.jobObservers[name].push(observer);
	},
	reserveJob: function(name, observer, delay) {
		delay = delay || 500;
		if(!this.jobObservers[name]) {
			this.jobObservers[name] = [];
		}
		var _self = this;
		this.jobObservers[name].push(function() {
			var args = $A(arguments);
			setTimeout(function() {
				observer.apply(_self, args);
			}, delay);
		});
	},
	fireJobs: function(name) {
		var _self = this;
		var args = $A(arguments).slice(1);
		if(this.jobObservers[name]) {
			this.jobObservers[name].each(function(observer) {
				observer.apply(_self, args);
			});
		}
	}
});

/*---- Trex.I.KeyObservable ------------------------------------------------------*/
Trex.I.KeyObservable = Trex.Faculty.create({
	keyObservers: {},
	observeKey: function(keys, observer) {
		var _name = function(keys) {
			return (keys.ctrlKey? 'T': 'F') + (keys.altKey? 'T': 'F') + (keys.shiftKey? 'T': 'F') + "_" + keys.keyCode;
		}(keys);
		if(!this.keyObservers[_name]) {
			this.keyObservers[_name] = [];
		}
		this.keyObservers[_name].push(observer);
	},
	fireKeys: function(ev) {
		var _name = function(ev) {
			return (ev.ctrlKey? 'T': 'F') + (ev.altKey? 'T': 'F') + (ev.shiftKey? 'T': 'F') + "_" + ev.keyCode;
		}(ev);
		if(!this.keyObservers[_name]) {
			return;
		}
		var _self = this;
		var args = $A(arguments).slice(1);
		try {
			this.keyObservers[_name].each(function(observer) {
				observer.apply(_self, args);
			});
		} catch (e) {
			if(e != $stop) { throw e; }
		}
		try {
			$tx.stop(ev);
		} catch(e){}
	},
	registerKeyEvent: function(el) {
		try {
			$tx.observe(el, 'keydown', this.fireKeys.bind(this), true);
		} catch(e) {}
	}
});

/*---- Trex.I.ElementObservable ------------------------------------------------------*/
Trex.I.ElementObservable = Trex.Faculty.create({
	elementObservers: {},
	observeElement: function(layer, observer) {
		if(layer == null) { //all
			this.observeElement({ tag: "*tx-final-body*"}, observer);
		} else if (layer.length) {
			for (var i = 0; i < layer.length; i++) {
				var item = layer[i];
				this.observeElement(item, observer);
			}
		} else {
			if (!this.elementObservers[layer.tag]) {
				this.elementObservers[layer.tag] = {};
			}
			if (!layer.klass) {
				layer.klass = "*tx-all-class*";
			}
			if (!this.elementObservers[layer.tag][layer.klass]) {
				this.elementObservers[layer.tag][layer.klass] = [];
			}
			this.elementObservers[layer.tag][layer.klass].push(observer);
		}
	},
	fireElements: function(node) {
		if(!node) {
			return;
		} 
		var _node = node;
		var args = $A(arguments).slice(1);
		
		var _self = this;
		try {
			if($tom.kindOf(_node, 'img,hr,table,button,iframe')) {
				var _observers = this.collectObserverByElement(_node.nodeName.toLowerCase(), _node.className);
				if(_observers) {
					_observers.each(function(observer) {
						observer.apply(_self, [_node].concat(args));
					});	
				}
			} else {
				while (_node) {
					var _observers = this.collectObserverByElement(_node.nodeName.toLowerCase(), _node.className);
					if(_observers) {
						_observers.each(function(observer) {
							observer.apply(_self, [_node].concat(args));
						});	
					}
					if($tom.isBody(_node)) {
						break;
					}
					_node = $tom.parent(_node);
				}
			}
			
		} catch (e) {
			if(e != $stop) { throw e; }
		}
		this.fireFinally();
	},
	fireFinally: function() {
		var _self = this;
		var args = $A(arguments).slice(1);
		var _observers = this.collectObserverByElement("*tx-final-body*");
		if(_observers) {
			_observers.each(function(observer) {
				observer.apply(_self, [null].concat(args));
			});	
		}
	},
	collectObserverByElement: function(tag, klass) {
		if(!this.elementObservers[tag]) {
			return null;
		}

		var _observers = [];
		klass = klass || "";
		if(klass != "") {
			var _classes = klass.split(" ");
			for(var _klass in this.elementObservers[tag]) {
				if(_classes.include(_klass)) {
					_observers.push(this.elementObservers[tag][_klass]);
				}
			}
		}
		if (this.elementObservers[tag]["*tx-all-class*"]) {
			_observers.push(this.elementObservers[tag]["*tx-all-class*"]);
		}
		return _observers.flatten();
	}
});