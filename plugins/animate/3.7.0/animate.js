$.fn.extend({
	animateAdd: function (animationName, callback) {
		var animationEnd = (function (el) {
			var animations = {
				animation: "animationend",
				OAnimation: "oAnimationEnd",
				MozAnimation: "mozAnimationEnd",
				WebkitAnimation: "webkitAnimationEnd",
			};

			for (var t in animations) {
				if (el.style[t] !== undefined) {
					return animations[t];
				}
			}
		})(document.createElement("div"));

		this.css("animation-name", animationName);
		this.addClass("animated "+animationName).one(animationEnd, function () {
			$(this).removeClass("animated "+animationName);
			$(this).css("animation-name", "no");
			if (typeof callback === "function") callback();
		});

		return this;
	},

	animateClear: function(animationName, callback) {
		this.css("animation-name", "no");
		this.removeClass("animated "+animationName);
		if(typeof callback === "function") { callback(); }
		return this;
	},
});

$(function(){
	if(WOW) {
		new WOW({
			boxClass:     "animated",
			animateClass: "animated",
			offset:       0,
			mobile:       true,
			live:         true
		}).init();
	}
});