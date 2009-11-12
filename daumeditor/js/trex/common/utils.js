(function utils(Trex){
	/**
	 * @namespace
	 * @name Trex.Util
	 */
	Trex.Util = /** @lends Trex.Util */ {
		_dispElIds: [],
		getDispElId: function() {
			var _genId;
			do {
				_genId = "tx_entry_" + Math.floor(Math.random() * 10000);
			} while(Trex.Util._dispElIds.include(_genId));
			Trex.Util._dispElIds.push(_genId);
			return _genId;
		},
		generateKey: function() {
			return parseInt(Math.random() * 100000000);
		},
		toStyleString: function(styles) {
			var _str = [];
			for(var _name in styles) {
				_str.push(_name.replace(/([A-Z])/g, "-$1").toLowerCase());
				_str.push(":");
				_str.push(styles[_name]);
				_str.push(";");
			}
			return _str.join("");
		},
		toAttrString: function(attrs) {
			var _str = [];
			for(var _name in attrs) {
				_str.push(_name);
				_str.push("=\"");
				_str.push(attrs[_name]);
				_str.push("\" ");
			}
			return _str.join("");
		},
		getMatchValue: function(reg, html, inx) {
			var _matchs;
			if((_matchs = reg.exec(html)) != null) {
				return _matchs[inx];
			} else {
				return null;
			}
		},
		getAttachmentType: function(value){
			value = (value || "").toLowerCase();
			switch(value){
				case 'image/jpg':
				case 'image/jpeg':
				case 'image/png':
				case 'image/tiff':
				case 'image/gif':
				case 'image/bmp':
				case 'image/x-jg':
				case 'image/ief':
				case 'image/pict':
				case 'jpg':
				case 'bmp':
				case 'gif':
				case 'png':
					return 'image';
				default :
					return 'file';
			}
		},
		/**
		 * 확장자에 따는 thumbnail 이미지 url을 가져온다.  
		 * @param {Object} ext
		 */
		thumburl: function(ext) {
			ext = (ext || "").toLowerCase();
			switch (ext) {
				case "doc":
				case "docx":
					return TrexConfig.getIconPath("#iconpath/pn_word.gif?rv=1.0.1");
				case "xls":
				case "xlsx":
					return TrexConfig.getIconPath("#iconpath/pn_xls.gif?rv=1.0.1");
				case "ppt":
				case "pptx":
					return TrexConfig.getIconPath("#iconpath/pn_ppt.gif?rv=1.0.1");
				case "pdf":
					return TrexConfig.getIconPath("#iconpath/pn_pdf.gif?rv=1.0.1");
				case "txt":
					return TrexConfig.getIconPath("#iconpath/pn_txt.gif?rv=1.0.1");
				case "hwp":
					return TrexConfig.getIconPath("#iconpath/pn_hwp.gif?rv=1.0.1");
				case "zip":
				case "alz":
					return TrexConfig.getIconPath("#iconpath/pn_zip.gif?rv=1.0.1");
				case "mp3":
				case "wav":
				case "ogg":
				case "wma":
				case "mp4":
				case "ape":
				case "ra":
				case "ram":
					return TrexConfig.getIconPath("#iconpath/pn_mp3.gif?rv=1.0.1");
				case "avi":
				case "mpeg":
				case "wmv":
				case "asf":
					return TrexConfig.getIconPath("#iconpath/pn_movie.gif?rv=1.0.1");
				case "swf":
					return TrexConfig.getIconPath("#iconpath/pn_swf.gif?rv=1.0.1");
				case "htm" :
				case "html":
					return TrexConfig.getIconPath("#iconpath/pn_html.gif?rv=1.0.1");
				case "jpg":
				case "gif":
				case "png":
				case "bmp":
					TrexConfig.getIconPath("#iconpath/pn_etc.gif?rv=1.0.1");	
				default:
					return TrexConfig.getIconPath("#iconpath/pn_etc.gif?rv=1.0.1");
			}
		},
		/**
		 * 확장자에 따는 preview 이미지 url을 가져온다.  
		 * @param {Object} ext
		 */
		prevurl: function(ext) {
			ext = (ext || "").toLowerCase();
			switch (ext) {
				case "doc":
				case "docx":
					return TrexConfig.getIconPath("#iconpath/p_word_s.gif?rv=1.0.1");
				case "xls":
				case "xlsx":
					return TrexConfig.getIconPath("#iconpath/p_xls_s.gif?rv=1.0.1");
				case "ppt":
				case "pptx":
					return TrexConfig.getIconPath("#iconpath/p_ppt_s.gif?rv=1.0.1");
				case "pdf":
					return TrexConfig.getIconPath("#iconpath/p_pdf_s.gif?rv=1.0.1");
				case "txt":
					return TrexConfig.getIconPath("#iconpath/p_txt_s.gif?rv=1.0.1");
				case "hwp":
					return TrexConfig.getIconPath("#iconpath/p_hwp_s.gif?rv=1.0.1");
				case "zip":
				case "alz":
					return TrexConfig.getIconPath("#iconpath/p_zip_s.gif?rv=1.0.1");
				case "mp3":
				case "wav":
				case "ogg":
				case "wma":
				case "mp4":
				case "ape":
				case "ra":
				case "ram":
					return TrexConfig.getIconPath("#iconpath/p_mp3_s.gif?rv=1.0.1");
				case "avi":
				case "mpeg":
				case "wmv":
				case "asf":
					return TrexConfig.getIconPath("#iconpath/p_movie_s.gif?rv=1.0.1");
				case "swf":
					return TrexConfig.getIconPath("#iconpath/p_swf_s.gif?rv=1.0.1");
				case "htm" :
				case "html":
					return TrexConfig.getIconPath("#iconpath/p_html_s.gif?rv=1.0.1");
				case "jpg":
					return TrexConfig.getIconPath("#iconpath/p_jpg_s.gif?rv=1.0.1");
				case "gif":
					return TrexConfig.getIconPath("#iconpath/p_gif_s.gif?rv=1.0.1");
				case "png":
				case "bmp":
					return TrexConfig.getIconPath("#iconpath/p_png_s.gif?rv=1.0.1");
				default:
					return TrexConfig.getIconPath("#iconpath/p_etc_s.gif?rv=1.0.1");
			}
		},
		getMatchedClassName: function(element, classes){
			var matched = false;
			var _class = "";
			for(var i = 0; i < classes.length; i++){
				_class = classes[i];
				if($tx.hasClassName(element, _class)){
					matched = _class;
					break;
				}
			}
			return matched;
		},	
		getAllAttributesFromEmbed: function(embedSrc){
			var map = {};
			embedSrc = embedSrc.replace(/<embed|>/ig,"");
			try {
				var regSplit = /(\w+)=((?:\")[^\"]+(?:\"|$)|(?:')[^']+(?:'|$)|(?:[^\"'][^ \n]+($| |\n)))/ig;
				while( (result = regSplit.exec(embedSrc)) != null ){
					map[result[1].trim().toLowerCase()] = result[2].replace(/^(\"|')/i,"").replace(/(\"|')$/i,"").trim();
				}
			}catch(e){ }
			
			return map;
		},	
		getAllAttributes: function(source){
			var _map = {};
			var _matchsAttr;
	
			var _reg = new RegExp("style=\"[^\"]*(?:width|WIDTH)\\s*:\\s*([0-9]+)px[^\"]*\"", "g");
			while ((_matchsAttr = _reg.exec(source)) != null) {
				_map["width"] = _matchsAttr[1];
			}
			_reg = new RegExp("style=\"[^\"]*(?:height|HEIGHT)\\s*:\\s*([0-9]+)px[^\"]*\"", "g");
			while ((_matchsAttr = _reg.exec(source)) != null) {
				_map["height"] = _matchsAttr[1];
			}
			_reg = new RegExp("\\s+([a-zA-Z]+)=\"([^\"]*)\"", "g");
			while ((_matchsAttr = _reg.exec(source)) != null) {
				if (!_map[_matchsAttr[1].toLowerCase()]) {
					_map[_matchsAttr[1].toLowerCase()] = _matchsAttr[2];
				}
			}
			_reg = new RegExp("\\s+([a-zA-Z]+)='([^']*)'", "g");
			while ((_matchsAttr = _reg.exec(source)) != null) {
				if (!_map[_matchsAttr[1].toLowerCase()]) {
					_map[_matchsAttr[1].toLowerCase()] = _matchsAttr[2];
				}
			}
			_reg = new RegExp("\\s+([a-zA-Z]+)=([^\\s>]*)", "g");
			while ((_matchsAttr = _reg.exec(source)) != null) {
				if (!_map[_matchsAttr[1].toLowerCase()]) {
					_map[_matchsAttr[1].toLowerCase()] = _matchsAttr[2];
				}
			}
			return _map;
		}
	};
	
	/**
	 * @namespace
	 * @name Trex.HtmlCreator
	 */
	Trex.HtmlCreator = {
		/**
		 * Create Table Markup String
		 * 
		 *  @example
		 *  var items =[ 
		 *  		{
		 *  			klass: 'klassName',
		 *  			image: 'image url', // can be omitted
		 *  			data: 'data'
		 *  		}
		 *  	]
		 *  
		 *	var tableMarkup = Trex.HtmlCreator.createTableMarkup(row, col, item);
		 *   
		 * @param {int} rows
		 * @param {int} cols
		 * @param {Object} items 
		 * 	  
		 */
		createTableMarkup: function(rows, cols, items){
			var _html = [];
			_html.push("<table unselectable=\"on\">");
			_html.push("<tbody>");
			
			var _total = items.length;
			var _item;
			for(var row=0; row<rows; row++) {
				_html.push("<tr>");
				for(var col=0; col<cols; col++) {
					if(row * cols + col < _total) {
						_item = items[row * cols + col];
						if(_item.image) {
							_html.push("<td class=\"tx-menu-list-item\"><a href=\"javascript:;\"><span class=\"" + ((_item.klass)? _item.klass: "") + "\"><img src=\"" + _item.image + "\" data=\"" + _item.data + "\"/></span></a></td>");
						} else {
							_html.push("<td class=\"tx-menu-list-item\"><a href=\"javascript:;\"><span class=\"" + ((_item.klass)? _item.klass: "") + "\">" + _item.data + "</span></a></td>");
						}
					} else {
						_html.push("<td class=\"tx-menu-list-item\"><a href=\"javascript:;\"><span class=\"\">&nbsp;</span></a></td>");
					}
				}
				_html.push("</tr>");
			};
			_html.push("</tbody>");
			_html.push("</table>");
			return _html.join("\n");
		}
	};
	
	Trex.String = {
		escapeQuot: function(str) {
			return str.replace(new RegExp('"', "g"), "&quot;").replace(new RegExp("'", "g"), "&#39;");
		},
		unescapeQuot: function(str) {
			return str.replace(new RegExp("&quot;", "gi"), '"').replace(new RegExp("&#39;", "g"), "'");
		},
		htmlspecialchars: function(str) {
			return Trex.String.escapeQuot(str.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;").replace(new RegExp(">", "g"), "&gt;"));
		},
		unHtmlspecialchars: function(str) {
			return Trex.String.unescapeQuot(str.replace(new RegExp("&amp;", "gi"), "&").replace(new RegExp("&lt;", "gi"), "<").replace(new RegExp("&gt;", "gi"), ">"));
		},	
		parseAttribute: function(elStr, attrName){
			var regAttribute1 = new RegExp("(^|\\W)" + attrName + '="([^"]*)"', "gi");
			var regAttribute2 = new RegExp("(^|\\W)" + attrName + "='([^']*)'", "gi");
			var regAttribute3 = new RegExp("(^|\\W)" + attrName + "=([^\\s>]*)", "gi");
			if (result = regAttribute1.exec(elStr)) {
				return result[2];
			}else if (result = regAttribute2.exec(elStr)) {
				return result[2];
			}else if (result = regAttribute3.exec(elStr)) {
				return result[2];
			}else {
				return "";
			}
		},	
		changeAttribute: function(elStr, attrName, toAttr){
			var regAttribute1 = new RegExp("(^|\\W)" + attrName + '="([^"]*)"', "gi");
			var regAttribute2 = new RegExp("(^|\\W)" + attrName + "='([^']*)'", "gi");
			var regAttribute3 = new RegExp("(^|\\W)" + attrName + "=([^\\s>]*)", "gi");
			var regAttribute4 = new RegExp("<([\\w]+\\s*)", "gi");
			var _exists = false;
			if (elStr.search(regAttribute1) > -1) {
				_exists = true;
				elStr = elStr.replace(regAttribute1, toAttr);
			} 
			if (elStr.search(regAttribute2) > -1) {
				_exists = true;
				elStr = elStr.replace(regAttribute2, toAttr);
			} 
			if (elStr.search(regAttribute3) > -1) {
				_exists = true;
				elStr = elStr.replace(regAttribute3, toAttr);
			} 
			if(!_exists) {
				elStr = elStr.replace(regAttribute4, "<$1" + toAttr + " ");
			}
			return elStr;
		}
	};
	
	/*---- Trex.Validator ------------------------------------------------------*/
	Trex.Validator = Trex.Class.create({
		initialize: function() { },
		strip: function(content) {
			return content.stripTags().replace(/&nbsp;/g, "").replace(/\ufeff/g, "").trim();
		},
		exists: function(content) {
			if(!content) {
				return false;
			}
			if(this.strip(content) == "") {
				if(content.search(/<(img|iframe|embed|table|hr|script)/i) < 0) {
					return false;
				}
			}
			return true;
		},
		equals: function(content, text) {
			if(!content || !text) {
				return false;
			}
			if(content.search(/<(img|iframe|embed|table|hr|script)/i) < 0) {
				if(this.strip(content) == this.strip(text)) {
					return true;
				}
			}
			return false;
		}
	});
	
	/*---- Trex.Repeater ------------------------------------------------------*/
	Trex.Repeater = Trex.Class.create({
		initialize: function(execHandler) {
			this.execHandler = execHandler;
		},
		start: function(term) {
			if(this.tItv) {
				this.clear();
			}
			this.tItv = window.setInterval(this.onTimer.bind(this), term);
		},
		clear: function() {
			window.clearInterval(this.tItv);
			this.tItv = null;
		},
		onTimer: function() {
			if(this.execHandler != null) {
				this.execHandler();
			}
		}
	});
	
	/*---- Trex.Timer ------------------------------------------------------*/
	Trex.Timer = Trex.Class.create({
		initialize: function(execHandler) {
			this.execHandler = execHandler;
		},
		start: function(term) {
			window.setTimeout(this.onTimer.bind(this), term);
		},
		onTimer: function() {
			if(this.execHandler != null) {
				this.execHandler();
			}
		}
	});
	
	/**
	 * Trex.Paging Class
	 * paging을 위한 class. Ajax나 fileter 등을 통한 dynamic data바인딩은 고려되지 않음. static array로만 사용이 가능 
	 * @class
	 * @param {Array} data
	 * @param {Object} config 
	  */
	Trex.Paging = Trex.Class.create({
		$const:{
			DEFAULT_PAGE_SIZE: 5,
			DEFAULT_BLOCK_SIZE:10
		},
		initialize: function(data, config ){
			this.data = data;
			this.currentpage = config.initPage || 1;
			this.totalrow = config.totalrow || this.getTotalRow();
			this.pagesize = config.pagesize || Trex.Paging.DEFAULT_PAGE_SIZE;
			this.blocksize = config.blocksize || Trex.Paging.DEFAULT_PAGE_SIZE;
			this.totalpage = Math.ceil( this.totalrow / this.pagesize );
			this.totalblock = Math.ceil( this.totalpage / this.blocksize );
		},
		getNextPage: function(){
			return (this.currentpage < this.totalpage)?this.currentpage+1:0;
		},
		getPrevPage: function(){
			return (this.currentpage > 1)?this.currentpage-1:0;
		},
		getNextBlock: function(){
			var _currentblock = Math.ceil(this.currentpage/this.blocksize);
			return ( _currentblock < this.totalblock)?_currentblock * this.blocksize + 1:0
		},
		getPrevBlock: function(){
			var _currentblock = Math.ceil(this.currentpage/this.blocksize);
			return (_currentblock > 1)?(_currentblock-2) * this.blocksize + 1:0;
		},
		getPageList: function(){
			var pages = [];
			var _startBlock = Math.ceil( this.currentpage / this.blocksize ) - 1;
			var _startPage = ( _startBlock * this.blocksize + 1 );
			var _endPage = Math.min( this.totalpage, (_startPage + this.blocksize - 1) );
			for ( var i = _startPage; i <= _endPage; i++ ){
				pages.push(i);
			}
	
			return pages;
		},
		movePage: function( page ){
			this.currentpage = page || this.currentpage;
		},
		getOnePageData: function(){
			var result = [];
			var _start = (this.currentpage-1) * this.pagesize;
			var _end = Math.min( this.currentpage * this.pagesize, this.totalrow ) ;
			for( var i = _start; i < _end; i++ ){
				result.push( this.data[i] ); 
			}
			
			return result;
		},
		getTotalRow: function(){
			return this.data.length;
		}
	});
	
	/**
	 * Trex.Slidebar Class
	 * slidebar 위젯. 마크업, CSS에 의존성이 있다. 
	 * @class
	 * @param {Object} config	 
	  */
	Trex.Slidebar = Trex.Class.create({
		initialize: function(config){
			/* config = { 
			 * 		handler: function, 슬라이드가 동작할때 실행될 함수
			 * 		elContext: 슬라이드가 제어될 영역, div등의 element
			 * 		knoWidth: knob element의 크기
			 * 		barSize: 슬라이드 element의 크기
			 * 		min: 최소값(논리적인 값, default 0)
			 *  	max :최대값(논리적인 값, default 100)
			 *  	interval: 한번 클릭이나 마우스 드래그로 이동하는 값(논리적인 값, default 5)
			 * 		defaultValue: 초기 knob이 위치할 값
			 * }
			 */		
			this.elContext = config.el;
			this.knobWidth =  config.knobWidth;
			this.isDisabled = false;
			this.handler = function(value){
				if (!this.isDisabled && typeof config.handler == "function") {
					config.handler(value);
				}
			}

			config.defaultValue = config.defaultValue || 0;
			this.logicObj = {
				interval: config.interval || 5 ,
				min: config.min || 0,
				max: config.max || 100
			};
			this.physicObj = {
				min:0,
				width: config.barSize || 100	
			};
			this.physicObj.max = this.physicObj.width - this.knobWidth;  
			this.physicObj.interval = this.logicObj.interval * this.physicObj.max / this.logicObj.max;
			
			this.startPos = 0;
			this.startX = 0;
			this.isDrag = false;
			this.result = 0;
			
			var elMenu = $tom.collect( this.elContext, "dd.tx-slide" );
			// 양끝단에 min값과 max값이 표시 될 수도 있다. 
			$tom.collect( elMenu, "span.tx-slide-min" ).innerHTML = ""; 
			$tom.collect( elMenu, "span.tx-slide-max" ).innerHTML = "";
							
			/* default 값 셋팅하는 부분이 필요하다? */
			this.bindEvent();
			this.setKnobPosition(config.defaultValue);
		},
		regenerate: function( value ){
			value = parseInt(value * this.physicObj.width / this.logicObj.max);
			this.setKnobPosition(value);
		},
		bindEvent: function(){
			var elMenu = $tom.collect( this.elContext, "dd.tx-slide" );
			var elPrev = $tom.collect( elMenu, "a.tx-slide-prev" )
			var elNext = $tom.collect( elMenu, "a.tx-slide-next" );
			var elBar = $tom.collect( elMenu, "div.tx-slide-bar" );
			var elKnob = this.elKnob = $tom.collect( elMenu, "div.tx-slide-knob" );
			
			$tx.observe( elKnob, "mousedown", function(ev){
				this.isDrag = true;
				this.startPos = this.getKnobPosition();
				this.startX = ev.clientX;
				$tx.stop(ev);
			}.bind(this));
			
			$tx.observe( elKnob, "mouseup", function(ev){
				this.isDrag = false;
			}.bind(this));
			
			$tx.observe( this.elContext, "mousemove", function(ev){
				if ( this.isDrag ){
					this.setKnobPosition( this.startPos +  ev.clientX - this.startX);
					$tx.stop(ev);
					this.handler( this.result );
				}
			}.bind(this));
			
			$tx.observe( elPrev, "click", function(ev){
				var count = Math.round(this.physicObj.interval) - 1;
				var that = this;
				var moveLeft = function(){
					var pos = that .getKnobPosition();
					that.setKnobPosition( pos - 1);
					if ( count-- > 0 ) {
						setTimeout(moveLeft, 10 );
					}else{
						that.handler(that.result);
					}
				};
				moveLeft();
				$tx.stop(ev);
			}.bind(this));
			
			$tx.observe( elNext, "click", function(ev){
				var count = Math.round(this.physicObj.interval);
				var that = this;
				var moveRight = function(){
					var pos = that.getKnobPosition();
					that.setKnobPosition( pos + 1);
					if ( --count > 0 ) {
						setTimeout(moveRight, 10 );
					}else{
						that.handler(that.result);
					}
				};
				moveRight();
				$tx.stop(ev);
			}.bind(this));
			
			$tx.observe( this.elContext, "mouseup", function(ev){
				if ( this.isDrag ) {
					this.isDrag = false;
				}
			}.bind(this));
			$tx.observe( elKnob, "click", function(ev){
				$tx.stop(ev);
			}.bind(this));
			
			$tx.observe( elBar, "click", function(ev){
				if ( !this.isDrag ) {
					var x = ev.layerX || ev.x;
					this.setKnobPosition( x - this.knobWidth / 2);
					this.handler( this.result );
				}
			}.bind(this));
		},	
		getKnobPosition: function(){
			var pos = $tx.getStyle( this.elKnob, "left");
			return pos.parsePx();
		},
		setKnobPosition: function(value){
			if ( this.isDisabled ){
				return;
			}
			value = (value < this.physicObj.max)?value:this.physicObj.max;
			value = (value > this.physicObj.min)?value:this.physicObj.min;
			$tx.setStyle( this.elKnob, {left: value.toPx()});
			
			this.result = Math.round( value * this.logicObj.interval / this.physicObj.interval );
		},
		setDisable: function(){
			this.isDisabled = true;
		},
		setEnable: function(){
			this.isDisabled = false;
		},
		getDisabled: function(){
			return this.isDisabled;
		}
	});
	
	
	/**
	 * Trex.DynamicSizer Class
	 * table의 가로세로 사이즈를 마우로 제어할 수 있는 위젯. 
	 * @class
	 * @param {Object} config	 
	  */
	Trex.DynamicSizer = Trex.Class.create({
		initialize: function(config){
			/* config = { 
			 * 		el: //다이나믹 사이저가 실릴 영역
			 * 		clickHandler : 클릭됐을때
			 */ 
			this.config = config;
			this.wrapper = config.el;
			this.elEventContext = tx.div({className:"tx-dynamic-sizer-context"});
			this.currentSize = {row:0, col:0}
			this.dynamicSizingEnabled = true;
			
			this.previewTable = new Trex.DynamicSizer.PreviewTable({
				parentEl: this.elEventContext,
				mouseOverHandler: this.changeSize.bind(this),
				mouseClickHandler: this.selectSize.bind(this)
			});
			this.sizeDisplay = new Trex.DynamicSizer.SizeDisplay({
				parentEl: this.wrapper
			});
			this.wrapper.appendChild( this.elEventContext );
			
			var cellSize = this.previewTable.getOneCellSize();
			this.selection = new Trex.DynamicSizer.Selection({
				parentEl:this.elEventContext,
				cellWidth: cellSize.width,
				cellHeight: cellSize.height
			});

			this.eventBinding();
		},
		clear: function(){
			this.dynamicSizingEnabled = true;
			this.changeSize(0,0);
		},
		eventBinding: function(){
//					var dynamicSizer = this;
//					var mouseOutHandler = function(ev){
//						dynamicSizer.changeSelectionStatus();
//					}
//					$tx.observe(this.elEventContext, "mouseout", mouseOutHandler);
		},
		changeSize: function(row, col){
			if (this.dynamicSizingEnabled) {
				this.currentSize.row = row;
				this.currentSize.col = col;
				
				this.selection.changeSize(row, col);
				this.sizeDisplay.changeDisplay(row, col);
			}
		},
		toggleDynamicSizing: function(){
			this.dynamicSizingEnabled = !this.dynamicSizingEnabled;
			if ( this.dynamicSizingEnabled ){
				this.selection.enableResize();
			}else{
				this.selection.disableResize();
			}
		},
		selectSize:function(ev){
			this.config.clickHandler( ev, this.currentSize);
		},
		getCurruentSize: function(){
			return this.currentSize;
		}
	});
		Trex.DynamicSizer.PreviewTable = Trex.Class.create({
			$const:{
				DEFAULT_TD_STYLE:{
					width:"12px", 
					height:"12px"
				},
				DEFAULT_TABLE_PROPERTY:{
					cellpadding: "0",
					cellspacing: "0"
				},
				MAX_SIZE: { COL:10, ROW:10 }
			},
			initialize: function(config){
				this.config = config;
				this.elTable = null;
				this.generateTable();
				this.eventBinding();
				config.parentEl.appendChild( this.elTable );
			},
			generateTable: function(){
				var tbody = tx.tbody();
				var PROPERTY = Trex.DynamicSizer.PreviewTable;
				for (var i = 0; i < PROPERTY.MAX_SIZE.ROW; i++) {
					var tr = tx.tr();
					for (var j = 0; j < PROPERTY.MAX_SIZE.COL; j++) {
						var td = tx.td(tx.div( {
							style: PROPERTY.DEFAULT_TD_STYLE
						}));
						td = this.setCoordToAttr(td, j+1, i+1);
						tr.appendChild(td);
					}
					tbody.appendChild(tr);
				}
				
				this.elTable = tx.table(PROPERTY.DEFAULT_TABLE_PROPERTY);
				this.elTable.appendChild( tbody );
			},
			setCoordToAttr: function(element, col, row){
				element.setAttribute("col", col);
				element.setAttribute("row", row);
				return element;
			},
			getCoordFromAttr: function(element){
				return {
					col: element.getAttribute("col") || 0,
					row: element.getAttribute("row") || 0
				}
			},
			getOneCellSize: function(){
				var offsetPos = $tom.getPosition( this.elTable );
				return {
					width: parseInt(offsetPos.width / Trex.DynamicSizer.PreviewTable.MAX_SIZE.COL),
					height: parseInt(offsetPos.height / Trex.DynamicSizer.PreviewTable.MAX_SIZE.ROW)
				} 
			},
			eventBinding: function(){
				// 외부에서 받은 event핸들러들로 binding시킴
				this.mouseOverHandler = this.config.mouseOverHandler;
				this.mouseClickHandler = this.config.mouseClickHandler;
				
				var self = this;
				var _mouseOverHandler = function(ev){
					var element = $tx.findElement(ev, "td");
					if (element) {
						var coord = self.getCoordFromAttr(element);
						self.mouseOverHandler(coord.row, coord.col);
					}
					$tx.stop(ev);
				}  
				var _mouseClickHandler = function(ev){
					self.mouseClickHandler(ev);
				}
				$tx.observe(this.elTable, "mouseover", _mouseOverHandler);
				$tx.observe(this.elTable, "click", _mouseClickHandler);
			}
		});
		
		Trex.DynamicSizer.Selection = Trex.Class.create({
			$const:{
				COLOR:{
					disable: "#000",
					enable: "#c6cdf7"
				}
			},
			initialize: function(config){
				this.elSelection = tx.div({
					className: "tx-dynamic-sizer-selection",
					style:{
						backgroundColor: Trex.DynamicSizer.Selection.COLOR.enable
					}
				});
				
				this.cellWidth = config.cellWidth;
				this.cellHeight = config.cellHeight;
				config.parentEl.appendChild( this.elSelection );
			},
			changeSize: function(rowCount, colCount){
				$tx.setStyle(this.elSelection, {
					width: (this.cellWidth * colCount) + "px",
					height: (this.cellHeight * rowCount) + "px"
				});										
			},
			changeBackColor: function( backColor ){
				$tx.setStyle(this.elSelection, {
					backgroundColor: backColor
				});
			},
			disableResize: function(){
				this.changeBackColor(Trex.DynamicSizer.Selection.COLOR.disable);
			},
			enableResize: function(){
				this.changeBackColor(Trex.DynamicSizer.Selection.COLOR.enable);
			}
		});
		
		Trex.DynamicSizer.SizeDisplay = Trex.Class.create({
			initialize: function(config){
				this.elColDisplay = tx.span("0");
				this.elRowDisplay = tx.span("0");
				var span = tx.span("x");
				this.elDisplay = tx.div({
						className: "tx-dynamic-sizer-display"
					},
					tx.span("표삽입 "), this.elRowDisplay, span, this.elColDisplay
				);
				
				config.parentEl.appendChild( this.elDisplay );
			},
			changeDisplay: function(row, col){
				if ( this.savedCol != col ){
					this.elColDisplay.innerHTML = this.savedCol = col;
				}
				if ( this.savedRow != row ){
					this.elRowDisplay.innerHTML = this.savedRow = row;
				}
			}
		});
		function init(){
			new Trex.DynamicSizer({
				el: $tx("test")
			});
		}
})(Trex);

/*---- Trex.ImageScale ------------------------------------------------------*/
Trex.ImageScale = Trex.Class.create({
	initialize: function(data, handler) {
		if(!data.imageurl) {
			return;
		}
		if(data.actualwidth) {
			return;
		}
		var _loadHandler = function(width, height) {
			data.actualwidth = width;
			data.actualheight = height;
			if(handler) {
				handler(width, height);
			}
		};

		setTimeout(function() {
			var _tmpImage = new Image();
			_tmpImage.onerror = function() {
				_tmpImage = null;
			};
			if( _tmpImage.onreadystatechange ) { //IE
				_tmpImage.onreadystatechange = function() {
					if(this.readyState == "complete") {
						_loadHandler(this.width, this.height);
						_tmpImage = null;
					}
				};
			} else {
				_tmpImage.onload = function() {
					_loadHandler(this.width, this.height);
					_tmpImage = null;
				};
			}
			_tmpImage.src = data.imageurl;
		}, 10);
	}
});