jQuery.extend(jQuery.bithive, {
	styles: function(elem, itself) {
		if(!elem) { var elem = $("body"); }
		if(typeof itself == "undefined") { var itself = false; }

		// TITLE -------------------------------------------------------------------------------
		$("title", elem).html($("title").text().replace(/(<([^>]+)>)/ig,""));
		
		// HELP --------------------------------------------------------------------------------
		$.bithive.eachElement("[data-help][data-help!='']", elem, itself, function() {
			$(this).append($("<i>", {class:"fas fa-question-circle text-grey ml-xs c-pointer"}).click(function(){
				$.bithive.help($(this).parent().data("help"));
			}));
		});

		// ACTION BUTTONS ----------------------------------------------------------------------
		// btn-back
		$.bithive.eachElement(".btn-back", elem, itself, function() {
			if(window.history.length > 1) {
				$(this).click(function() { window.history.back(); });
			} else {
				$(this).val($.bithive.lang.buttonClose);
				$(this).text($.bithive.lang.buttonClose);
				$(this).click(function() { window.close(); });
			}
		});

		// btn-print
		$(".btn-print", elem).addClass("no-print").click(function(e) {
			$.bithive.print();
		});

		// btn-delete
		$.bithive.eachElement(".btn-delete", elem, itself, function() {
			$(this).click(function(e) {
				if(!$(this).attr("onclick")) {
					e.preventDefault();
					let imya = $(this).data("imya") || null;
					if(imya!==null) {
						let href = ($(this).data("href")) ? $(this).data("href") : "delete";
						let secure = ($(this).hasAttr("data-secure")) ? true : false;
						if(href.indexOf("?")<0) { href += "?"; }

						$.bithive.confirm($.bithive.lang.confirmMsgDelete, function(dialog){
							let formData = new FormData();
							formData.append("imya", imya);

							let fkpass = $(".text-pwd", $("#"+dialog.options.id));
							if(fkpass.length) {
								formData.append("pwd", fkpass.prop("realvalue"));
							}
				
							$.ajax({
								type: "POST",
								url: href,
								data: formData,
								contentType: false,
								cache: false,
								processData: false,
								success: function(response) {
									if(parseInt(response)==response) {
										self.location.reload();
									} else {
										$.bithive.ResponseHandler(response);
									}
								}
							});
						}, secure);
					}
				}
			});
		});
		
		// TABS ------------------------------------------------------------
		$.bithive.eachElement("nav-tabs a", elem, itself, function() {
			$(this).click(function(e) {
				e.preventDefault();
				$(this).tab("show");
			});
		});

		if(jQuery().tabs) {
			$.bithive.eachElement("ul.nav-tabs", elem, itself, function() {
				$(this).tabs();
			});
		}

		// STEPS -----------------------------------------------------------
		if(jQuery().steps) {
			$.bithive.eachElement(".form-steps", elem, itself, function() {
				$(this).steps();
			});
		}

		// CONTEXTMENU -----------------------------------------------------
		$.bithive.eachElement(".ctxmenu", elem, itself, function() {
			var launcher = $(this);
			var ctxmenu = $(launcher.data("ctxmenu")) || $(".dropdown-menu", launcher);
			var onevent = launcher.data("ctxmenu-event") || "contextmenu";
			launcher.on(onevent, function(e) {
				if($.bithive.ctxmenu.menu) {
					$(".dropdown-menu", $.bithive.ctxmenu.menu).removeClass("show").hide();
					$.bithive.ctxmenu.menu.removeClass("show").hide();
				}

				$.bithive.ctxmenu.menu = ctxmenu;
				$.bithive.ctxmenu.top = e.clientY;
				$.bithive.ctxmenu.left = e.clientX;
				ctxmenu.prop("launcher", $(this));
				ctxmenu.css({
					display: "block",
					position: "fixed",
					top: ($.bithive.ctxmenu.top - 10),
					left: ($.bithive.ctxmenu.left - 10)
				}).addClass("show");
				
				return false;
			});

			$("a", ctxmenu).not(".dropdown-toggle").on("click", function() {
				ctxmenu.removeClass("show").hide();
			});
		});
		
		// SUBMENU ---------------------------------------------------------
		$.bithive.eachElement(".dropdown-submenu .dropdown-toggle", elem, itself, function(){
			$(this).click(function(e) {
				var submenu = $(this).next();
				$(".dropdown-submenu", submenu.parent()).removeClass("show");

				submenu.css({
					top: "0px",
					left: "100%",
					bottom: "auto"
				}).toggleClass("show");

				var offset = submenu.offset();

				if(offset.left + submenu.width() > $("body").width()) {
					submenu.css("left", submenu.width()*-1);
				}

				if(offset.top + submenu.height() > $("body").height()) {
					submenu.css({"top":"auto", "bottom":"0px"});
				}
			});
		});

		// CLIPBOARD -------------------------------------------------------
		if(jQuery().clipboard) {
			$.bithive.eachElement("[clipboard-target]", elem, itself, function(){
				$(this).click(function(e) {
					var clip = $(this);
					var target = clip.attr("clipboard-target");
					var message = clip.attr("clipboard-message") || $.bithive.lang.clipboardSuccess;
					var clasess = clip.attr("clipboard-clasess") || "btn btn-success btn-md mt-md";
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
			});

			$.bithive.eachElement("[clipboard-text]", elem, itself, function(){
				$(this).click(function(e) {
					var clip = $(this);
					var text = clip.attr("clipboard-text");
					var message = clip.attr("clipboard-message") || $.bithive.lang.clipboardSuccess;
					var clasess = clip.attr("clipboard-clasess") || "btn btn-success btn-md mt-md";
					$(this).clipboard({
						mode: false,
						text: text.replace(/\\n/g,"\n").replace(/\\t/g,"\t"),
						success_after: function(e) { e.clearSelection(); },
						success_notify: {
							message: message,
							classes: clasess
						}
					});
				});
			});
		}

		// FORMATS ---------------------------------------------------------
		// booleans
		$.bithive.eachElement(".format-boolean", elem, itself, function() {
			var options = ($(this).hasAttr("format-custom")) ? $(this).attr("format-custom").split(";") : [$.bithive.lang.valueYes,$.bithive.lang.valueNo];
			$(this).html(($(this).html()!="0" && $(this).html()!="false" && $(this).html()!="") ? options[0] : options[1]);
		});

		// case [ format-custom: {"value":"label","value":"label","value":"label"} ]
		// valor = string. Separar con , para multiples valores
		$.bithive.eachElement(".format-case", elem, itself, function() {
			let options = ($(this).hasAttr("format-custom")) ? jQuery.parseJSON($(this).attr("format-custom")) : [$.bithive.lang.valueNo,$.bithive.lang.valueYes];
			let vals = $(this).html().split(",");
			let replaces = [];
			$.each(vals, function() {
				if(options[this]) { replaces.push(options[this]); }
			});
			if(replaces.length) { $(this).html(replaces.join(",")); }
		});

		// dates
		if(jQuery().dateformat) {
			$.bithive.eachElement(".format-date", elem, itself, function() { $(this).dateformat("dd/mm/yyyy"); });
			$.bithive.eachElement(".format-month", elem, itself, function() { $(this).dateformat("mm/yyyy"); });
			$.bithive.eachElement(".format-time", elem, itself, function() { $(this).dateformat("HH:ii:ss"); });
			$.bithive.eachElement(".format-hour", elem, itself, function() { $(this).dateformat("HH:ii"); });
			$.bithive.eachElement(".format-datetime", elem, itself, function() { $(this).dateformat("dd/mm/yyyy HH:ii:ss"); });
			$.bithive.eachElement(".format-cusdate", elem, itself, function(){ $(this).dateformat($(this).attr("format-custom")); });
		}

		// numbres
		if((typeof wNumb != "undefined") && jQuery().numberformat) {
			$.bithive.eachElement(".format-number", elem, itself, function() {
				$(this).numberformat({"decimal":0});
			});

			$.bithive.eachElement(".format-money", elem, itself, function() {
				var custom = $(this).attr("format-custom") || "";
				custom = custom.split(";");
				if(custom[1]) {
					var currency = custom[0];
					var decimal = parseInt(custom[1]);
				} else {
					var currency = (parseInt(custom[0])!=custom[0]) ? custom[0] : "";
					var decimal = (parseInt(custom[1])==custom[1]) ? custom[1] : 2;
				}
				
				if(!$.bithive.dynCSS.formats[currency]) {
					var curclass = jQuery.uid();
					$.bithive.dynCSS.formats[currency] = curclass;
					$('<style>.format-money.'+curclass+':before{content:"'+currency+'"}</style>').appendTo("head");
				} else {
					var curclass = $.bithive.dynCSS.formats[currency];
				}
				var decimal = $(this).attr("format-custom") || 2;
				$(this).addClass("text-right "+curclass).numberformat({"format":"money", "decimals":decimal});
			});

			$.bithive.eachElement(".format-decimal", elem, itself, function() {
				var decimal = $(this).attr("format-custom") || 2;
				$(this).addClass("text-right").numberformat({"format":"decimal", "decimals":decimal});
			});

			$.bithive.eachElement(".format-percent", elem, itself, function() { $(this).numberformat("percent"); });
		}

		$.bithive.eachElement(".format-zerofill", elem, itself, function(){
			var zeros = parseInt($(this).attr("format-custom")) || 5;
			var zerospad = new Array(1 + zeros).join("0");
			$(this).text((zerospad + $(this).text()).slice(-zerospad.length));
		})
		
		// DIALOGS ---------------------------------------------------------
		if(typeof BootstrapDialog != "undefined") {
			$.bithive.eachElement(".dialog-close", elem, itself, function() {
				$(this).click(function(e) {
					$(".bootstrap-dialog-close-button", $(this).closest(".modal")).trigger("click");
				});
			});

			$.bithive.eachElement(".dialog-content", elem, itself, function() {
				$(this).click(function(e) {
					e.preventDefault();
					var options = $(this).hyphened("dialog");
					$.bithive.modal(options);
				});
			});

			$.bithive.eachElement(".dialog-link", elem, itself, function() {
				$(this).click(function(e) {
					e.preventDefault();
					var launcher	= $(this);
					var options		= launcher.hyphened("dialog");
					var id			= options.id || jQuery.uid();
					var classes		= (options.class) ? " "+options.class : " ";
					var size		= (options.size) ? "dialog-"+options.size : "";
					var title		= options.title || "&nbsp;";
					var closable	= (typeof options.closable == "undefined") ? true : options.closable;
					var btnClose	= (options.close) ? [{ label: options.close, cssClass: "btn-primary pull-center", action: function(dialogItself){ dialogItself.close(); }}] : null;
					
					// los elementos de la respuesta que tengan el atributo dialog-close, cerraran el dialogo
					var dialogLinkLoaded = false;
					var dialogOptions = {
						draggable: true,
						title: title,
						closable: closable,
						message: $("<div></div>").id(id).addClass("container-fluid"+classes).load(options.href, function(){ dialogLinkLoaded = true; }),
						cssClass: size,
						onshow: function(dialogRef){
							if(options.before) { $.bithive.run(options.before, launcher); }
						},
						onshown: function(dialogRef){
							var body = $("#"+id);
							var dialogLinkInterval = setInterval(function() {
								if(dialogLinkLoaded) {
									$.bithive.apply(body);
									$("[dialog-close]", body).click(function(){ dialogRef.close(); });
									if(options.after) { $.bithive.run(options.after, launcher); }
									clearInterval(dialogLinkInterval);
								}
							}, 100);
						}
					};
					
					if(btnClose!=null) { dialogOptions.buttons = btnClose; }
					var dialog = BootstrapDialog.show(dialogOptions);
				});
			});

			// genera un dialogo de confirmacion
			$.bithive.eachElement(".dialog-confirm", elem, itself, function() {
				$(this).click(function(e) {
					let launcher = $(this);
					var options = {
						title: 		$.bithive.lang.confirmTitle, // titulo de la ventana
						message:	$.bithive.lang.confirmQuestion, // mensaje
						js:			null,	// codigo JS que ejecutará en caso afirmativo. Si esta presente NO se ejecutara href
						href:		null,	// URL que ejecutará en caso afirmativo. Si esta presente NO se ejecutara js
											// ---
						hrefafter:	null,	// URL que ejecutará en caso afirmativo luego de ejecutar href
						target:		null,	// selector jquery donde se cargara href o hrefafter
											// ---
						after:		null	// funcion que se ejecutará en caso afirmativo si no existe href
					};
					
					options = $.extend({}, options, $(this).hyphened("dialog"));

					BootstrapDialog.confirm({
						draggable: true,
						title: options.title,
						message: options.message,
						type: BootstrapDialog.TYPE_DANGER,
						btnCancelLabel: $.bithive.lang.buttonCancel,
						btnCancelClass: "btn-default",
						btnOKLabel: $.bithive.lang.buttonOk,
						btnOKClass: "btn-danger",
						callback: function(result) {
							if(result) {
								if(typeof window[options.js] == "function") {
									window[options.js](launcher);
								} else if(options.href) {
									if(options.target) {
										if(options.hrefafter) {
											$.get(options.href, function(response) {
												$(options.target).load(options.hrefafter, function() {
													$.bithive.apply($(options.target));
												});
											});
										} else {
											$(options.target).load(options.href, function() {
												$.bithive.apply($(options.target));
											});
										}
									} else {
										self.location.href = options.href;
									}
								} else {
									setTimeout(function() { $.bithive.run(options.after); }, 100);
								}
							}
						}
					});
				});
			});
		}
		
		// LINKS -----------------------------------------------------------
		// abre un link en un target
		$.bithive.eachElement(".link-in", elem, itself, function() {
			$(this).click(function(e) {
				e.preventDefault();
				var href = $(this).attr("href") || $(this).data("href");
				var target = $(this).attr("target") || $(this).data("target");
				var after = $(this).data("after");
				$(target).load(href, function() {
					$.bithive.apply($(target));
					if(after) {
						$.bithive.run(after);
					}
				});
			});
		});

		// solicita confirmacion en un link
		$.bithive.eachElement(".link-confirm", elem, itself, function() {
			$(this).click(function(e) {
				e.preventDefault();
				let target = $(this).attr("target") || "_top";
				let href = $(this).data("href") || $(this).attr("href")
				let confirm = $(this).data("confirm") || $.bithive.lang.confirmQuestion;
				let secure = $(this).data("secure") || null;
				$.bithive.confirm(confirm, function(){
					window.open(href, target);
				}, secure);
			});
		});

		// solicita confirmacion en un link ajax-get
		$.bithive.eachElement(".link-confirm-ajax", elem, itself, function() {
			$(this).click(function(e) {
				e.preventDefault();
				let href = $(this).data("href") || $(this).attr("href");
				let confirm = $(this).data("confirm") || $.bithive.lang.confirmQuestion;
				let after = $(this).data("after") || null;
				let secure = $(this).data("secure") || null;
				$.bithive.confirm(confirm, function(){
					jQuery.ajax({
						url: href,
						dataType: "text",
						success: function(response) {
							if(after) { window[after](response); }
						}
					});
				}, secure);
			});
		});

		// genera un link post basado en un href y un json
		$.bithive.eachElement(".link-post", elem, itself, function() {
			$(this).click(function(e) {
				let btn = $(this);
				e.preventDefault();
				var href = $(this).data("href") || false;
				if(href!==false) {
					var target = $(this).attr("target") || $(this).data("target") || null;
					var query = $(this).data("values") || false;
					if(query===false) {
						var url = document.createElement("a");
						url.href = href;
						query = url.search;
					}
					var confirm = $(this).data("confirm") || false;
					var values = (!query) ? false : (typeof query == "string") ? jQuery.parseURL(query) : query;
					if(confirm) {
						$.bithive.confirm(confirm, function(){ $.bithive.postLink(btn, href, values, target); });
					} else {
						$.bithive.postLink(btn, href, values, target);
					}
				}
			});
		});

		// convierte un fa icon en un toggler de estados
		$.bithive.eachElement("i.link-toggler", elem, itself, function() {
			let classOn = $(this).attr("toggler-class-on") || "text-green";
			let classOff = $(this).attr("toggler-class-off") || "text-red";
			let faIcon = $(this).attr("toggler-faicon") || "fa-dot-circle";

			$(this)
				.prop({
					"togglerClassOn": "fas "+faIcon+" "+classOn,
					"togglerClassOff": "fas "+faIcon+" "+classOff,
					"togglerOnWhen": (parseInt($(this).attr("toggler-on")) || 1)
				})
				.addClass(function(){
					return ($(this).attr("toggler-value")==$(this).prop("togglerOnWhen")) ? $(this).prop("togglerClassOn"): $(this).prop("togglerClassOff");
				})
				.click(function(){
					let el = $(this);
					let id = el.attr("toggler-id"); // id del registro
					let val = el.attr("toggler-value"); // valor actual del estado (0|1)
					let url = el.attr("toggler-url"); // url que administra los estados
					let after = el.attr("toggler-after") || null; // funcion que se ejecuta luego del cambio de estado  funcname(el, state)
					el.removeClass(el.prop("togglerClassOn")+" "+el.prop("togglerClassOff"));
					el.addClass("fas fa-circle-notch text-light-gray spinRight");
					jQuery.ajax({
						url: url,
						data: {"id":id, "state":val},
						dataType: "json",
						success: function(data) {
							let nval = parseInt(data);
							el.attr("toggler-value", nval).removeClass("fas fa-circle-notch text-light-gray spinRight");
							if(nval==el.prop("togglerOnWhen")) {
								el.addClass(el.prop("togglerClassOn"));
							} else {
								el.addClass(el.prop("togglerClassOff"));
							}

							if(after) { window[after](el, nval); }
						}
					});
				});
		});
		
		// TABLES ----------------------------------------------------------
		// full colspan
		$(".colspanall", elem).each(function() {
			var cols = $(this).closest("table").find("tr:first th,td").length;
			$(this).attr("colspan", cols);
		});

		// filtros
		if(jQuery().tablefilter) {
			// utilizar data-filter="none" en los th que no deben tener la opcion
			$.bithive.eachElement("table.table-filter", elem, itself, function(){
				$(this).tablefilter({
					afterFilter: function(table) {
						table.trigger("runtotals");
					}
				});
			});
			
			// filtros ocultos al inicio
			$.bithive.eachElement("table.table-filter-hidden", elem, itself, function(){
				$(this).tablefilter({
					afterFilter: function(table) {
						table.trigger("runtotals");
					},
					hidden: true
				});
			});
		}

		// orden
		if(jQuery().tablesorter) {
			// utilizar data-sorter="none" en los th que no deben tener la opcion
			$.bithive.eachElement("table.table-sorter", elem, itself, function(){
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

		// table scroll
		$.bithive.eachElement("table.table-scroll", elem, itself, function(){
			let fixed = $(this).data("scroll-fixed") || "400px"; 
			$(this).prop("tableScroll", true);
			$("tbody", $(this)).css({
				"width": "100%",
				"height": "calc( 100vh - "+fixed+")",
				"overflow-y": "auto",
				"overflow-x": "hidden"
			});

			$(this).on("resize", function() {
				let table = $(this);
				if(jQuery().slimScroll) {
					let slim = $(".slimScrollDiv", table);
					if(slim.length) {
						$("tbody", slim).insertBefore(slim);
						slim.remove();
					}
				}

				$("thead, tbody, tfoot", table).removeClass("d-block");
				var cells = table.find("tbody tr:first").children();

				table.find("thead tr").children().css("min-width", "");
				cells.css("min-width", "");
				table.find("tfoot tr").children().css("min-width", "");
				let cols = cells.map(function() {
					return $(this).innerWidth();
				}).get();

				cells.each(function(i, v) {
					$(v).css("min-width", cols[i]);
				}).promise().done(function(){
					table.find("thead tr").children().each(function(i, v) {
						$(v).css("min-width", cols[i]);
					}).promise().done(function(){
						table.find("tfoot tr").children().each(function(i, v) {
							$(v).css("min-width", cols[i]);
						}).promise().done(function(){
							$("thead, tbody, tfoot", table).addClass("d-block");
							if(jQuery().slimScroll) {
								$("tbody", table).slimScroll({
									"height": $("tbody", table).height()+"px",
									"alwaysVisible": true,
									"railOpacity": .1
								});
							}
						});
					});
				});
			}).trigger("resize");
		});

		// tabla para pantallas chicas
		if(jQuery().tablexs) {
			$.bithive.eachElement("table.table-xs", elem, itself, function(){
				var table = $(this);
				table.tablexs();

				// filtros
				if($("tr.filters", $(this))[0]) {
					var row = $("tr.filters", $(this));
					var btnFilters = $("<span>", {class: "action-button d-block d-lg-none"}).append(
						$("<a>", {class:"btn btn-white m-sm mr-n"})
							.html('<i class="fa fa-filter icon-xs">')	
							.click(function(){
								if(!$.bithive.isSmallScreen() || row.prop("xs-filter")) { return true; }
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
			$.bithive.eachElement(".table2excel", elem, itself, function(){
				var table = $($(this).data("table"));
				$(this).click(function(e) {
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
		$.bithive.eachElement("[data-columns]", elem, itself, function() {
			let btn = $(this);
			let columns = $(btn.data("columns"));
			if(typeof columns[0]=="undefined") { btn.remove(); return false; }

			let table = $(columns[0].closest("table"));
			let menu = $(".dropdown-menu", btn);

			$.each(columns, function() {
				let div = $("<div>", {class:"dropdown-item c-pointer", idx: this.cellIndex}).prop("colsTable", table);
				let labelText = ($(this).text().trim().length) ? $(this).text().trim() : "_____";
				let label = $("<label>", {class: "c-pointer"}).html(labelText.substring(0,32));
				let checkbox = $("<i>", {class: "fas fa-check icon-sm text-primary m-sm mr-o"});

				let toggler = div.html(checkbox).append(label).prop({
					"colsTable": table,
					"colsIdx": this.cellIndex+1,
					"colsVisible": ($(this).css("display")!="none" ? true : false)
				});

				if(jQuery.cookie) {
					if(typeof $.cookie("col_"+toggler.prop("colsIdx"))!="undefined") {
						toggler.prop("colsVisible", $.cookie("col_"+toggler.prop("colsIdx")));
					}
				}

				toggler.click(function(){
					let togg = $(this);
					$("i", togg).toggleClass("text-primary text-light-gray");
					if(togg.prop("colsVisible")) {
						togg.prop("colsVisible", false);
						$("th:nth-child("+(togg.prop("colsIdx"))+"), td:nth-child("+(togg.prop("colsIdx"))+")", togg.prop("colsTable")).css("cssText", "display:none !important");
					} else {
						togg.prop("colsVisible", true);
						$("th:nth-child("+(togg.prop("colsIdx"))+"), td:nth-child("+(togg.prop("colsIdx"))+")", togg.prop("colsTable")).removeClass("d-none").css("display","");
					}
					if(jQuery.cookie) { $.cookie("col_"+togg.prop("colsIdx"), togg.prop("colsVisible")); }
				});

				if(!toggler.prop("colsVisible")) {
					toggler.prop("colsVisible", true);
					toggler.trigger("click");
					$(window).resize(function() { toggler.trigger("init"); });
				} else {
					$(this).removeClass("d-none");
				}

				menu.append(div);
				menu.click(function(e){
					e.stopPropagation();
				});
			});
		});

		// totales
		if(jQuery().tabletotal) {
			// utilizar data-total="none" en los th que no deben tener la opcion
			$.bithive.eachElement("table.table-total", elem, itself, function(){
				var before = $(this).data("total-before") || false;
				var after = $(this).data("total-after") || false;
				var row = $(this).data("total-row") || false;
				$(this).tabletotal({
					cssClass: "table-xs-row",
					before: function(table) {
						if(after && typeof window[before]==="function") { window[before](table); }
					},
					after: function(table) {
						$.bithive.apply($("thead", table), true);
						$.bithive.apply($("tfoot", table), true);
						if(after && typeof window[after]==="function") { window[after](table); }
					},
					row: function(tr) {
						if(row && typeof window[row]==="function") {  window[row](tr); }
					}
				});
			});
		}

		/* tooltips */
		$("[data-toggle='tooltip']").each(function(){
			$(this).tooltip({
				"html": true,
				"placement": "auto" 
			});
		});

		/* btrigger*/
		$.bithive.eachElement("[btrigger]", elem, itself, function() {
			let el = $(this);
			val = el.attr("btrigger").split(",");
			let evn = (typeof val[1]!="undefined") ? val[1] : "click";
			let ref = (typeof val[2]!="undefined") ? val[2] : $.uid();
			let id = "[btrigger='"+el.attr("btrigger")+"'";
			el.prop("btrigger", [id,evn,ref]).on(evn, function(){
				$.bithive.btrigger.set($(this).prop("btrigger"));
			})
		});

		/* copy */
		$.bithive.eachElement(".copyable", elem, itself, function() {
			let content = $(this);
			let text = content.text();
			if(text.length) {
				$("<i>", {class:"far fa-copy mr-xs c-pointer"}).click(function(){
					$(this).clipboard({
						mode: false,
						text: text,
						success_after: function(e) { e.clearSelection(); },
						success_notify: {
							message: $.bithive.lang.clipboardSuccess
						}
					});
				}).prependTo(content);
			}
		});

		return true;
	}
});