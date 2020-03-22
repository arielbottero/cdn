(function(jQuery) {
    jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		tablexs: function(params) {
			var $this = this;

			/* clasess
				table-xs-col
				table-xs-none
				table-xs-menu
			*/

			// método principal
			this.init = function(params) {
				var table = $($this);
				var index = -1;
				var skips = [];
				var hidden = [];
				var heads = [];
				var defaultHeads = [];
				$("thead tr th", table).each(function(k, v) {
					if($(this).hasClass("table-xs-col")) {
						if(index==-1) { index = k+1; }
						skips.push(":nth-child("+(k+1)+")");
					} else if($(this).hasClass("table-xs-none")) {
						hidden.push(":nth-child("+(k+1)+")");
					} else {
						heads.push(this.innerHTML);
					}

					defaultHeads.push(this.innerHTML);
				});

				// valores por defecto
				if(!skips.length) {
					skips.push(":nth-child(1)");
					skips.push(":nth-child(2)");
					heads = defaultHeads.slice(2);
					var menuClass = ".dropdown-menu";
				} else {
					var menuClass = ".table-xs-menu";
				}

				if(index==-1) { index = 1; }
				var skip = skips.join(",");
				var colspan = heads.length-skips.length;

				if(heads.length) {
					$("tr", table).each(function() {
						$("td,th", $(this)).not(skip).addClass("hidden-sm-down");
					});

					if(hidden.length) { skip += ","+hidden.join(","); }
					$("tbody tr", table).each(function() {
						var id = jQuery.uid();
						var row = $(this);
						row.on("mousedown touchstart",function(e){
							if($(window).width()>767) { return true; }
							var title = [];
							$("td:visible,th:visible", row).each(function() { title.push($(this).text()); });
							timer = setTimeout(function(){
								BootstrapDialog.show({
									title: title.join(" - "),
									animate: true,
									message: $(menuClass, row).clone(true).css({
										"float":"none",
										"position":"inherit",
										"border": "0",
										"display": "block"
									}).show(),
								});
							},700);
						}).on("mouseup mouseleave touchend touchmove",function(e){
							if($(window).width()>767) { return true; }
							if(typeof timer !== "undefined") {
								clearTimeout(timer);
							}
						}).click(function() {
							if($(window).width()>767) { return true; }
							if(!$("#"+id)[0]) {
								var tds = $("td,th", row).not(skip)
								var ul = $("<ul>").css({"list-style-type":"none", "padding":"0"});
								tds.each(function(idx, td) {
									var headText = heads[idx].replace(/^\s+|\s+|(&nbsp;)+$/gm,'');
									if(headText!="") {
										ul.append($("<li>").addClass("padding-xs brd-solid brd-xs brd-grey brd-only-bottom text-sm").html("<b>"+headText+":</b> &nbsp;"+td.innerHTML));
									}
								});

								var tr = $("<tr>").addClass("hidden-md-up").attr("id", id);
								tr.append($("<td>").attr("colspan", colspan).append(ul))
								tr.insertAfter(row);
							} else {
								$(this).removeClass("text-red fa-minus-circle");
								$("#"+id).remove();
							}
						}).attr("table-minus", id);
					});
				}
			};
			
			// disparador
			this.init();
		}
    });
})(jQuery);