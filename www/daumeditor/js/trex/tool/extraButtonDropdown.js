Trex.module("add drop-down menu button if extra buttons exist.", 
	function (editor, toolbar, sidebar, canvas, config) {
		var borderClasses = {'tx-btn-nlrbg': true, 'tx-slt-59bg': true};
		
		var getBorderClass = function(el) {
			var classes = $tx.classNames(el);
			for(var i = 0; i < classes.length; i++) {
				var className = classes[i];
				var matched = borderClasses[className];
				if (matched) {
					return className;
				}
			}
		};
		
		var hideDropDownMenu = function(elWrapper, elDropBtn, borderClassName) {
			$tx.hide(elWrapper);
			$tx.removeClassName(elDropBtn, borderClassName + '-pushed');
			$tx.addClassName(elDropBtn, borderClassName);
			$tx.removeClassName(elDropBtn, 'tx-menu-opened')
		};
		
		var showDropDownMenu = function(elWrapper, elDropBtn, borderClassName) {
			$tx.show(elWrapper);
			$tx.removeClassName(elDropBtn, borderClassName);
			$tx.addClassName(elDropBtn, borderClassName + '-pushed');
			$tx.addClassName(elDropBtn, 'tx-menu-opened');
		};
		
		var addExtraButtonEvent = function(elDropBtn) {
			var elWrapper = $tom.collect(elDropBtn, '.tx-extra-buttons-wrapper');
			if (!elWrapper) {
				return;
			}
			var positions = $tx.positionedOffset(elDropBtn);
			elWrapper.style.left = (positions[0] - 45).toPx();
			elWrapper.style.top = (positions[1] + 23).toPx();
			
			var currentBorderClass = getBorderClass(elDropBtn);
			
			$tx.observe(elDropBtn, 'click', function(ev) {
				if ($tx.visible(elWrapper)) {
					hideDropDownMenu(elWrapper, elDropBtn, currentBorderClass);
				} else {
					showDropDownMenu(elWrapper, elDropBtn, currentBorderClass);
				}
				if (ev) {
					$tx.stop(ev);
				}
			});
			
			canvas.observeJob(Trex.Ev.__CANVAS_PANEL_CLICK, function(ev) {
				hideDropDownMenu(elWrapper, elDropBtn, currentBorderClass);
			});
		};
		
		var elDropBtnList = $tom.collectAll('.tx-extra-drop-down');
		if (elDropBtnList.length == 0) {
			return;
		}
		elDropBtnList.each(addExtraButtonEvent);
	}
);

