if (!window.StopWatch) {
	StopWatch = {
		output: [],
		index: 0,
		start: function(){
			StopWatch._init = new Date().getTime();
		},
		lap: function(desc, c){
			var ctx = c ? c : window;
			var gap = new Date().getTime() - StopWatch._init;
			StopWatch.output.push("#" + (ctx.StopWatch.index++) + " : " + gap + " , " + desc);
		}
	};
}
