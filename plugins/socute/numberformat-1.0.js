// el valor a formatear debe estar en formato deciaml mysql
// sin separador de miles y con . para los decimales
// 1200
// 123.56
// 1.25647

(function($) {
	var pluginName = "numberformat";
  	
	// inicio del plugin
	function Plugin(element) {
		this.element	= element;	// elemento seleccionado
		this.el			= $(element); // jQuery element
		this.name		= pluginName; // nombre del plugin

		// valores por defecto
		this.options				= {};
		this.options.format			= "number";
		this.options.append			= "";
		this.options.prepend		= "";
		this.options.decimal		= 2;
	};

	// se incorpora el plugin al objeto jQuery
	$.fn[pluginName] = function(options, parameters) {
		this.each(function() {
			var firstTime = false;
			
			// crea el plugin
			if(!$.data(this, pluginName)) {
				$.data(this, pluginName, new Plugin(this));
				var firstTime = true;
			}

			$.data(this, pluginName)["init"](options);

			// destructor
			if(options==="destroy") {
				delete $.data(this, pluginName);
			}
		});

		return this;
	};

	// funciones del plugin
	Plugin.prototype = {
		init: function(options) {
			if(typeof options==="string") {
				options = {"format":options};
			}

			// se extienden los valores default
			this.options = $.extend({}, this.options, options);

			// format
			if(this.el.is("input") || this.el.is("textarea") || this.el.is("select")) {
				this.el.val(this.formatNumber(this.el.val()));
			} else {
				this.el.html(this.formatNumber(this.el.html()));
			}

			return this;
		},

		formatNumber: function(val) {
			var val = $.strToNumber(val);
			switch(this.options.format) {
				case "money":
					val = parseFloat(val);
					return this.money(val, this.options.prepend);

				case "percent":
					val = parseFloat(val);
					return this.percent(val);

				case "decimal":
					val = parseFloat(val);
					return this.decimal(val, this.options.decimal);

				case "number":
				default:
					val = (this.options.decimal) ? parseFloat(val) : parseInt(val);
					return this.format(val, this.options.decimal);
			}
		},

		format: function(val, decimals) {
			var wNumbMoney = wNumb({
				decimals: decimals,
				thousand: ".",
				mark: ","
			});
			return wNumbMoney.to(val);
		},

		decimal: function(val, decimals) {
			var wNumbMoney = wNumb({
				decimals: decimals,
				mark: ","
			});
			return wNumbMoney.to(val);
		},

		money: function(val, prefix) {
			var wNumbMoney = wNumb({
				prefix: prefix,
				decimals: 2,
				thousand: ".",
				mark: ","
			});
			return wNumbMoney.to(val);
		},
		
		percent: function(val) {
			var wNumbMoney = wNumb({
				suffix: "%",
				decimals: 2,
				mark: ","
			});
			return wNumbMoney.to(val);
		}
	};

})(jQuery);