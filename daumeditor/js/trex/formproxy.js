Trex.install("install Trex.FormProxy",
	function(editor, toolbar, sidebar, canvas, config){
		var _formproxy = new Trex.FormProxy(editor, sidebar, config);
		editor.getForm = function() {
			return _formproxy;
		};
	}
);

Trex.FormProxy =Trex.Class.create( {
	initialize : function(editor, sidebar,  config){
		this.editor = editor;
		this.sidebar = sidebar;
		this.config = config;
		
		var _elForm = this.elForm = document.forms[config.form];
		if(!_elForm) {
			throw new Error("[Exception]Trex.Form : not exist element - " + config.form);
		}

		_elForm.onsubmit = function() {
			return false;
		};
	},
	submit: function() {
		this.elForm.submit();
	},
	createField: function(elField) {
		this.elForm.appendChild(elField);
	},
	getElements: function() {
		return this.elForm.elements;
	},
	getElementByName: function(name) {
		return this.elForm[name];
	},
	getFormField: function() {
		var _formfield = {};
		
		var _fields = this.getElements();
		var _field;
		for(var i=0; i<_fields.length; i++) {
			_field = _fields[i];
			if(!["select", "input", "textarea"].include(_field.tagName.toLowerCase())) {
				continue;
			}
			if(!_field.name && !_field.id) {
				continue;
			}
			if(_field.tagName.toLowerCase() == "select") {
				if (_field.selectedIndex > 0) {
					_formfield[_field.name] = _field.options[_field.selectedIndex].value;
				}
			} else {
				if(_field.type == "radio" && !_field.checked) {
					continue;
				} else if(_field.type == "checkbox" && !_field.checked) {
					continue;
				} else {
					_formfield[_field.name || _field.id] = _field.value;
				}
			}
		}
		return _formfield;
	},
	setFormField: function(formfield){
		if(!formfield) {
			return;
		}
		var _fields = this.getElements();
		var _field;
		var _value;
		for(var i=0; i<_fields.length; i++) {
			_field = _fields[i];
			if(_field.name === null || _field.name.length === 0) {
				continue;
			}
			if(!formfield[_field.name]) {
				continue;
			}
			if(!["select", "input", "textarea"].include(_field.tagName.toLowerCase())) {
				continue;
			}
			_value = formfield[_field.name];
			if(_field.tagName.toLowerCase() == "select") {
				for(var j=0; j<_field.options.length; j++) {
					if(_field.options[j].value == _value) {
						_field.options[j].selected = true;
						break;
					}
				}
			} else {
				if(_field.type == "radio" || _field.type == "checkbox") {
					if(_field.value == _value) {
						_field.checked = true;
					}
					continue;
				} else {
					_field.value = _value;
				}
			}
		}
	}
});
		