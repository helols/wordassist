/**
 * @fileOverview
 */

/**
 * 
 */
var Split = function(){
	this.initialize.apply(this, arguments);
};
Split.prototype = {
	initialize: function(root, props){
		this.root = root;
		this.clonePolicy = props.clonePolicy ? props.clonePolicy : "backend";
		this.target = props.target ? props.target : null;
		this.filter =  props.filter ? props.filter : true;
	},
	run: function(){
		return this.split(this.target);
	},
	split: function(target){
		var _t = target;
		var _p = _t.parentNode;
		if(_p.nodeName == "BODY"){
			return;
		}
		if(!this.filter(_t)){
			return _t;
		}
		var _pClone;
		if(_p && _p !== this.root){
			_pClone = _p.cloneNode(false);
			if(this.clonePolicy == "backend"){
				do{
					var tmp = _t.nextSibling;
					_pClone.appendChild(_t);
					var _t = tmp;
				} while(_t);
				
				if(_p.nextSibling){
					_p.parentNode.insertBefore(_pClone, _p.nextSibling);
				}else{
					_p.parentNode.appendChild(_pClone);
				}
				this.split(_pClone);
			}else if(this.clonePolicy == "frontend"){
				do{
					var tmp = _t.previousSibling;
					if(!_pClone.firstChild){
						_pClone.appendChild(_t);
					}else{
						_pClone.insertBefore(_t, _pClone.firstChild);
					}
					_t = tmp;
				} while(_t);
				
				_p.parentNode.insertBefore(_pClone, _p);
				this.split(_pClone);
			}
		}else{
			//console.log("Finished");
		}		
		return _pClone;
	}
};