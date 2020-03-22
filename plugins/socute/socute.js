jQuery.extend({
	soCute: function(elem) {
		if(!elem) { var elem = $("body"); }

		// booleans
		$(".socute-boolean", elem).each(function() {
			var options = ($(this).hasAttr("socute-custom")) ? $(this).attr("socute-custom").split(";") : ["SI","NO"];
			$(this).html(($(this).html()=="1" || $(this).html()=="true") ? options[0] : options[1]);
		});

		// case [ socute-custom: {value:label;value:label;value:label} ]
		$(".socute-case", elem).each(function() {
			var options = ($(this).hasAttr("socute-custom")) ? jQuery.parseJSON($(this).attr("socute-custom")) : ["NO", "SI"];
			$(this).html(options[$(this).html()]);
		});

		// dates
		if(jQuery().dateformat) {
			$(".socute-date", elem).dateformat("dd/mm/yyyy");
			$(".socute-month", elem).dateformat("mm/yyyy");
			$(".socute-time", elem).dateformat("HH:ii:ss");
			$(".socute-hour", elem).dateformat("HH:ii");
			$(".socute-datetime", elem).dateformat("dd/mm/yyyy HH:ii:ss");
			$(".socute-cusdate", elem).each(function(){
				$(this).dateformat($(this).attr("socute-custom"));
			});
		}

		// numbres
		if((typeof wNumb != "undefined") && jQuery().numberformat) {
			$(".socute-number", elem).each(function() {
				$(this).numberformat({"decimal":0});
			});

			$(".socute-money", elem).each(function() {
				var currency = $(this).attr("socute-custom") || "";
				$(this).numberformat({"format":"money", "prepend":currency});
			});

			$(".socute-decimal", elem).each(function() {
				var decimal = $(this).attr("socute-custom") || 2;
				$(this).numberformat({"format":"decimal", "decimal":decimal});
			});

			$(".socute-percent", elem).numberformat("percent");
		}

		$(".socute-zerofill", elem).each(function(){
			var zeros = parseInt($(this).attr("socute-custom")) || 5;
			var zerospad = new Array(1 + zeros).join("0");
			$(this).text((zerospad + $(this).text()).slice(-zerospad.length));
		});
	}
});