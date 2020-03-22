jQuery.fn.extend({
	gyros: function(options){
		if(typeof(options)=="undefined") { var options = {}; }
		var stroke	= options.stroke || 3;
		var top		= options.top || 0;
		var width	= options.width || "60px";

		$(this).html(
			$("<div>")
				.addClass("gyros")
				.css({
					"top": top,
					"width": width,
					"background": "trasparent"
				})
				.html(
					'<svg viewBox="25 25 50 50" class="gyros-circular">'+
						'<circle stroke-miterlimit="10" stroke-width="'+stroke+'" fill="none" r="20" cy="50" cx="50" class="gyros-path" />'+
					'</svg>'
				)
		)
		
		return $(this);
	}
});