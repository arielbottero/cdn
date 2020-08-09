jQuery.extend({
	bithive : {
		apply: function(elem) {
			if(!elem) { var elem = $("body"); }
			var $this = this;
			$.each(elem, function(){
				$this.styles(this);
				$this.forms(this);
			});
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

		styles: function(elem) {
			if(!elem) { var elem = $("body"); }
			
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
			
			// TABS --------------------------------------------------------------------------------
			$("nav-tabs a", elem).click(function(e) {
				e.preventDefault();
				$(this).tab("show");
			});

			if(jQuery().tabs) {
				$("ul.nav-tabs", elem).tabs();
			}

			// CLIPBOARD --------------------------------------------------------------------------------
			if(jQuery().clipboard) {
				$("[clipboard-target]", elem).click(function(){
					var clip = $(this);
					var target = clip.attr("clipboard-target");
					var message = clip.attr("clipboard-message") || "datos copiados al portapapeles";
					var clasess = clip.attr("clipboard-clasess") || "btn btn-success btn-md margin-md margin-only-top";
					$(this).clipboard({
						target: target,
						success_after: function(e) { e.clearSelection(); },
						success_notify: {
							message: message,
							classes: clasess
						}
					});
				});

				$("[clipboard-text]", elem).click(function(){
					var clip = $(this);
					var text = clip.attr("clipboard-text");
					var message = clip.attr("clipboard-message") || "datos copiados al portapapeles";
					var clasess = clip.attr("clipboard-clasess") || "btn btn-success btn-md margin-md margin-only-top";
					$(this).clipboard({
						text: text,
						success_after: function(e) { e.clearSelection(); },
						success_notify: {
							message: message,
							classes: clasess
						}
					});
				});
			}

			// FORMATS -----------------------------------------------------------------------------
			// booleans
			$(".format-boolean", elem).each(function() {
				var options = ($(this).hasAttr("format-custom")) ? $(this).attr("format-custom").split(";") : ["SI","NO"];
				$(this).html(($(this).html()=="1" || $(this).html()=="true") ? options[0] : options[1]);
			});

			// case [ format-custom: {value:label;value:label;value:label} ]
			$(".format-case", elem).each(function() {
				var options = ($(this).hasAttr("format-custom")) ? jQuery.parseJSON($(this).attr("format-custom")) : ["NO", "SI"];
				$(this).html(options[$(this).html()]);
			});

			// dates
			if(jQuery().dateformat) {
				$(".format-date", elem).dateformat("dd/mm/yyyy");
				$(".format-month", elem).dateformat("mm/yyyy");
				$(".format-time", elem).dateformat("HH:ii:ss");
				$(".format-hour", elem).dateformat("HH:ii");
				$(".format-datetime", elem).dateformat("dd/mm/yyyy HH:ii:ss");
				$(".format-cusdate", elem).each(function(){
					$(this).dateformat($(this).attr("format-custom"));
				});
			}

			// numbres
			if((typeof wNumb != "undefined") && jQuery().numberformat) {
				$(".format-number", elem).each(function() {
					$(this).numberformat({"decimal":0});
				});

				$(".format-money", elem).each(function() {
					var currency = $(this).attr("format-custom") || "";
					$(this).numberformat({"format":"money", "prepend":currency});
				});

				$(".format-decimal", elem).each(function() {
					var decimal = $(this).attr("format-custom") || 2;
					$(this).numberformat({"format":"decimal", "decimal":decimal});
				});

				$(".format-percent", elem).numberformat("percent");
			}

			$(".format-zerofill", elem).each(function(){
				var zeros = parseInt($(this).attr("format-custom")) || 5;
				var zerospad = new Array(1 + zeros).join("0");
				$(this).text((zerospad + $(this).text()).slice(-zerospad.length));
			})
			
			// DIALOGS -----------------------------------------------------------------------------
			if(typeof BootstrapDialog != "undefined") {
				$(".dialog-link", elem).click(function(e) {
					e.preventDefault();
					var options		= $(this).hyphened("dialog");
					var id			= options.id || jQuery.uid();
					var classes		= (options.class) ? " "+options.class : " ";
					var size		= (options.size) ? "dialog-"+options.size : "";
					var title		= options.title || "&nbsp;";
					var btnClose	= (options.close) ? [{ label: options.close, cssClass: "btn-primary pull-center", action: function(dialogItself){ dialogItself.close(); }}] : null;
					
					var dialogOptions = {
						draggable: true,
						title: title,
						message: $("<div></div>").id(id).addClass("container-fluid"+classes).load(options.href),
						cssClass: size,
						onshown: function(dialogRef){
							var body = $("#"+id);
							setTimeout(function() {
								jQuery.bithive.apply(body);
							}, 100);
							if(options.after) { jQuery.bithive.run(options.after); }
						}
					};
					
					if(btnClose!=null) { dialogOptions.buttons = btnClose; }
					var dialog = BootstrapDialog.show(dialogOptions);
				});

				// genera un dialogo de confirmacion
				$(".dialog-confirm", elem).click(function(e) {
					var options = {
						title: 		"Confirmar", // titulo de la ventana
						message:	"Confirma?", // mensaje
						href:		null,		 // URL que ejecutarÃ¡ en caso afirmativo
												 // ---
						hrefafter:	null,		 // URL que ejecutarÃ¡ en caso afirmativo luego de ejecutar href
						target:		null,		 // selector jquery donde se cargara href o hrefafter
												 // ---
						after:		null		 // funcion que se ejecutarÃ¡ en caso afirmativo si no existe href
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
								if(options.href) {
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
			
			// LINKS -------------------------------------------------------------------------------
			// abre un link en un target
			$(".link-in", elem).click(function(e) {
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
			$(".link-post", elem).click(function() {
				var href = $(this).attr("href") || $(this).data("href");
				var target = $(this).attr("target") || $(this).data("target") || null;
				var values = null;
				var query = $(this).data("values") || null;
				if(query) { values = (typeof query == "string") ? jQuery.parseURL(query) : query; }
				jQuery.bithive.postLink(href, values, target);
			});
			
			// TABLES ------------------------------------------------------------------------------
			// full colspan
			$(".colspanall").each(function() {
				var cols = $(this).closest("table").find("tr:first th,td").length;
				$(this).attr("colspan", cols);
			});
			
			// filtros
			if(jQuery().tablefilter) {
				// utilizar data-filter="none" en los th que no deben tener la opcion
				$("table.table-filter", elem).tablefilter({
					"after": function(table) { table.trigger("runtotals"); }
				});
				
				// filtros ocultos al inicio
				$("table.table-filter-hidden", elem).tablefilter({
					after: function(table) { table.trigger("runtotals"); },
					hidden: true
				});
			}

			// tabla para pantallas chicas
			if(jQuery().tablexs) {
				$("table.table-xs", elem).tablexs();
			}

			// orden
			if(jQuery().tablesorter) {
				// utilizar data-sorter="none" en los th que no deben tener la opcion
				$("table.table-sorter", elem).each(function(){
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
				$("table.table-total", elem).tabletotal({
					after: function(row) { jQuery.bithive.apply(row); }
				});
			}

			// table to excel
			if(jQuery().table2excel) {
				$(".table2excel", elem).each(function(){
					var table = $($(this).data("table"));
					$(this).click(function() {
						var filename = ($(this).data("filename") || "document.xlsx").split(".");
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
									exclude: ".excel-false",
									filename: filename[0],
									fileext: "."+filename[1]
								});
						} else {
							table.table2excel({
								exclude: ".excel-false",
								filename: filename[0],
								fileext: "."+filename[1]
							});
						}
					});
				});
			} 

			$("[togglecols]", elem).each(function() {
				var toggler = $(this);
				var columns = $("."+toggler.attr("togglecols"));
				var table = $(columns[0].closest("table"));
				$.each(columns, function() {
					$("th:nth-child("+(this.cellIndex+1)+"), td:nth-child("+(this.cellIndex+1)+")", table).fadeToggle("slow");
				});

				toggler.click(function() {
					$.each(columns, function() {
						$("th:nth-child("+(this.cellIndex+1)+"), td:nth-child("+(this.cellIndex+1)+")", table).fadeToggle("slow");
					});
				})
			});

	
			$("[data-columns]", elem).each(function() {
				var btn = $(this);
				var columns = $(btn.data("columns"));
				var table = $(columns[0].closest("table"));

				var menu = $(".dropdown-menu", btn);
				$.each(columns, function() {
					var div = $("<div>", {class:"dropdown-item c-pointer", idx: this.cellIndex});
					var label = $("<label>", {class: "c-pointer", for:"col-"+this.cellIndex}).html($(this).text());
					var checkbox = $("<i>", {class: "fas fa-check icon-sm text-primary m-sm mr-o"});

					div.html(checkbox).append(label).click(function(){
						$("i", $(this)).toggleClass("text-primary text-light-gray");
						$("th:nth-child("+(parseInt($(this).attr("idx"))+1)+"), td:nth-child("+(parseInt($(this).attr("idx"))+1)+")", table).each(function(k,v){
							var cell = $(this);
							if(cell.is(":hidden")) {
								cell.fadeIn();
								cell.removeClass("excel-false");
								if(cell.prop("excelfalse")) {
									cell.addClass("excel-false");
								}
							} else {
								cell.fadeOut();
								if(cell.hasClass("excel-false")) {
									cell.prop("excelfalse", true);
								} else {
									cell.addClass("excel-false");
								}
							}
						});
					});

					menu.append(div);
					menu.click(function(e){
						e.stopPropagation();
					});
				});
			});

			// botones de control
			// se aplica al final de los plugins de tablas
			$("[table-buttons]", elem).each(function() {
				var buttons = $(this);
				var table = $(buttons.attr("table-buttons"));

				$("[data-btn]", buttons).each(function() {
					var btn = $(this);
					var action = btn.data("btn");
					
					if(action=="copy") {
						btn.click(function() {
							var cpy = table.clone();
							$(".copy-false", cpy).remove();
							$("body").append(cpy);
							cpy.css({"position":"absolute", "top":"-10000px"});
							
							$(this).clipboard({
								target: cpy,
								success_after: function(e) {
									e.clearSelection();

									var content = e.text;
									content = content.replace('"', '\"');
									content = content.replace(/[ ]*\t[ ]*/g, '","');
									content = content.replace(/(\r\n|\n\r|\n)/gm, '"\n');
									content = content.replace(/^/gm, '"');
									
									new Clipboard(cpy[0], {text: function(trigger) { return content; }});
									cpy.trigger("click").remove();
								},
								success_notify: {
									message: "datos copiados al portapapeles",
									classes: "btn btn-success btn-md margin-md margin-only-top"
								}
							});
						});
					}
					
					switch(action) {
						case "copy":
							btn.click(function() {
								$(this).clipboard({
									target: table,
									success_after: function(e) {
										e.clearSelection();
									},
									success_notify: {
										message: "datos copiados al portapapeles",
										classes: "btn btn-success btn-md margin-md margin-only-top"
									}
								});
							});
							break;
						
						case "copycsv":
							btn.click(function() {
								var cpy = table.clone();
								$(".copy-false", cpy).remove();
								$("body").append(cpy);
								cpy.css({"position":"absolute", "top":"-10000px"});
								
								$(this).clipboard({
									target: cpy,
									success_after: function(e) {
										e.clearSelection();

										var content = e.text;
										content = content.replace('"', '\"');
										content = content.replace(/[ ]*\t[ ]*/g, '","');
										content = content.replace(/(\r\n|\n\r|\n)/gm, '"\n');
										content = content.replace(/^/gm, '"');
										
										new Clipboard(cpy[0], {text: function(trigger) { return content; }});
										cpy.trigger("click").remove();
									},
									success_notify: {
										message: "datos copiados al portapapeles",
										classes: "btn btn-success btn-md margin-md margin-only-top"
									}
								});
							});
							break;

						case "excel":
							btn.click(function() {
								table.table2excel({
									exclude: ".excel-false",
									name: table.attr("id"),
									filename: (btn.data("filename") || "document"),
									fileext: ".xlsx"
								});
							});
							break;
/*
						case "colstoggle":
							var columns = $(".colhide", table);
							btn.click(function() {
								$.each(columns, function() {
									$("th:nth-child("+(this.cellIndex+1)+"), td:nth-child("+(this.cellIndex+1)+")", table).fadeToggle("slow");
								});
							});
							
							$.each(columns, function() {
								$("th:nth-child("+(this.cellIndex+1)+"), td:nth-child("+(this.cellIndex+1)+")", table).hide();
							});
							break;
*/
					}

				});
			});

			/* tooltips */
			$("[data-toggle='tooltip']").tooltip({
				"html": true,
				"placement": "auto"
			});
		},

		forms: function(form) {
			if(!form) { var form = $("body"); }

			$(".nonote").each(function(){
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
						}
					});
				});
			});

			// ATTACHER ----------------------------------------------------------------------------
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

			// AUTOCOMPLETE ------------------------------------------------------------------------
			$("input.form-autocomplete", form).each(function() {
				var field = $(this);
				var target = field.data("target") || null;
				var after = field.data("after") || null;
				var addtext = field.data("addtext") || null;
				var addsource = field.data("addsource") || null;

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
						if(ui.item.value=="[--add-new-value--]") {
							field.val("");
							target.val("");
							var urladd = jQuery.base64.atob(addsource);
							urladd = jQuery.bithive.RefToVal(urladd);
							jQuery.bithive.addNewValue(urladd, addtext, target, field);
						} else {
							setTimeout(function() { field.val(ui.item.label); },10);
							target.val(ui.item.value);
							if(after) { jQuery.bithive.run(after, [field, ui.item]); } // [elemento, objeto(value option)]
						}
					},
					response: function(event, ui) {
						if(addtext) {
							ui.content.push({"label":addtext, "value":"[--add-new-value--]"});
							$(this).autocomplete("widget").addClass("form-autocomplete-addtext"); 
						}
					}
				}).on("focus", function() {
					$(this).prop("oldlabel", $(this).val());
					$(this).prop("oldval", target.val());
					$(this).val("");
				}).on("blur", function() {
					if(target.val()==$(this).prop("oldval")) {
						$(this).val($(this).prop("oldlabel"));
					}
				});

				// update mode
				if(field.val()!="") {
					var current = field.val();
					if(src.indexOf("[")===0) {
						$.each(source, function(key, item) {
							if(item.value==current) {
								target.val(current);
								field.val(item.label);
								if(after) { jQuery.bithive.run(after, [field, item]); }
								return false;
							}
						});
					} else {
						jQuery.ajax({
							url: jQuery.bithive.RefToVal(src),
							dataType: "json",
							data: { i:1, q: field.val() },
							success: function(data) {
								$.each(data, function(key, item) {
									if(item.value==current) {
										target.val(current);
										field.val(item.label);
										if(after) { jQuery.bithive.run(after, [field, item]); }
										return false;
									}
								});
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
					selectYear: "Selecionar AÃ±o",
					prevYear: "Anterior AÃ±o",
					nextYear: "Siguiente AÃ±o",
					selectDecade: "Selecionar Decada",
					prevDecade: "Anterior DÃ©cada",
					nextDecade: "Siguiente DÃ©cada",
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
							if(type=="datepicker") {
								linked.val(moment(e.date).format("YYYY-MM-DD"));
							} else if(type=="datetimepicker") {
								linked.val(moment(e.date).format("YYYY-MM-DD HH:mm:ss"));
							} else if(type=="monthpicker") {
								linked.val(moment(e.date).format("YYYY-MM")+"-01");
							} else if(type=="yearpicker") {
								linked.val(moment(e.date).format("YYYY"));
							} else {
								linked.val(moment(e.date).format(formats[type]));
							}
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
							if(type=="datepicker") {
								linked1.val(moment(e.date).format("YYYY-MM-DD"));
							} else if(type=="datetimepicker") {
								linked1.val(moment(e.date).format("YYYY-MM-DD HH:mm:ss"));
							} else if(type=="monthpicker") {
								linked1.val(moment(e.date).format("YYYY-MM-")+"01");
							} else {
								linked1.val(moment(e.date).format(formats[type]));
							}
							dp2.data("DateTimePicker").minDate(e.date);
						});

						var linked2 = $("[data-linked-me='"+dp2.data("linked-with")+"']", dp2.parent());
						dp2.on("dp.change", function (e) {
							if(type=="datepicker") {
								linked2.val(moment(e.date).format("YYYY-MM-DD"));
							} else if(type=="datetimepicker") {
								linked2.val(moment(e.date).format("YYYY-MM-DD HH:mm:ss"));
							} else if(type=="monthpicker") {
								linked2.val(moment(e.date).format("YYYY-MM-")+"01");
							} else {
								linked2.val(moment(e.date).format(formats[type]));
							}
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
			if(jQuery().mask) {
				$(".form-decimal", form).each(function() { $(this).mask("#,##0.0000", {reverse: true, placeholder: "0.0000"}); });
				$(".form-amount", form).each(function() { $(this).mask("#,##0.00", {reverse: true, placeholder: "0.00"}); });
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
				var subform = $(this);
				var formid = subform.data("id");
				var source = subform.data("source");
				var preload = parseInt(subform.data("default"));
				var subclass = subform.data("class") || "";
				var afteradd = subform.data("afteradd") || null;
				var afterrem = subform.data("afterrem") || null;

				subform.on("click", function(e, data) {
					var div = $("<div>").addClass("clearfix "+subclass).html($("<div>").gyros({width:"40px", stroke:2}));
					div.load(source, function(){
						var btnEdit = $("[data-subform='update']", div);
						var btnRem = $("[data-subform='remove']", div);

						$("input,select,textarea", div).each(function() {
							var field = $(this);
							var name = field.attr("name");
							if(name.substring(name.length - 2)=="[]") {
								name = name.substring(0, name.length-2);
							}

							if(data && data[name]) {
								field.val(data[name]);
								field.data("value", data[name]);
							}

							field.attr("name", name+"[]");
						});

						// boton editar
						// cuando existe bloquea los campos hasta que es presionado, salvo que el bloque tenga la class "enabled"
						// al presionarlo crea un campo oculto que tiene por nombre el valor del atributo data-subform-id + _update
						// y el pone como valor el almacenado en data[subform-update]
						if(btnEdit.length) {
							if(data) {
								btnEdit.click(function(){
									$("input,select,textarea", div).prop("disabled", false);
									$(".ui-autocomplete-input", div).each(function() {
										$(this).autocomplete("enable").autocomplete("option", "disabled", false);
										$("#"+$(this).prop("autocomplete-target")).prop("disabled", false);
									});

									var name = btnEdit.data("subform-id");
									if(name && data[name]) {
										div.append($("<input>").attr({
											"type": "hidden",
											"name":  name+"_update[]",
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
								btnRem.click(function() {
									btnRem = $(this);
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
													div.parent().append($("<input>").attr({
														"type": "hidden",
														"name":  name+"_remove[]",
														"value": btnRem.prop("subform-remove-value")
													}));
												}
												div.fadeOut(function() {
													div.remove();
													if(afterrem) { jQuery.bithive.run(afterrem); }
												});
												jQuery.bithive.enumerate($("[data-subform='number']", $("#"+formid+"_target")));
											}
										}
									});
								});
							} else {
								btnRem.click(function() {
									div.fadeOut(function() {
										div.remove();
										if(afterrem) { jQuery.bithive.run(afterrem); }
									});
									jQuery.bithive.enumerate($("[data-subform='number']", $("#"+formid+"_target")));
								});
							}
						}

						$("[data-subform='up']", div).click(function() { div.insertBefore(div.prev()); jQuery.bithive.enumerate($("[data-subform='number']", $("#"+formid+"_target"))); });
						$("[data-subform='down']", div).click(function() { div.insertAfter(div.next()); jQuery.bithive.enumerate($("[data-subform='number']", $("#"+formid+"_target"))); });
						jQuery.bithive.enumerate($("[data-subform='number']", $("#"+formid+"_target")));
						jQuery.bithive.apply(div);
						if(afteradd) { jQuery.bithive.run(afteradd, div); }

						if(data && btnEdit.length) {
							$("input,select,textarea", div).each(function() {
								if(subclass.indexOf("subform-enabled")==-1) {
									var field = $(this);
									if(field.hasClass("ui-autocomplete-input")) {
										field.autocomplete("disable").autocomplete("option", "disabled", true);
										$("#"+field.prop("autocomplete-target")).prop("disabled", true);
									} else {
										field.prop("disabled", true);
									}
								}

								if(btnRem.length) { btnRem.hide(); } 
							});
						}
					});
					$("#"+formid+"_target").append(div);
				});

				if(subform.hasAttr("data-value")) {
					var div = $("<div>").html($("<div>").gyros({width:"40px", stroke:2}));
					var info = jQuery.base64.atob(subform.data("value"))
					info = JSON.parse(info);

					$.each(info, function() {
						subform.trigger("click", [this]);
					});
				} else {
					if(preload>0) {
						for(var x=0; x<preload; x++) {
							subform.trigger("click");
						}
					}
				}
			});

			$(".form-submit", form).click(function(e) {
				e.preventDefault();
				var btn = $(this);

				if($(this).hasClass("form-confirm")) {
					var message = btn.data("confirm");
					if(message=="1" || message=="true") { message = "Confirma?"; }
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
			$("textarea.fullscreen", form).each(function() {
				$(this).on("keydown", function(e) {
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

		SendForm: function(btnSubmit) {
			var hrefRedirect = false;
			var form = btnSubmit.closest("form");

			var redirect = $("input[name='NGL_REDIRECT']:last", form);
			if(redirect.length) {
				var hrefRedirect = redirect.val();
				hrefRedirect += (hrefRedirect.indexOf("?")<0) ? "?response=" : "&response=";
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
					// debug mode
					if(response.substr(0, 15)=="[[TUTOR-DEBUG]]" || response.substr(0, 13)=="[ NOGAL ERROR") {
						$("<div>")
							.addClass("debug-box")
							.append(
								$("<div>")
									.addClass("debug-content")
									.append(
										$("<button>")
											.addClass("debug-close")
											.click(function(){
												$(this).parent().parent().remove();
												gyros.remove();
												btnRow.show();
											})
									)
									.append(response)
							)
							.appendTo($("body"))
						;
						window.scrollTo(0,0);
						return true;
					}

					// redirect
					var parsed = JSON.parse(response);
					if(typeof parsed == "string" && (parsed.substr(0, 7).toLowerCase()=="http://" || parsed.substr(0, 8).toLowerCase()=="https://")) {
						window.location.href = parsed;
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
			});
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
					lnktarget.prop("gyrosid", gyros).hide().after($("<div>").attr("id", gyros).css("width", "30px").gyros({width:"30px", stroke:2}));
				}

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
							jQuery.bithive.mkSelectOptions(lnktarget, data, values);
						}
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
						}
						group.append(
							$("<option />")
								.attr("value", option.value)
								.html(option.label)
						);
					});
					args[0].append(group);
				} else {
					$.each(src, function(i,option) {
						args[0].append(
							$("<option />")
								.attr("value", option.value)
								.html(option.label)
						);
					});
				}

				if(elem.hasAttr("data-addnew")) {
					var urladd = jQuery.base64.atob(elem.data("addnew"));
					var addtext = (elem.hasAttr("data-addnewtext")) ? elem.data("addnewtext") : "Agregar";

					args[0].preppend(
						$("<option />")
							.attr("value", "[--add-new-value--]")
							.html("[-- "+addtext+" --]") 
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
				jQuery.ajax({
					url: src,
					dataType: "json",
					success: function(data) {
						source = data;
					}
				});
			}

			var limit = 0;
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
			$("#topnav, .no-print").hide();
			$("body").addClass("bg-print");
			window.print();
			$("#topnav, .no-print").show();
			$("body").removeClass("bg-print");
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

		jsonFiller: function(parsed, targetElement) {
			jQuery.each(parsed, function(key, value) {
				var target = $("[data-id='"+key+"']", targetElement)
				if(target.is(":input")) {
					target.val(value);
				} else {
					target.html(value);
				}
				jQuery.bithive.apply($("[data-id='"+key+"']", targetElement));
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
		}
	}
});