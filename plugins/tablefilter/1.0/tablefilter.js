(function(jQuery) {
	jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		tablefilter: function(params) {
			let $this = this;

			// valores por defecto
			this.options = {
				cols	: true,
				hidden	: false,
				sensitive : false,
				alltext	: "TODO",
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
				let table = $($this);
				let tr = $("<tr>").addClass("filters no-print d-none d-lg-table-row").prependTo($("thead", table));
				if(params.hidden) { tr.css("display", "none"); }

				if(params.cols!==true) {
					if(typeof params.cols!="array") {
						params.cols = params.cols.split(",");
					}

					params.cols = params.cols.map(function(a) { return parseInt(a); });
				}

				$("thead th", table).each(function(idx, th) {
					th = $(this);
					let type = th.data("filter") || "input";
					let splitter = th.data("filter-splitter") || false;

					if((type!="none" && type!="false" && type!="index") && (params.cols===true || jQuery.inArray((idx+1), params.cols)>=0)) {
						let colnum = (idx+1);
						type = type.toLowerCase();
						let filter, div, uid, filterTo;
						switch(type) {
							case "select":
							case "multiple":
								let values = [];
								$("td:nth-child("+colnum+")", table).each(function(){
									if($(this).text().indexOf("TODO")!=-1) { $(this).addClass("text-red"); }
									if(splitter) {
										values = values.concat($(this).text().split(";"));
									} else {
										values.push($(this).text());
									}
								});

								let clean = [];
								jQuery.each(values, function(i, e) {
									e = e.replace(/[\t\n\r]/ig, "").trim();
									if(jQuery.inArray(e, clean)== -1) { clean.push(e); }
								});
								values = clean.sort();
								
								let options = "<option value='*' selected>"+params.alltext+"</option>";
								jQuery.each(values, function() {
									options += "<option value='"+this+"'>"+this+"</option>";
								});

								filter = $("<select>", {"data-live-search":"true"}).addClass("custom-select").html(options);
								if(type=="multiple") { filter.attr("multiple", "multiple"); }
								div = $("<div class='filter-select'>").append(filter);
								if(jQuery().selectpicker) {
									filter.removeClass("custom-select").selectpicker().on("hidden.bs.select", function(){
										let values = filter.selectpicker("val");
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
								uid = jQuery.uid();
								filter = $("<input>").addClass("form-control").val(" ").attr("id", uid);;
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
								div = $("<div class='input-group filter-date'><div class='input-group-prepend'><div class='input-group-text'><i class='far fa-calendar-alt' aria-hidden='true'></i></div></div></div>").append(filter);
								break;

							case "daterange":
								uid = jQuery.uid();
								filter = $("<input>").addClass("form-control").val(" ").attr("id", uid+"_from");
								filterTo = $("<input>").addClass("form-control").val(" ").attr("id", uid+"_to");
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

								div = $("<div class='input-group filter-daterange'></div>")
									.append(filter)
									.append("<div class='input-group-prepend input-group-append'><div class='input-group-text'><i class='far fa-calendar-alt' aria-hidden='true'></i></div></div>")
									.append(filterTo);
								break;
								
							case "text":
							case "input":
								filter = $("<input>").addClass("form-control").attr({
									"data-toggle": "tooltip",
									"data-placement": "top"
									//,"title": params.help
								});
								div = $("<div class='filter-input'>").append(filter);
								break;

							case "empty":
								uid = jQuery.uid();
								filter = $("<input>", {class:"form-onoffswitch-checkbox", type:"checkbox", id:uid});
								div = $("<div>", {class:"form-onoffswitch-container filter-switch"}).html(
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
								$(this).trigger("filter");
							})
							.on("filter", function() {
								let filterField = $(this);
								let filterVal = $this.GetValue(type, filterField);
								let sign = false;
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

									}
									filterVal = filterVal.trim();
									if(!params.sensitive) { filterVal = filterVal.toLowerCase(); }
									let filterValText = '"'+filterVal+'"';
									if(!params.sensitive) { filterValText =  filterValText.toLowerCase(); }
								}
								
								if(typeof filterVal=="String") { filterVal = filterVal.trim(); }
								$("td:nth-child("+colnum+")", $("tbody", table)).not(".day").each(function(e){
									$this.Toggle($(this).parent(), colnum, false); 

									let hide = false;
									if(!splitter && filterVal!="" && filterVal!="**") {
										if(type=="multiple") {
											hide = true;
											let curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
											curval = curval.trim();
											$.each(filterVal, function(i,j){
												if(!params.sensitive) { j = j.toLowerCase(); }
												if(j=="*" || j==curval) {
													hide = false;
													return true;
												}
											});
										} else if(type=="input") {
											if(!params.sensitive) { filterVal =  filterVal.toLowerCase(); }
											let curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
											if(sign!==false) {
												if(isNaN(filterVal)) {
													if(!eval('"'+curval+'"'+sign+filterValText)) { hide = true; }
												} else {
													if(!eval($.strToNumber(curval)+sign+$.strToNumber(filterVal))) { hide = true; }
												}
											} else {
												if(curval.indexOf(filterVal)==-1) { hide = true; }
											}
										} else if(type=="date") {
											let id = filterField.attr("id");
											let filterValDate = $("#"+id).data("DateTimePicker").date();
											filterValDate = (filterValDate) ? filterValDate.format("YYYYMMDD") : false;
											let curval = ($(this).data("df-value")) ? $(this).data("df-value") : $(this).text();
											curval = moment(curval).format("YYYYMMDD");
											if(filterValDate && curval!=filterValDate) { hide = true; }
										} else if(type=="daterange") {
											let id = filterField.attr("id").split("_")[0];
											let filterValFrom = $("#"+id+"_from").data("DateTimePicker").date();
											filterValFrom = (filterValFrom) ? filterValFrom.format("YYYYMMDD") : "19700101";
											let filterValTo = $("#"+id+"_to").data("DateTimePicker").date();
											filterValTo = (filterValTo) ? filterValTo.format("YYYYMMDD") : "20300101"
											let curval = ($(this).data("df-value")) ? $(this).data("df-value") : $(this).text();
											curval = moment(curval).format("YYYYMMDD");
											if(curval < filterValFrom || curval > filterValTo) { hide = true; }
										} else if(type=="empty") {
											if(filterField.prop("checked") && $(this).html().toLowerCase().trim()=="") { hide = true; }
										} else {
											let curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
											curval = curval.replace(/[\t\n\r]/ig, "").trim();
											if(("*"+curval)!=filterVal) { hide = true; }
										}
									} else if(splitter) {
										let curval = (!params.sensitive) ? $(this).text().toLowerCase() : $(this).text();
										curval = curval.replace(/[\t\n\r]/ig, "").trim();

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
									}

									$this.Toggle($(this).parent(), colnum, hide);
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
												let x = 0;
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

			this.Toggle = function(row, cell, hide) {
				if(!row.hasProp("tableFilterCols")) { row.prop("tableFilterCols", {}); }
				let cols = row.prop("tableFilterCols");
				cols[cell] = hide ? 1 : 0;
				if(Object.values(cols).reduce((sum, a) => sum + a,0)) {
					row.hide();
				} else {
					row.show();
				}
				row.prop("tableFilterCols", cols);
			}

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