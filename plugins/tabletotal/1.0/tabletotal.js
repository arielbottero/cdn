/*
	<th width="50" class="text-right" data-sorter="none" data-filter="index" data-total="index">#</th>
	<th width="120" data-total="none">Código</th>
	<th data-total="none">Nombre</th>
	<th data-total="avg" data-total-format="format-decimal" data-total-custom="4">Costo</th>
	<th data-total-format="format-money">Costo Stock</th>
*/
(function(jQuery) {
    jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		tabletotal: function(params) {
			var $this = this;

			// valores por defecto
			this.options = {
				nodata	: "Sin Datos",
				cssClass: "",
				hidden: false,
				before: function(table) {}, // tabla = elemento principal. Se ejecuta antes de leer todas las lineas
				after: function(table) {}, // tabla = elemento principal. Se ejecuta al finalizar todas las lineas
				row: function(tr) {} // tr = fila actual. Se ejecuta en cada linea
			};

			if(typeof params=="string") { params = { cols: params }; }
			this.options = $.extend({}, this.options, this.hyphened("tbtotal"), params);

			// método principal
			this.init = function(params) {
				var table = $($this);

				var tr = $("<tr>").addClass("table-total "+params.cssClass).appendTo($("thead", table));
				if(params.hidden) { tr.css("display", "none"); }

				var subtotal = false;
				var cols = {};
				$("thead th", table).each(function(idx, th) {
					th = $(this);
					var type = th.data("total") || "none";
					var format = th.data("total-format") || "";
					if(th.hasAttr("data-total-subtotal") && th.attr("data-total-subtotal")=="true") { subtotal = idx; };
					var filter = th.data("total-filter") || function(v) { return parseInt(v); };
					var formatCustom = th.data("total-custom") || "";

					type = type.toLowerCase();
					if(typeof filter == "string") { filter = eval("("+filter+")"); }

					var td = $("<th>")
						.attr("data-total-col", idx)
						.attr("colspan", th.attr("colspan"))
						.css("display", th.css("display"))
						.addClass("table-total-cell secondary "+format)
					;

					if(formatCustom!="") {
						td.attr("format-custom", formatCustom);
					}

					cols[idx] = { type: type, filter: filter };
					switch(type) {
						case "avg":
						case "max":
						case "min":
						case "sum":
							td.addClass("text-right").html("0");
							break;

						case "index":
							td.addClass("text-center").html("<i class='fas fa-equals icon-md'></i>");
							break;

						case "text":
							td.html(formatCustom);
							break;

						case "none":
						case "false":
						default:
							td.html("&nbsp;")
					}

					tr.append(td);
				});
				table.prop("tbtotal-cols", cols);
				table.prop("tbtotal-subtotal", subtotal);

				table.on("runtotals", function(){
					params.before(table);

					var cols = table.prop("tbtotal-cols");
					var subtotal = table.prop("tbtotal-subtotal");
					var lastSutotal = false;
					var totals = {};
					var subtotals = {};
					var rows = 0;
					$(">tbody tr:visible", table).each(function() {
						var tr = $(this);
						if(tr.hasClass("table-total-subtotal")) {
							tr.remove();
						} else {
							rows++;
							params.row(tr);
							$("td,th", tr).each(function(idx, col) {
								var value = $(col).text() || "";
								switch(cols[idx] && cols[idx].type) {
									case "avg":
									case "sum":
										if(!totals[idx]) { totals[idx] = 0; }
										if(!subtotals[idx]) { subtotals[idx] = 0; }
										totals[idx] += cols[idx].filter(value);
										subtotals[idx] += cols[idx].filter(value);
										break;

									case "max":
										value = cols[idx].filter(value);
										if(!totals[idx]) { totals[idx] = value; }
										if(!subtotals[idx]) { subtotals[idx] = value; }
										totals[idx] = (value>totals[idx]) ? value : totals[idx];
										subtotals[idx] = (value>subtotals[idx]) ? value : subtotals[idx];
										break;

									case "min":
										value = cols[idx].filter(value);
										if(!totals[idx]) { totals[idx] = value; }
										if(!subtotals[idx]) { subtotals[idx] = value; }
										totals[idx] = (value<totals[idx]) ? value : totals[idx];
										subtotals[idx] = (value<subtotals[idx]) ? value : subtotals[idx];
										break;
								}

								if(subtotal===idx && rows>1) {
									if(lastSutotal===false) { lastSutotal = value; }
									if(lastSutotal!=value) {
										var subtr = $("thead tr.table-total", table).clone().addClass("table-total-subtotal");
										$("th", subtr).each(function(idx, th) {
											var subth = $(th);
											switch(cols[idx] && cols[idx].type) {
												case "count":
													subth.html(rows);
													break;
				
												case "avg":
													if(subtotals[idx]) { subth.html(subtotals[idx]/rows); } else { subth.html(0); }
													break;
				
												case "max":
												case "min":
												case "sum":
													if(subtotals[idx]) { subth.html(subtotals[idx]); } else { subth.html(0); }
													break;
											}
											if(subtotal==idx) { subth.html(lastSutotal); }
										});
										lastSutotal = value;
										subtr.insertBefore(tr);
										subtotals = {};
									}
								}
							});
						}
					});

					// analizar que hace subtotal... me olvide...
					if(rows>0) {
						if(subtotal!==false) {
							var subtr = $("thead tr.table-total", table).clone().addClass("table-total-subtotal");
							$("th", subtr).each(function(idx, th) {
								var subth = $(th);
								switch(cols[idx] && cols[idx].type) {
									case "count":
										subth.html(rows);
										break;
	
									case "avg":
										if(subtotals[idx]) { subth.html(subtotals[idx]/rows); } else { subth.html(0); }
										break;
	
									case "max":
									case "min":
									case "sum":
										if(subtotals[idx]) { subth.html(subtotals[idx]); } else { subth.html(0); }
										break;
								}
								if(subtotal==idx) { subth.html(lastSutotal); }
							});
							subtr.appendTo("tbody", table);
						}

						$("thead tr.table-total", table).show();
						$("thead tr.table-total th", table).each(function(idx, th) {
							switch(cols[idx] && cols[idx].type) {
								case "count":
									$(th).html(rows);
									break;

								case "avg":
									if(totals[idx]) { $(th).html(totals[idx]/rows); } else { $(th).html(0); }
									break;

								case "max":
								case "min":
								case "sum":
									if(totals[idx]) { $(th).html(totals[idx]); } else { $(th).html(0); }
									break;
							}
						});

						$("tfoot .table-total", table).remove();
						$("thead tr.table-total", table).clone().appendTo($("tfoot", table));
					} else {
						$("thead tr.table-total", table).hide();
						$("tfoot .table-total", table).remove();
						$("<tr>", table)
							.addClass("table-total")
							.append(
								$("<th>").addClass("colspanall secondary text-center").html($this.options.nodata)
							).appendTo($("tfoot", table));
					}

					params.after(table);
				});
				
				if(!$("tfoot", table).length) { table.append($("<tfoot>")); }
				tr.trigger("runtotals");
			};

			// disparador
			this.init(this.options);
		}
    });
})(jQuery);