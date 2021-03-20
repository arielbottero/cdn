/*

vRules["type"]
	all
	html
	color
	date
	datetime
	email
	filename
	int
	imya
	ipv4
	ipv6
	noempty
	number
	time
	url
	alpha
	string
	text
	symbols
	@regex
vRules["minlength"]
vRules["maxlength"]
vRules["greaterthan"]
vRules["lessthan"]
vRules["in"]

*/

(function($) {
	var sPluginName = "alvin";
  	
	// inicio del plugin
	function Plugin(element) {
		this.element				= element;	// elemento seleccionado
		this.el						= $(element); // jQuery element
		this.name					= sPluginName; // nombre del plugin
		
		this.aPatterns				= {};
		this.aPatterns["color"] 	= "#([0-9A-F]{6,8}|[0-9A-F]{3})";
		this.aPatterns["date"] 		= "[0-9]{4}\-([012][0-9]|3[01])\-([012][0-9]|3[01])";
		this.aPatterns["datetime"]	= "[0-9]{4}\-([012][0-9]|3[01])\-([012][0-9]|3[01])\ ([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])";
		this.aPatterns["email"] 	= "[a-zA-Z0-9\_\-]+(\.[a-zA-Z0-9\-\_]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})";
		this.aPatterns["filename"]	= "((?=^([a-z]:|\\\\))(^([a-z]:|\\\\)[^\/\?\<\>\:\*\|]+)|(?!^([a-z]:|\\\\))([^\\0]+))";
		this.aPatterns["imya"]		= "[a-zA-Z][a-zA-Z0-9]{31}";
		this.aPatterns["int"] 		= "[0-9]*";
		this.aPatterns["number"] 	= "[0-9\.\,\-]*";
		this.aPatterns["ipv4"] 		= "((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
		this.aPatterns["ipv6"] 		= "(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))";
		this.aPatterns["time"] 		= "([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?";
		this.aPatterns["url"] 		= "((http|ftp|HTTP|FTP)(s|S)?:\/\/)?([0-9a-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})([\/a-zA-Z0-9 \.-]*)*\/?";
	}

	// funciones del plugin
	Plugin.prototype = {
		init: function() {
		},
		
		check: function() {
			var node = this.el[0].nodeName.toLowerCase();
			if(node=="input" && this.el[0].type.toLowerCase()=="hidden") { return true; }

			this.el.prop("alvinerror", false);
			var div = this.el.closest(".form-group");
			$(".form-error", div).remove();
			if(node=="input" && (this.el[0].type.toLowerCase()=="radio" || this.el[0].type.toLowerCase()=="checkbox")) {
				var aRules = this.el.parents("div").hyphened("alvin");
				var val = $("input[name='"+this.el.attr("name")+"']:checked").val() || "";
			} else if(this.el.hasClass("form-date") && this.el.data("linked-with")) {
				var aRules = this.el.hyphened("alvin");
				var val = $("[name='"+this.el.data("linked-with")+"']").val();
			} else {
				var aRules = this.el.hyphened("alvin");
				var val = this.el.val();
			}
			
			var valid = true;
			if($.map(aRules, function(n, i) { return i; }).length) {
				valid = this.CheckValue(val, aRules);
			}

			if(valid!==true) {
				// var message = ("message" in aRules) ? decodeURIComponent(escape(aRules["message"])) : "error: "+valid;
				var message = ("message" in aRules) ? aRules["message"] : "error: "+valid;
				var errspan = $("<span>")
					.addClass("form-error")
					.html(message)
					.appendTo(div)
				;

				this.el.on("focus change", function(){
					errspan.remove();
				});

				this.el.prop("alvinerror", true);
			}
		},

		between: function(mValue, sMinValue, sMaxValue) {
			var aBetween	= [];
			aBetween[0]		= sMinValue;
			aBetween[1]		= (typeof sMaxValue!="undefined") ? sMaxValue : aBetween[0];
			aBetween[2]		= mValue;
			
			aBetween.sort(function(a, b) {
				var ax = [], bx = [];

				a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
				b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
				
				while(ax.length && bx.length) {
					var an = ax.shift();
					var bn = bx.shift();
					var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
					if(nn) return nn;
				}

				return ax.length - bx.length;
			});
			
			if(aBetween[0]==mValue) {
				return 0;
			} else if(aBetween[1]==mValue) {
				return 1;
			} else {
				return 2;
			}
		},

		CheckValue: function(mSource, vRules) {
			mValue = mSource;

			// require
			if("required" in vRules && mValue=="") {
				return "required";				
			}
			
			// type
			if("type" in vRules) {
				if(!this.ValidateByType(mSource, vRules["type"])) {
					return "type";
				}
			}

			nLength = mValue.length;

			// minlength
			if("minlength" in vRules && nLength < parseInt(vRules["minlength"])) {
				return "minlength";
			}

			// maxlength
			if("maxlength" in vRules && nLength > parseInt(vRules["maxlength"])) {
				return "maxlength";
			}

			// lessthan y greaterthan
			var bLess = ("lessthan" in vRules);
			var bGreat = ("greaterthan" in vRules);
			if(bLess || bGreat) {
				mLess = (bLess) ? vRules["lessthan"] : vRules["greaterthan"];
				mGreat = (bGreat) ? vRules["greaterthan"] : vRules["lessthan"];

				var nBetween = this.between(mValue, mLess, mGreat);

				if(bLess && !bGreat && nBetween>0) { return "lessthan"; }
				if(bGreat && !bLess && nBetween<2) { return "greaterthan"; }
				if(bGreat && bLess && nBetween!=1) { return "between"; }
			}
			
			// in
			if("in" in vRules) {
				var aIn = split(",", vRules["in"]);
				if(!$.inArray(mValue, aIn)) {
					return "in";
				}
			}

			return true;
		},

		ClearCharacters: function(sString, aParams, bInvert) {
			if(typeof bInvert == "undefined") { bInvert = false; }
			var nString = sString.length;
			for(x=0; x<nString; x++) {
				var sChar = sString[x];
				if(sChar.length) {
					var info = $().chrinfo(sChar);
					if(info) {
						if((info.type in aParams.types) || (info.group in aParams.groups) || (info.decimal in aParams.chars)) {
							if(bInvert) { return false; }
						} else {
							if(!bInvert) { return false; }
						}
					}
				}
			}
			
			return true;
		},

		empty: function(mValue) {
			var undef, nLen;
			var aEmptyValues = [undef, null, false, 0, "", "0"];
			for(var x=0, nLen=aEmptyValues.length; x<nLen; x++) {
				if(mValue===aEmptyValues[x]) {
					return true;
				}
			}
			return false;
		},

		ord: function(string) {
			return string.charCodeAt(0);
		},

		ValidateByType: function(mValue, sType) {
			var aParams = {};
			var bValid = false;
			switch(sType) {
				case "noempty":
					bValid = !this.empty(mValue);
					break;

				case "all":
				case "html":
					bValid = true;
					break;

				case "color":
				case "date":
				case "datetime":
				case "email":
				case "filename":
				case "int":
				case "imya":
				case "ipv4":
				case "ipv6":
				case "number":
				case "time":
				case "url":
					var regex = new RegExp("^"+this.aPatterns[sType]+"$", "mgi");
					bValid = regex.test(mValue);
					break;

				case "alpha":
					aParams["types"] = {"ABC":true, "ABU":true};
					aParams["groups"] = {};
					aParams["chars"] = {9:true,10:true,13:true,32:true};
					bValid = this.ClearCharacters(mValue, aParams);
					break;

				case "string":
					aParams["types"] = {"ABC":true, "ABU":true, "NUM":true};
					aParams["groups"] = {};
					aParams["chars"] = {9:true,10:true,13:true,32:true};
					bValid = this.ClearCharacters(mValue, aParams);
					break;

				case "text":
					aParams["types"] = {"ABC":true, "ABU":true, "NUM":true,"SYL":true, "SYM":true};
					aParams["groups"] = {"BASIC_LATIN_SYMBOLS":true};
					aParams["chars"] = {9:true,10:true,13:true,32:true};
					bValid = this.ClearCharacters(mValue, aParams, false, true);
					break;

				case "symbols":
					aParams["types"] = {"SYM":true};
					aParams["groups"] = {};
					aParams["chars"] = {};
					bValid = this.ClearCharacters(mValue, aParams, true);
					break;
				
				default :
					var regex = new RegExp(sType.substring(1), "mg");
					bValid = regex.test(mValue);
					break;
			}

			return bValid;
		},

		Symbols: function(aSymbols) {
			var aOrds = [];
			$.each(aSymbols, function() {
				aOrds[this] = true;
			})
			return aOrds;
		}
	};

	// se incorpora el plugin al objeto jQuery -----------------------------------------------------
	jQuery.fn[sPluginName] = function(options, parameters) {
		this.each(function() {
			var firstTime = false;
			
			// crea el plugin
			if(!jQuery.data(this, sPluginName)) {
				jQuery.data(this, sPluginName, new Plugin(this));
				var firstTime = true;
			}

			// ejecuta el llamado a un metodo
			if(typeof(jQuery.data(this, sPluginName)[options])==="function") {
				if(firstTime) { jQuery.data(this, sPluginName)["init"](); }
				jQuery.data(this, sPluginName)[options](parameters);
			} else {
				if(firstTime) { jQuery.data(this, sPluginName)["init"](options); }
			}

			// destructor
			if(options==="destroy") {
				delete jQuery.data(this, sPluginName);
			}
		});

		return this;
	};
})(jQuery);