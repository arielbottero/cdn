(function(jQuery) {
    jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		tablexs: function(params) {
			var $this = this;

			/* clasess
				table-xs-container
				table-xs-col
				table-xs-none
				table-xs-menu
				table-xs-row
			*/

			// método principal
			this.init = function(params) {
				var table = $($this);
				var index = -1;
				var show = [];
				var hidden = [];
				var heads = [];
				var defaultHeads = [];
				$("thead tr th", table).each(function(k, v) {
					if($(this).hasClass("table-xs-col")) {
						if(index==-1) { index = k+1; }
						show.push(":nth-child("+(k+1)+")");
						heads.push(this.innerHTML);
					} else if($(this).hasClass("table-xs-none") || $(this).hasClass("d-none")) {
						hidden.push(":nth-child("+(k+1)+")");
					} else {
						heads.push(this.innerHTML);
					}

					defaultHeads.push(this.innerHTML);
				});

				// valores por defecto
				if(!show.length) {
					show.push(":nth-child(1)");
					show.push(":nth-child(2)");
				}
				var menuClass = ($(".table-xs-menu", table)[0]) ? ".table-xs-menu" : ".dropdown-menu";

				if(index==-1) { index = 1; }
				var skip = show.join(",");

				if(heads.length) {
					if(hidden.length) { skip += ","+hidden.join(","); }
					
					$("tr", table).each(function() {
						$("td,th", $(this)).not(skip).addClass("d-none d-lg-table-cell");
					});

					$("tbody tr, thead tr.table-xs-row, tfooter tr.table-xs-row", table).each(function() {
						var id = jQuery.uid();
						var row = $(this);
						row.on("mousedown touchstart",function(e) {
							if($(window).width()>767) { return true; }
							var title = [];
							$("td:visible,th:visible", row).each(function() { title.push($(this).text()); });
							timer = setTimeout(function(){
								BootstrapDialog.show({
									title: title.join(" - "),
									animate: true,
									message: $(menuClass, row).clone(true).addClass("table-xs-menu").show(),
								});
							},700);
						}).on("mouseup mouseleave touchend touchmove",function(e){
							if($(window).width()>767) { return true; }
							if(typeof timer !== "undefined") {
								clearTimeout(timer);
							}
						}).click(function() {
							if($(window).width()>767) { return true; }
							
							var tds = $("td,th", row);
							var divrow = $("<div>").attr("id", id);
							var datarows = $("<div>", {class:"xs-modal-data"}).appendTo(divrow);
							tds.each(function(idx, td) {
								var headText = heads[idx].replace(/^\s+|\s+|(&nbsp;)+$/gm, ' ');
								if(headText!="") {
									var coldata = $(td).clone(true);
									if(coldata.hasClass("d-none")) { coldata.prop("xs-modal-row-hidden", true); }
									coldata.removeClass("d-none").addClass("text-left").tooltip("disable");
									var rowdata = $("<div>", {class:"row xs-modal-row"})
										.html($("<div>").addClass("col-4 py-sm brd-solid brd-xs brd-b-o brd-light-grey text-md xs-modal-col-label").html(headText))
										.append($("<div>").addClass("col py-sm brd-solid brd-xs brd-b-o brd-light-grey text-md xs-modal-col-value").html(coldata.html()))
									;
									if(coldata.prop("xs-modal-row-hidden")) { rowdata.addClass("d-none"); }
									datarows.append(rowdata);
								}
							});

							var title = [];
							$("td,th", row).each(function() { if(!$(this).hasClass("d-none")) { title.push($(this).text()); }});

							var dialog = new BootstrapDialog({
								title: title.join(" - "),
								animate: true,
								message: divrow,
								onshow: function(dialogref) {
									divrow.append(
										$("<div>", {class:"row"}).html(
											$("<div>", {class:"col pt-md text-center"})
												.html(
													$("<button>", {class: "table-xs-copy btn btn-lg btn-white mx-md"}).html('<i class="fa fa-copy"></i>').click(function(){
														clip = [];
														$(".xs-modal-row", divrow).not(".d-none").each(function(){
															let row = $(this);
															clip.push($(".xs-modal-col-label", row).text()+": "+$(".xs-modal-col-value", row).html());
														})

														$(this).clipboard({
															modal: dialog.getModal()[0],
															target: $(".xs-modal-data"),
															success_after: function(e) { e.clearSelection(); },
															success_notify: {
																message: "datos copiados al portapapeles",
																classes: "btn btn-success btn-md mt-md"
															}
														})
													})
												)
												.append(
													function() {
														var button = $("<button>", {class: "table-xs-copy btn btn-lg btn-white mx-md dropdown-toggle xs-modal-cols-btn"})
															.attr("data-toggle", "dropdown")
															.html('<i class="fas fa-eye-slash"></i>')
														;

														var menu = $("<div>", {class:"dropdown-menu xs-modal-cols-menu"});
														$(".xs-modal-row", divrow).each(function() {
															var uid = jQuery.uid();
															var row = $(this);
															var div = $("<div>", {class:"dropdown-item c-pointer", idx:uid});
															var labelText = $(".xs-modal-col-label", row).text().trim();
															if(labelText!="") {
																var label = $("<label>", {class: "c-pointer", for:uid}).html(labelText.substring(0,32));
																var cssClass = (row.hasClass("d-none")) ? "text-light-gray" : "text-primary";
																var checkbox = $("<i>", {class: "fas fa-check icon-sm m-sm mr-o "+cssClass});
											
																var toggler = div.html(checkbox).append(label);
																toggler.click(function(){
																	$("i", $(this)).toggleClass("text-primary text-light-gray");
																	row.toggleClass("d-none");
																});
											
																menu.append(div);
																menu.click(function(e){
																	e.stopPropagation();
																});
															}
														});

														return $("<div>", {class:"d-inline-block dropdown xs-modal-columns"}).html(button).append(menu);
													}
												)
										)
									)
								},
								onshown: function() {
									var btn = $(".xs-modal-cols-btn");
									btn.dropdown();
								}
							});
							dialog.realize();
							dialog.open();
						});
					});
				}
			};
			
			// disparador
			this.init();
		}
    });
})(jQuery);