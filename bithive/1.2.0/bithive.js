jQuery.extend({
	bithive : {
		version: "1.2.0",
		ctxmenu: {top:0, left:0},
		httpRequests: 0,

		apply: function(elem, itself) {
			if(!elem) { var elem = $("body"); }
			if(typeof itself == "undefined") { var itself = false; }

			var $this = this;
			$.each(elem, function(){
				$this.styles(this, itself);
				$this.forms(this, itself);
			});

			jQuery.bithive.RunAfterApply(elem);
		},

		after: function(method, elem) {
			if(!elem) { var elem = $("body"); }
			let functions = elem.prop("AfterApplyFunctions") || [];
			functions.push(method);
			elem.prop("AfterApplyFunctions", functions);
		},

		RunAfterApply: function(elem) {
			var interval = setInterval(function(){
				if(jQuery.bithive.httpRequests<=0) {
					clearInterval(interval);
					var functions = elem.prop("AfterApplyFunctions")
					jQuery.each(functions, function() {
						this();
					});
					elem.prop("AfterApplyFunctions", []);

					$("body").css("overflow", "auto");
					$("#bithive-loading").fadeOut("fast");
				}
			})
		},

		run: function(code, args) {
			if(typeof window[code]=="function") {
				if(typeof args == "undefined") {
					window[code]();
				} else {
					window[code](args);
				}
			} else {
				eval(code);
			}
		},

		getElement: function(selector, elem, itself) {
			return (itself && $(elem).is(selector)) ? $(elem) : $(selector, elem);
		},

		isSmallScreen: function() {
			return (jQuery(window).width()<=767) ? true : false;
		},

		styles: function(elem, itself) {
			if(!elem) { var elem = $("body"); }
			if(typeof itself == "undefined") { var itself = false; }
			
			// ACTION BUTTONS ----------------------------------------------------------------------
			// btn-print
			$(".btn-print").addClass("no-print").on("click", function(e) {
				jQuery.bithive.print();
			});

			// btn-insert
			$(".btn-insert").on("click", function(e) {
				if(!$(this).attr("onclick")) {
					e.preventDefault();
					var href = ($(this).data("href")) ? $(this).data("href") : "insert";
					self.location.href = href;
				}
			});

			// btn-update
			$(".btn-update").on("click", function(e) {
				if(!$(this).attr("onclick")) {
					e.preventDefault();
					var imya = $(this).data("imya") || null;
					if(imya!==null) {
						var href = ($(this).data("href")) ? $(this).data("href") : "update";
						if(href.indexOf("?")<0) { href += "?"; }
						self.location.href = href+"imya="+imya;
					}
				}
			});

			// btn-delete
			$(".btn-delete").on("click", function(e) {
				if(!$(this).attr("onclick")) {
					e.preventDefault();
					var imya = $(this).data("imya") || null;
					if(imya!==null) {
						var href = ($(this).data("href")) ? $(this).data("href") : "delete";
						if(href.indexOf("?")<0) { href += "?"; }
						BootstrapDialog.confirm({
							draggable: true,
							title: "Confirmar",
							message: "Eliminar el registro?",
							type: BootstrapDialog.TYPE_DANGER,
							btnCancelLabel: "cancelar",
							btnOKLabel: "aceptar",
							btnOKClass: "btn-danger",
							callback: function(result) {
								if(result) {
									$.get(href+"imya="+imya, function(response) {
										if(parseInt(response)==response) {
											self.location.reload();
										} else {
											BootstrapDialog.show({
												draggable: true,
												type: BootstrapDialog.TYPE_WARNING,
												buttons: [{
													label: "aceptar",
													cssClass: "btn-warning",
													action: function(dialog) {
														dialog.close();
													}
												}],
												title: "Advertencia!",
												message: response,
											});
										}
									});
								}
							}
						});
					}
				}
			});
			
			// TABS ------------------------------------------------------------
			jQuery.bithive.getElement("nav-tabs a", elem, itself).click(function(e) {
				e.preventDefault();
				$(this).tab("show");
			});

			if(jQuery().tabs) {
				jQuery.bithive.getElement("ul.nav-tabs", elem, itself).each(function() {
					$(this).tabs();
				});
			}

			// STEPS -----------------------------------------------------------
			if(jQuery().steps) {
				jQuery.bithive.getElement(".form-steps", elem, itself).each(function() {
					$(this).steps();
				});
			}

			// CONTEXTMENU -----------------------------------------------------
			jQuery.bithive.getElement(".ctxmenu", elem, itself).each(function() {
				var launcher = $(this);
				var ctxmenu = $(launcher.data("ctxmenu")) || $(".dropdown-menu", launcher);
				var onevent = launcher.data("ctxmenu-event") || "contextmenu";
				launcher.on(onevent, function(e) {
					$.bithive.ctxmenu.top = e.pageY;
					$.bithive.ctxmenu.left = e.pageX;
					ctxmenu.prop("launcher", $(this));
					ctxmenu.css({
						display: "block",
						top: ($.bithive.ctxmenu.top - 10),
						left: ($.bithive.ctxmenu.left - 90)
					}).addClass("show");
					
					return false;
				});

				$("a", ctxmenu).not(".dropdown-toggle").on("click", function() {
					$(this).parent().removeClass("show").hide();
				});

				$(document).click(function (e) {
					if($(e.target).closest(ctxmenu).length === 0) {
						$(".dropdown-menu", ctxmenu).removeClass("show").hide();
						ctxmenu.removeClass("show").hide();
					}
				});
			});
			
			// SUBMENU ---------------------------------------------------------
			jQuery.bithive.getElement(".dropdown-submenu .dropdown-toggle", elem, itself).click(function(){
				var submenu = $(this).next();

				$(".dropdown-submenu", submenu.parent()).removeClass("show");

				submenu.css({
					top: "0px",
					left: "100%"
				}).toggleClass("show");

				var offset = submenu.offset();

				if(offset.left + submenu.width() > $("body").width()) {
					submenu.css("left", submenu.width()*-1);
				}

				if(offset.top + submenu.height() > $("body").height()) {
					submenu.css({"top":"auto", "bottom":"0px"});
				}
			});

			// CLIPBOARD -------------------------------------------------------
			if(jQuery().clipboard) {
				jQuery.bithive.getElement("[clipboard-target]", elem, itself).click(function(){
					var clip = $(this);
					var target = clip.attr("clipboard-target");
					var message = clip.attr("clipboard-message") || "datos copiados al portapapeles";
					var clasess = clip.attr("clipboard-clasess") || "btn btn-success btn-md margin-md margin-only-top";
					$(".no-print", target).hideShow();
					$(this).clipboard({
						target: target,
						success_after: function(e) {
							e.clearSelection();
							$(".no-print", target).hideShow();
						},
						success_notify: {
							message: message,
							classes: clasess
						}
					});
				});

				jQuery.bithive.getElement("[clipboard-text]", elem, itself).click(function(){
					var clip = $(this);
					var text = clip.attr("clipboard-text");
					var message = clip.attr("clipboard-message") || "datos copiados al portapapeles";
					var clasess = clip.attr("clipboard-clasess") || "btn btn-success btn-md margin-md margin-only-top";
					$(this).clipboard({
						mode: false,
						text: text,
						success_after: function(e) { e.clearSelection(); },
						success_notify: {
							message: message,
							classes: clasess
						}
					});
				});
			}

			// FORMATS ---------------------------------------------------------
			// booleans
			jQuery.bithive.getElement(".format-boolean", elem, itself).each(function() {
				var options = ($(this).hasAttr("format-custom")) ? $(this).attr("format-custom").split(";") : ["SI","NO"];
				$(this).html(($(this).html()=="1" || $(this).html()=="true") ? options[0] : options[1]);
			});

			// case [ format-custom: {value:label;value:label;value:label} ]
			jQuery.bithive.getElement(".format-case", elem, itself).each(function() {
				var options = ($(this).hasAttr("format-custom")) ? jQuery.parseJSON($(this).attr("format-custom")) : ["NO","SI"];
				$(this).html(options[$(this).html()]);
			});

			// dates
			if(jQuery().dateformat) {
				jQuery.bithive.getElement(".format-date", elem, itself).dateformat("dd/mm/yyyy");
				jQuery.bithive.getElement(".format-month", elem, itself).dateformat("mm/yyyy");
				jQuery.bithive.getElement(".format-time", elem, itself).dateformat("HH:ii:ss");
				jQuery.bithive.getElement(".format-hour", elem, itself).dateformat("HH:ii");
				jQuery.bithive.getElement(".format-datetime", elem, itself).dateformat("dd/mm/yyyy HH:ii:ss");
				jQuery.bithive.getElement(".format-cusdate", elem, itself).each(function(){
					$(this).dateformat($(this).attr("format-custom"));
				});
			}

			// numbres
			if((typeof wNumb != "undefined") && jQuery().numberformat) {
				jQuery.bithive.getElement(".format-number", elem, itself).each(function() {
					$(this).numberformat({"decimal":0});
				});

				jQuery.bithive.getElement(".format-money", elem, itself).each(function() {
					var curclass = jQuery.uid();
					var currency = $(this).attr("format-custom") || "";
					$(this).addClass("text-right "+curclass).numberformat({"format":"money"});
					$('<style>.format-money.'+curclass+':before{content:"'+currency+'"}</style>').appendTo("head");
				});

				jQuery.bithive.getElement(".format-decimal", elem, itself).each(function() {
					var decimal = $(this).attr("format-custom") || 2;
					$(this).addClass("text-right").numberformat({"format":"decimal", "decimal":decimal});
				});

				jQuery.bithive.getElement(".format-percent", elem, itself).numberformat("percent");
			}

			jQuery.bithive.getElement(".format-zerofill", elem, itself).each(function(){
				var zeros = parseInt($(this).attr("format-custom")) || 5;
				var zerospad = new Array(1 + zeros).join("0");
				$(this).text((zerospad + $(this).text()).slice(-zerospad.length));
			})
			
			// DIALOGS ---------------------------------------------------------
			if(typeof BootstrapDialog != "undefined") {
				jQuery.bithive.getElement(".dialog-content", elem, itself).click(function(e) {
					e.preventDefault();
					var options		= $(this).hyphened("dialog");
					var id			= options.id || jQuery.uid();
					var classes		= (options.class) ? " "+options.class : " ";
					var size		= (options.size) ? "dialog-"+options.size : "";
					var title		= options.title || "&nbsp;";
					var content		= options.content;
					var btnClose	= (options.close) ? [{ label: options.close, cssClass: "btn-primary pull-center", action: function(dialogItself){ dialogItself.close(); }}] : null;
					
					// los elementos de la respuesta que tengan el atributo dialog-close, cerraran el dialogo
					
					var dialogLinkLoaded = false;
					var dialogOptions = {
						draggable: true,
						title: title,
						message: $("<div></div>").id(id).addClass("container-fluid"+classes).html($(content).html()),
						cssClass: size,
						onshow: function(dialogRef){
							if(options.before) { jQuery.bithive.run(options.before); }
						},
						onshown: function(dialogRef){
							var body = $("#"+id);
							var dialogLinkInterval = setInterval(function() {
								if(dialogLinkLoaded) {
									jQuery.bithive.apply(body);
									$("[dialog-close]", body).click(function(){ dialogRef.close(); });
									clearInterval(dialogLinkInterval);
								}
							}, 100);
							if(options.after) { jQuery.bithive.run(options.after); }
						}
					};
					
					if(btnClose!=null) { dialogOptions.buttons = btnClose; }
					var dialog = BootstrapDialog.show(dialogOptions);
				});

				jQuery.bithive.getElement(".dialog-link", elem, itself).click(function(e) {
					e.preventDefault();
					var launcher	= $(this);
					var options		= launcher.hyphened("dialog");
					var id			= options.id || jQuery.uid();
					var classes		= (options.class) ? " "+options.class : " ";
					var size		= (options.size) ? "dialog-"+options.size : "";
					var title		= options.title || "&nbsp;";
					var btnClose	= (options.close) ? [{ label: options.close, cssClass: "btn-primary pull-center", action: function(dialogItself){ dialogItself.close(); }}] : null;
					
					// los elementos de la respuesta que tengan el atributo dialog-close, cerraran el dialogo
					
					var dialogLinkLoaded = false;
					var dialogOptions = {
						draggable: true,
						title: title,
						message: $("<div></div>").id(id).addClass("container-fluid"+classes).load(options.href, function(){ dialogLinkLoaded = true; }),
						cssClass: size,
						onshow: function(dialogRef){
							if(options.before) { jQuery.bithive.run(options.before, launcher); }
						},
						onshown: function(dialogRef){
							var body = $("#"+id);
							var dialogLinkInterval = setInterval(function() {
								if(dialogLinkLoaded) {
									jQuery.bithive.apply(body);
									$("[dialog-close]", body).click(function(){ dialogRef.close(); });
									if(options.after) { jQuery.bithive.run(options.after, launcher); }
									clearInterval(dialogLinkInterval);
								}
							}, 100);
						}
					};
					
					if(btnClose!=null) { dialogOptions.buttons = btnClose; }
					var dialog = BootstrapDialog.show(dialogOptions);
				});

				// genera un dialogo de confirmacion
				jQuery.bithive.getElement(".dialog-confirm", elem, itself).click(function(e) {
					var options = {
						title: 		"Confirmar", // titulo de la ventana
						message:	"Confirma?", // mensaje
						js:			null,		 // codigo JS que ejecutará en caso afirmativo. Si esta presente NO se ejecutara href
						href:		null,		 // URL que ejecutará en caso afirmativo. Si esta presente NO se ejecutara js
												 // ---
						hrefafter:	null,		 // URL que ejecutará en caso afirmativo luego de ejecutar href
						target:		null,		 // selector jquery donde se cargara href o hrefafter
												 // ---
						after:		null		 // funcion que se ejecutará en caso afirmativo si no existe href
					};
					
					options = $.extend({}, options, $(this).hyphened("dialog"));

					BootstrapDialog.confirm({
						draggable: true,
						title: options.title,
						message: options.message,
						type: BootstrapDialog.TYPE_DANGER,
						btnCancelLabel: "cancelar",
						btnCancelClass: "btn-default",
						btnOKLabel: "aceptar",
						btnOKClass: "btn-danger",
						callback: function(result) {
							if(result) {
								if(typeof window[options.js] == "function") {
									window[options.js](this);
								} else if(options.href) {
									if(options.target) {
										if(options.hrefafter) {
											$.get(options.href, function(response) {
												$(options.target).load(options.hrefafter, function() {
													jQuery.bithive.apply($(options.target));
												});
											});
										} else {
											$(options.target).load(options.href, function() {
												jQuery.bithive.apply($(options.target));
											});
										}
									} else {
										self.location.href = options.href;
									}
								} else {
									setTimeout(function() { jQuery.bithive.run(options.after); }, 100);
								}
							}
						}
					});
				});
			}
			
			// LINKS -----------------------------------------------------------
			// abre un link en un target
			jQuery.bithive.getElement(".link-in", elem, itself).click(function(e) {
				e.preventDefault();
				var href = $(this).attr("href") || $(this).data("href");
				var target = $(this).attr("target") || $(this).data("target");
				var after = $(this).data("after");
				$(target).load(href, function() {
					jQuery.bithive.apply($(target));
					if(after) {
						jQuery.bithive.run(after);
					}
				});
			});

			// genera un link post basado en un href y un json
			jQuery.bithive.getElement(".link-post", elem, itself).click(function() {
				var href = $(this).attr("href") || $(this).data("href");
				var target = $(this).attr("target") || $(this).data("target") || null;
				var values = null;
				var query = $(this).data("values") || null;
				if(query) { values = (typeof query == "string") ? jQuery.parseURL(query) : query; }
				jQuery.bithive.postLink(href, values, target);
			});

			// convierte un fa icon en un toggler de estados
			jQuery.bithive.getElement("i.link-toggler", elem, itself).each(function() {
				$(this)
					.addClass(function(){
						return (parseInt($(this).attr("toggler-value"))===1) ? "fas fa-dot-circle text-green" : "fas fa-dot-circle text-red";
					})
					.click(function(){
						let el = $(this);
						let id = el.attr("toggler-id"); // id del registro
						let val = el.attr("toggler-value"); // valor actual del estado (0|1)
						let url = el.attr("toggler-url"); // url que administra los estados
						let after = el.attr("toggler-after") || null; // funcion que se ejecuta luego del cambio de estado  funcname(el, state)
						el.removeClass("fa-dot-circle text-green text-red");
						el.addClass("fa-circle-notch text-light-gray spinRight");
						jQuery.ajax({
							url: url,
							data: {"id":id, "state":val},
							dataType: "json",
							success: function(data) {
								let nval = parseInt(data);
								el.attr("toggler-value", nval).removeClass("fa-circle-notch text-light-gray spinRight");
								if(nval===1) {
									el.addClass("fa-dot-circle text-green");
								} else {
									el.addClass("fa-dot-circle text-red");
								}

								if(after) { window[after](el, nval); }
							}
						});
					});
			});
			
			// TABLES ----------------------------------------------------------
			// full colspan
			$(".colspanall").each(function() {
				var cols = $(this).closest("table").find("tr:first th,td").length;
				$(this).attr("colspan", cols);
			});
			
			// filtros
			if(jQuery().tablefilter) {
				// utilizar data-filter="none" en los th que no deben tener la opcion
				jQuery.bithive.getElement("table.table-filter", elem, itself).each(function(){
					$(this).tablefilter({
						afterFilter: function(table) {
							table.trigger("runtotals");
						}
					});
				});
				
				// filtros ocultos al inicio
				jQuery.bithive.getElement("table.table-filter-hidden", elem, itself).tablefilter({
					afterFilter: function(table) {
						table.trigger("runtotals");
					},
					hidden: true
				});
			}

			// orden
			if(jQuery().tablesorter) {
				// utilizar data-sorter="none" en los th que no deben tener la opcion
				jQuery.bithive.getElement("table.table-sorter", elem, itself).each(function(){
					var x = 0;
					var options = {"headers":{}};
					$("thead th", $(this)).each(function(){
						if($(this).hasAttr("data-sorter") && $(this).data("sorter")=="none") {
							options["headers"][x] = {sorter: false};
						}
						x++;
					});

					$(this).tablesorter(options);
				});
			}

			// totales
			if(jQuery().tabletotal) {
				// utilizar data-total="none" en los th que no deben tener la opcion
				jQuery.bithive.getElement("table.table-total", elem, itself).tabletotal({
					cssClass: "table-xs-row",
					after: function(table) {
						jQuery.bithive.apply($("thead", table));
						jQuery.bithive.apply($("tfoot", table));
					}
				});
			}

			// tabla para pantallas chicas
			if(jQuery().tablexs) {
				jQuery.bithive.getElement("table.table-xs", elem, itself).each(function(){
					var table = $(this);
					table.tablexs();

					// filtros
					if($("tr.filters", $(this))[0]) {
						var row = $("tr.filters", $(this));
						var btnFilters = $("<span>", {class: "action-button d-block d-lg-none"}).append(
							$("<a>", {class:"btn btn-white m-sm mr-n"})
								.html('<i class="fa fa-filter icon-xs">')	
								.click(function(){
									if(!jQuery.bithive.isSmallScreen() || row.prop("xs-filter")) { return true; }
									BootstrapDialog.show({
										title: "Filtros",
										animate: true,
										message: function(){
											row.prop("xs-filter", row.next()).addClass("d-block");
											$("td", row).each(function(){
												var td = $(this);
												td.prepend($("<div>", {class:"xs-filter-label my-xs"}).text(td.attr("title")));
												if(td.hasClass("table-filter-cell-none")) {
													td.addClass("d-none");
												} else {
													if(td.hasClass("d-none")) { td.removeClass("d-none").prop("xs-filter-td", true); }
													td.addClass("d-block");
												}
											});
											return row;
										},
										onhide: function() {
											$("td", row).each(function(){
												var td = $(this);
												td.removeClass("d-none d-block");
												$(".xs-filter-label", td).remove();
												if(td.prop("xs-filter-td")) {
													td.addClass("d-none").prop("xs-filter-td", false);
												}
											});

											row.insertBefore(row.prop("xs-filter")).removeClass("d-block");
											row.prop("xs-filter", false);
										},
										buttons: [{
											label: "Cerrar",
											action: function(dialogRef){
												dialogRef.close();
											}
										}]
									});
								})
						)
						
						if($("#actions-buttons")[0]) {
							$("#actions-buttons").prepend(btnFilters);
						} else {
							$("<div>", {id:"actions-buttons", class:"abs-top-right no-print mr-md pr-xs pt-xs d-inline-block"}).html(btnFilters).appendTo("#wrapper"); 
						}
					}
				});
			}

			// table to excel
			if(jQuery().table2excel) {
				jQuery.bithive.getElement(".table2excel", elem, itself).each(function(){
					var table = $($(this).data("table"));
					$(this).click(function() {
						var filename = new String($(this).data("filename"));
						if(filename=="true") { filename = document.title.replace(/[\s]/,"_").toLowerCase()+".xls"; }
						if(filename.indexOf(".")==-1) { filename = filename+".xls"; }
						filename = filename.split(".");

						if(table.length > 1) {
							var bigTable = $("<table>");
							var x = 0;
							$.each(table, function(){ 
								if(x==0) {
									$("tr", $(this)).each(function(){
										bigTable.append($("<div>").append($(this).clone()).html());
									});
								} else {
									var y = 0;
									var cols;
									$("tr", $(this)).each(function(){
										if(y==0) {
											var tr = $("tr:eq(0)", bigTable);
											for(var i=0;i<$("th,td", tr).length;i++) { cols += "<td></td>"; }
											tr.append($("<td style='border-right:solid 2px #000000'></td><td></td>")).append($(this).clone().html());
										} else {
											var tr = $("tr:eq("+y+")", bigTable);
											if(!tr.length) {
												var tr = $("<tr>"+(cols)+"</tr>");
												bigTable.append(tr);
											} 
											tr.append($("<td style='border-right:solid 2px #000000'></td><td></td>")).append($(this).clone().html());
										}
										y++; 
									});
								}
								x++;
							});
							bigTable
								.css({"position":"absolute", "top":"-10000px"})
								.appendTo("body")
								.table2excel({
									exclude: ".no-print,.dropdown",
									filename: filename[0],
									fileext: "."+filename[1]
								});
						} else {
							table.table2excel({
								exclude: ".no-print,.dropdown",
								filename: filename[0],
								fileext: "."+filename[1]
							});
						}
					});
				});
			} 

			// table-columns
			jQuery.bithive.getElement("[data-columns]", elem, itself).each(function() {
				var btn = $(this);
				var columns = $(btn.data("columns"));
				if(typeof columns[0]=="undefined") { btn.remove(); return false; }

				var table = $(columns[0].closest("table"));

				var menu = $(".dropdown-menu", btn);
				$.each(columns, function() {
					var div = $("<div>", {class:"dropdown-item c-pointer", idx: this.cellIndex});
					var labelText = ($(this).text().trim().length) ? $(this).text().trim() : "_____";
					var label = $("<label>", {class: "c-pointer", for:"col-"+this.cellIndex}).html(labelText.substring(0,32));
					var checkbox = $("<i>", {class: "fas fa-check icon-sm text-primary m-sm mr-o"});

					var toggler = div.html(checkbox).append(label);
					toggler.click(function(){
						$("i", $(this)).toggleClass("text-primary text-light-gray");
						$("th:nth-child("+(parseInt($(this).attr("idx"))+1)+"), td:nth-child("+(parseInt($(this).attr("idx"))+1)+")", table).each(function(k,v){
							var cell = $(this);
							if(cell.hasClass("d-none")) {
								cell.fadeIn("fast", function(){ cell.removeClass("d-none"); });
								if(!jQuery.bithive.isSmallScreen() && cell.prop("xs-hidden")) {
									cell.addClass("d-lg-table-cell");
								}
							} else {
								cell.fadeOut("fast", function(){ cell.addClass("d-none"); });
								if(!jQuery.bithive.isSmallScreen() && cell.prop("xs-hidden")) {
									cell.removeClass("d-lg-table-cell");
								}
							}
						});
					}).on("init", function(){
						var isHidden = true;
						$("th:nth-child("+(parseInt($(this).attr("idx"))+1)+"), td:nth-child("+(parseInt($(this).attr("idx"))+1)+")", table).each(function(k,v){
							var cell = $(this);
							cell.addClass("d-none");

							cell.removeClass("excel-false");
							if(cell.prop("excelfalse")) {
								cell.addClass("excel-false");
							}

							if(cell.hasClass("d-lg-table-cell")) {
								if(!jQuery.bithive.isSmallScreen()) {
									cell.removeClass("d-none");
									isHidden = false;
								}
								cell.prop("xs-hidden", true);
							}
						});

						if(isHidden) { $("i", $(this)).toggleClass("text-primary text-light-gray"); }
					});

					if($(this).hasClass("d-none")) {
						toggler.trigger("init");
						$(window).resize(function() { toggler.trigger("init"); });
					}

					menu.append(div);
					menu.click(function(e){
						e.stopPropagation();
					});
				});
			});

			/* tooltips */
			$("[data-toggle='tooltip']").tooltip({
				"html": true,
				"placement": "auto"
			});
		},

		forms: function(form, itself) {
			if(!form) { var form = $("body"); }
			if(typeof itself == "undefined") { var itself = false; }

			$(".no-notes").each(function(){
				$("> small", $(this)).remove();
			});

			$("[data-clear]", form).each(function() {
				var regex = new RegExp("["+$(this).data("clear")+"]", "g");
				$(this).on("focus change keyup paste", function() {
					var val = $(this).val();
					val = val.replace(regex, "");
					$(this).val(val);
				});
			});

			$("[data-checker]", form).each(function() {
				$(this).on("change paste", function() {
					var field = $(this);
					var val = field.val();
					var src = field.data("checker");
					var msgok = field.data("checker-success");
					var msgko = field.data("checker-fail");

					var height = field.outerHeight();
					var gyroside = 30;
					var gyros = $("<div>").css({
						"top": (((height - gyroside)/2)+gyroside)+"px",
						"width": gyroside+"px",
						"position": "absolute",
						"left": "10px",
						"float": "left"
					}).gyros({width:gyroside+"px", stroke:2});
					field.after(gyros);

					jQuery.bithive.httpRequests++;
					jQuery.ajax({
						url: src,
						dataType: "json",
						data: { q: val },
						success: function(response) {
							gyros.remove();
							if(response.success=="1") {
								if(response.message) {
									msg = msgok.replace("***", response.message);
									BootstrapDialog.show({
										draggable: true,
										type: BootstrapDialog.TYPE_WARNING,
										buttons: [{
											label: "aceptar",
											cssClass: "btn-warning",
											action: function(dialog) {
												dialog.close();
												field.val("");
												field.focus();
											}
										}],
										title: "Confirmación",
										message: msg,
									});
								}

								if(response.values) {
									jQuery.bithive.jsonFiller(response.values, document);
								}
							} else {
								if(response.message) {
									msg = msgko.replace("***", response.message);
									BootstrapDialog.show({
										draggable: true,
										type: BootstrapDialog.TYPE_WARNING,
										buttons: [{
											label: "aceptar",
											cssClass: "btn-warning",
											action: function(dialog) {
												dialog.close();
												field.val("");
												field.focus();
											}
										}],
										title: "Advertencia",
										message: msg,
									});
								}
							}
						},
						complete: function(response) {
							jQuery.bithive.httpRequests--;
						}
					});
				});
			});

			// ATTACHER --------------------------------------------------------
			$(".form-attacher", form).each(function() {
				var field = $(this);
				var types = ["jpg","jpge","png","gif"];
				if(field.data("types")!="") { types = field.data("types").split(","); }
				var maxfiles = field.data("max") || 1;
				var autohide = field.data("autohide") || false;
				var preloads = (field.hasAttr("data-value")) ? eval(jQuery.base64.atob(field.data("value"))) : null;

				field.attacher({
					name: field.data("name"),
					types: types,
					maxfiles: maxfiles,
					autohidetarget: autohide,
					target: ".attacher-target",
					previews: ".attacher-previews",
					preload: preloads,
					onsuccess: function(response) {
						if($("input[name='NGL_REDIRECT']", form)[0]) {
							self.location = $("input[name='NGL_REDIRECT']", form).val();
						}
					},
					beforeremove: function(preview) {
						return confirm("eliminar?");
					}
				});
			});

			// ATTACHER RESIZER ------------------------------------------------
			if(jQuery().attachresizer) {
				$(".form-attachresizer", form).each(function() {
					let name = ($(this).hasAttr("data-name")) ? $(this).data("name") : "attachresizer";
					$(this).attr("name", name).attachresizer();
				});
			}

			$(".custom-file-input", form).each(function() {
				$(this).on("change", function() {
					// var fileName = $(this).val().split("\\").pop();
					let fileName = $(this).val();
					$(this).siblings(".custom-file-label").addClass("selected").html(fileName);
				});
			});			

			// AUTOCOMPLETE ----------------------------------------------------
			$("input.form-autocomplete", form).each(function() {
				var field = $(this);
				var target = field.data("target") || null;
				var template = field.data("template") || null;
				var after = field.data("after") || null;
				var nofound = field.data("nofoundtext") || "Sin Resultados";
				var addtext = field.data("addtext") || null;
				var addsource = field.data("addsource") || null;
				var lnktarget = $(field.data("lnk-target")) || null;
				var lnksrc = field.data("lnk-source") || null;

				if(target==null) {
					var fieldId = jQuery.uid();
					$("<input>").attr({
						"type": "hidden",
						"id": fieldId,
						"name": field.attr("name"),
						"value": field.val()
					}).insertAfter(field);

					var uid = jQuery.uid()+"_";
					field.attr({
						"name": uid+field.attr("name")
					});

					target = fieldId;
				}

				var source = null;
				var src = jQuery.base64.atob(field.data("source"));
				if(src.indexOf("[")===0) {
					source = eval(src);
				} else {
					source = function(request, response) {
						$.getJSON(jQuery.bithive.RefToVal(src) + "&q=" +encodeURIComponent(request.term), response);
					};
				}

				field.prop("autocomplete-target", target);
				var target = $("#"+target);
				field.autocomplete({
					source: source,
					minLength: 3,
					select: function(event, ui) {
						if(ui.item.value=="[--no-found--]") { return false; }
						if(ui.item.value=="[--add-new-value--]") {
							field.val("");
							target.val("");
							var urladd = jQuery.base64.atob(addsource);
							urladd = jQuery.bithive.RefToVal(urladd);
							jQuery.bithive.addNewValue(urladd, addtext, target, field);
						} else {
							setTimeout(function() { field.val(ui.item.label); },10);
							var target = $("#"+field.prop("autocomplete-target"));
							target.val(ui.item.value);

							// relaciones
							if(lnksrc) {
								jQuery.ajax({
									url: jQuery.base64.atob(lnksrc) + ui.item.value,
									dataType: "json",
									success: function(data) {
										var values = jQuery.bithive.OptionsValues(lnktarget);
										if(lnktarget.hasClass("checkbox")) {
											jQuery.bithive.mkchecks("checkbox", lnktarget, data, values);
										} else if(lnktarget.hasClass("radio")) {
											jQuery.bithive.mkchecks("radio", lnktarget, data, values);
										} else {
											$("#"+lnktarget.prop("gyrosid")).remove();
											lnktarget.show();
											jQuery.bithive.mkSelectOptions(lnktarget, data, values);
										}
									}
								});
							}

							if(after) { jQuery.bithive.run(after, [field, ui.item, false]); } // [elemento, objeto(value option), is_update]
						}
					},
					response: function(event, ui) {
						if(!ui.content.length) {
							ui.content.push({"label":"-- "+nofound+" --", "value":"[--no-found--]"});
							if(addtext) {
								ui.content.push({"label":addtext, "value":"[--add-new-value--]"});
								$(this).autocomplete("widget").addClass("form-autocomplete-addtext"); 
							}
						} else {
							if(addtext) {
								ui.content.push({"label":addtext, "value":"[--add-new-value--]"});
								$(this).autocomplete("widget").addClass("form-autocomplete-addtext"); 
							}
						}
					}
				}).on("focus", function(event, ui) {
					var targetField = $("#"+$(this).prop("autocomplete-target"));
					$(this).prop("oldlabel", $(this).val());
					$(this).prop("oldval", targetField.val());
					$(this).val("");
				}).on("blur", function() {
					var targetField = $("#"+$(this).prop("autocomplete-target"));
					if(targetField.val()==$(this).prop("oldval")) {
						$(this).val($(this).prop("oldlabel"));
					}
				});

				if(template) {
					template = jQuery.base64.atob(template);
					field.autocomplete("instance")._renderItem = function(ul, item) {
						let li = $("<li>").append(template);
						jQuery.bithive.KeysFromData(li, item);
						return li.appendTo(ul);
					};
				}

				// update mode
				if(field.val()!="") {
					var current = field.val();
					if(src.indexOf("[")===0) {
						$.each(source, function(key, item) {
							if(item.value==current) {
								target.val(current);
								field.val(item.label);
								if(after) { jQuery.bithive.run(after, [field, item, true]); }
								return false;
							}
						});
					} else {
						jQuery.bithive.httpRequests++;
						jQuery.ajax({
							url: jQuery.bithive.RefToVal(src),
							dataType: "json",
							data: { i:1, q: field.val() },
							success: function(data) {
								$.each(data, function(key, item) {
									if(item.value==current) {
										target.val(current);
										field.val(item.label);
										if(after) { jQuery.bithive.run(after, [field, item, true]); }
										return false;
									}
								});
							},
							complete: function(response) {
								jQuery.bithive.httpRequests--;
							}
						});
					}
				}
			});

			// CHECKBOX/RADIO ----------------------------------------------------------------------
			// tilda todos los checkboxes visibles (destilda TODOS) que tengan la clase pasada en data-checkall
			$("[data-checkall]", form).each(function() {
				var checkall = $(this);
				checkall.prop("isChecked", false);
				checkall.click(function() {
					var boxes = $(checkall.data("checkall"));
					if(!checkall.prop("isChecked")) {
						boxes.filter(":visible").prop("checked", true);
						checkall.prop("isChecked", true);
					} else {
						boxes.prop("checked", false);
						checkall.prop("isChecked", false);
					}
				});
			});
			
			
			$("div.checkbox[data-source]", form).each(function() {
				var field = $(this);
				var source = jQuery.base64.atob(field.data("source"));
				if(source!="") {
					field.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
					jQuery.bithive.mkchecks("checkbox",field,source, jQuery.bithive.OptionsValues(field));
				}
			});
			
			$("div.onoffswitch[data-source]", form).each(function() {
				var field = $(this);
				var source = jQuery.base64.atob(field.data("source"));
				if(source!="") {
					field.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
					jQuery.bithive.mkchecks("onoffswitch",field,source, jQuery.bithive.OptionsValues(field));
				}
			});
			
			$("div.radio[data-source]", form).each(function() {
				var field = $(this);
				var source = jQuery.base64.atob(field.data("source"));
				if(source!="") {
					field.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
					jQuery.bithive.mkchecks("radio",field,source, jQuery.bithive.OptionsValues(field));
				}
			});


			// COLOR PICKER ------------------------------------------------------------------------
			if(jQuery().colorpicker) {
				$(".form-color", form).colorpicker();
			}

			// HTML CONTAINER ----------------------------------------------------------------------
			$(".form-html", form).each(function() {
				var url = $(this).data("url");
				if(url!="") {
					$(this).load(url, function() {
						jQuery.bithive.apply($(this));
					});
				}
			});

			// SETS --------------------------------------------------------------------------------
			if(jQuery().buttonsSet) {
				$(".form-buttonsset", form).each(function() {
					var field = $("input", $(this));
					var source = $.base64.atob(field.data("source")) || "";
					jQuery.bithive.mkOptions(source, function(src, args) {
						if(src!=="") {
							$(args[0]).buttonsSet(src);
						}
					}, [this]);
				});

				$(".form-daysofweek", form).each(function() {
					$(this).buttonsSet([
						{ "label":"Do", "value":"0" },
						{ "label":"Lu", "value":"1" },
						{ "label":"Ma", "value":"2" },
						{ "label":"Mi", "value":"3" },
						{ "label":"Ju", "value":"4" },
						{ "label":"Vi", "value":"5" },
						{ "label":"Sa", "value":"6" }
					]);
				});

				$(".form-months", form).each(function() {
					$(this).buttonsSet([
						{ "label":"Ene", "value":"1" },
						{ "label":"Feb", "value":"2" },
						{ "label":"Mar", "value":"3" },
						{ "label":"Abr", "value":"4" },
						{ "label":"May", "value":"5" },
						{ "label":"Jun", "value":"6" },
						{ "label":"Jul", "value":"7" },
						{ "label":"Ago", "value":"8" },
						{ "label":"Sep", "value":"9" },
						{ "label":"Oct", "value":"10" },
						{ "label":"Nov", "value":"11" },
						{ "label":"Dic", "value":"12" }
					]);
				});
			}

			// DATE --------------------------------------------------------------------------------
			if(jQuery().datetimepicker) {
				var formats = {
					"datepicker" : "DD/MM/YYYY",
					"monthpicker": "MM/YYYY",
					"yearpicker": "YYYY",
					"hourpicker" : "HH:mm",
					"timepicker" : "HH:mm:ss",
					"datetimepicker" : "DD/MM/YYYY HH:mm:ss"
				};
				
				var tooltips = {
					today: "Hoy",
					clear: "Limpiar",
					close: "Cerrar",
					selectMonth: "Selecionar Mes",
					prevMonth: "Anterior Mes",
					nextMonth: "Siguiente Mes",
					selectYear: "Selecionar Año",
					prevYear: "Anterior Año",
					nextYear: "Siguiente Año",
					selectDecade: "Selecionar Decada",
					prevDecade: "Anterior Década",
					nextDecade: "Siguiente Década",
					prevCentury: "Anterior Siglo",
					nextCentury: "Siguiente Siglo"
				};
				
				$("input.form-date", form).each(function() {
					var field = $(this);
					var date = field.val() || null;
					if(date) {
						if(date.length==4) { date += "-01-01"; }
						if(date.length==7) { date += "-01"; }
					}
					var type = field.data("type") || "datepicker";
					var linked = $("[data-linked-me='"+$(this).data("linked-with")+"']", field.parent());
					if(formats[type]) {
						field.datetimepicker({
							format: formats[type],
							tooltips: tooltips,
							showClear: true,
							locale: "es"
						}).on("dp.change", function(e) {
							var timevalue;
							if(type=="datepicker") {
								timevalue = moment(e.date).format("YYYY-MM-DD");
							} else if(type=="datetimepicker") {
								timevalue = moment(e.date).format("YYYY-MM-DD HH:mm:ss");
							} else if(type=="monthpicker") {
								timevalue = moment(e.date).format("YYYY-MM");
								if(timevalue!="Invalid date") { timevalue += "-01"; }
							} else if(type=="yearpicker") {
								timevalue = moment(e.date).format("YYYY");
							} else {
								timevalue = moment(e.date).format(formats[type]);
							}
							if(timevalue!="Invalid date") { linked.val(timevalue); } else { linked.val(""); }
						});

						if(date) { field.data("DateTimePicker").date(moment(date)); }
						if(field.data("min")) { field.data("DateTimePicker").minDate(moment(field.data("min"))); }
						if(field.data("max")) { field.data("DateTimePicker").maxDate(moment(field.data("max"))); }
						
						if(type=="hourpicker" || type=="timepicker") {
							$(".input-group-addon > i", $(this).parent()).removeClass("fa-calendar").addClass("fa-clock-o");
						}
					} else {
						if(jQuery().mask) {
							if(type=="date") {
								field.mask("B0/A0/0000", {
									translation: {
										"A": { pattern: /[0-1]/},
										"B": { pattern: /[0-3]/}
									},
									placeholder: "__/__/____"}
								).on("change", function() {
									var dateval = field.val().split("/");
									linked.val(dateval[2]+"-"+dateval[1]+"-"+dateval[0]);
								});
							} else if(type=="hour") {
								field.mask("C0:D0", {
									translation: {
										"C": { pattern: /[0-2]/},
										"D": { pattern: /[0-5]/}
									},
									placeholder: "__:__"}
								).on("change", function() {
									linked.val(field.val()+":00");
								});
								
								$(".input-group-addon > i", field.parent()).removeClass("fa-calendar").addClass("fa-clock-o");
							} else if(type=="time") {
								field.mask("C0:D0:D0", {
									translation: {
										"C": { pattern: /[0-2]/},
										"D": { pattern: /[0-5]/}
									},
									placeholder: "__:__:__"}
								).on("change", function() {
									linked.val(field.val());
								});
								
								$(".input-group-addon > i", field.parent()).removeClass("fa-calendar").addClass("fa-clock-o");
							} else if(type=="datetime") {
								field.mask("B0/A0/0000 C0:D0:D0", {
									translation: {
										"A": { pattern: /[0-1]/},
										"B": { pattern: /[0-3]/},
										"C": { pattern: /[0-2]/},
										"D": { pattern: /[0-5]/}
									},
									placeholder: "__/__/____ __:__:__"}
								).on("change", function() {
									var datetime = field.val().split(" ");
									var dateval = datetime[0].split("/");
									linked.val(dateval[2]+"-"+dateval[1]+"-"+dateval[0]+" "+datetime[1]);
								});
							}
						}
					}
				});

				$("div.form-date", form).each(function() {
					var range = $(this);
					var inputs = $("input", range);
					var type = range.data("type");
					if(formats[type]) {
						var dp1 = $(inputs[0]);
						var dp2 = $(inputs[1]);
						var date1 = dp1.val() || null;
						var date2 = dp2.val() || null;

						dp1.datetimepicker({ format: formats[type], tooltips: tooltips, showClear: true, locale: "es", useCurrent: false});
						dp2.datetimepicker({ format: formats[type], tooltips: tooltips, showClear: true, locale: "es"});
						
						var linked1 = $("[data-linked-me='"+dp1.data("linked-with")+"']", dp1.parent());
						dp1.on("dp.change", function (e) {
							var timevalue;
							if(type=="datepicker") {
								timevalue = moment(e.date).format("YYYY-MM-DD");
							} else if(type=="datetimepicker") {
								timevalue = moment(e.date).format("YYYY-MM-DD HH:mm:ss");
							} else if(type=="monthpicker") {
								timevalue = moment(e.date).format("YYYY-MM");
								if(timevalue!="Invalid date") { timevalue += "-01"; }
							} else if(type=="yearpicker") {
								timevalue = moment(e.date).format("YYYY");
							} else {
								timevalue = moment(e.date).format(formats[type]);
							}
							if(timevalue!="Invalid date") { linked1.val(timevalue); } else { linked1.val(""); }
							dp2.data("DateTimePicker").minDate(e.date);
						});

						var linked2 = $("[data-linked-me='"+dp2.data("linked-with")+"']", dp2.parent());
						dp2.on("dp.change", function (e) {
							var timevalue;
							if(type=="datepicker") {
								timevalue = moment(e.date).format("YYYY-MM-DD");
							} else if(type=="datetimepicker") {
								timevalue = moment(e.date).format("YYYY-MM-DD HH:mm:ss");
							} else if(type=="monthpicker") {
								timevalue = moment(e.date).format("YYYY-MM");
								if(timevalue!="Invalid date") { timevalue += "-01"; }
							} else if(type=="yearpicker") {
								timevalue = moment(e.date).format("YYYY");
							} else {
								timevalue = moment(e.date).format(formats[type]);
							}
							if(timevalue!="Invalid date") { linked2.val(timevalue); } else { linked2.val(""); }
							dp1.data("DateTimePicker").maxDate(e.date);
						});
						
						if(date1) { dp1.data("DateTimePicker").date(moment(date1)); }
						if(range.data("min")) { dp1.data("DateTimePicker").minDate(moment(range.data("min"))); }

						if(date2) { dp2.data("DateTimePicker").date(moment(date2)); }
						if(range.data("max")) { dp2.data("DateTimePicker").maxDate(moment(range.data("max"))); }

						if(type=="hourpicker" || type=="timepicker") {
							$(".input-group-addon > i", $(this)).removeClass("fa-calendar").addClass("fa-clock-o");
						}

						var selector = range.data("selector");
						if(selector) {
							var dropdown = $(".dropdown-menu", range);
							var selectors = selector.split(",");
							$.each(selectors, function() {
								if(this=="|") {
									dropdown.append('<div class="dropdown-divider"></div>');
								} else if(momentdates.labels[this]) {
									var method = this;
									$("<a>")
										.addClass("dropdown-item")
										.text(momentdates.labels[method])
										.click(function(){
											var dates = eval("momentdates."+method+"()");
											dp1.data("DateTimePicker").clear();
											dp2.data("DateTimePicker").clear();
											dp1.data("DateTimePicker").date(dates[0]);
											dp2.data("DateTimePicker").date(dates[1]);
										})
										.appendTo(dropdown)
									;
								}
							});
						}
					}
				});
			}

			// FILES -------------------------------------------------------------------------------
			$("input[type='file']", form).each(function() {
				$(this).closest("form").attr("enctype", "multipart/form-data");
			});


			// MASKS -------------------------------------------------------------------------------
			// al actualizar, actualizar unmask en SendForm
			if(jQuery().mask) {
				$(".mask-decimal", form).each(function() {
					let value = $(this).val();
					if(value!="" && value.indexOf(".")<0) { $(this).val(value+".0000"); }
					$(this).mask("#,##0.0000", {reverse: true, placeholder: "0.0000"}).addClass("text-right");
				});
				$(".mask-money", form).each(function() {
					let value = $(this).val();
					if(value!="" && value.indexOf(".")<0) { $(this).val(value+".00"); }
					$(this).mask("#,##0.00", {reverse: true, placeholder: "0.00"}).addClass("text-right");
				});
				$(".mask-cuit", form).each(function() { $(this).mask("00-00000000-0", {placeholder: "__-________-_"}); });
				$(".mask-dni", form).each(function() { $(this).mask("Z0.000.000",{translation: {placeholder: "__.___.___", "Z": {pattern: /[0-9]/, optional: true}}}); });
				$(".mask-ip", form).each(function() { $(this).mask("0ZZ.0ZZ.0ZZ.0ZZ", {placeholder: "_._._._", translation: {"Z": {pattern: /[0-9]/, optional: true}}}); });
				$(".mask-cbu", form).each(function() { $(this).mask("0000000000000000000000") });
				$(".mask-phone", form).each(function() { $(this).mask("0000 0000", {placeholder: "____ ____"}); });
				$(".mask-phone_area", form).each(function() { $(this).mask("(00) 0000 0000", {placeholder: "(__) ____ ____"}); });
				$(".mask-cellphone", form).each(function() { $(this).mask("15 0000 0000", {placeholder: "15 ____ ____"}); });
				$(".mask-cellphone_area", form).each(function() { $(this).mask("(00) 15 0000 0000", {placeholder: "(__) 15 ____ ____"}); });
			};

			// RELATION ----------------------------------------------------------------------------
			$(".form-relation", form).each(function() {
				var relid		= $(this).data("id") || "";
				var source		= $(this).data("source");
				var href		= $(this).data("value");
				var target		= $(this).data("target");
				var size		= $(this).data("size");
				var skipfirst	= $(this).data("skipfirst");
				var isform		= $(this).data("isform");
				var closebutton	= $(this).data("closebutton");

				if(size!="") { size = "dialog-"+size; }
				if(target!="") { targetElement = $(target); }
				href = (href=="true" || href=="1") ? true : href;
				isform = (isform=="true" || isform=="1") ? true : false;
				closebutton = (closebutton=="true" || closebutton=="1") ? true : false;
				skipfirst = (skipfirst=="true" || skipfirst=="1") ? true : false;
				$(this).click(function() {
					var dialog = BootstrapDialog.show({
						draggable: true,
						title: $(this).val().toUpperCase(),
						cssClass: size,
						message: $("<div>", {"id": relid, "class": "container-fluid"}).load(source, function() {
							var modal = $(this);
							modal.on("relation", function(){
								$("[data-relation]", modal).click(function(){
									var type = $(this).data("relation").toLowerCase();
									var code = /<!--(.*?)-->/g.exec($(this).html());
									if(code===null) {
										code = $(this).html();
									} else {
										code = code[1];
									}
									
									if(type=="multiple") {
										targetElement.append(code);
									} else if(type=="toggle") {
										var curcode = targetElement.html();
										code = $("<div>").html(code).html();
										if(curcode.indexOf(code)!=-1) {
											curcode = curcode.replace(code, "");
											targetElement.html(curcode);
										} else {
											targetElement.append(code);
										}
									} else if(type=="once") {
										targetElement.html(code);
									} else if(type=="onceclose") {
										targetElement.html(code);
										dialog.close();
									}

									$("[data-relation='close']", modal).click(function(e) { dialog.close(); });
									jQuery.bithive.apply(targetElement);
								});
							}).trigger("relation");

							if(isform) {
								var form = modal.find("form");
								form.prop("dialog", {"dialog": dialog, "href": href, "target": target});
								$("<div>", {"class": "row"})
									.append(
										$("<div>", {"class": "col btnbox text-center"})
											.append(
												$("<input>", {
													"type": "button",
													"class": "btn btn-primary form-submit",
													"value": "Guardar"
												})
											)
											.append(
												$("<input>", {
													"type": "button",
													"class": "btn margin-md margin-only-left",
													"value": "Cancelar"
												}).attr("data-relation", "close")
											)
									)
									.appendTo(form)
								;
							}

							if(closebutton) {
								$("<div>", {"class": "row"})
									.append(
										$("<div>", {"class": "col btnbox text-center"})
											.append(
												$("<input>", {
													"type": "button",
													"class": "btn btn-primary",
													"value": "Cerrar"
												}).attr("data-relation", "close")
											)
									)
									.appendTo(modal)
								;
							}

							$("[data-relation='close']", modal).click(function(e) { dialog.close(); });
							jQuery.bithive.apply(modal);
						})
					});
				});
				
				if(href!="" && href!=true && !skipfirst) {
					targetElement.load(href, function() {
						jQuery.bithive.apply(targetElement);
					});
				}
			});

			// NUMBER PICKER -----------------------------------------------------------------------
			if(jQuery().TouchSpin) {
				$("input.form-number", form).each(function() {
					var min = $(this).data("min");
					if(typeof min=="undefined" || min==="") { min = -1000000000; }

					var max = $(this).data("max");
					if(typeof max=="undefined" || max==="") { max = 1000000000; }

					var step = $(this).data("step");
					if(typeof step=="undefined" || step==="") { step = 1; }

					var prefix = $(this).data("prefix") || "";
					var postfix = $(this).data("postfix") || "";

					var val = $(this).val();
					if(val!="") {
						if(val<min || val>max) {
							$(this).val(min);
						} else {
							$(this).val(val);
						}
					} else {
						if(min!=-1000000000) { $(this).val(min); }
					}

					$(this).TouchSpin({
						min: min,
						max: max,
						step: step,
						prefix: prefix,
						postfix: postfix,
						verticalbuttons: true
					});
				});
			}

			// PASSWORD ----------------------------------------------------------------------------
			$(".showpass").click(function() {
				var pass = $("input", $(this).parent());
				if(pass.attr("type")=="password") {
					pass.attr("type", "text");
					$("i", $(this)).removeClass("fa-eye").addClass("fa-eye-slash");
				} else {
					pass.attr("type", "password");
					$("i", $(this)).removeClass("fa-eye-slash").addClass("fa-eye");
				}
				pass.focus();
			});

			// SELECT ------------------------------------------------------------------------------
			$("select.form-select[data-source]", form).each(function() {
				var field = $(this);
				var source = jQuery.base64.atob(field.data("source"));
				if(source!="") {
					jQuery.bithive.mkselect(field, source, jQuery.bithive.OptionsValues(field));
				}
			});

			// SLIDER ------------------------------------------------------------------------------
			if(jQuery().slider) {
				$("div.form-slider", form).each(function() {
					var target = $(this).data("target");
					var field = $("[name='"+target+"']", $(this).parent());
					var handle = $(".ui-slider-handle", $(this).parent());

					var min = $(this).data("min");
					if(typeof min=="undefined" || min=="") { min = 0; }

					var max = $(this).data("max");
					if(typeof max=="undefined" || max=="") { max = 10; }

					var step = $(this).data("step");
					if(typeof step=="undefined" || step=="") { step = 1; }

					var val = $(this).val();
					if(val=="" || val<min || val>max) { $(this).val(min); }

					var prefix = $(this).data("prefix") || "";
					var postfix = $(this).data("postfix") || "";

					$(this).slider({
						min: min,
						max: max,
						step: step,
						create: function() {
							var curval = $(this).slider("value");
							field.val(curval);
							handle.text(prefix+curval+postfix);
						},
						slide: function(event, ui) {
							var curval = ui.value;
							field.val(curval);
							handle.text(prefix+curval+postfix);
						}
					});
					if($(this).hasAttr("disabled")) { $(this).slider("disable"); }
				});
			}
			
			// SUBFORM -----------------------------------------------------------------------------
			$(".form-subform", form).each(function() {
				jQuery.bithive.SubForms(this);
			});

			$(".form-submit", form).click(function(e) {
				e.preventDefault();
				var btn = $(this);

				if($(this).hasClass("form-confirm")) {
					var message = btn.data("confirm");
					if(message=="1" || message=="true") { message = "Confirma?"; }
					message = jQuery.bithive.RefToVal(message);
					BootstrapDialog.confirm({
						draggable: true,
						title: "Confirmar",
						message: message,
						type: BootstrapDialog.TYPE_DANGER,
						btnCancelLabel: "cancelar",
						btnCancelClass: "btn-default",
						btnOKLabel: "aceptar",
						btnOKClass: "btn-danger",
						callback: function(result) {
							if(result) {
								jQuery.bithive.SendForm(btn);
							}
						}
					});
				} else {
					jQuery.bithive.SendForm(btn);
				}
			});

			// TAGS --------------------------------------------------------------------------------
			if(jQuery().tagit) {
				$("input.form-tags", form).each(function() {
					var field = $(this);
					var source = $.base64.atob(field.data("source")) || "";
					var length = field.data("length") || "";
					var clear = field.data("clear") || "";
					var disabled = ($(this).hasAttr("disabled"));
					jQuery.bithive.mkOptions(source, function(src, args) {
						var source = [];
						if(src!="") {
							jQuery.each(src, function(k,v) {
								source.push(v.value);
							});
						}

						args[0].tagit({
							availableTags: source,
							autocomplete: {delay: 0, minLength: 2},
							allowSpaces: true,
							readOnly: disabled,
							preprocessTag: function (val) {
								if(!val) { return ''; }
								var values = val.replace(/(\n|\r\n)/g, args[0].tagit("option","singleFieldDelimiter"));
								values = values.split(args[0].tagit("option","singleFieldDelimiter"));
								if(values.length > 1) {
									for (var i = 0; i < values.length; i++) {
										args[0].tagit("createTag", values[i]);
									}
									return '';
								} else {
									return val;
								}
							}
						});

						if(clear!=="" || length!=="") {
							args[0].tagit({
								"preprocessTag": function(val) {
									if(clear!=="") {
										var regex = new RegExp("["+clear+"]", "g");
										val = val.replace(regex, "");
									}

									if(length!=="") { val = val.slice(0, length); }
									return val;
								}
							});
						}

					}, [field]);
				});
			}

			// TEXTAREAS ---------------------------------------------------------------------------
			$("textarea.fullscreen, textarea.fullinput", form).each(function() {
				$(this).addClass("fullscreen").on("keydown", function(e) {
					if(e.keyCode==9 || e.which==9) {
						e.preventDefault();
						var s = this.selectionStart;
						this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
						this.selectionEnd = s+1;
					}
				});
				$(this).textareafullscreen({width: "90%"});
			});

			$("textarea.dynamic", form)
				.on("focus change keyup paste", function(e) {
					var $this = $(this);
					var hiddenDiv = $("#HiddenDiv");
					if(!hiddenDiv.length) {
						hiddenDiv = $('<div id="HiddenDiv" style="display:none; padding-top:1.2em; white-space:pre-wrap; word-wrap:break-word"></div>');
						$("body").append(hiddenDiv);
					}
				
					if($this.is(":visible")) {
						hiddenDiv.css("width", $this.width());
					} else {
						hiddenDiv.css("width", $(window).width()/2);
					}

					hiddenDiv.text($this.val() + "\n\n");
					if(hiddenDiv.height()>$this.height()) {
						$this.css("height", hiddenDiv.height());
					}
					
					var content = hiddenDiv.html().replace(/\n/g, "<br>");
					hiddenDiv.html(content);
				})
				.on("blur", function(e) {
					$(this).css("height", "");
				});

			if(typeof squireUI!="undefined") {
				$("textarea.wysiwyg-lite", form).each(function(){
					squireUI($(this), { smallbar:true, ui:"lite", tags:"<br /><br ><p></p><a></a><b></b><i></i><ul></ul><ol></ol><li></li>" });
				});

				$("textarea.wysiwyg", form).each(function(){
					squireUI($(this), { smallbar:true, ui:"simple", tags:"<br /><br ><p></p><a></a><b></b><i></i><ul></ul><ol></ol><li></li>" });
				});

				$("textarea.wysiwyg-full", form).each(function(){
					squireUI($(this), { smallbar:true, ui:"full" });
				});
			}
		},

		alert: function(msg, after) {
			BootstrapDialog.show({
				draggable: true,
				closable: false,
				type: BootstrapDialog.TYPE_WARNING,
				buttons: [{
					label: "aceptar",
					cssClass: "btn-warning",
					action: function(dialog) {
						dialog.close();
						if(after) { after(); }
					}
				}],
				title: "Alerta",
				message: msg,
			});
		},

		// beforeFn se ejecuta antes de enviar el formulario
		// beforeFn retorna formData, si formData es igual false, el envio se aborta
		SendForm: function(btnSubmit) {
			var hrefRedirect = false;
			var form = btnSubmit.closest("form");
			
			var before = form.prop("beforeFn") || null;
			var after = form.prop("afterFn") || null;
			
			var redirect = $("input[name='NGL_REDIRECT']:last", form);
			if(redirect.length) {
				var hrefRedirect = redirect.val();
				if(hrefRedirect.indexOf("?")!=-1) {
					var urlQuery = hrefRedirect.substring(hrefRedirect.indexOf("?")+1);
					if(urlQuery.indexOf("&")==0) { urlQuery = urlQuery.substring(1); }
					urlQuery = JSON.parse('{"' + decodeURI(urlQuery).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
					var urlQueryString = [];
					$.each(urlQuery, function(k,v){
						if(k!="response") {
							urlQueryString.push(k+"="+v);
						}
					});
					hrefRedirect = hrefRedirect.substring(0, hrefRedirect.indexOf("?")+1)
					hrefRedirect += urlQueryString.join("&")+"&response=";
				} else {
					hrefRedirect += "?response=";
				}
				$("input[name='NGL_REDIRECT']", form).remove();
			}

			var fields = $("input,select,textarea", form);

			var alvin = true;
			$(".form-error", form).remove();
			$.each(fields, function() {
				$(this).alvin("check");
				if($(this).prop("alvinerror")) { alvin = false; }
			});
			if(!alvin) { return false; }

			// unmask ---
			$(".mask-decimal", form).each(function() { $(this).val($(this).val().replace(/,/g, "")); });
			$(".mask-money", form).each(function() { $(this).val($(this).val().replace(/,/g, "")); });
			$(".mask-cuit", form).each(function() { $(this).val($(this).val().replace(/\-/g, "")); });
			$(".mask-dni", form).each(function() { $(this).val($(this).val().replace(/\./g, "")); });

			// attacher resizer
			$(".form-attachresizer", form).each(function() { $(this).prop("attachresizer").toField(); });

			if(typeof form.prop("attacher") != "undefined") {
				var formData = form.prop("attacher").prepareForm();
			} else {
				var formData = new FormData(form[0]);
				$("input[type='file']").each(function() {
					var fieldname = $(this).attr("name");
					$($(this)[0].files).each(function(i, file) {
						formData.append(fieldname, file);
					});
				});
			}

			// before send
			if(before) {
				if(typeof window[before]==="function") {
					var formData = window[before](formData, form)
					if(formData===false) { return false; }
				}
			}

			var btnRow = btnSubmit.closest(".row");
			var gyros = $("<div>").gyros({top: "-10px", width:"60px", stroke:2});
			btnRow.after(gyros).hide();

			$.ajax({
				type: form.attr("method"),
				url: form.attr("action"),
				data: formData,
				contentType: false,
				cache: false,
				processData: false,
				success: function(response) {
					// actions
					try {
						var parsed = JSON.parse(response);
					} catch(e) {
						if(e instanceof SyntaxError) {
							if(typeof response == "string" && (response.substr(0, 7).toLowerCase()=="http://" || response.substr(0, 8).toLowerCase()=="https://")) {
								window.location.href = response;
							} else if(response.substr(0, 15)=="[[TUTOR-DEBUG]]") {
								// tutor debug
								jQuery.bithive.SendFormMessages(btnRow, gyros, response, "debug");
							} else if(response.substr(0, 15)=="[[TUTOR-ALERT]]") {
								// tutor alert
								jQuery.bithive.SendFormMessages(btnRow, gyros, response, "alert");
							} else {
								// nogal error | php error
								jQuery.bithive.SendFormMessages(btnRow, gyros, response, "error");
							}
						}
						return true;
					}

					if(after) {
						if(typeof window[after]==="function") {
							window[after](parsed, form);
							gyros.remove();
							btnRow.show();
						}
					} else if(typeof form.prop("dialog")!="undefined") {
						form.prop("dialog").dialog.close();
						if(form.prop("dialog").href!="") {
							var targetElement = $(form.prop("dialog").target);
							var href = form.prop("dialog").href;
							if(href==true) {
								jQuery.bithive.jsonFiller(parsed, targetElement);
							} else {
								targetElement.load(href, function() {
									jQuery.bithive.apply(targetElement);
								});
							}
						}
					} else if(typeof form.prop("addnewvalue")!="undefined") {
						if(parseInt(response)==response) {
							var source = jQuery.bithive.RefToVal(form.prop("addnewvalue").source);
							jQuery.ajax({
								url: source,
								dataType: "json",
								data: { i:1, q: response },
								success: function(data) {
									$.each(data, function(key, item) {
										if(item.value==response) {
											form.prop("addnewvalue").target.val(response);
											form.prop("addnewvalue").field.val(item.label);
										}
									});
									form.prop("addnewvalue").dialog.close();
								}
							});
						} else {
							response = parsed;
							form.prop("addnewvalue").field.val(response);
							form.prop("addnewvalue").field.val(response.label);
							form.prop("addnewvalue").target.val(response.value);
							form.prop("addnewvalue").dialog.close();
						}
					} else {
						var dialog = $(this).closest(".modal-dialog");
						if(dialog.length) {
							dialog.close();
						} else {
							if(hrefRedirect!==false) {
								window.location.href = hrefRedirect+response;
							} else {
								window.location.reload(); 	
							}
						}
					}
				},
				error: function(response) {
					BootstrapDialog.show({
						draggable: true,
						type: BootstrapDialog.TYPE_WARNING,
						buttons: [{
							label: "aceptar",
							cssClass: "btn-warning",
							action: function(dialog) {
								dialog.close();
							}
						}],
						title: "Advertencia!",
						message: response,
					});
				}
			});
		},

		SendFormMessages: function(btnRow, gyros, response, type) {
			var content = (type=="alert") ? response.substr(15) : response;
			if(type=="alert") {
				var typeClass= "warning";
			} else if(type=="error") {
				var typeClass= "danger";
			} else {
				var typeClass= "info";
			}

			$("<div>", {class:"box-overlay"}).appendTo($("body"));
			$("<div>")
				.addClass(type+"-box abs-top-center mt-hg sw-md")
				.append(
					$("<div>")
						.addClass(type+"-content")
						.append($("<div>", {class:type+"-header text-lg p-md bg-"+typeClass}).html(
							$("<i>").addClass("float-right fa fa-times icon-md text-white c-pointer").click(function(){
								$("button", $(this).parent().parent()).trigger("click");
							})
						))
						.append($("<div>", {class:type+"-message text-lg p-md"}).html(content))
						.append(
							$("<button>")
								.addClass(type+"-close d-block mx-auto my-sm btn px-md btn-md btn-"+typeClass)
								.click(function(){
									$("."+type+"-box, .box-overlay").remove();
									gyros.remove();
									btnRow.show();
								})
						)
				)
				.appendTo($("body"))
			;
			window.scrollTo(0,0);
			return true;
		},

		RefToVal: function(string) {
			var matches = string.match(/(\{:)(.*?)(:\})/gi);
			if(matches) {
				$.each(matches, function(i,key) {
					var selector = key.substr(2, key.length-4);
					if($(selector).length) {
						string = string.replace(key, $(selector).val());
					}
				});
			}
			
			return string;
		},

		SubForms: function(elem) {
			var subformButton = $(elem).addClass("subform-trigger");
			var formid = subformButton.data("id");
			var source = (elem.nodeName.toLowerCase()!="select") ? subformButton.data("source") : null;
			var targetSelector = subformButton.data("target") || "#"+formid+"_target";
			var limit = parseInt(subformButton.data("limit")) || 0;
			var limitmsg = subformButton.data("limit-message") || "Límite de registros alcanzado";
			var target = $(targetSelector).prop({
				"form-trigger": subformButton,
				"last-subform": null
			});
			var preload = parseInt(subformButton.data("default"));
			var subclass = subformButton.data("class") || "";

			if(elem.nodeName.toLowerCase()!="select") {
				subformButton.click(function(e, data, parentForm, subSource) {
					let src = (subSource && subSource!==true) ? subSource : source;
					if(limit) {
						if($(".subform-form", target).length >= limit) {
							jQuery.bithive.alert(limitmsg);
							return false;
						}
					}
					jQuery.bithive.SubFormTrigger(e, data, parentForm, src, subformButton, target, subclass);
				});
			} else {
				subformButton.change(function(e, data, parentForm) {
					target.html("");
					source = $(this).children("option:selected").data("info") || null;
					if(source) {
						jQuery.bithive.SubFormTrigger(e, data, parentForm, source, subformButton, target, subclass);
					}
				});
			}

			if(subformButton.hasAttr("data-value")) {
				var div = $("<div>").html($("<div>").gyros({width:"40px", stroke:2}));
				var info = jQuery.base64.atob(subformButton.data("value"));
				info = decodeURIComponent(escape(info));
				info = JSON.parse(info);
				$.each(info, function() {
					subformButton.trigger("click", [this]);
				});
			} else {
				if(preload>0) {
					for(var x=0; x<preload; x++) {
						subformButton.trigger("click");
					}
				}
			}

			if(subformButton.val()=="") { subformButton.remove(); }
		},

		SubFormTrigger: function(e, data, parentForm, source, subformButton, target, subclass) {
			var div = $("<div>").addClass("subform-form clearfix "+subclass).html($("<div>").gyros({width:"40px", stroke:2}));
			div.load(source, function(){
				div.prop("subFormData", ((typeof data != "undefined") ? data : null));
				if(parentForm) {
					parentForm.prop({
						"form-trigger": target.prop("form-trigger"),
						"last-subform": null
					});
					jQuery.bithive.SubFormProccess(target, div, data, subformButton);
					let subFormId = $("[data-subform-id]", div).data("subform-id");
					let subFormIdValue = div.prop("subFormIdVal");
					let parentId = parentForm.prop("subform-id");
					let parentIdValue = parentForm.prop("subFormIdVal");
					let parentLink = $("input[name='"+parentId+"["+parentIdValue+"]']", parentForm).val();
					let status = (typeof data == "undefined") ? false : true;
					let childLink = $("input[name='"+subFormId+"_lnk["+subFormIdValue+"]']", div);
					if(!childLink.length) { childLink = $("<input>", {type:"hidden", name:subFormId+"_lnk["+subFormIdValue+"]", disabled:status}).attr("data-subform-parent", parentId).appendTo(div); }
					childLink.val(parentLink);
					$("[data-subform-nested]", div).remove();
					div.attr("style", "margin-left: 10% !important").prop("last-subform", div).insertAfter(parentForm);
				} else {
					jQuery.bithive.SubFormProccess(target, div, data, subformButton);
					target.append(div).prop("last-subform", div);
				}
			});
		},

		SubFormProccess: function(target, div, data, button) {
			var subclass = button.data("class") || "";
			var afteradd = button.data("afteradd") || null;
			var afterrem = button.data("afterrem") || null;

			var btnEdit = $("[data-subform='update']", div);
			var btnRem = $("[data-subform='remove']", div);
			var btnToggler = $("[data-subform='toggle']", div);
			var subFormIdValue = div.prop("subFormIdVal");
			
			// autollenado de datos INI ----------------------------
			jQuery.bithive.SubFormFillData(target, div, data, button);
			// autollenado de datos END ----------------------------

			// boton editar
			// cuando existe bloquea los campos hasta que es presionado, salvo que el bloque tenga la class "enabled"
			// al presionarlo crea un campo oculto que tiene por nombre el valor del atributo data-subform-id + _update
			// y el pone como valor el almacenado en data[subform-update]
			if(btnEdit.length) {
				if(data) {
					btnEdit.click(function(){
						var subform = $(this).closest(".subform-form");
						var subFormIdValue = subform.prop("subFormIdVal");
						if(subform.prop("collapsed")) {
							subform.prop("collapsed", false);
							subform.css({"height":"", "overflow":""});
						}

						$("input,select,textarea", subform).prop("disabled", false);
						$(".ui-autocomplete-input", subform).each(function() {
							$(this).prop("disabled", false);
							$(this).autocomplete("enable").autocomplete("option", "disabled", false);
							$("#"+$(this).prop("autocomplete-target")).prop("disabled", false);
						});

						var name = btnEdit.data("subform-id");
						if(name && data[name]) {
							subform.append($("<input>").attr({
								"type": "hidden",
								"name":  name+"_update["+subFormIdValue+"]",
								"value": data[name]
							}));
						}
						
						if(btnRem.length) { btnRem.show(); } 
						$(this).remove();
					});
				} else {
					btnEdit.remove();
				}
			}

			// boton remover
			// al presionarlo remueve el subform y de existir un valor en data para el valor del atributo data-subform-id
			// crea un campo oculto llamado como dicho valor + _remove y le pone el valor de data correspondiente
			if(btnRem.length) {
				var name = btnRem.data("subform-id");
				if(data && name && data[name]) {
					btnRem.prop("subform-remove-value", data[name]);
					btnRem.click(function(e, nested) {
						var btnRem = $(this);
						var subform = $(this).closest(".subform-form");
						var subFormIdValue = subform.prop("subFormIdVal");
						if(nested) {
							if(btnRem.prop("subform-remove-value")) {
								subform.parent().append($("<input>").attr({
									"type": "hidden",
									"name":  name+"_remove["+subFormIdValue+"]",
									"value": btnRem.prop("subform-remove-value")
								}));
							}
							subform.fadeOut(function() {
								subform.remove();
								if(afterrem) { jQuery.bithive.run(afterrem); }
							});
						} else {
							BootstrapDialog.confirm({
								draggable: true,
								title: "Confirmar",
								message: btnRem.html()+"?",
								type: BootstrapDialog.TYPE_DANGER,
								btnCancelLabel: "cancelar",
								btnOKLabel: "aceptar",
								btnOKClass: "btn-danger",
								callback: function(result) {
									if(result) {
										if(btnRem.prop("subform-remove-value")) {
											subform.parent().append($("<input>").attr({
												"type": "hidden",
												"name":  name+"_remove["+subFormIdValue+"]",
												"value": btnRem.prop("subform-remove-value")
											}));

											// nested
											$("[data-subform-parent='"+name+"'][value='"+btnRem.prop("subform-remove-value")+"']").each(function(){
												let subRem = $("[data-subform='remove']", $(this).parent());
												if(subRem[0]) { subRem.trigger("click", true); }
											});
										}
										subform.fadeOut(function() {
											subform.remove();
											if(afterrem) { jQuery.bithive.run(afterrem); }
										});
										jQuery.bithive.enumerate($("[data-subform='number']", target));
									}
								}
							});
						}
					});
				} else {
					btnRem.click(function() {
						var subform = $(this).closest(".subform-form");
						subform.fadeOut(function() {
							subform.remove();
							if(afterrem) { jQuery.bithive.run(afterrem); }
						});
						jQuery.bithive.enumerate($("[data-subform='number']", target));
					});
				}
			}

			// boton clonar
			// permite duplicar todos los datos del subform, salvo el id
			$("[data-subform='clone']", div).click(function() {
				var subform = $(this).closest(".subform-form");
				if($(this).hasAttr("data-subform-before")) { eval($(this).data("subform-before")+"(subform)"); }

				var clonedData = {};
				$("input, textarea, select", subform).each(function(){
					var field = $(this);
					// evaluar [] despues de agregar subFormIdValue
					clonedData[field.attr("name").replace(/\[\w+\]/, "")] = field.val();
				});
				target.prop("form-trigger").trigger("click", clonedData);
				var cloned = target.prop("last-subform");
				if($(this).hasAttr("data-subform-after")) { eval($(this).data("subform-after")+"(subform, cloned)"); }

				jQuery.bithive.enumerate($("[data-subform='number']", target));
			});


			// boton anidar
			// permite añadir un sub-formulario relacionado con el actual
			if($("[data-subform-nested]", div).length) {
				$("[data-subform-nested]", div).click(function(e, subdata) {
					var source = $(this).data("subform-nested");
					var subform = $(this).closest(".subform-form");
					var subFormIdValue = subform.prop("subFormIdVal");
					var formid = $(this).data("subform-id");
					subform.prop("subform-id", formid);
					var lnkparent = $("input[name='"+formid+"["+subFormIdValue+"]']", subform);
					if(!lnkparent.length) { lnkparent = subform.append($("<input>", {type:"hidden", name:formid+"["+subFormIdValue+"]"})); }
					if(lnkparent.val()=="") { lnkparent.val(jQuery.uid()); }

					if($(this).hasAttr("data-subform-before")) { eval($(this).data("subform-before")+"(subform)"); }
					target.prop("form-trigger").trigger("click", [subdata, subform, source]);
					var subsub = subform.prop("last-subform");
					if($(this).hasAttr("data-subform-after")) { eval($(this).data("subform-after")+"(subform, subsub)"); }

					jQuery.bithive.enumerate($("[data-subform='number']", subform));
				});
			}

			// boton toggle
			if(btnToggler.length) {
				div.prop("subform-toggler", btnToggler);
				btnToggler.click(function() {
					var height = btnToggler.data("subform-toggle-height") || 50;
					var subform = $(this).closest(".subform-form");
					if(subform.prop("collapsed")) {
						subform.prop("collapsed", false);
						subform.css({"height":"", "overflow":""});
						subform.prop("subform-toggler").html("<i class='fas fa-minus'></i> &nbsp;"+subform.prop("subform-togglerlabel"));
					} else {
						subform.prop("collapsed", true);
						subform.css({"height":height+"px", "overflow":"hidden"});
						subform.prop("subform-toggler").html("<i class='fas fa-plus'></i> &nbsp;"+subform.prop("subform-togglerlabel"));
					}
				});

				if(btnToggler.data("subform-toggle-label")) {
					$(".subform-toggle-label", div)
						.on("keyup paste change", function(){
							var subform = $(this).closest(".subform-form");
							var btnToggler = subform.prop("subform-toggler");
							var label = btnToggler.data("subform-toggle-label").replace(/\{:\*:\}/g, $(this).val());
							subform.prop("subform-togglerlabel", label);
							btnToggler.html("<i class='fas fa-minus'></i> &nbsp;"+label);
						})
						.trigger("change");
				}
			}

			// botones up/down
			$("[data-subform='up']", div).click(function() { div.insertBefore(div.prev()); jQuery.bithive.enumerate($("[data-subform='number']", target)); });
			$("[data-subform='down']", div).click(function() { div.insertAfter(div.next()); jQuery.bithive.enumerate($("[data-subform='number']", target)); });
			jQuery.bithive.enumerate($("[data-subform='number']", target));
			jQuery.bithive.apply(div);
			if(afteradd) { jQuery.bithive.run(afteradd, div); }

			if(data && btnEdit.length) {
				$("input,select,textarea", div).each(function() {
					if(subclass.indexOf("subform-enabled")==-1) {
						var field = $(this);
						if(field.hasClass("ui-autocomplete-input")) {
							field.prop("disabled", true);
							field.autocomplete("disable").autocomplete("option", "disabled", true);
							$("#"+field.prop("autocomplete-target")).prop("disabled", true);
						} else {
							field.prop("disabled", true);
						}
						
						if(btnRem.length) { btnRem.hide(); } 
					} else {
						btnEdit.trigger("click");
					}
				});
			}
		},

		SubFormFillData: function(target, div, data, button) {
			var subFormIdValue = jQuery.uid();
			div.prop("subFormIdVal", subFormIdValue);
			$("input,select,textarea", div).each(function() {
				var field = $(this);
				var name = field.attr("name");
				if(typeof name != "undefined") {
					if(name.substring(name.length - 2)=="[]") {
						name = name.substring(0, name.length-2);
					}
					if(data && !(data instanceof jQuery) && data[name]) {
						if(field.attr("type")=="checkbox" || field.attr("type")=="radio") {
							if(field.val()==data[name]) { field.prop("checked", true); }
						} else {
							field.val(data[name]);
						}
						field.data("value", data[name]);
					}

					field.attr("name", name+"["+subFormIdValue+"]");
				}
			});

			if(typeof data == "undefined") {
				let subFormId = $("[data-subform-id]", div).data("subform-id");
				div.append($("<input>").attr({
					"type": "hidden",
					"name":  subFormId+"_insert["+subFormIdValue+"]"
				}));
			}

			jQuery.bithive.after(function(){
				jQuery.bithive.jsonFiller(data, div);
				setTimeout(function(args) {
					var elem = div;
					// datepickers
					$(".form-date", elem).each(function() {
						if($(this).data("DateTimePicker")) {
							var field = $("[data-linked-me='"+$(this).data("linked-with")+"']", $(this).parent());
							$(this).data("DateTimePicker").clear();
							$(this).data("DateTimePicker").date(moment(field.val()));
						}
					});

					// switchs
					var subFormIdValue = div.prop("subFormIdVal");
					$(".form-onoffswitch-checkbox", elem).each(function() {
						var field = $(this);
						var name = field.attr("name");
						if(typeof name != "undefined") {
							if(name.substring(name.length - 2)=="[]") {
								name = name.substring(0, name.length-2);
							}
							if(data && data[name]) {
								if(field.val()==data[name]) { field.prop("checked", true); }
								field.data("value", data[name]);
							}

							field.attr("name", name+"["+subFormIdValue+"]");
						}
					});

					if(data && $("[data-subform='toggle']", elem)) { $("[data-subform='toggle']", elem).trigger("click"); }
				
					var nested = $("[data-subform-nested]", div);
					if(nested.length) {
						if(data && data.nested) {
							$.each(data.nested, function() {
								nested.trigger("click", [this]);
							})
						}
					}
				},1000,[div]);
			}, div);
		},

		KeysFromData: function(elem, data) {
			if(typeof data == "undefined") { return string; }
			var string = elem.html();
			var newString = string.replace(/\{:([\w]*):\}/g, function(str, key) {
				return (typeof data[key]!=="undefined" && data[key] !== null) ? data[key] : "";
			});
			elem.html(newString);
		},

		enumerate: function(elem) {
			$(elem).each(function(x){
				$(this).html((x+1));
			});
		},
		
		mkchecks: function(type, elem, source, values) {
			var after = null;
			var disabled = (elem.hasAttr("disabled"));

			if(type=="radio") {
				after = function(){
					if(elem.hasAttr("data-lnk-target") && elem.hasAttr("data-lnk-source")) {
						jQuery.bithive.RelatedOptions(elem, "radio");
					}
				};
			}

			jQuery.bithive.mkOptions(source, function(src, args) {
				var cssClass = args[0].data("class") || "col-xs-12";
				var name = args[0].data("name") || type;

				args[0].html("");
				if(type!="onoffswitch") {
					$.each(src, function(i,option) {
						var uid = jQuery.uid();
						var chk = $("<div>")
							.html(
								function() {
									var opt = $("<input>")
										.attr({
											"id": uid,
											"type": type,
											"name": name,
											"value": option.value,
										})
										.addClass("custom-control-input")
									;
									if(disabled) { opt.attr("disabled", "disabled"); }
									return opt;
								}
							)
							.addClass("custom-control custom-"+type+" col "+cssClass)
							.append($("<label>").attr("for", uid).addClass("cursor-pointer custom-control-label").html(option.label))
						;

						if($.inArray(option.value, args[1])>=0) { $("input", chk).prop("checked", true); }
						args[0].append(chk);
					});
				} else {
					$.each(src, function(i,option) {
						var uid = jQuery.uid();
						var onoff = $("<div>", {class:"form-onoffswitch-container"})
							.html($("<div>", {class:"form-onoffswitch-button"})
								.html($("<div>", {class:"form-onoffswitch"})
									.html(
										function() {
											var opt = $("<input>")
												.attr({
													"id": uid,
													"type": "checkbox",
													"name": name,
													"value": option.value,
												})
												.addClass("form-onoffswitch-checkbox")
											;
											if(disabled) { opt.attr("disabled", "disabled"); }
											return opt;
										}
									)
									.append($("<label>", {class:"form-onoffswitch-label"}).attr("for", uid))
								)
							)
							.append($("<label>", {class:"form-onoffswitch-text"}).html(option.label))
							.addClass(cssClass)
						;

						if($.inArray(option.value, args[1])>=0) { $("input", onoff).prop("checked", true); }
						args[0].append(onoff);
					});
				}

				if(args[0].html()=="") { args[0].html(args[0].data("empty")); }
				if(args[2] && typeof args[2]=="function") { args[2](); }
			}, [elem,values,after]);
		},

		mkselect: function(elem, source, values) {
			jQuery.bithive.mkSelectOptions(elem,source,values,function(){
				if(elem.hasAttr("data-lnk-target") && elem.hasAttr("data-lnk-source")) {
					jQuery.bithive.RelatedOptions(elem, "select");
				}
				jQuery.bithive.BootstrapSelect(elem);
			});
		},

		// creacion, sort y rsort
		BootstrapSelect: function(elem) {
			if(jQuery().selectpicker) {
				let defaultValue = elem.data("default") || false;
				elem.selectpicker({
					defaultValue: defaultValue,
					style: "btn-white",
					width: "100%",
					size: 10
				}).on("DOMSubtreeModified", function() {
					elem.selectpicker("refresh");
				}).on("sort", function(){
					var value = elem.selectpicker("val");
					var options = $("option", elem);
					var first = options[0];
					delete options[0];
					options.sort(function(a,b) {
						if (a.text > b.text) return 1;
						else if (a.text < b.text) return -1;
						else return 0;
					});
					elem.empty().append(first).append(options).selectpicker("refresh");
					elem.selectpicker("val", value);
				}).on("rsort", function(){
					var value = elem.selectpicker("val");
					var options = $("option", elem);
					var first = options[0];
					delete options[0];
					options.sort(function(a,b) {
						if (a.text < b.text) return 1;
						else if (a.text > b.text) return -1;
						else return 0;
					});
					elem.empty().append(first).append(options).selectpicker("refresh");
					elem.selectpicker("val", value);
				});
			} else {
				elem.removeClass("bootstrap-select").addClass("custom-select");
			}
		},

		RelatedOptions: function(elem, type) {
			var targets = (type=="select") ? elem : $("input[type='radio']", elem);
			var lnktarget = $(elem.data("lnk-target"));
			var lnksrc = elem.data("lnk-source");
			targets.change(function() {
				if(lnktarget.hasClass("checkbox") || lnktarget.hasClass("radio")) {
					lnktarget.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
				} else {
					var gyros = jQuery.uid();
					lnktarget.prop("gyrosid", gyros).hide().after(
						$("<div>")
							.attr("id", gyros)
							.css("width", "30px")
							.gyros({width:"30px", stroke:2})
					);
					if(jQuery().selectpicker) {
						$("button", lnktarget.parent()).hide();
					}
				}

				jQuery.bithive.httpRequests++;
				jQuery.ajax({
					url: jQuery.base64.atob(lnksrc) + $(this).val(),
					dataType: "json",
					success: function(data) {
						var values = jQuery.bithive.OptionsValues(lnktarget);
						if(lnktarget.hasClass("checkbox")) {
							jQuery.bithive.mkchecks("checkbox", lnktarget, data, values);
						} else if(lnktarget.hasClass("radio")) {
							jQuery.bithive.mkchecks("radio", lnktarget, data, values);
						} else {
							$("#"+lnktarget.prop("gyrosid")).remove();
							lnktarget.show();
							jQuery.bithive.mkSelectOptions(lnktarget, data, values, function(){
								jQuery.bithive.BootstrapSelect(lnktarget);
								$("button", lnktarget.parent()).show();
							});
						}
					},
					complete: function(response) {
						jQuery.bithive.httpRequests--;
					}
				});
			});
			
			jQuery.bithive.styles();
			if(type=="select") {
				targets.trigger("change");
			} else {
				$("input[type='radio']:checked", elem).trigger("change");
			}
		},

		mkSelectOptions: function(elem,source,values,after) {
			jQuery.bithive.mkOptions(source, function(src, args) {
				if(!elem.hasAttr("data-nodefault") || elem.data("nodefault")=="") {
					args[0].html("<option value='0'>--</option>");
				} else {
					args[0].html("");
				}

				if(src[0] && src[0].group) {
					var group = false;
					var groupname = false;
					$.each(src, function(i,option) {
						if(groupname!=option.group) {
							if(groupname!=false){ args[0].append(group); }
							groupname = option.group
							group = $("<optgroup />").attr("label", groupname);
							if(group.class) { group.addClass(option.class); }
							if(group.disabled) { group.attr("disabled"); }
						}
						let opt = $("<option />").attr("value", option.value).html(option.label);
						if(option.class) { opt.addClass(option.class); }
						if(option.title) { opt.attr("title", option.title); }
						if(option.info) { opt.attr("data-info", option.info); }
						if(option.disabled) { opt.attr("disabled", "disabled"); }
						group.append(opt);
					});
					args[0].append(group);
				} else {
					$.each(src, function(i,option) {
						let opt = $("<option />").attr("value", option.value).html(option.label);
						if(option.class) { opt.addClass(option.class); }
						if(option.title) { opt.attr("title", option.title); }
						if(option.info) { opt.attr("data-info", option.info); }
						if(option.disabled) { opt.attr("disabled", "disabled"); }
						args[0].append(opt);
					});
				}

				if(elem.hasAttr("data-addnew")) {
					var urladd = jQuery.base64.atob(elem.data("addnew"));
					var addtext = (elem.hasAttr("data-addnewtext")) ? elem.data("addnewtext") : "Agregar";

					$("option:first", args[0]).after(
						$("<option />")
							.attr("value", "[--add-new-value--]")
							.html("[ "+addtext+" ]") 
							.click(function(){
								var dialog = jQuery.bithive.addNewValue(urladd, addtext, false, elem);
								elem.val("0").focus();
							})
					);
				}

				$.each(args[1], function(i,val){
					$("option[value='"+val+"']", args[0]).prop("selected", true);
				});

				if(args[2] && typeof args[2]=="function") { args[2](); }
			}, [elem,values,after]);
		},

		mkOptions: function(src, func, args) {
			var source = null;

			if(typeof src=="object") {
				source = src;
			} else if(src.indexOf("[")===0) {
				source = eval(src);
			} else {
				jQuery.bithive.httpRequests++;
				jQuery.ajax({
					url: src,
					dataType: "json",
					success: function(data) {
						source = data;
					},
					complete: function(response) {
						jQuery.bithive.httpRequests--;
					}
				});
			}

			var limit = 0;
			jQuery.bithive.httpRequests++;
			var loader = setInterval(function() {
				limit++;
				if(src=="") {
					clearInterval(loader);
					func("", args);
				} else if(typeof source=="object" && !!source) {
					clearInterval(loader);
					func(source, args);
				} else if(limit==50) {
					console.log("Request timeout: "+src);
					clearInterval(loader);
				}
				jQuery.bithive.httpRequests--;
			}, 200);
		},

		OptionsValues: function(elem) {
			if(elem.data("value")) {
				var values = new String(elem.data("value"));
				return values.split(";");
			} else {
				return [];
			}
		},

		print: function() {
			$("body").children().not("#bithive-loading").hideShow();
			$("body").addClass("bg-print");
			let printContent = $("#doccontent").clone();
			$(".no-print, .dropdown", printContent).remove();
			$("body").append(printContent);
			window.print();
			printContent.remove();
			$("body").children().not("#bithive-loading").hideShow();
			$("body").removeClass("bg-print");
		},

		loadDoc: function(target, href, after) {
			$(target).load(href, function(){
				jQuery.bithive.apply($(this));
				if(after) { after(); }
			});
		},

		postLink: function(href, values, target) {
			if(typeof target == "undefined") { var target = "_blank"; }
			var form = $("<form>").attr({"method": "post", "target": target, "action": href}).appendTo("body");
			if(values) {
				jQuery.each(values, function(key, value) {
					form.append($("<input>").attr({"type":"hidden", "name":key}).val(value));
				});
			}
			form[0].submit(function() {
				form.remove(); 
				return true
			});
		},

		parseMoney: function(str, decimal) {
			if(!decimal) { decimal = "."; }
			if(decimal==".") {
				return parseFloat(str.replace(/,/g, ""));
			} else {
				return parseFloat(str.replace(/./g, "").replace(/,/g, "."));
			}			
		},

		jsonFiller: function(parsed, targetElement, after) {
			jQuery.each(parsed, function(key, value) {
				var target = $("[data-id='"+key+"']", targetElement)
				if(target.is(":input")) {
					target.val(value);
				} else {
					target.html(value);
				}

				jQuery.bithive.styles(target, true);
			});
		},

		addNewValue: function(urladd, addtext, target, field) {
			if(!urladd) { return false; }
			if(!addtext) { addtext = "Agregar"; }
			if(!target) { target = false; }
			if(!field) {
				field = false;
				src = false;
			} else {
				src = jQuery.base64.atob(field.data("source"));
			}

			var dialog = BootstrapDialog.show({
				draggable: true,
				title: addtext,
				cssClass: "dialog-xl",
				message: $("<div>", {"class": "container-fluid"}).load(urladd, function(){
					var form = $(this).find("form");
					form.prop("addnewvalue", {"dialog":dialog, "source":src, "field":field, "target":target});

					$("<div>", {"class": "row"})
						.append(
							$("<div>", {"class": "col btnbox text-center"})
								.append(
									$("<input>", {
										"type": "button",
										"class": "btn btn-primary form-submit",
										"value": "Guardar"
									})
								)
								.append(
									$("<input>", {
										"type": "button",
										"class": "btn margin-md margin-only-left",
										"value": "Cancelar",
										"click": function(e) {
											dialog.close();
										}
									})
								)
						)
						.appendTo(form)
					;

					jQuery.bithive.apply($(this));
				})
			});

			return dialog;
		},

		fieldToggle: function(elem, fields, show, className) {
			if($(elem).prop("fieldToggleShow")==true) {
				$(elem).prop("fieldToggleShow", false);
				show = true;
			}

			if(typeof show == "undefined") { show = true; }
			if(typeof className == "undefined") { className = "d-none"; }
			$.each(fields, function(k,v){
				if(typeof v == "object") {
					var field = $(""+v[0]);
					var value = v[1];
				} else {
					var field = $(v);
					var value = "";
				}

				if(show) {
					field.closest(".form-group").removeClass(className);
				} else {
					field.closest(".form-group").addClass(className);
					field.val(value).change();
				}
			});
		}, 

		tableToPDF: function(elem) {
			var pdf = $("<div>").html(elem.clone());
			pdf.appendTo("body");
			
			// $("#doccontent", pdf).attr({"data-pdfcss": "width:200px"}); 

			$("*", pdf).not(":visible").remove();
			$(".no-print, .dropdown-menu", pdf).remove();

			$("div.pdf-table", pdf).each(function() {
				$("> div", $(this)).each(function() {
					$("> div", $(this)).each(function() {
						$(this).replaceWith($("<td>").html($(this).html()));
					});
					$(this).replaceWith($("<tr>", {valing:"top"}).html($(this).html()));
				});
				$(this).replaceWith($("<table>").attr({"data-pdfcss": "width:240px;border:solid 1px #000000"}).html($(this).html()));
			});

			pdf.cssInline(["table", "thead", "tbody", "tr", "th", "div"], [
				"color", "background-color", "font-size", "display",
				"margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
				"padding", "padding-top", "padding-right", "padding-bottom", "padding-left", 
			]);

			$("[data-inlinecss]", pdf).each(function(k, v) {
				var attrs = $(v).attr("data-pdfcss")+";" || "";
				attrs += jQuery.bithive.CSSToPDFConvert($(v).data("inlinecss"), 190, 1200);
				$(v).attr("data-pdfcss", attrs);
			});

			var pdfContent = pdf.html();
			pdf.remove();

			return pdfContent;
		},

		CSSToPDFConvert: function(inline, mm, px) {
			var regex = /(width|border-left|padding-left|margin-left|border-right|padding-right|margin-right):([0-9\.]+)(px|em|rem)/g;
			var matchs = $.getMatchAll(inline, regex);
			$.each(matchs, function(k, v){
				var regex = new RegExp(v[0], "g");
				var val = parseFloat(v[2]);
				if(v[3]!="px") { val = val/16; }
				if(val>0) {
					inline = inline.replace(regex, v[1] + ":" + (val * mm / px).toFixed(4)+"mm");
				}
			}); 
	
			var regex = /(height|border-top|padding-top|margin-top|border-bottom|padding-bottom|margin-bottom):([0-9\.]+)(px|em|rem)/g;
			var matchs = $.getMatchAll(inline, regex);
			$.each(matchs, function(k, v){
				var regex = new RegExp(v[0], "g");
				var val = parseFloat(v[2]);
				if(v[3]!="px") { val = val/16; }
				if(val>0) {
					inline = inline.replace(regex, v[1] + ":" + (val * mm / px).toFixed(4)+"mm");
				}
			});
	
			inline = inline.replace(/font\-family:(.*?);/g, "font-family:helvetica;");
			inline = inline.replace(/font\-size:(.*?);/g, "");
	
			return inline;
		}
	}
});