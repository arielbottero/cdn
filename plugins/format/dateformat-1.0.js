/*
	d 		Day of the month as digits; no leading zero for single-digit days.
	dd 		Day of the month as digits; leading zero for single-digit days.
	ddd 	Day of the week as a three-letter abbreviation.
	dddd 	Day of the week as its full name.
	m 		Month as digits; no leading zero for single-digit months.
	mm 		Month as digits; leading zero for single-digit months.
	mmm 	Month as a three-letter abbreviation.
	mmmm 	Month as its full name.
	yy 		Year as last two digits; leading zero for years less than 10.
	yyyy 	Year represented by four digits.
	h 		Hours; no leading zero for single-digit hours (12-hour clock).
	hh 		Hours; leading zero for single-digit hours (12-hour clock).
	H 		Hours; no leading zero for single-digit hours (24-hour clock).
	HH 		Hours; leading zero for single-digit hours (24-hour clock).
	i 		Minutes; no leading zero for single-digit minutes.
	ii 		Minutes; leading zero for single-digit minutes.
	s 		Seconds; no leading zero for single-digit seconds.
	ss 		Seconds; leading zero for single-digit seconds.
	l or L 	Milliseconds. l gives 3 digits. L gives 2 digits.
	t 		Lowercase, single-character time marker string: a or p.
	tt 		Lowercase, two-character time marker string: am or pm.
	T 		Uppercase, single-character time marker string: A or P. Uppercase T unlike CF's t to allow for user-specified casing.
	TT 		Uppercase, two-character time marker string: AM or PM. Uppercase TT unlike CF's tt to allow for user-specified casing.
	Z 		US timezone abbreviation, e.g. EST or MDT. With non-US timezones or in the Opera browser, the GMT/UTC offset is returned, e.g. GMT-0500
	o 		GMT/UTC timezone offset, e.g. -0500 or +0230.
	S 		The date's ordinal suffix (st, nd, rd, or th). Works well with d.
	'â€¦'		Literal character sequence. Surrounding quotes are removed.
	"â€¦" 	Literal character sequence. Surrounding quotes are removed.
	UTC: 	Must be the first four characters of the mask. Converts the date from local time to UTC/GMT/Zulu time before applying the mask. The "UTC:" prefix is removed.
*/
(function($) {
	var pluginName = "dateformat";
  	
	// inicio del plugin
	function Plugin(element) {
		this.element	= element;	// elemento seleccionado
		this.el			= $(element); // jQuery element
		this.name		= pluginName; // nombre del plugin

		// valores por defecto
		this.options				= {};
		this.options.mask			= "dd/dd/yyyy HH:ii";
		this.options.utc			= false;
		this.options.lang			= "es";
		this.options.names			= {
										"en" : {
											"days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
											"months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
										},
										
										"es" : {
											"days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
											"months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
										}
									};
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

			// ejecuta el llamado a un metodo
			if(typeof($.data(this, pluginName)[options])==="function") {
				if(firstTime) { $.data(this, pluginName)["init"](); }
				$.data(this, pluginName)[options](parameters);
			} else {
				if(firstTime) { $.data(this, pluginName)["init"](options); }
			}

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
				options = {"mask":options};
			}

			// se extienden los valores default
			this.options = $.extend({}, this.options, options);

			// this
			var $this = this;

			// format
			if(this.el.is("input") || this.el.is("textarea") || this.el.is("select")) {
				this.el.on("format", function(){
					$(this).attr("data-df-value", $(this).val());
					var date = $this.dateformat($(this).val());
					if(date) {
						$(this).val($this.format(date, $this.options.mask, $this.options.utc));
					} else {
						$(this).val("");
					}
				}).trigger("format");
			} else {
				this.el.on("format", function(){
					$(this).attr("data-df-value", $(this).html());
					var date = $this.dateformat($(this).html());
					if(date) {
						$(this).html($this.format(date, $this.options.mask, $this.options.utc));
					} else {
						$(this).html("&nbsp;");
					}
				}).trigger("format");
			}

			return this;
		},

		format: function(date, mask, utc) {
			var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhisTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
				timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
				timezoneClip = /[^-+\dA-Z]/g,
				pad = function (val, len) {
					val = String(val);
					len = len || 2;
					while (val.length < len) val = "0" + val;
					return val;
				};


			// Regexes and supporting functions are cached through closure
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}
			date = date ? new Date(date) : new Date;
			//if(isNaN(date)) throw SyntaxError("invalid date");
			if(isNaN(date)) { return false; }

			mask = String(mask || this.options.format);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				i = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  this.options.names[this.options.lang].days[D].substring(0,3),
					dddd: this.options.names[this.options.lang].days[D],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  this.options.names[this.options.lang].months[m].substring(0,3),
					mmmm: this.options.names[this.options.lang].months[m],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					i:    i,
					ii:   pad(i),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		},
		
		dateformat: function(dateformat) {
			if(typeof dateformat==="string") {
				if(dateformat.indexOf("-")==-1) {
					var parts = dateformat.split(/:/);
					if(parts[0]!="0000") {
						var jsdate = new Date(1970, 1, 1, parts[0], parts[1], parts[2] || 0);
					}
				} else {
					var parts = dateformat.split(/[- :]/);
					if(parts[0]!="0000") {
						var jsdate = new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0);
					}
				}
			}
			return jsdate || null;   
		}
	};

})(jQuery);