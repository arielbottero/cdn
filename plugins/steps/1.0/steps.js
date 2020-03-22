/*
before y after aceptan como argumentos:
	btn: boton sobre el que se hizo click
	num: numero de step actual
*/
(function(jQuery) {
    jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		steps: function(selector) {
			var $this = this;
			var steps = $(this);

			this.init = function() {
				var x = 0;
				steps.addClass("steps");
				$(".step", steps).hide().each(function() {
					var step = $(this);
					step.attr("data-step-num", x);
					if(!x) { step.show(); }

					$(".steps-btn", $(".steps-buttons", step)).each(function(){
						var btn = $(this);
						var num = btn.closest(".step").data("step-num");
						var action = $(this).attr("steps-action") || "";
						var before = $(this).attr("steps-before") || null;
						var after = $(this).attr("steps-after") || null;

						action = action.toLowerCase();
						btn.click(function(){
							if(before) {
								if(typeof before == "string") { before = eval("("+before+")"); }
								before(btn, num);
							}

							if(action=="prev") {
								step.hide();
								$("[data-step-num='"+(num-1)+"'").fadeIn();
							} else if(action=="next") {
								step.hide();
								$("[data-step-num='"+(num+1)+"'").fadeIn();
							} else if(action.indexOf("#")===0) {
								step.hide();
								num = action.replace("#", "");
								$("[data-step-num='"+(num-1)+"'").fadeIn();
							}

							if(after) {
								if(typeof after == "string") { after = eval("("+after+")"); }
								after(btn, num);
							}
						});
					});

					x++;
				});
			}

			this.init();
		}
    });
})(jQuery);