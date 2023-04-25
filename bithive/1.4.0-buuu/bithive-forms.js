jQuery.extend(jQuery.bithive, {
	formstyle: function(form, itself) {
		if(!form) { var form = $("body"); }
		if(typeof itself == "undefined") { var itself = false; }

		$.bithive.eachElement("[data-clear]", form, itself, function() {
			var regex = new RegExp("["+$(this).data("clear")+"]", "g");
			$(this).on("focus change keyup paste", function() {
				var val = $(this).val();
				val = val.replace(regex, "");
				$(this).val(val);
			});
		});

		$.bithive.eachElement("[data-checker]", form, itself, function() {
			$(this).prop("checker-oldvalue", $(this).val());
			$(this).on("change paste", function() {
				var field = $(this);
				var val = field.val();
				if(val==$(this).prop("checker-oldvalue")) { return false; }

				var src = field.data("checker");
				var msgok = field.data("checker-success") || false;
				var msgko = field.data("checker-fail") || false;
				var after = field.data("checker-after") || false;

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
							if(msgok) {
								if(response.message) {
									$.bithive.confirm(msgok.replace("***", response.message), function(){
										field.focus();
									});
								} else {
									$.bithive.confirm(msgok, function(){
										field.focus();
									});
								}
							}

							if(response.values) {
								$.bithive.jsonFiller(response.values, document);
							}
						} else {
							if(msgko) {
								if(response.message) {
									$.bithive.confirm(msgko.replace("***", response.message), function(){
										field.focus();
									});
								} else {
									$.bithive.confirm(msgko, function(){
										field.focus();
									});
								}
							}
						}
						if(after) { $.bithive.run(after, [response, field]); }
					},
					complete: function(response) {
					}
				});
			});
		});

		// ATTACHER --------------------------------------------------------
		$.bithive.eachElement(".form-attacher", form, itself, function() {
			var field = $(this);
			var types = ["jpg","jpge","png","gif"];
			if(field.data("types")!="") { types = field.data("types").split(","); }
			var maxfiles = field.data("max") || 1;
			var maxsize = field.data("maxsize") || (8*1024*1024);
			var autohide = field.data("autohide") || false;
			var preloads = (field.hasAttr("data-value")) ? eval(jQuery.base64.atob(field.data("value"))) : null;

			field.attacher({
				name: field.data("name"),
				types: types,
				maxfiles: maxfiles,
				maxsize: maxsize,
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
			$.bithive.eachElement(".form-attachresizer", form, itself, function() {
				let name = ($(this).hasAttr("data-name")) ? $(this).data("name") : "attachresizer";
				$(this).attr("name", name).attachresizer();
			});
		}

		$.bithive.eachElement(".custom-file-input", form, itself, function() {
			$(this).on("change", function() {
				// var fileName = $(this).val().split("\\").pop();
				let fileName = $(this).val();
				$(this).siblings(".custom-file-label").addClass("selected").html(fileName);
			});
		});			

		// AUTOCOMPLETE ----------------------------------------------------
		$.bithive.eachElement("input.form-autocomplete", form, itself, function() {
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
				$("<input>", {class:"form-autocomplete-value"}).attr({
					"type": "hidden",
					"id": fieldId,
					"name": field.attr("name"),
					"value": field.val()
				}).insertAfter(field);

				var uid = jQuery.uid()+"_";
				field.attr({
					"name": uid+field.attr("name"),
					"data-lnk-id": fieldId
				});

				target = fieldId;
			}

			var source = null;
			var src = jQuery.base64.atob(field.data("source"));
			if(src.indexOf("[")===0) {
				source = eval(src);
			} else {
				source = function(request, response) {
					$.getJSON($.bithive.RefToVal(src) + "&q=" +encodeURIComponent(request.term), response);
				};
			}
			field.prop("autocomplete-target", target);

			// clear btn
			var clear = $(".autocomplete-clear", field.parent()).click(function(){
				if(!field.prop("disabled")) {
					$("#"+field.prop("autocomplete-target")).val("");
					$(this).addClass("d-none");
					field.val("").focus();
				}
			}).addClass("d-none");
			field.prop("autocomplete-clear", clear);

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
						urladd = $.bithive.RefToVal(urladd);
						$.bithive.addNewValue(urladd, addtext, target, field);
					} else {
						setTimeout(function() { field.val(ui.item.label).attr("title", ui.item.label); },10);
						var target = $("#"+field.prop("autocomplete-target"));
						target.val(ui.item.value);
						
						// relaciones
						if(lnksrc) {
							jQuery.ajax({
								url: jQuery.base64.atob(lnksrc) + ui.item.value,
								dataType: "json",
								success: function(data) {
									var values = $.bithive.OptionsValues(lnktarget);
									if(lnktarget.hasClass("checkbox")) {
										$.bithive.mkchecks(form, "checkbox", lnktarget, data, values);
									} else if(lnktarget.hasClass("radio")) {
										$.bithive.mkchecks(form, "radio", lnktarget, data, values);
									} else {
										$("#"+lnktarget.prop("gyrosid")).remove();
										lnktarget.show();
										$.bithive.mkSelectOptions(lnktarget, data, values);
									}
								}
							});
						}

						if(after) { $.bithive.run(after, [field, ui.item, false]); } // [elemento, objeto(value option), is_update]
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
				$(this).prop("autocomplete-clear").addClass("d-none");
			}).on("blur", function() {
				var targetField = $("#"+$(this).prop("autocomplete-target"));
				if(targetField.val()==$(this).prop("oldval")) {
					$(this).val($(this).prop("oldlabel"));
				}

				if($(this).val().trim().length==0) {
					targetField.val("");
					$(this).prop("autocomplete-clear").addClass("d-none");
				} else {
					$(this).prop("autocomplete-clear").removeClass("d-none");
				}
			}).on("fill", async function(){
				let field = $(this);
				if(field.val()!="") {
					var current = field.val();
					if(src.indexOf("[")===0) {
						$.each(source, function(key, item) {
							if(item.value==current) {
								target.val(current);
								field.val(item.label).attr("title", item.label);
								if(after) { $.bithive.run(after, [field, item, true]); }
								return false;
							}
						});
					} else {
						jQuery.ajax({
							url: $.bithive.RefToVal(src),
							dataType: "json",
							data: { i:1, q: field.val() },
							success: function(data) {
								$.each(data, function(key, item) {
									if(item.value==current || (item.imya && item.imya==current)) {
										target.val(item.value);
										field.val(item.label).attr("title", item.label);
										if(after) { $.bithive.run(after, [field, item, true]); }
										return false;
									}
								});
							},
							complete: function(response) {
							}
						});
					}
ACA

					// let done = await setInterval((id)=>{
					// 	if(aRunning[id]) { return true; }
					// }, 100);


					clear.removeClass("d-none");
				}
			}).trigger("fill");

			if(template) {
				template = jQuery.base64.atob(template);
				field.autocomplete("instance")._renderItem = function(ul, item) {
					let li = $("<li>").append(template);
					$.bithive.KeysFromData(li, item);
					return li.appendTo(ul);
				};
			}

		});

		// CHECKBOX/RADIO ----------------------------------------------------------------------
		$.bithive.eachElement("div.checkbox[data-source]", form, itself, function() {
			var field = $(this);
			var source = jQuery.base64.atob(field.data("source"));
			if(source!="") {
				field.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
				$.bithive.mkchecks(form, "checkbox",field,source, $.bithive.OptionsValues(field));
			}
		});
		
		$.bithive.eachElement("div.onoffswitch[data-source]", form, itself, function() {
			var field = $(this);
			var source = jQuery.base64.atob(field.data("source"));
			if(source!="") {
				field.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
				$.bithive.mkchecks(form, "onoffswitch", field, source, $.bithive.OptionsValues(field));
			}
		});
		
		$.bithive.eachElement("div.radio[data-source]", form, itself, function() {
			var field = $(this);
			var source = jQuery.base64.atob(field.data("source"));
			if(source!="") {
				field.html($("<div>").css("width", "30px").gyros({width:"30px", stroke:2}));
				$.bithive.mkchecks(form, "radio",field,source, $.bithive.OptionsValues(field));
			}
		});

		// tilda todos los checkboxes visibles (destilda TODOS) que tengan el selector pasado en data-checkall
		$.bithive.eachElement("[data-checkall]", form, itself, function() {
			var checkall = $(this);
			checkall.prop("isChecked", checkall.prop("checked"));
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

		// tilda unicamente este checkbox, destildando todos los pasados en data-checkjustme
		$.bithive.eachElement("[data-checkjustme]", form, itself, function() {
			$.bithive.CheckJustMe($(this));
		});


		// COLOR PICKER ------------------------------------------------------------------------
		if(jQuery().colorpicker) {
			$(".form-color", form).colorpicker();
		}

		// HTML CONTAINER ----------------------------------------------------------------------
		$.bithive.eachElement(".form-html", form, itself, function() {
			var url = $(this).data("url");
			if(url!="") {
				$(this).html($("<div>").gyros({top: "0px", width:"32px", stroke:2})).load(url, function() {
					$.bithive.apply($(this));
				});
			}
		});

		// MULTIPLE INPUT-----------------------------------------------------------------------
		$(".form-minput").each(function(){
			let el = $(this);
			if(!el.prop("minput")) {
				el.prop("minput", true);
				let name		= el.attr("name");
				let len			= (el.hasAttr("minput-len")) ? el.attr("minput-len").split(",") : 2; // largo de cada campo separado por  ,
				let cols		= (el.hasAttr("minput-class")) ? el.attr("minput-class").split(",") : "col"; // clases css separadas por ,
				let splitter	= el.attr("minput-splitter") || "-"; // divisor del valor guardado
				let after		= el.attr("minput-after") || null; // function (el)
				
				let val			= el.val();
				let vals		= val.split(splitter);

				let div = $("<div>", {class:"form-inline w-100"});
				for(let x in cols) {
					div.append(function() {
						let newel = el.clone()
							.removeClass("form-minput")
							.addClass((typeof cols=="object") ? cols[x] : cols)
							.attr("name", "minput_"+name+"_"+x)
							.attr("maxlength", len[x])
						;
						if(vals && vals[x]) { newel.val(vals[x]); }

						newel.on("change", function(){
							if(after) {
								let val = window[after]($(this));
								$(this).val(val);
							}

							let value = [];
							$("[name^='minput_"+name+"_']").each(function(){
								value.push($(this).val());
							});

							el.val(value.join(splitter));
						})
						return newel;
					});
					
				}
				el.attr("type", "hidden").after(div);
			}
		});

		// SETS --------------------------------------------------------------------------------
		if(jQuery().buttonsSet) {
			$.bithive.eachElement(".form-buttonsset", form, itself, function() {
				let field = $("input", $(this));
				let groupClass = $(this).data("groupclass");
				let setClass = $(this).data("setclass");
				let btnClass = $(this).data("btnclass");
				if($(this).hasClass("daysofweek")) {
					$(this).buttonsSet($.bithive.lang.buttonsSetDays, {setclass:setClass, btnclass:btnClass, groupclass:groupClass});
				} else if($(this).hasClass("months")) {
					$(this).buttonsSet(buttonsSetMonths, {setclass:setClass, btnclass:btnClass, groupclass:groupClass});
				} else {
					var source = $.base64.atob(field.data("source")) || "";
					$.bithive.mkOptions(source, function(src, args) {
						if(src!=="") {
							$(args[0]).buttonsSet(src, {setclass:setClass, btnclass:btnClass, groupclass:groupClass});
						}
					}, [this]);						
				}
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
			
			var tooltips = $.bithive.lang.datePickerTooltips;
			
			$.bithive.eachElement("input.form-date", form, itself, function() {
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

			$.bithive.eachElement("div.form-date", form, itself, function() {
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
							} else if(this=="clear") {
								$("<a>")
									.addClass("dropdown-item")
									.text($.bithive.lang.datePickerTooltips.clear)
									.click(function(){
										dp1.data("DateTimePicker").clear();
										dp2.data("DateTimePicker").clear();
									})
									.appendTo(dropdown)
								;
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
		$.bithive.eachElement("input[type='file']", form, itself, function() {
			$(this).closest("form").attr("enctype", "multipart/form-data");
		});

		// MASKS -------------------------------------------------------------------------------
		// al actualizar, actualizar unmask en SendForm y reMask on debug
		if(jQuery().mask) {
			$.bithive.eachElement(".mask-decimal", form, itself, function() {
				let decimals = $(this).attr("mask-decimals") || 4;
				decimals = parseInt(decimals);
				let zeros = "0,"+"0".repeat(decimals);
				let placeholder = "0,"+"0".repeat(decimals);
				$.bithive.InputMask($(this), {
					mask: "#.##"+zeros,
					options: {reverse: true, placeholder: placeholder},
					unmask: function(el) {
						let val = parseFloat(el.val().replace(/\./g, "").replace(/\,/g, ".")).toFixed(decimals);
						if(isNaN(val)) { val = 0; }
						return val;
					},
					preparemask: function(el) {
						let val = el.val();
						if(val!="" && val.indexOf(".")<0) { val+="."+zeros; }
						return parseFloat(val).toFixed(decimals);
					}
				}).addClass("text-right");
			});

			// money
			$.bithive.eachElement(".mask-money", form, itself, function() {
				let decimals = parseInt($(this).attr("mask-decimals")) || 2;
				if(decimals < 2) { decimals = 2; }
				let zeros = "0,"+"0".repeat(decimals);
				let placeholder = "0,"+"0".repeat(decimals);
				$.bithive.InputMask($(this), {
					mask: "#.##"+zeros,
					options: {reverse: true, placeholder: placeholder},
					unmask: function(el) {
						let val = parseFloat(el.val().replace(/\./g, "").replace(/\,/g, ".")).toFixed(decimals);
						if(isNaN(val)) { val = 0; }
						return val;
					},
					preparemask: function(el) {
						let val = el.val();
						if(val!="" && val.indexOf(".")<0) { val+="."+zeros; }
						return parseFloat(val).toFixed(decimals);
					}
				}).addClass("text-right");
			});

			$.bithive.eachElement(".mask-cuit", form, itself, function() { $.bithive.InputMask($(this), {mask:"00-00000000-0", unmask:[["-", ""]], options:{placeholder: "__-________-_"}}); });
			$.bithive.eachElement(".mask-invoice", form, itself, function() { $.bithive.InputMask($(this), {mask:"00000-00000000", options:{placeholder: "00000-00000000"}}); });
			$.bithive.eachElement(".mask-dni", form, itself, function() { $.bithive.InputMask($(this), {mask:"Z0.000.000", unmask:[["\\.", ""]], options:{translation: {placeholder: "__.___.___", "Z": {pattern: /[0-9]/, optional: true}}}}); });
			$.bithive.eachElement(".mask-ip", form, itself, function() { $.bithive.InputMask($(this), {mask:"0ZZ.0ZZ.0ZZ.0ZZ", options:{placeholder: "_._._._", translation: {"Z": {pattern: /[0-9]/, optional: true}}}}); });
			$.bithive.eachElement(".mask-cbu", form, itself, function() { $.bithive.InputMask($(this), {mask:"0000000000000000000000"})});
			$.bithive.eachElement(".mask-phone", form, itself, function() { $.bithive.InputMask($(this), {mask:"0000 0000", options:{placeholder: "____ ____"}}); });
			$.bithive.eachElement(".mask-phone_area", form, itself, function() { $.bithive.InputMask($(this), {mask:"(00) 0000 0000", options:{placeholder: "(__) ____ ____"}}); });
			$.bithive.eachElement(".mask-cellphone", form, itself, function() { $.bithive.InputMask($(this), {mask:"15 0000 0000", options:{placeholder: "15 ____ ____"}}); });
			$.bithive.eachElement(".mask-cellphone_area", form, itself, function() { $.bithive.InputMask($(this), {mask:"(00) 15 0000 0000", options:{placeholder: "(__) 15 ____ ____"}}); });
		};

		// RELATION ----------------------------------------------------------------------------
		$.bithive.eachElement(".form-relation", form, itself, function() {
			var relid		= $(this).data("id") || "";
			var source		= $(this).data("source");
			var href		= $(this).data("value");
			var target		= $(this).data("target");
			var size		= $(this).data("size");
			var skipfirst	= $(this).data("skipfirst");
			var isform		= $(this).data("isform");
			var closebutton	= $(this).data("closebutton");
			var targetElement = (target!="") ? $(target) : null;

			if(size!="") { size = "dialog-"+size; }
			href = (href=="true" || href=="1") ? true : href;
			isform = (isform=="true" || isform=="1") ? true : false;
			closebutton = (closebutton=="true" || closebutton=="1") ? true : false;
			skipfirst = (skipfirst=="true" || skipfirst=="1") ? true : false;
			$(this).click(function(e) {
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
								
								if(targetElement) {
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

									$.bithive.apply(targetElement);
								}

								$("[data-relation='close']", modal).click(function(e) { dialog.close(); });
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
												"value": $.bithive.lang.buttonOk
											})
										)
										.append(
											$("<input>", {
												"type": "button",
												"class": "btn margin-md margin-only-left",
												"value": $.bithive.lang.buttonCancel
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
												"value": $.bithive.lang.buttonClose
											}).attr("data-relation", "close")
										)
								)
								.appendTo(modal)
							;
						}

						$("[data-relation='close']", modal).click(function(e) { dialog.close(); });
						$.bithive.apply(modal);
					})
				});
			});
			
			if(href!="" && href!=true && !skipfirst && targetElement) {
				targetElement.load(href, function() {
					$.bithive.apply(targetElement);
				});
			}
		});

		// NUMBER PICKER -----------------------------------------------------------------------
		if(jQuery().TouchSpin) {
			$.bithive.eachElement("input.form-number", form, itself, function() {
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
					verticalbuttons: true,
					buttonup_class: "btn",
					buttondown_class: "btn"
				});
			});
		}

		// PASSWORDS ---------------------------------------------------------------------------
		$.bithive.eachElement(".showpass", form, itself, function() {
			$(this).click(function() {
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
		});

		$.bithive.eachElement("input.text-pwd, textarea.text-pwd", form, itself, function() {
			$(this)
				.prop("realvalue", $(this).val())
				.on("keyup", function(){
					let real = $(this).prop("realvalue");
					let fake = $(this).val();

					if((real.length+1)<=fake.length) {
						let chars = fake.substr(real.length, (fake.length-real.length));
						real += chars;
					} else {
						real = real.substr(0, fake.length);
					}

					$(this).val(fake.replace(/(.)/g, "•"));
					$(this).prop("realvalue", real);
				})
				.trigger("change")
			;
		});

		// INPUT COPY --------------------------------------------------------------------------
		$.bithive.eachElement("input.control-copy", form, itself, function() {
			let input = $(this);
			$("<div>", {class:"input-group-append c-pointer"}).html(
				$("<div>", {class:"input-group-text"}).html(
					$("<i>", {class:"far fa-copy icon-sm"})
				)
			).appendTo(input.parent()).click(function(){
				let input = $(".form-input", $(this).parent());
				$(this).clipboard({
					mode: false,
					text: input.val(),
					success_after: function(e) { e.clearSelection(); },
					success_notify: {
						message: $.bithive.lang.clipboardSuccess
					}
				});
			});
		});

		// SELECT ------------------------------------------------------------------------------
		$.bithive.eachElement("select.form-select[data-source]", form, itself, function() {
			var field = $(this);
			var source = jQuery.base64.atob(field.data("source")) || "";
			if(field.hasAttr("multiple")) {
				let name = field.attr("name");
				if(name.substring(-2)!="[]") { field.attr("name", name+"[]"); }
			}
			if(source!="") {
				$.bithive.mkselect(field, source, $.bithive.OptionsValues(field));
			} else {
				let vals = $.bithive.OptionsValues(field);
				for(let x in vals) {
					$("option[value='"+vals[x]+"']", field).prop("selected", true);
				}
				$.bithive.BootstrapSelect(field);
			}
		});

		// SLIDER ------------------------------------------------------------------------------
		if(jQuery().slider) {
			$.bithive.eachElement("div.form-slider", form, itself, function() {
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
		$.bithive.eachElement(".form-subform", form, itself, function() {
			$.bithive.SubForms(this);
		});

		// TAGS --------------------------------------------------------------------------------
		if(jQuery().tagit) {
			$.bithive.eachElement("input.form-tags", form, itself, function() {
				var field = $(this);
				var source = $.base64.atob(field.data("source")) || "";
				var length = field.data("length") || "";
				var clear = field.data("clear") || "";
				var disabled = ($(this).hasAttr("disabled"));
				var values = $(this).val();
				$.bithive.mkOptions(source, function(src, args) {
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

					// valores pre-cargados
					if(values) {
						values = values.replace(/(\n|\r\n)/g, args[0].tagit("option","singleFieldDelimiter"));
						values = values.split(args[0].tagit("option","singleFieldDelimiter"));
						if(values.length > 1) {
							for(let i = 0; i < values.length; i++) {
								args[0].tagit("createTag", values[i]);
							}
						}
					}

				}, [field]);
			});
		}

		// TEXTAREAS ---------------------------------------------------------------------------
		$.bithive.eachElement("textarea.fullscreen, textarea.fullinput", form, itself, function() {
			$(this).addClass("fullscreen").textareafullscreen({width: "90%"});
		});

		$.bithive.eachElement("textarea.limited", form, itself, function() {
			let counter = $("<small>", {class:"float-right"});
			let id = counter.id();
			$(this).after(counter).on("change keyup paste", function(){
				let limit = $(this).data("limit") || 255;
				let val = $(this).val();
				if(val.length >= limit) { $(this).val(val.substring(0, limit)); }
				let count = (limit - val.length) < 0 ? 0 : (limit - val.length);
				$("#"+id).text(count+"/"+limit);
			});
		});

		$.bithive.eachElement("textarea.dynamic", form, itself, function() {
			$(this).on("focus change keyup paste", function(e) {
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
		});

		if(typeof squireUI!="undefined") {
			$.bithive.eachElement("textarea.wysiwyg-lite", form, itself, function() {
				squireUI($(this), {
					smallbar:true,
					ui:"lite",
					tags:"<br /><br ><p></p><a></a><b></b><i></i><ul></ul><ol></ol><li></li>",
					css: [
						ENV.cdn+"/css/bootstrap-4.3.1.min.css",
						ENV.cdn+"/css/bootstrap-plus-3.0.css",
						ENV.cdn+"/css/bootstrap-plus-xs-3.0.css"
					]
				});
			});

			$.bithive.eachElement("textarea.wysiwyg", form, itself, function() {
				squireUI($(this), {
					smallbar:true, 
					ui:"simple", 
					tags:"<br /><br ><p></p><a></a><b></b><i></i><ul></ul><ol></ol><li></li>",
					css: [
						ENV.cdn+"/css/bootstrap-4.3.1.min.css",
						ENV.cdn+"/css/bootstrap-plus-3.0.css",
						ENV.cdn+"/css/bootstrap-plus-xs-3.0.css"
					]
				});
			});

			$.bithive.eachElement("textarea.wysiwyg-full", form, itself, function() {
				squireUI($(this), {
					smallbar:true,
					ui:"full",
					css: [
						ENV.cdn+"/css/bootstrap-4.3.1.min.css",
						ENV.cdn+"/css/bootstrap-plus-3.0.css",
						ENV.cdn+"/css/bootstrap-plus-xs-3.0.css"
					]
				});
			});
		}

		// SUBMIT --------------------------------------------------------------
		$(".form-submit", form).click(function(e) {
			e.preventDefault();
			var btn = $(this);

			if($(this).hasClass("form-confirm")) {
				var message = btn.data("confirm");
				if(message=="1" || message=="true") { message =$.bithive.lang.confirmQuestion; }
				message = $.bithive.RefToVal(message);
				BootstrapDialog.confirm({
					draggable: true,
					title: $.bithive.lang.confirmTitle,
					message: message,
					type: BootstrapDialog.TYPE_DANGER,
					btnCancelLabel: $.bithive.lang.buttonCancel,
					btnCancelClass: "btn-default",
					btnOKLabel: $.bithive.lang.buttonOk,
					btnOKClass: "btn-danger",
					callback: function(result) {
						if(result) {
							$.bithive.SendForm(btn);
						}
					}
				});
			} else {
				$.bithive.SendForm(btn);
			}
		});

		return true;
	},
















	// beforeFn se ejecuta antes de enviar el formulario
	// beforeFn retorna formData, si formData es igual false, el envio se aborta
	SendForm: function(btnSubmit) {
		var hrefRedirect = false;
		var form = btnSubmit.closest("form");
		var before = form.attr("before") || null;
		var after = form.attr("after") || null;
		
		var redirect = $("input[name='NGL_REDIRECT']:last", form);
		if(redirect.length) {
			var hrefRedirect = redirect.val();
			if(hrefRedirect.indexOf("?")!=-1) {
				var urlQuery = hrefRedirect.substring(hrefRedirect.indexOf("?")+1);
				hrefRedirect = hrefRedirect.substring(0, hrefRedirect.indexOf("?")+1);
				if(urlQuery.indexOf("&")==0) { urlQuery = urlQuery.substring(1); }
				urlQuery = decodeURI(urlQuery).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"');
				if(urlQuery!="") {
					try {
						urlQuery = JSON.parse('{"' +urlQuery+ '"}');
					} catch(e) {
						if(e instanceof SyntaxError) {
							console.debug("Malformed URL: "+urlQuery);
						}
						return true;
					}

					var urlQueryString = [];
					$.each(urlQuery, function(k,v){
						if(k!="response") {
							urlQueryString.push(k+"="+v);
						}
					});
					hrefRedirect += urlQueryString.join("&")+"&response=";
				} else {
					hrefRedirect += "&response=";
				}
			} else {
				hrefRedirect += "?response=";
			}
			$("input[name='NGL_REDIRECT']", form).remove();
		}

		var fields = $("input,select,textarea", form);

		// unmask ---
		$(".mask-money").each(function() { $(this).trigger("unmask", true); });
		$(".mask-decimal").each(function() { $(this).trigger("unmask", true); });
		$(".mask-cuit").each(function() { $(this).trigger("unmask", true); });
		$(".mask-dni").each(function() { $(this).trigger("unmask", true); });

		let alvinfocus = false;
		var alvin = true;
		$(".form-error", form).remove();
		$.each(fields, function() {
			$(this).alvin("check");
			if($(this).prop("alvinerror")) {
				if($(this).hasClass("form-select")) {
					$("> button", $(this).parent())
						.addClass("form-error-border")
						.on("focus change", function(){
							$(this).removeClass("form-error-border");
						}
					);
				} else {
					$(this)
						.addClass("form-error-border")
						.on("focus change", function(){
							$(this).removeClass("form-error-border");
						}
					);
				}

				if(!alvinfocus) { alvinfocus = $(this); }
				alvin = false;
			}
		});
		if(!alvin) {
			window.scrollTo(0, alvinfocus.position().top);
			$.bithive.danger($.bithive.lang.alvinErrorMessage);

			// remask
			$(".mask-money").each(function() { $(this).trigger("mask"); });
			$(".mask-decimal").each(function() { $(this).trigger("mask"); });
			$(".mask-cuit").each(function() { $(this).trigger("mask"); });
			$(".mask-dni").each(function() { $(this).trigger("mask"); });
			return false;
		}

		// attacher resizer
		$(".form-attachresizer", form, false, function() { $(this).prop("attachresizer").toField(); });

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
						$.bithive.ResponseHandler(response, btnRow, gyros);

						// remask
						$(".mask-money").each(function() { $(this).trigger("mask"); });
						$(".mask-decimal").each(function() { $(this).trigger("mask"); });
						$(".mask-cuit").each(function() { $(this).trigger("mask"); });
						$(".mask-dni").each(function() { $(this).trigger("mask"); });
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
						var targetElement = $(form.prop("dialog").target) || null;
						var href = form.prop("dialog").href;
						if(href==true) {
							$.bithive.jsonFiller(parsed, targetElement);
						} else if(targetElement) {
							targetElement.load(href, function() {
								$.bithive.apply(targetElement);
							});
						}
					}
				} else if(typeof form.prop("addnewvalue")!="undefined") {
					if(parseInt(response)==response) {
						var source = $.bithive.RefToVal(form.prop("addnewvalue").source);
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
					if(form.hasAttr("data-dialog")) {
						let dialog = form.closest(".modal").prop("dialog");
						if(dialog) { dialog.close(); }
						if(form.hasAttr("data-after")) {
							let after = form.data("after");
							if(typeof after=="string" && typeof window[after]=="function") {
								window[after](response);
							}
						}
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
				let parser = new DOMParser();
				let html = parser.parseFromString(response.responseText,"text/xml");
				let code = html.getElementsByTagName("body") || "";
				let msg = $("<div>").html(code);
				$.bithive.ResponseHandler(msg.html(), btnRow, gyros);
			}
		});
	},

	ResponseHandler: function(response, btnRow, gyros, target) {
		btnRow = btnRow || false;
		gyros = gyros || false;
		target = target || false;
		if(typeof response=="string") {
			if(response.substr(0, 7).toLowerCase()=="http://" || response.substr(0, 8).toLowerCase()=="https://") {
				window.location.href = response;
			} else if(target && window[target]) {
				window[target](response);
			} else if(target && $(target).length) {
				$(target).html(response);
			} else if(response.substr(0, 15)=="[[TUTOR-DEBUG]]") {
				// tutor debug
				$.bithive.SendFormMessages(response, btnRow, gyros, "debug");
			} else if(response.substr(0, 15)=="[[TUTOR-ALERT]]") {
				// tutor alert
				$.bithive.SendFormMessages(response, btnRow, gyros, "alert");
			} else if(response.substr(0,13)=="[ NOGAL ERROR") {
				// nogal error | php error
				$.bithive.SendFormMessages(response, btnRow, gyros, "error");
			} else {
				// nogal error | php error | server error
				$.bithive.SendFormMessages(response, btnRow, gyros, "error");
			}
		} else {
			// nogal error | php error | server error
			$.bithive.SendFormMessages(response, btnRow, gyros, "error");
		}
	},

	SendFormMessages: function(response, btnRow, gyros, type) {
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
								if(btnRow) { gyros.remove(); }
								if(btnRow) { btnRow.show(); }
							})
					)
			)
			.appendTo($("body"))
		;
		window.scrollTo(0,0);
		return true;
	},

	formsview: function(form) {
		let elements = $(".form-view input, .form-view select, .form-view textarea, .form-view select.form-select, .form-view div.squireUI, .form-view [data-subform]");
		elements = elements.not("[type='button']");
		$.bithive.eachElement(elements, form, true, function() {
			let el = $(this);
			let obj = el;
			if(el.hasClass("form-select")) {
				el.prop("disabled", false);
				obj = $("button", el.parent());
				obj.prop("value", $(".filter-option-inner-inner", el.parent()).text());
				$(".dropdown-menu", el.parent()).hide();
			} else if(el.hasClass("squireUI")) {
				let content = $("textarea", el).val();
				let ifr = $("<iframe>", {class:"brd-n w-100"});
				el.html(ifr);
				ifr[0].contentWindow.document.write(content);
				obj = $("<div>", {class:"wysiwyg-view p-absolute w-100 h-100"}).html(content);
				obj.prop("value", obj.text());
				obj.html("");
				el.prepend(obj);
			} else if(el.hasAttr("data-subform")) {
				el.remove();
			} else {
				el.prop("readonly", true);
			}

			obj.click(function(e){
				e.preventDefault();
				let elem = $(this);
				elem.clipboard({
					mode: false,
					text: elem.prop("value") || elem.val(),
					success_after: function(e) { e.clearSelection(); },
					success_notify: {
						message: $.bithive.lang.clipboardSuccess
					}
				});
			});
		});
	},

	// SUBFORMS ----------------------------------------------------------------
	SubForms: async function(elem) {
		var subformButton = $(elem).addClass("subform-trigger");
		var formid = subformButton.data("id");
		var suffix = subformButton.data("source-suffix") || "";
		var source = (elem.nodeName.toLowerCase()!="select") ? subformButton.data("source") : null;
		var targetSelector = subformButton.data("target") || "#"+formid+"_target";
		var limit = parseInt(subformButton.data("limit")) || 0;
		var limitmsg = subformButton.data("limit-message") || $.bithive.lang.subFormLimitMsg;
		subformButton.prop({"last-subform": null});
		var defaultfroms = parseInt(subformButton.data("default"));
		var subclass = subformButton.data("class") || "";

		if(elem.nodeName.toLowerCase()=="select") {
			subformButton.prop("subFormType", "select");
			subformButton.change(function(e, data, parentForm) {
				let target = $(targetSelector);
				target.html("");
				source = $(this).children("option:selected").data("info") || null;
				if(source!==null) { source = source+suffix; }
				if(source) {
					$.bithive.SubFormTrigger(e, data, parentForm, source, subformButton, target, subclass);
				}
			});
		} else if(subformButton.hasClass("form-number")) {
			subformButton.prop("subFormType", "number");
			subformButton.closest(".bootstrap-touchspin").css("max-width", "100px");
			subformButton.prop("subforms", 0);
			subformButton.change(function(e, data, parentForm, subSource) {
				let target = $(targetSelector);
				let src = (subSource && subSource!==true) ? subSource : source;
				let y = ($(this).val() - subformButton.prop("subforms"));
				subformButton.prop("subforms", subformButton.prop("subforms") + y);
				if(y > 0) {
					for(let x=0; x<y; x++) {
						if(limit) {
							if($(".subform-form", target).length >= limit) {
								$.bithive.alert(limitmsg);
								return false;
							}
						}
						let sub = $.bithive.SubFormTrigger(e, data, parentForm, src, subformButton, target, subclass);
					}
				} else {
					y = y * -1 + 1;
					let remove = [];
					let subforms = $(".subform-form", target);
					for(let x=1; x<y; x++) {
						remove.push(subforms[subforms.length-x]);
					}
					for(let x in remove) {
						let subf = remove[x];
						let rembtn = $("[data-subform='remove']", subf) || false;
						if(rembtn) {
							rembtn.trigger("click");
						} else {
							subf.remove();
						}
					}
				}
			});
		} else {
			subformButton.prop("subFormType", "button");
			subformButton.click(function(e, data, parentForm, subSource) {
				let target = $(targetSelector);
				let src = (subSource && subSource!==true) ? subSource : source;
				if(limit) {
					if($(".subform-form", target).length >= limit) {
						$.bithive.alert(limitmsg);
						return false;
					}
				}
				return $.bithive.SubFormTrigger(e, data, parentForm, src, subformButton, target, subclass);
			});
		}

		var trigger = "click";
		if(subformButton.prop("subFormType")!="button") { trigger = "change"; }
		if(subformButton.hasAttr("data-value")) {
			var div = $("<div>").html($("<div>").gyros({width:"40px", stroke:2}));
			var info = jQuery.base64.atob(subformButton.data("value"));
			try {
				info = decodeURIComponent(encodeURIComponent(info));
				info = JSON.parse(info);
				$.each(info, await function() {
					if(subformButton.prop("subFormType")=="number") { subformButton.val(parseInt(subformButton.val())+1); }
					let trigged = subformButton.trigger(trigger, [this]);
					return trigged;
				});
			} catch(e) { 
				console.error(e); 
			}
		} else {
			if(defaultfroms>0) {
				if(subformButton.prop("subFormType")=="number") {
					subformButton.val(defaultfroms).trigger(trigger)
				} else {
					for(var x=0; x<defaultfroms; x++) {
						subformButton.trigger(trigger);
					}
				}
			}
		}
		if(subformButton.val()=="" && !subformButton.hasClass("form-number")) { subformButton.remove(); }

		return true;
	},

	SubFormTrigger: function(e, data, parentForm, source, subformButton, target, subclass) {
		var div = $("<div>").attr("id", "subform-"+jQuery.uid()).addClass("subform-form clearfix "+subclass).html($("<div>").gyros({width:"40px", stroke:2}));
		let subFormIdValue = jQuery.uid();
		if(subformButton.data("extend")) { subFormIdValue = subformButton.prop("subFormFieldId"); }
		div.prop("subform-target", target);
		div.prop("subFormIdVal", subFormIdValue);
		div.prop("subformButton", subformButton);

		div.load(source, function(){
			div.prop("subFormData", ((typeof data != "undefined") ? data : null));
			if(parentForm) {
				let subFormId = $("[data-subform-id]", div).data("subform-id");
				let subFormIdValue = div.prop("subFormIdVal");
				let parentId = parentForm.prop("subform-id");
				let parentIdValue = parentForm.prop("subFormIdVal");
				let parentLink = $("input[name='"+parentId+"["+parentIdValue+"]']", parentForm).val();
				let status = (typeof data == "undefined") ? false : true;
				let childLink = $("input[name='"+subFormId+"_lnk["+subFormIdValue+"]']", div);
				if(!childLink.length) {
					childLink = $("<input>", {type:"hidden", name:subFormId+"_lnk["+subFormIdValue+"]", disabled:status})
						.prop("subFormFieldId", subFormIdValue)
						.attr("data-subform-parent", parentId)
						.appendTo(div);
				}

				$.bithive.SubFormProccess(target, div, data, subformButton);

				childLink.val(parentLink);
				$("[data-subform-nested]", div).remove();
				div.attr("style", "margin-left: 10% !important").insertAfter(parentForm);
				$("[data-subform-nested]", parentForm).prop("last-subform", div);
			} else {
				target.append(div);
				$.bithive.SubFormProccess(target, div, data, subformButton);
				subformButton.prop("last-subform", div);
			}
		});

		return div;
	},

	SubFormProccess: async function(target, div, data, button) {
		var subclass = button.data("class") || "";
		var afteradd = button.data("afteradd") || null;
		var afterrem = button.data("afterrem") || null;
		var afterclone = button.data("afterclone") || null;
		var preloaded = button.data("preloaded") || null;
		var btnEdit = $("[data-subform='update']", div);
		var btnRem = $("[data-subform='remove']", div);
		var btnToggler = $("[data-subform='toggle']", div);
		var subFormIdValue = div.prop("subFormIdVal");

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
					$(".form-buttonsset", subform).trigger("enabled");
					$(".ui-autocomplete-input", subform).each(function() {
						$(this).prop("disabled", false);
						$(this).autocomplete("enable").autocomplete("option", "disabled", false);
						$("#"+$(this).prop("autocomplete-target")).prop("disabled", false);
					});

					var name = btnEdit.data("subform-id");
					if(name && data[name]) {
						let upsert = preloaded ? "_insert" : "_update";
						subform.append($("<input>").attr({
							"type": "hidden",
							"name":  name+upsert+"["+subFormIdValue+"]",
							"value": data[name]
						}).prop("subFormFieldId", subFormIdValue));
					}
					
					if(btnRem.length) { btnRem.show(); } 
					$(this).remove();
				});
			} else {
				btnEdit.remove();
			}
		} else {
			let name = $("[data-subform-id]", div).data("subform-id");
			if(!$(name+"_insert["+subFormIdValue+"]", div).length) {
				if(data && name && data[name]) {
					div.append($("<input>").attr({
						"type": "hidden",
						"name":  name+"_update["+subFormIdValue+"]",
						"value": data[name]
					}).prop("subFormFieldId", subFormIdValue));
				}
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
							}).prop("subFormFieldId", subFormIdValue));
						}
						subform.fadeOut(function() {
							subform.remove();
							if(afterrem) { $.bithive.run(afterrem); }
						});
					} else {
						$.bithive.confirm(btnRem.html()+"?", function(){
							if(btnRem.prop("subform-remove-value")) {
								subform.parent().append($("<input>").attr({
									"type": "hidden",
									"name":  name+"_remove["+subFormIdValue+"]",
									"value": btnRem.prop("subform-remove-value")
								}).prop("subFormFieldId", subFormIdValue));

								// nested
								$("[data-subform-parent='"+name+"'][value='"+btnRem.prop("subform-remove-value")+"']").each(function(){
									let subRem = $("[data-subform='remove']", $(this).parent());
									if(subRem[0]) { subRem.trigger("click", true); }
								});
							}
							subform.fadeOut(function() {
								subform.remove();
								if(button.hasClass("form-number")) {
									let subqty = $(".subform-form", target).length;
									button.prop("subforms", subqty);
									button.val(subqty);
								}
								if(afterrem) { $.bithive.run(afterrem); }
							});
							$.bithive.enumerate($("[data-subform='number']", target));
						});
					}
				});
			} else {
				btnRem.click(function() {
					var subform = $(this).closest(".subform-form");
					subform.fadeOut(function() {
						subform.remove();
						if(button.hasClass("form-number")) {
							let subqty = $(".subform-form", target).length;
							button.prop("subforms", subqty);
							button.val(subqty);
						}
						if(afterrem) { $.bithive.run(afterrem); }
					});
					$.bithive.enumerate($("[data-subform='number']", target));
				});
			}
		}

		// boton clonar
		// permite duplicar todos los datos del subform, salvo el id
		$("[data-subform='clone']", div).click(function() {
			let subform = $(this).closest(".subform-form");
			if($(this).hasAttr("data-subform-before")) { eval($(this).data("subform-before")+"(subform)"); }
			button.trigger("click");
			let cloning = setInterval(function(){
				let cloned = button.prop("last-subform");
				let clonedData = {};
				$("input, textarea, select", subform).each(function(){
					let field = $(this);
					clonedData[field.attr("name").replace(/\[\w+\]/, "")] = field.val();
				});

				$.bithive.SubFormFillData([cloned, clonedData]);

				if($(this).hasAttr("data-subform-after")) { eval($(this).data("subform-after")+"(subform, cloned)"); }
				
				// afterclone: [clone, source]
				if(afterclone) { $.bithive.run(afterclone, [$($(".subform-form").last(), target), subform]); }
				
				button.prop("subforms", button.prop("subforms") + 1);
				$.bithive.enumerate($("[data-subform='number']", target));
				clearInterval(cloning);
			}, 200);
		});

		// boton anidar
		// permite añadir un sub-formulario relacionado con el actual
		if($("[data-subform-nested]", div).length) {
			$("[data-subform-nested]", div).click(function(e, subdata) {
				var nestButton = $(this);
				var source = nestButton.data("subform-nested");
				var subform = nestButton.closest(".subform-form");
				var subFormIdValue = subform.prop("subFormIdVal");
				var formid = nestButton.data("subform-id");
				subform.prop("subform-id", formid);
				var lnkparent = $("input[name='"+formid+"["+subFormIdValue+"]']", subform);
				if(!lnkparent.length) { lnkparent = subform.append($("<input>", {type:"hidden", name:formid+"["+subFormIdValue+"]"}).prop("subFormFieldId", subFormIdValue)); }
				if(lnkparent.val()=="") { lnkparent.val(jQuery.uid()); }

				if(nestButton.hasAttr("data-subform-before")) { eval(nestButton.data("subform-before")+"(subform)"); }
				button.trigger("click", [subdata, subform, source]);
				var subsub = nestButton.prop("last-subform");
				if(nestButton.hasAttr("data-subform-after")) { eval(nestButton.data("subform-after")+"(subform, subsub)"); }

				$.bithive.enumerate($("[data-subform='number']", subform));
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
		$("[data-subform='up']", div).click(function() { div.insertBefore(div.prev()); $.bithive.enumerate($("[data-subform='number']", target)); });
		$("[data-subform='down']", div).click(function() { div.insertAfter(div.next()); $.bithive.enumerate($("[data-subform='number']", target)); });
		$.bithive.enumerate($("[data-subform='number']", target));

		// valor del boton o select disparador
		div.append($("<input>").attr({
			"type": "hidden",
			"name":  name+"_launcher["+subFormIdValue+"]",
			"value": button.attr("name")
		}));

		$.bithive.apply(div, false, async function(callback){
			if(data) {
				if(btnEdit.length || subclass.indexOf("subform-disabled")>-1) {
					let filled = $.Deferred();
					$.when($("input,select,textarea,div.form-attacher", div).each(async function() {
						var field = $(this);
						if(field.hasClass("ui-autocomplete-input")) {
							field.prop("disabled", true);
							field.autocomplete("disable").autocomplete("option", "disabled", true);
							$("#"+field.prop("autocomplete-target")).prop("disabled", true);
						} else {
							field.prop("disabled", true);
						}
						if(btnRem.length) { btnRem.hide(); } 
					})).then(function(){
						$.bithive.SubFormFillData([div, data],()=>{
							if(afteradd) { $.bithive.run(afteradd, div); }
							$.bithive.applyEnd(div);
						});
					});
				} else {
					filled = await $.bithive.SubFormFillData([div, data],()=>{
						if(afteradd) { $.bithive.run(afteradd, div); }
						$.bithive.applyEnd(div);
					});
				}
			} else {
				filled = await $.bithive.SubFormFillData([div, data],()=>{
					if(afteradd) { $.bithive.run(afteradd, div); }
					$.bithive.applyEnd(div);
				});
			}
		});
	},

	SubFormFillData: function(args, callback) {
		let div = args[0];
		let data = args[1];
		div.prop("subFormData", data);
		var subFormIdValue = div.prop("subFormIdVal") || jQuery.uid();
		$.when($("input,select,textarea,div.form-attacher", div).each(async function() {
			var field = $(this);
			var name = (field.hasClass("form-attacher")) ? field.attr("data-name") : field.attr("name");
			if(typeof name != "undefined") {
				name = name.replace(/\[\w+\]/g, "");
				if(data && !(data instanceof jQuery) && data[name]) {
					if(field.attr("type")=="checkbox" || field.attr("type")=="radio") {
						if(field.val()==data[name]) { field.prop("checked", true); }
					} else if(field.hasClass("bootstrap-select")) {
						field.on("loaded.bs.select", function(){
							field.selectpicker("val", data[name]);
						});
					} else if(field.hasClass("form-autocomplete-value")) {
						field.val(data[name]);
						let ac = await field.prev().val(data[name]).trigger("fill");
					} else {
						field.val(data[name]);
						if(field.hasAttr("onfill")) { field.change(); }
					}
					field.data("value", data[name]);
					if(field.hasProp("class", "mask-[0-9a-z\-]+")) {
						field.trigger("preparemask").trigger("mask");
					}
				}

				if(field.hasClass("form-attacher")) {
					field.attr("data-name", name+"["+subFormIdValue+"]").prop("subFormFieldId", subFormIdValue);
				} else {
					field.attr("name", name+"["+subFormIdValue+"]").prop("subFormFieldId", subFormIdValue);
				}

				return true;
			}
		})).then(()=>{
			let preloaded = $(div).prop("subformButton").data("preloaded") || false;
			if(preloaded && $("[data-subform='update']", div)) {
				$("[data-subform='update']", div).trigger("click");
			}

			if(typeof data == "undefined") {
				let subFormId = $("[data-subform-id]", div).data("subform-id");
				div.append($("<input>").attr({
					"type": "hidden",
					"name":  subFormId+"_insert["+subFormIdValue+"]"
				}).prop("subFormFieldId", subFormIdValue));
			}

			$.bithive.jsonFiller(data, div, function(){
				// buttonsset
				$(".form-buttonsset", div).each(function() {
					$(this).trigger("refresh");
				});

				// datepickers
				$(".form-date", div).each(function() {
					if($(this).data("DateTimePicker")) {
						var field = $("[data-linked-me='"+$(this).data("linked-with")+"']", $(this).parent());
						$(this).data("DateTimePicker").clear();
						$(this).data("DateTimePicker").date(moment(field.val()));
					}
				});

				// switchs
				var subFormIdValue = div.prop("subFormIdVal");
				$(".form-onoffswitch-checkbox", div).each(function() {
					var field = $(this);
					var name = field.attr("name");
					if(data && data[name]) {
						if(data[name]!="" && data[name]!=0) { field.prop("checked", true); }
						field.data("value", data[name]).val(data[name]);
					}
				});

				if(data && $("[data-subform='toggle']", div)) { $("[data-subform='toggle']", div).trigger("click"); }
			
				var nested = $("[data-subform-nested]", div);
				if(nested.length) {
					if(data && data.nested) {
						$.each(data.nested, function() {
							nested.trigger("click", [this]);
						})
					}
				}

				// if(callback) { callback(); };
			});
		});
	},

	mkchecks: function(container, type, elem, source, values) {
		var after = null;
		var disabled = (elem.hasAttr("disabled"));

		if(type=="radio") {
			after = function(){
				if(elem.hasAttr("data-lnk-target") && elem.hasAttr("data-lnk-source")) {
					$.bithive.RelatedOptions(elem, "radio");
				}
			};
		}

		$.bithive.mkOptions(source, function(src, args) {
			var cssClass = args[0].data("class") || "col-12";
			var name = args[0].data("name") || type;
			args[0].html("");
			if(type!="onoffswitch") {
				$.when(
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
							.addClass("custom-control custom-"+type+" col-12 "+cssClass)
							.append($("<label>").attr("for", uid).addClass("c-pointer custom-control-label").html(option.label))
						;

						if($.inArray(option.value, args[1])>=0) { $("input", chk).prop("checked", true); }
						args[0].append(chk);
					})
				).then(function(){
					$.bithive.CheckJustMe(args[0]);
					if(args[0].html()=="") { args[0].html(args[0].data("empty")); }
					if(args[2] && typeof args[2]=="function") { args[2](); }
				});
			} else {
				$.when(
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
													"value": (option.value || 0)
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

						if(args[0].data("boolean")=="1" || args[0].data("boolean")=="true") {
							if(typeof args[1][0] != "undefined") {
								if(args[1][0]!=0 && args[1][0]!="0" && args[1][0]!="") { $("input", onoff).prop("checked", true); }
							}
						} else {
							if($.inArray($("input", onoff).val(), args[1])>=0) { $("input", onoff).prop("checked", true); }
						}
						args[0].append(onoff)
					})
				).then(function(){
					$.bithive.CheckJustMe(args[0]);
					if(args[0].html()=="") { args[0].html(args[0].data("empty")); }
					if(args[2] && typeof args[2]=="function") { args[2](); }
				});
			}
		}, [elem,values,after]);
	},

	mkselect: function(elem, source, values) {
		$.bithive.mkSelectOptions(elem,source,values,function(){
			if(elem.hasAttr("data-lnk-target") && elem.hasAttr("data-lnk-source")) {
				$.bithive.RelatedOptions(elem, "select");
			}
			$.bithive.BootstrapSelect(elem);
		});
	},

	// creacion, sort y rsort
	BootstrapSelect: function(elem) {
		if(jQuery().selectpicker) {
			let defaultValue = elem.data("default") || false;
			let onload = elem.data("onload") || false;
			elem.selectpicker({
				defaultValue: defaultValue,
				width: "100%",
				size: 10
			}).on("loaded.bs.select", function() {
				if(onload && typeof window[onload] == "function") { window[onload](this); }
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

			jQuery.ajax({
				url: jQuery.base64.atob(lnksrc) + $(this).val(),
				dataType: "json",
				success: function(data) {
					var values = $.bithive.OptionsValues(lnktarget);
					if(lnktarget.hasClass("checkbox")) {
						$.bithive.mkchecks("checkbox", lnktarget, data, values);
					} else if(lnktarget.hasClass("radio")) {
						$.bithive.mkchecks("radio", lnktarget, data, values);
					} else {
						$("#"+lnktarget.prop("gyrosid")).remove();
						lnktarget.show();
						$.bithive.mkSelectOptions(lnktarget, data, values, function(){
							$.bithive.BootstrapSelect(lnktarget);
							$("#subsector").selectpicker("refresh");
							$("button", lnktarget.parent()).show();
						});
					}
				},
				complete: function(response) {
				}
			});
		});
		
		$.bithive.styles();
		if(type=="select") {
			targets.trigger("change");
		} else {
			$("input[type='radio']:checked", elem).trigger("change");
		}
	},

	mkSelectOptions: function(elem,source,values,after) {
		$.bithive.mkOptions(source, function(src, args) {
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
					if(parseInt(option.disabled)) { opt.attr("disabled", "disabled"); }
					group.append(opt);
				});
				args[0].append(group);
			} else {
				$.each(src, function(i,option) {
					let opt = $("<option />").attr("value", option.value).html(option.label);
					if(option.class) { opt.addClass(option.class); }
					if(option.title) { opt.attr("title", option.title); }
					if(option.info) { opt.attr("data-info", option.info); }
					if(parseInt(option.disabled)) { opt.attr("disabled", "disabled"); }
					args[0].append(opt);
				});
			}

			if(elem.hasAttr("data-addnew")) {
				var urladd = jQuery.base64.atob(elem.data("addnew"));
				var addtext = (elem.hasAttr("data-addnewtext")) ? elem.data("addnewtext") : $.bithive.lang.buttonAdd;

				$("option:first", args[0]).after(
					$("<option />")
						.attr("value", "[--add-new-value--]")
						.html("[ "+addtext+" ]") 
						.click(function(){
							var dialog = $.bithive.addNewValue(urladd, addtext, false, elem);
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
				},
				complete: function(response) {
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

	InputMask: function(elem, options) {
		if(options.preparemask && typeof options.preparemask == "function") { elem.val(options.preparemask(elem)); }
		elem.mask(options.mask, options.options);
		elem.on("mask", function() {
			$(this).val($(this).masked());
		}).on("preparemask", function() {
			$(this).val(options.preparemask($(this)));
		}).on("paste", function(e) {
			let paste = $(this);
			setTimeout(function(){
				paste.unmask();
				paste.trigger("change");
			}, 0);
		}).on("unmask", function(e, set){
			if(options.unmask) {
				var val = $(this).val();
				if(typeof options.unmask == "function") {
					val = options.unmask($(this));
				} else {
					for(let i in options.unmask) {
						val = val.replace(new RegExp(options.unmask[i][0], "g"), options.unmask[i][1]);
					}
				}

				if(set) { $(this).val(val); } else { return val; }
			}
		}).trigger("change");

		return elem;
	},

	CheckJustMe: function(justme) {
		if(justme.hasClass("onoffswitch")) {
			$(".form-onoffswitch-label", justme).click(function() {
				let chk = $(this).prev();
				if(!chk.prop("disabled") && !chk.prop("checked")) {
					$(justme.data("checkjustme")).not(chk).prop("checked", false);
				}
			});
		} else if(justme.hasClass("checkbox") || justme.hasClass("radio")) {
			$("input[type='checkbox'], input[type='radio']", justme).change(function() {
				if($(this).prop("checked")) {
					$(justme.data("checkjustme")).not($(this)).prop("checked", false);
				}
			});
		} else {
			justme.change(function() {
				if(justme.prop("checked")) {
					$(justme.data("checkjustme")).not(justme).prop("checked", false);
				}
			});
		}
	},

	addNewValue: function(urladd, addtext, target, field) {
		if(!urladd) { return false; }
		if(!addtext) { addtext = $.bithive.lang.buttonAdd; }
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
									"value": $.bithive.lang.buttonOk
								})
							)
							.append(
								$("<input>", {
									"type": "button",
									"class": "btn margin-md margin-only-left",
									"value": $.bithive.lang.buttonCancel,
									"click": function(e) {
										dialog.close();
									}
								})
							)
					)
					.appendTo(form)
				;

				$.bithive.apply($(this));
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
	}
});