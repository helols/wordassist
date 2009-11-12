EditorLoadChecker = {
	intervalCount: 5,
	checkForGecko: function(){
		if(Editor.getConfig().canvas.selectedMode == "html"){
			var _iframe = $tx('tx_canvas_wysiwyg'); 
			var uuid = setInterval(function(){
				try{
					if (_iframe.contentDocument.designMode == 'off' && EditorLoadChecker.intervalCount > 0) {
						_iframe.src = $tx('tx_canvas_wysiwyg').src + "&ts=" + new Date().getTime();
						EditorLoadChecker.intervalCount--;
						if(EditorLoadChecker.intervalCount < 0){
							clearInterval(uuid);
						}
					}else {
						clearInterval(uuid);
					}	
				}catch(e){
					console.log(e);
					EditorLoadChecker.intervalCount--;
					if(EditorLoadChecker.intervalCount < 0){
						clearInterval(uuid);
					}
				}
			}, 500);	
		}else{
			var uuid = setInterval(function(){
				if(Editor.getCanvas().getPanel('html').el.src != Editor.getCanvas().getPanel('html').el.contentWindow.location.href){
					Editor.getCanvas().getPanel('html').el.src = Editor.getCanvas().getPanel('html').el.src;
					EditorLoadChecker.intervalCount--;
					if(EditorLoadChecker.intervalCount < 0){
						clearInterval(uuid);
					}
				}else {
					clearInterval(uuid);
				}
			}, 500);
		}
	},
	checkForTrident: function(){
		var uuid = setInterval(function(){
			var _iframe = $tx('tx_canvas_wysiwyg');
			var _body = _iframe.contentWindow.document.body;
			if (_body && _body.contentEditable != "true"){
				_body.setAttribute("contentEditable", "true");
				EditorLoadChecker.intervalCount--;
				if(EditorLoadChecker.intervalCount < 0){
					clearInterval(uuid);
				}
			}else {
				clearInterval(uuid);
			}
		}, 500);
	},
	check: function(){
		if ($tx.gecko) {
			EditorLoadChecker.checkForGecko();
		}else if($tx.msie){
			EditorLoadChecker.checkForTrident();
		}		
	}
};