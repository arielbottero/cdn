(function(jQuery) {
		jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		tablefilter: function(params) {
			var $this = this;

			// valores por defecto
			this.options = {
				cols	: true,
				hidden	: false,
				sensitive : false,
				alltext	: "--",
				after: function(table) {}, // tabla = elemento principal
				afterFilter: function(table) {}, // tabla = elemento principal
				dplang: {
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
				},
				help:	"<span class='text-sm text-white'>"+
						"VACIO : todo<br>"+
						"TEXTO : cualquier coincidencia<br>"+
						"=TEXTO : valor exacto<br>"+
						"&lt;TEXTO : valores menores<br>"+
						"&gt;TEXTO : valores mayores<br>"+
						"&lt;=TEXTO : valores menores o iguales<br>"+
						"&gt;=TEXTO : valores mayores o iguales<br>"+
						"!TEXTO : valores distintos"+
						"</span>"
				,
				helphash:	"<span class='text-sm text-white'>Reenumera la columna índice luego de aplicar los filtros</span>"
			};

			if(typeof params=="string") { params = { cols: params }; }
			this.options = $.extend({}, this.options, this.hyphened("tbfilter"), params);

			// método principal
			this.init = function(params) {
				var table = $($this);
				var tr = $("<tr>").addClass("filters no-print d-none d-lg-table-row").prependTo($("thead", table));
				if(params.hidden) { tr.css("display", "none"); }

				if(params.cols!==true) {
					if(typeof params.cols!="array") {
						params.cols = params.cols.split(",");
					}

					params.cols = params.cols.map(function(a) { return parseInt(a); });
				}

				$("thead th", table).each(function(idx, th) {
					th = $(this);
					var type = th.data("filter") || "input";
					var splitter = th.data("filter-splitter") || false;

					if((type!="none" && type!="false" && type!="index") && (params.cols===true || jQuery.inArray((idx+1), params.cols)>=0)) {
						var colnum = (idx+1);
						var type = type.toLowerCase();
						switch(type) {
							case "select":
							case "multiple":
								var values = [];
								$("td:nth-child("+colnum+")", table).each(function(){
									if($(this).text().indexOf("TODO")!=-1) { $(this).addClass("text-red"); }
									if(splitter) {
										values = values.concat($(this).text().split(";"));
									} else {
										values.push($(this).text());
									}
								});

								var clean = [];
								jQuery.each(values, function(i, e) {
									e = e.replace(/[\t\n\r]/ig, "").trim();
									if(jQuery.inArray(e, clean)== -1) { clean.push(e); }
								});
								values = clean.sort();
								
								var options = "<option value='*' selected>"+params.alltext+"</option>";
								jQuery.each(values, function() {
									options += "<option value='"+this+"'>"+this+"</option>";
								});

								var filter = $("<select>").addClass("custom-select").html(options);
								if(type=="multiple") { filter.attr("multiple", "multiple"); }
								var div = $("<div class='filter-select'>").append(filter);
								if(jQuery().selectpicker) {
									filter.removeClass("custom-select").selectpicker().on("hidden.bs.select", function(){
										var values = filter.selectpicker("val");
										if(!values.length) {
											filter.selectpicker("val", "*").trigger("change");
										} else if(values.length > 1) {
											if($.inArray("*", values)>-1) {
												filter.selectpicker("val", "*").trigger("change");
											}
										}
									});
								}
								break;

							case "date":
								var uid = jQuery.uid();
								var filter = $("<input>").addClass("form-control").val(" ").attr("id", uid);;
								filter.datetimepicker({
									format: "DD/MM/YYYY",
									tooltips: params.dplang,
									showClear: true,
									locale: "es"
								}).on("dp.show", function(e) {
									$(this).prop("first", true);
								}).on("dp.change", function(e) {
									if($(this).prop("first")===true) { filter.trigger("paste"); }
								});
								var div = $("<div class='input-group filter-date'><div class='input-group-prepend'><div class='input-group-text'><i class='far fa-calendar-alt' aria-hidden='true'></i></div></div></div>").append(filter);
								break;

							case "daterange":
								var uid = jQuery.uid();
								var filter = $("<input>").addClass("form-control").val(" ").attr("id", uid+"_from");
								var filterTo = $("<input>").addClass("form-control").val(" ").attr("id", uid+"_to");
								filter.datetimepicker({
									format: "DD/MM/YYYY",
									tooltips: params.dplang,
									showClear: true,
									locale: "es"
								}).on("dp.show", function(e) {
									$(this).prop("first", true);
								}).on("dp.change", function(e) {
									if($(this).prop("first")===true) { filter.trigger("paste"); }
								});

								filterTo.datetimepicker({
									format: "DD/MM/YYYY",
									tooltips: params.dplang,
									showClear: true,
									locale: "es"
								}).on("dp.show", function(e) {
									$(this).prop("first", true);
								}).on("dp.change", function(e) {
									if($(this).prop("first")===true) { filter.trigger("paste"); }
								});

								var div = $("<div class='input-group filter-daterange'></div>")
									.append(filter)
									.append("<div class='input-group-prepend input-group-append'><div class='input-group-text'><i class='far fa-calendar-alt' aria-hidden='true'></i></div></div>")
									.append(filterTo);
								break;
								
							case "text":
							case "input":
								var filter = $("<input>").addClass("form-control").attr({
									"data-toggle": "tooltip",
									"data-placement": "top"
									//,"title": params.help
								});
								var div = $("<div class='filter-input'>").append(filter);
								break;

							case "empty":
								var uid = jQuery.uid();
								var filter = $("<input>", {class:"form-onoffswitch-checkbox", type:"checkbox", id:uid});
								var div = $("<div>", {class:"form-onoffswitch-container filter-switch"})
											.html(
												$("<div>", {class:"form-onoffswitch-button"})
													.html(
														$("<div>", {class:"form-onoffswitch"})
															.html(filter)
															.append($("<label>", {class:"form-onoffswitch-label", for:uid}))
													)
											)
								break;
						}

						filter
							.prop("filter-type", type)
							.on("keyup paste change", function() {
								$("td:nth-child("+colnum+")", $("tbody", table)).parent().show();
								$("select,input", tr).not($(this)).trigger("filter");
								$(this).trigger("filter");
							})
							.on("filter", function() {
								var filterField = $(this);
								var filterVal = $this.GetValue(type, filterField);
								var sign = false;
								if(typeof filterVal!="object") {
									if(filterVal.substr(0,1)=="=" || filterVal.substr(0,1)=="<" || filterVal.substr(0,1)==">" || filterVal.substr(0,1)=="!") {
										if(filterVal.substr(1,1)=="=" || filterVal.substr(1,1)=="<" || filterVal.substr(1,1)==">") {
											sign = filterVal.substr(0,2);
											filterVal = filterVal.substr(2);
										} else {
											sign = filterVal.substr(0,1);
											if(sign=="=" || sign=="!") { sign += "="; }
											filterVal = filterVal.substr(1)
										}

										filterVal = filterVal.trim();
										if(!params.sensitive) { filterVal = filterVal.toLowerCase(); }
										var filterValText = '"'+filterVal+'"';
										if(!params.sensitive) { filterValText =  filterValText.toLowerCase(); }
									}
								}
								
								filterVal = filterVal.trim();
								if(!params.sensitive) { filterVal =  filterVal.toLowerCase(); }
								$("td:nth-child("+colnum+")", $("tbody", table)).not(".day").each(function(e){
									if(!splitter && filterVal!="" && filterVal!="**") {
										if(type=="multiple") {
											var hide = true;
											var curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
											curval = curval.trim();
											$.each(filterVal, function(i,j){
												if(!params.sensitive) { j = j.toLowerCase(); }
												if(j=="*" || j==curval) {
													hide = false;
													return true;
												}
											});
											if(hide) { $(this).parent().hide(); }
										} else if(type=="input") {
											var curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
											if(sign!==false) {
												if(isNaN(filterVal)) {console.log("dd")
													if(!eval('"'+curval+'"'+sign+filterValText)) { $(this).parent().hide(); }
												} else {
													if(!eval($.strToNumber(curval)+sign+$.strToNumber(filterVal))) { $(this).parent().hide(); }
												}
											} else {
												if(curval.indexOf(filterVal)==-1) { $(this).parent().hide(); }
											}
										} else if(type=="date") {
											var id = filterField.attr("id");
											var filterValDate = $("#"+id).data("DateTimePicker").date();
											filterValDate = (filterValDate) ? filterValDate.format("YYYYMMDD") : false;
											var curval = ($(this).data("df-value")) ? $(this).data("df-value") : $(this).text();
											curval = moment(curval).format("YYYYMMDD");
											if(filterValDate && curval!=filterValDate) { $(this).parent().hide(); }
										} else if(type=="daterange") {
											var id = filterField.attr("id").split("_")[0];
											var filterValFrom = $("#"+id+"_from").data("DateTimePicker").date();
											filterValFrom = (filterValFrom) ? filterValFrom.format("YYYYMMDD") : "19700101";
											var filterValTo = $("#"+id+"_to").data("DateTimePicker").date();
											filterValTo = (filterValTo) ? filterValTo.format("YYYYMMDD") : "20300101"
											var curval = ($(this).data("df-value")) ? $(this).data("df-value") : $(this).text();
											curval = moment(curval).format("YYYYMMDD");
											if(curval < filterValFrom || curval > filterValTo) { $(this).parent().hide(); }
										} else if(type=="empty") {
											if(filterField.prop("checked") && $(this).html().toLowerCase().trim()=="") { $(this).parent().hide(); }
										} else {
											var curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
											curval = curval.replace(/[\t\n\r]/ig, "").trim();
											if(("*"+curval)!=filterVal) { $(this).parent().hide(); }
										}
									} else if(splitter) {
										var curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
										curval = curval.replace(/[\t\n\r]/ig, "").trim();

										var hide = true;
										if(type=="multiple" && typeof filterVal=="object") {
											$.each(curval.split(splitter), function(z,w){
												w = w.trim();
												$.each(filterVal, function(i,j){
													if(!params.sensitive) { j = j.toLowerCase(); }
													if(j=="*" || j==w) {
														hide = false;
														return true;
													}
												});
											});
										} else {
											if(!params.sensitive) { filterVal = filterVal.toLowerCase(); }
											$.each(curval.split(splitter), function(z,w){
												w = w.trim();
												if(!params.sensitive) { w = w.toLowerCase(); }
												if(filterVal=="**" || filterVal=="*"+w) {
													hide = false;
													return true;
												}
											});
										}
										if(hide) { $(this).parent().hide(); }
									}
								});

								if(typeof params.afterFilter == "function") {
									params.afterFilter(table);
								}
							})
						;

						tr.append(
							$("<td>")
								.attr({"colspan":th.attr("colspan"), "title":th.text()})
								.css("display", th.css("display"))
								.addClass("table-filter-cell align-middle text-center")
								.html(div)
						);
					} else if(type=="index") {
						tr.append(
							$("<td>")
								.attr({"title":th.text()})
								.addClass("text-center cursor-pointer")
								.html(
									$("<i>")
										.addClass("fa fa-hashtag text-primary icon-md")
										.prop("aria-hidden", "true")
										.attr({
											"data-toggle": "tooltip",
											"data-placement": "top",
											"title": params.helphash
										})
										.click(function(){
											if($(this).hasClass("fa fa-hashtag")) {
												$(this).removeClass("fa fa-hashtag").addClass("fab fa-slack-hash");
												var x = 0;
												$("th[scope='row']:visible", table).each(function() {
													$(this).prop("realscope", $(this).text()).html(++x);
												});
											} else {
												$(this).removeClass("fab fa-slack-hash").addClass("fa fa-hashtag");
												$("th[scope='row']:visible", table).each(function() {
													$(this).html($(this).prop("realscope"));
												});												
											}
										})
								)
						)
					} else {
						tr.append(
							$("<td>")
								.addClass("table-filter-cell-none")
								.attr({"colspan":th.attr("colspan"), "title":th.text()})
								.css({"text-align":"center", "opacity":".3"})
								.html('<i class="fa fa-filter" aria-hidden="true"></i>')
						);
					}
				});

				if(typeof params.after == "function") {
					params.after(table);
				}
			};

			this.GetValue = function(type, field) {
				switch(type) {
					case "select": return "*"+field.find("option:selected").val();
					case "date": return field.val();
				}

				return field.val();
			}
			
			// disparador
			this.init(this.options);
		}
		});
})(jQuery);