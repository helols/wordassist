var DEVELLIBS = [
	"global.js",
	"lib/firebug/firebugx.js",
	"trex/lib/txlib.js",
	"trex/lib/hyperscript.js",
	"trex/lib/stopwatch.js",
	"trex/lib/template.js",
	"trex/lib/dgetty.js",
	"trex/lib/dfindy.js",
	"trex/lib/xgetty.js",
	"trex/lib/dateformat.js",
	"trex/lib/swfobject.js",
	"trex/trex.js",
	"trex/event.js",
	"trex/config.js",
	"trex/message.js",
	"trex/common/markup.js",
	"trex/common/domutil.js",
	"trex/common/ajax.js",
	"trex/common/utils.js",
	"trex/common/observable.js",
	"trex/common/imageresizer.js",
	"trex/common/split.js",
	"trex/common/colorpallete.js",
	"trex/common/button.js",
	"trex/common/menu.js",
	"trex/common/flash.js",
	"trex/editor.js",
	"trex/toolbar.js",
	"trex/sidebar.js",
	"trex/docparser.js",
	"trex/entryproxy.js",
	"trex/formproxy.js",
	"trex/saver.js",
	
	/** NOTE: Canvas & Panels Start */
	"trex/history.js",
	"trex/canvas.js",
	"trex/panels/panel.js",
	"trex/panels/wysiwygpanel.js",
	"trex/panels/textpanel.js",
	/** NOTE: Canvas & Panels end */
		
	/** NOTE: Processor Start */
	"trex/processor/marker.js",
	"trex/processor/selection.js",
	"trex/processor/bookmark.js",
	"trex/processor/processor_textarea.js",
		"trex/processor/processor_standard.js",
		"trex/processor/processor_trident.js",
		"trex/processor/processor_gecko.js",
		"trex/processor/processor_webkit.js",
			/* Processor For P */
			"trex/processor/p/processor_standard_p.js",
			"trex/processor/p/processor_trident_p.js",
			"trex/processor/p/processor_gecko_p.js",
			"trex/processor/p/processor_webkit_p.js",
			/* Processor For Br */
			"trex/processor/br/processor_standard_br.js",
			"trex/processor/br/processor_trident_br.js",
			"trex/processor/br/processor_gecko_br.js",
			"trex/processor/br/processor_webkit_br.js",
	"trex/processor/processor.js",
	/** NOTE: Processor End */
	
	/** NOTE: Filter Start */
	"trex/filters/converting.js",
	"trex/filters/redundancy.js",
	/** NOTE: Filter End */
	
	/** NOTE: Tool Start */
	"trex/tool/switcher.js", 
	"trex/tool/switchertoggle.js", 
	"trex/tool/fontfamily.js", 
	"trex/tool/fontsize.js", 
	"trex/tool/bold.js", 
	"trex/tool/underline.js", 
	"trex/tool/italic.js",
	"trex/tool/strike.js",
	"trex/tool/forecolor.js",
	"trex/tool/backcolor.js",
	"trex/tool/alignleft.js",
	"trex/tool/aligncenter.js",
	"trex/tool/alignright.js",
	"trex/tool/alignfull.js",
	"trex/tool/lineheight.js",
	"trex/tool/styledlist.js",
	"trex/tool/ordered.js",
	"trex/tool/unordered.js",
	"trex/tool/indent.js",
	"trex/tool/outdent.js",
	"trex/tool/insertlink.js",
	"trex/tool/textbox.js",
	"trex/tool/quote.js",
	"trex/tool/table.js",
	"trex/tool/emoticon.js",
	"trex/tool/redo.js",
	"trex/tool/undo.js",
	"trex/tool/horizontalrule.js",
	"trex/tool/specialchar.js",
	"trex/tool/dictionary.js",
	"trex/tool/background.js",
	"trex/tool/advanced.js",
	"trex/tool/extraButtonDropdown.js",
	/** NOTE: Tool End */
	
	/** NOTE: Attacher Start */
	"trex/attachment.js",
	"trex/attachbox.js",
	"trex/attachbox/attachbox_ui.js",
	"trex/attachbox/iadaptor.js",
	"trex/attacher.js",
		"trex/attacher/image.js",
		"trex/attacher/file.js",
	/** NOTE: Attacher End */
	
	/** NOTE: Embeder Start */
	"trex/embeder.js",
	"trex/embedentry.js",
		"trex/embeder/media.js",
	/** NOTE: Embeder End */
	
	/** NOTE: Module Start */
	"trex/modules/mousehandle.js",
	"trex/modules/canvassize.js",
	"trex/modules/noticepanel.js",
	"trex/modules/block_edit_and_resize.js",
	"trex/modules/saveimagehistory.js",
	/** NOTE: Module End */
	
	/** NOTE: Plugin Start */
	"trex/plugin/plugin.js",
		"trex/plugin/fullscreen.js",
		"trex/plugin/resizer.js",
        "trex/plugin/wordassist.js",		
	/** NOTE: Plugin End */
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
