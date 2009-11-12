
Trex.module("register content filter / mode change",
	function(editor, toolbar, sidebar, canvas, config) {
		
		/* -> Text Convert */
		function toText(html){
			var filterList = [
		      
		      [new RegExp("<head[^>]*>.*?<\\/head>", "gi"), ""], //<head ~ <\\/head> delete
		      [new RegExp("<s" + "cript[^>]*>.*?<\\/s" + "cript>", "gi"), ""],
		      [new RegExp("<style[^>]*>.*?<\\/style>", "gi"), ""], //<style ~ <\\/style> delete
		      [new RegExp("<!--.*?-->", "gi"), ""], //comment delete
		
		      //개행 처리
		      [new RegExp("<h[1-6][^>]*>(.+?)<\\/h[1-6]>", "gi"), "\n$1\n\n"], //<h1(h6) ~ <\\/h1(h6]> 제거
		      [new RegExp("(<p[^>]*>(.+?)<\\/p>)", "gi"), "$1\n"], //<td>	
		      [new RegExp("<br[^>]*>\\n", "gi"), "\n"], //<br>+개행
		      [new RegExp("<br[^>]*>", "gi"), "\n"], //<br>
		      [new RegExp("(<ul[^>]*>|<\\/ul>|<ol[^>]*>|<\\/ol>|<table[^>]*>|<\\/table>)", "gi"), "\n\n"], //<ul>
		      [new RegExp("(<tr[^>]*>|<\\/tr>)", "gi"), "\n"], //<tr>
		
		      //공백 처리
		      [new RegExp("(<li[^>]*>(.+?)<\\/li>)", "gi"), "\t$1\n"], //<td>
		      [new RegExp("(<td[^>]*>(.+?)<\\/td>)", "gi"), "\t$1"], //<td>
		      [new RegExp("(<th[^>]*>(.+?)<\\/th>)", "gi"), "\t$1"], //<th>
		
		      //나머지 모든 태그 삭제
		      [new RegExp("<[\\/a-zA-Z!]+[^>]*>", "g"), ""],
		
		      //특수문자 치환
		      [new RegExp("&nbsp;?", "g"), " "],
		      [new RegExp("&quot;?", "g"), "\""],
		      [new RegExp("&gt;?", "g"),'>'],
		      [new RegExp("&lt;?", "g"),'<'],
		      [new RegExp("&amp;?", "g"),'&'],
		      [new RegExp("&copy;?", "g"),'(c)'],
		      [new RegExp("&trade;?", "g"),'(tm)'],
		      [new RegExp("&#8220;?", "g"), "\""],
		      [new RegExp("&#8221;?", "g"), "\""],
		      [new RegExp("&#8211;?", "g"), "_"],
		      [new RegExp("&#8217;?", "g"), "'"],
		      [new RegExp("&#38;?", "g"), "&"],
		      [new RegExp("&#169;?", "g"), "(c)"],
		      [new RegExp("&#8482;?", "g"),"(tm)"],
		      [new RegExp("&#151;?", "g"),"--"],
		      [new RegExp("&#039;?", "g"),"'"],
		      [new RegExp("&#147;?", "g"), "\""],
		      [new RegExp("&#148;?", "g"), "\""],
		      [new RegExp("&#149;?", "g"), "*"],
		      [new RegExp("&reg;?", "g"), "(R]"],
		      [new RegExp("&bull;?", "g"), "*"],
		  ];
		
			var tmp = html;
			for(i = 0; i < filterList.length; i++) {
				tmp = tmp.replace(filterList[i][0], filterList[i][1]);
			}
			return tmp;
		}
	
		function fromText(txt) {
			if( txt !== null && txt.length !== 0 ) {
				txt = txt.replace(/&/g, "&amp;");
				txt = txt.replace(/ /g, "&nbsp;");
				txt = txt.replace(/\"/g, "&quot;");
				txt = txt.replace(/>/g, "&gt;");
				txt = txt.replace(/</g, "&lt;");
				if(txt.lastIndexOf("\n") === txt.length-1){
					txt = txt.substr(0, txt.length-1);
				}
				if(txt.lastIndexOf("\r") === txt.length-1){
					txt = txt.substr(0, txt.length-1);
				}
				txt = txt.replace(/\r\n|\r|\n/g, "<br>\n");
			}
			return txt;
		}
		
		var _docparser = editor.getDocParser();	
		_docparser.registerFilter(
			'filter/converting', {
				'text@load': function(contents){
					return toText(contents);
				},
				'source@load': function(contents){
					return contents;
				},
				'html@load': function(contents){
					return contents;
				},
				'text4save': function(contents){
					return fromText(contents);
				},
				'source4save': function(contents){
					return contents;
				},
				'html4save': function(contents){
					return contents;
				},
				'text2source': function(contents){
					return fromText(contents);
				},
				'text2html': function(contents){
					return fromText(contents);
				},
				'source2text': function(contents){
					return toText(contents);
				},
				'source2html': function(contents){
					return contents;
				},
				'html2text': function(contents){
					return toText(contents);
				},
				'html2source': function(contents){
					return contents;
				}
			}
		);
	}
);