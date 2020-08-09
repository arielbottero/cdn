(function(jQuery) {
    jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		tabs: function() {
			var $this = this;
			var tabs = $(this);

			this.init = function() {
				$(">li", tabs).each(function() {
					$(this).click(function() {
						var current = $(this);
						var parent = current.closest("li.dropdown");
						current = parent.length > 0 ? parent : current;
						var next = current.next();
						var prev = current.prev();

						$(">li", tabs).removeClass("next prev active");
						current.addClass("active");
						prev.addClass("prev").removeClass("active");
						next.addClass("next").removeClass("active");

						$this.updateDropdownMenu(prev, "left");
						$this.updateDropdownMenu(current, "center");
						$this.updateDropdownMenu(next, "right");	
					});

					var label = $("a[data-toggle='tab']", $(this));
					label.html($("<span>").addClass("tab-label").html(label.html()));
				});

				$("li", tabs).has("a.active").trigger("click");
			}

			this.updateDropdownMenu = function(el, position) {
				el.find(".dropdown-menu")
					.removeClass("pull-xs-left pull-xs-center pull-xs-right")
					.addClass("pull-xs-"+position);
			}

			this.init();
		}
    });
})(jQuery);