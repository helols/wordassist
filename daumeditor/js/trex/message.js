
var TrexMessage = function() {
	var __MESSAGES = {};
	
	var _deepcopy = function(preset, service) {
		var _dest = preset;
		for(var _name in service) {
			switch(typeof(service[_name])) {
				case 'undefined':
				case 'null':
				case 'string':
				case 'number':
				case 'boolean': 
				case 'date':
				case 'function':
					_dest[_name] = service[_name];
					break;
				default:
					if(service[_name].constructor == Array) {
						_dest[_name] = [].concat(service[_name]);
					} else {
						_deepcopy(_dest[_name] || {}, service[_name]);
					}
					break;
			}
		}
		return _dest;
	};
	
	var _trexMessage = {
		getMsg: function(msgid){
			var _message = __MESSAGES[msgid] || "";
			
			if (_message.indexOf("#iconpath") > -1) {
				_message = TrexConfig.getIconPath(_message);
			}
			if (_message.indexOf("#decopath") > -1) {
				_message = TrexConfig.getDecoPath(_message);
			}
			return _message;
		},
		addMsg: function(messages) {
			_deepcopy(__MESSAGES, messages);
		}
	};
	
	return _trexMessage;
}();

window.TXMSG = TrexMessage.getMsg;	
	
TrexMessage.addMsg({
	/* editor */
	'@editor.safari.confirm': "확인",
	'@editor.safari.notice': "* 현재 버전의 Safari 에서는 일부 기능이 정상적으로 동작하지 않을 수 있습니다. ",
	
	/* menu */
	'@menu.pallete.enter': "입력",
	'@menu.pallete.more': "더보기",
	'@menu.pallete.revert': "기본색으로",
	'@adoptor.label': "가나다",
	'@adoptor.transparent': "투명",
	
	/* canvas */
	'@canvas.unload.message': "지금까지 작성된 글은 안전하게 자동 저장되어, 회원님이 다시 글쓰기 하실 때 불러올 수 있습니다.",
	'@canvas.unload.message.at.modify': "지금까지 작성된 글은 안전하게 자동 저장되어, 회원님이 다시 수정하실 때 불러올 수있습니다.",
	
	/* attacher */
	'@attacher.can.modify.alert': "기존에 등록된 #{title}를 수정할 수 있는 화면으로 이동합니다.",
	'@attacher.can.modify.confirm': "#{title}은(는) 하나만 등록이 가능합니다.\n다시 올리시면 기존의 #{title}이(가) 삭제됩니다. 계속하시겠습니까?",
	'@attacher.capacity.alert': "용량을 초과하였습니다.",
	'@attacher.del': "삭제",
	'@attacher.delete.confirm': "삭제하시면 본문에서도 삭제됩니다. 계속하시겠습니까?",
	'@attacher.delete.all.confirm': "선택한 첨부파일을 삭제하시겠습니까? 삭제하시면 본문에서도 삭제됩니다.",
	'@attacher.exist.alert': "이미 본문에 삽입되어 있습니다.",
	'@attacher.ins': "삽입",
	'@attacher.insert.alert': "에디터 상태에서만 삽입할 수 있습니다.",
	'@attacher.only.wysiwyg.alert': "에디터 상태에서만 본문에 삽입할 수 있습니다.\n에디터모드에서 첨부박스의 썸네일을 클릭해서 삽입할 수 있습니다.",
	'@attacher.preview.image': "#iconpath/pn_preview.gif",
	'@attacher.size.alert': "용량을 초과하여 더이상 등록할 수 없습니다.",
	
		/* image */
		'@image.title': "사진",
		
		/* file */
		'@file.error.file.count.alert': "업로드 파일갯수가 초과되었습니다.",
		'@file.error.file.size.alert': "업로드 용량이 초과되었습니다.",
		'@file.invalid.copyright': " <strong>[저작권 위반 의심, 본인만 확인가능]</strong>",
		'@file.title': "파일",
	
	/* embeder */
	'@embeder.alert': "에디터 상태에서만 삽입할 수 있습니다.",
	
		/* media */
		'@media.prev.url': "#iconpath/spacer2.gif?rv=1.0.1",
		'@media.prev.url.tvpot': "#iconpath/img_multi_tvpot.gif?rv=1.0.1",
		'@media.prev.url.wmp': "#iconpath/spacer2.gif?rv=1.0.1",
		'@media.title': "멀티미디어",
	
	/* tool */
		/* insertlink */
		'@insertlink.cancel.image': "#iconpath/btn_cancel.gif?rv=1.0.1",
		'@insertlink.confirm.image': "#iconpath/btn_confirm.gif?rv=1.0.1",
		'@insertlink.invalid.url': "'HTTP://'로 시작하는 URL을 입력해주십시오.",
		'@insertlink.link.alt': "[#{title}]로 이동합니다.",
		'@insertlink.remove.image': "#iconpath/btn_remove.gif?rv=1.0.1",
		'@insertlink.title': "선택된 부분에 걸릴 URL주소를 넣어주세요.",
		
		/* align */
		'@align.image.align.center': "가운데정렬",
		'@align.image.align.full': "오른쪽글흐름",
		'@align.image.align.left': "왼쪽정렬",
		'@align.image.align.right': "왼쪽글흐름",
		'@align.text.align.center': "가운데정렬 (Ctrl+.)",
		'@align.text.align.full': "양쪽정렬",
		'@align.text.align.left': "왼쪽정렬 (Ctrl+,)",
		'@align.text.align.right': "오른쪽정렬 (Ctrl+/)",
		
		/* fullscreen */
		'@fullscreen.attach.close.btn': "파일첨부박스",
		'@fullscreen.noti.btn': "일반 글쓰기로",
		'@fullscreen.noti.span': "넓게쓰기 버튼을 다시 누르시면 처음 글쓰기 창 크기로 돌아갑니다.",
		
		/* specialchar */
		'@specialchar.cancel.image': "#iconpath/btn_l_cancel.gif?rv=1.0.1",
		'@specialchar.confirm.image': "#iconpath/btn_l_confirm.gif?rv=1.0.1",
		'@specialchar.title': "선택한 기호",
		
		/* table */
		'@table.add': "더하기",
		'@table.alert': "1 이상 20 이하의 숫자만 입력 가능합니다.",
		'@table.bg.color': "표 배경색",
		'@table.border.color': "테두리 색",
		'@table.border.width': "테두리 굵기",
		'@table.cancel.image': "#iconpath/btn_cancel.gif?rv=1.0.1",
		'@table.col': "열&nbsp;",
		'@table.confirm.image': "#iconpath/btn_confirm.gif?rv=1.0.1",
		'@table.row': "행&nbsp;",
		'@table.sub': "빼기"
});

