/**
 * @fileoverview 
 *  Table을 삽입하는 기능을 가진 Tool 'table' Source,
 *  Class Trex.Tool.Table,Trex.Menu.Table,Trex.Menu.Table.TableEdit와 configuration 을 포함 하고있다.    
 */
TrexConfig.addTool(
	"table",
	{
		sync: false,
		status: true
	},
	function(root){
		var bgc = TrexConfig.get("canvas",root).styles.backgroundColor;
		if (bgc != "transparent") {
			TrexConfig.getTool("table",root).bgcolor = bgc;
		}
	}
);

Trex.Tool.Table = Trex.Class.create({
	$const: {
		__Identity: 'table',
		__DEFAULT_TABLE_PROPERTY:{
			"width": 600,
			"cellSpacing": 1,
			"cellPadding": 0,
			"style": {
				border: "none",
				borderSpacing:"0"
			}
		}
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _self = this;
		this.tableSize = { row: 0, col:0 };
		this.templateWizard = new Trex.Tool.Table.TemplateWizard();
		
		var _canvas = this.canvas;
		this.config = config;
		
		var _toolHandler = function(data) {
			var table = _self.changeTableStyle(_self.makeEmptyTable(data.row, data.col), data.templateNumber);
			var div = tx.div(table);
			var value = div.innerHTML;
			
			_canvas.execute(function(processor) {
				var _tNode = processor.pasteContent(value, true);
				processor.bookmarkInto(_tNode);
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			new Trex.Menu.Table(this.menuCfg),
			/* handler */
			_toolHandler
		);
	},
	makeEmptyTable: function(row, col){
		var table = tx.table(Trex.Tool.Table.__DEFAULT_TABLE_PROPERTY);
		var tbody = tx.tbody();
		var width = parseInt(100/col) + "%";
		for( var i = 0; i < row; i++ ){
			var tr = tx.tr();
			for( var j = 0; j < col; j++ ){
				tr.appendChild( tx.td("\ufeff", {style:{'width':width}}));
			}
			tbody.appendChild( tr );
		}
		table.appendChild( tbody );
		
		if ( this.config.width ) {
			table.setAttribute("width", config.width);	
		}
		return table; 	
	},
	changeTableStyle: function(table, templateNumber){
		if (templateNumber) {
			this.templateWizard.applyStyle(table, templateNumber);
		}else{
			this.templateWizard.applyStyle(table, 0);
		}
		return table;
	}
});

Trex.Tool.Table.TemplateWizard = Trex.Class.create({
	initialize: function(){
		// TODO 템플릿 종류 리스트 보여주는 부분이 필요하다. 
		this.templateList = (typeof getTableTemplateList == "function")? getTableTemplateList() : [{
			klass: "ex1",
			common: {
				borderRight: "1px solid #000",
				borderBottom: "1px solid #000"
			},
			firstRow: {
				borderTop: "1px solid #000"
			},
			firstCol: {
				borderLeft: "1px solid #000"
			},
			lastCol: {},
			lastRow: {},
			evenRow: {},
			oddRow: {}
		}];
		this.currentTemplate = null;
	},
	applyStyle: function(table, templateIndex){
		// TODO 번호가 없을때의 예외처리
		this.currentTemplate = this.templateList[templateIndex];
		var trArr = $tom.collectAll(table, "tr");
		
		for( var i = 0; i < trArr.length; i++){
			var tdArr = $tom.collectAll(trArr[i], "td");
			for( var j = 0; j <tdArr.length; j++){
				this.setCellStyle(tdArr[j], {
					isEventRow: (i % 2) == 0,
					isFirstRow: i == 0,
					isLastRow: i == trArr.length - 1, 
					isFirstCol: j == 0,
					isLastCol: j == tdArr.length - 1 
				});	
			}
		}
	},
	setCellStyle: function(elTd, truthMap){
		var t = this.currentTemplate;
		var style = Object.extend({}, t['common']);
		Object.extend(style, (truthMap.isEvenRow)?t['evenRow'] : t['oddRow']);
		Object.extend(style, (truthMap.isLastRow)?t['lastRow'] : (truthMap.isFirstRow)?t['firstRow'] : {});
		Object.extend(style, (truthMap.isLastCol)?t['lastCol'] : (truthMap.isFirstCol)?t['firstCol'] : {});
		txlib.setStyle(elTd, style);
	},
	getTemplateList: function(){
		return this.templateList;
	}
});

Trex.MarkupTemplate.add(
	'menu.table.direct', [
		'<div>표 직접설정</div>',
		'<div class="tx-table-input-area">',
		'<div class="tx-field tx-col-field">열 개수<input type="text" value="1"><a class="tx-btn tx-btn-add" href="javascript:;">열개수+</a><a class="tx-btn tx-btn-sub" href="javascript:;">열개수-</a></div>',
		'<div class="tx-field tx-row-field">행 개수<input type="text" value="1"><a class="tx-btn tx-btn-add" href="javascript:;">행개수+</a><a class="tx-btn tx-btn-sub" href="javascript:;">열개수-</a></div>',
		'</div>'
	].join("")
);
/* Trex.Menu.Table ************************************************************************************/
Trex.Menu.Table = Trex.Class.create({
	$const:{
		MAX_ROW:30,
		MAX_COL:30
	},
	TEMPLATE: '<div>표 직접설정</div><div class="tx-table-input-area"><div class="tx-field tx-col-field">열 개수<input type="text" value="1"><a class="tx-btn tx-btn-add" href="javascript:;">열개수+</a><a class="tx-btn tx-btn-sub" href="javascript:;">열개수-</a></div><div class="tx-field tx-row-field">행 개수<input type="text" value="1"><a class="tx-btn tx-btn-add" href="javascript:;">행개수+</a><a class="tx-btn tx-btn-sub" href="javascript:;">열개수-</a></div></div>',
	$extend: Trex.Menu,
	ongenerated: function(config) {
		this.rowSize = 1;
		this.colSize = 1;
				
		this.elInnerPreview = $tom.collect(this.elMenu, 'div.tx-menu-inner .tx-menu-preview');
		this.dynamicSizer = this.generateDynamicSizer(this.elInnerPreview);
		
		this.elInnerRowCol = $tom.collect(this.elMenu, 'div.tx-menu-inner .tx-menu-rowcol');
		this.generateTextSizer(this.elInnerRowCol);
		
		this.elButtonArea = $tom.collect(this.elMenu, 'div.tx-menu-inner .tx-menu-enter');
		this.generateButtonArea(this.elButtonArea);
	},
	onregenerated: function() {
		this.showDynamicSizer();
	},
	showDynamicSizer: function(){
		this.dynamicSizer.clear();
		$tx.show( this.elInnerPreview );
		$tx.hide( this.elInnerRowCol );
		$tx.hide( this.elButtonArea );
	},
	showTextSizer: function(){
		$tx.hide(this.elInnerPreview);
		$tx.show(this.elInnerRowCol);
		$tx.show(this.elButtonArea);
	},
	generateDynamicSizer: function(elPreivewContext){
		var _self = this;
		var dynamicSizer = new Trex.DynamicSizer({
			el: elPreivewContext,
			clickHandler: this.onSelect.bind(this)
		});
		
		var _elA = tx.a({href:"javascript:;"}, "표 직접설정");
		$tx.observe( _elA, "click", function(ev){
			_self.showTextSizer();
			$tx.stop(ev);
		});
		
		var _elButton = tx.div({className:"tx-more-button"});
		_elButton.appendChild(_elA);
		elPreivewContext.appendChild( _elButton );
		
		return dynamicSizer;
	},
	generateTextSizer: function(elContext) {
		var _self = this;
		
		Trex.MarkupTemplate.get('menu.table.direct').evaluateToDom({}, elContext);
		
		var calculator = {
			calculate: function(value, max, operand){
				value = parseInt(value);
				if ( value + operand > max || value + operand< 1){
					alert( TXMSG("@table.alert") );
					return value;
				}else{
					return value + operand;
				}
			},
			getValidValue:function(value, previousValue, max){
				if ( value < 0 || value > max  ){
					alert( TXMSG("@table.alert") );
					return previousValue;
				}else{
					return value;
				}		
				
			}
		}
		
		var colInput = $tom.collect(elContext, ".tx-col-field input");
		$tx.observe(colInput, "blur", function(){
			colInput.value = _self.colSize = calculator.getValidValue(colInput.value, _self.colSize, Trex.Menu.Table.MAX_COL);
		});
		$tx.observe( $tom.collect(elContext, ".tx-col-field .tx-btn-add"), "click", function(){ 
			colInput.value = _self.colSize = calculator.calculate(_self.colSize, Trex.Menu.Table.MAX_COL, 1); 
		});
		$tx.observe($tom.collect(elContext, ".tx-col-field .tx-btn-sub"), "click", function(){ 
			colInput.value = _self.colSize = calculator.calculate(_self.colSize, Trex.Menu.Table.MAX_COL, -1); 
		});
		
		var rowInput = $tom.collect(elContext, ".tx-row-field input");
		$tx.observe(rowInput, "blur", function(){ 
			rowInput.value = _self.rowSize = calculator.getValidValue(rowInput.value, _self.rowSize, Trex.Menu.Table.MAX_ROW);
		});
		$tx.observe($tom.collect(elContext, ".tx-row-field .tx-btn-add"), "click", function(){ 
			rowInput.value = _self.rowSize = calculator.calculate(_self.rowSize, Trex.Menu.Table.MAX_ROW, 1); 
		});
		$tx.observe($tom.collect(elContext, ".tx-row-field .tx-btn-sub"), "click", function(){ 
			rowInput.value = _self.rowSize = calculator.calculate(_self.rowSize, Trex.Menu.Table.MAX_ROW, -1); 
		});
	},
	generateButtonArea: function(elContext){
		var _self = this;
		var elDiv = tx.div();
		var elAConfirm = tx.a({href:"javascript:;", className:"tx-btn-confirm"}, "확인");
		var elACancel = tx.a({href:"javascript:;", className:"tx-btn-cancel"}, "취소");
		
		$tx.observe( elAConfirm, "click", function(ev){
			_self.onSelect(ev, {
				row: _self.rowSize,
				col: _self.colSize
			});
		});
		$tx.observe( elACancel, "click", this.onCancel.bind(this) );

		elDiv.appendChild(elAConfirm);
		elDiv.appendChild(elACancel);
		elContext.appendChild( elDiv );
	}
});