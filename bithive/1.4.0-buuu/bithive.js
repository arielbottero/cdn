jQuery.extend({
	bithive : {
		version: "2.0.0",
		ctxmenu: {menu: null, top:0, left:0},
		// httpRequests: 0,
		applies: [],
		dynCSS: {formats:{}},

		lang: {
			alertTitle: "Atención!",
			alvinErrorMessage: "Error en la carga del formulario.<br />Por favor revise los datos e intente nuevamente.",
			confirmTitle: "Confirmar",
			confirmQuestion: "Confirmar?",
			confirmMsgDelete: "Eliminar el registro?",
			confirmPassword: "Ingrese su Contraseña",
			confirmLeave: "Algunos datos han cambiado, está seguro de proseguir?",
			buttonOk: "Aceptar",
			buttonCancel: "Cancelar",
			buttonClose: "Cerrar",
			buttonAdd: "Agregar",
			clipboardSuccess: "Datos copiados al portapapeles",
			valueYes: "SI",
			valueNo: "NO",
			subFormLimitMsg: "Límite de registros alcanzado",
			buttonsSetDays: [
				{ "label":"Do", "value":"0" },
				{ "label":"Lu", "value":"1" },
				{ "label":"Ma", "value":"2" },
				{ "label":"Mi", "value":"3" },
				{ "label":"Ju", "value":"4" },
				{ "label":"Vi", "value":"5" },
				{ "label":"Sa", "value":"6" }
			],
			buttonsSetMonths: [
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
			],
			datePickerTooltips: {
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
			}
		},

		render: async function(elem, itself, func) {
			if(!elem) { var elem = $("body"); }
			if(typeof itself == "undefined") { var itself = false; }
			
			let styles = this.styles ? await this.styles(elem, itself) : true;
			let forms = this.formstyle ? await this.formstyle(elem, itself) : true;
			if(forms && this.formsview) { /*$.bithive.formsview(form);*/ }
			if(styles && forms) {
				if($("#bithive-loading").is(":visible")) {
					let code = $("body").html();
					let error = code.indexOf("[ NOGAL ERROR @");
					if(error>-1) {
						$("#bithive-loading").html(code.substring(error));
					} else {
						$("body").css("overflow", "auto");
						$("#bithive-loading").fadeOut("fast");
					}
				}
				return true;
			}
		},

		apply: async function(elem, itself, func) {
			this.applyStart(elem);
			let styles = $.bithive.styles ? $.bithive.styles(elem, itself) : true;
			let forms = $.bithive.formstyle ? $.bithive.formstyle(elem, itself) : true;
			if(forms && $.bithive.formsview) { /*$.bithive.formsview(form);*/ }
			if(styles && forms) {
				if(func) {
					let done = await $.bithive.run(func);
					return true;
				} else {
					this.applyEnd(elem);
				}
			}
		},

		applyStart: function(elem) {
			elem.addClass("applying");
		},

		applyEnd: function(elem) {
			elem.removeClass("applying");
		},

		run: function(code, args) {
			if(typeof window[code]=="function") {
				if(typeof args == "undefined") {
					return window[code]();
				} else {
					return window[code](args);
				}
			} else if(typeof $.bithive[code]=="function") {
				if(typeof args == "undefined") {
					return $.bithive[code]();
				} else {
					return $.bithive[code](args);
				}
			} else if(typeof code=="function") {
				if(typeof args == "undefined") {
					return code();
				} else {
					return code(args);
				}
			} else {
				return eval(code);
			}
		},

		getElement: function(selector, elem, itself) {
			return (itself && $(elem).is(selector)) ? $(elem) : $(selector, elem);
		},

		eachElement: async function(selector, elem, itself, callback) {
			if(typeof elem=="undefined") { var elem = $("body"); }
			if(elem[0]) {
				let objs = $.bithive.getElement(selector, elem, itself);
				return jQuery.when(jQuery.each(objs, callback)).then(function(){ return true; });
			}
		},

		isSmallScreen: function() {
			return (jQuery(window).width()<=767) ? true : false;
		},

		help: function(doc) {
			$.bithive.rightbar.load("https://wiki.hytcom.net/raw/abiz/"+doc+".md", true);
		},

		alert: function(msg, after) {
			BootstrapDialog.show({
				draggable: true,
				closable: false,
				type: BootstrapDialog.TYPE_WARNING,
				buttons: [{
					label: $.bithive.lang.buttonOk,
					cssClass: "btn-warning",
					action: function(dialog) {
						dialog.close();
						if(after) { after(); }
					}
				}],
				title: $.bithive.lang.alertTitle,
				message: msg,
			});
		},

		danger: function(msg, after) {
			BootstrapDialog.show({
				draggable: true,
				closable: false,
				type: BootstrapDialog.TYPE_DANGER,
				buttons: [{
					label: $.bithive.lang.buttonOk,
					cssClass: "btn-danger",
					action: function(dialog) {
						dialog.close();
						if(after) { after(); }
					}
				}],
				title: $.bithive.lang.alertTitle,
				message: msg,
			});
		},

		// msg: mensaje para el usuario o funcion que retorna o false, si retorna false se aborta el confirm
		// after: funcion que se ejecuta en caso afirmativo
		confirm: function(msg, after, secure) {
			if(typeof msg==="function" || typeof window[msg]==="function") {
				msg = $.bithive.run(msg);
			} else {
				msg = $("<h3>").html(msg);
			}
			if(msg===false) { return false; }

			let message = $("<div>", {class:"p-md"}).append(msg);
			if(typeof secure!=="undefined" && secure) {
				message.append(
					$("<div>", {"class":"form-group mt-md"})
						.html($("<label>", {"class":"control-label"}).html($.bithive.lang.confirmPassword))
						.append($("<input>", {type:"text", class:"form-control text-pwd"}))
				);
			}

			dialogOptions = {
				title: $.bithive.lang.confirmTitle,
				message: message,
				draggable: true,
				closable: false,
				type: BootstrapDialog.TYPE_DANGER,
				data: { "callback": after },
				onshown: function(dialog) {
					$.bithive.apply(dialog.getModalBody(), true);
				},
				buttons: [
					{ label: $.bithive.lang.buttonCancel, action: function(dialog) { dialog.close(); }}, 
					{
						label: $.bithive.lang.buttonOk,
						cssClass: "btn-danger",
						action: function(dialog) {
							dialog.getData("callback")(dialog);
							dialog.close();
						}
					}
				]
			};

			var dialog = BootstrapDialog.show(dialogOptions);
		},

		modal: function(options) {
			var id			= options.id || jQuery.uid();
			var classes		= (options.class) ? " "+options.class : " ";
			var size		= (options.size) ? "dialog-"+options.size : "";
			var title		= options.title || "&nbsp;";
			var closable	= (typeof options.closable == "undefined") ? true : options.closable;
			var content		= options.content || false;
			var url			= options.url || false;
			var onload		= options.onload || false;
			var btnClose	= (options.close) ? [{ label: options.close, cssClass: "btn-primary pull-center", action: function(dialogItself){ dialogItself.close(); }}] : null;
			
			// los elementos de la respuesta que tengan el atributo dialog-close, cerraran el dialogo
			if(url) {
				var message = $("<div>").id(id).addClass("container-fluid"+classes).load(url, function(){
					$.bithive.apply(message);
					if(onload) { onload(message); }
				});
			} else {
				var message = $("<div>").id(id).addClass("container-fluid"+classes).html($(content).html())
			}

			var dialogLinkLoaded = false;
			var dialogOptions = {
				draggable: true,
				title: title,
				closable: closable,
				message: message,
				cssClass: size,
				onshow: function(dialogRef){
					if(options.before) { $.bithive.run(options.before); }
				},
				onshown: function(dialogRef){
					var body = $("#"+id);
					var dialogLinkInterval = setInterval(function() {
						if(dialogLinkLoaded) {
							$.bithive.apply(body);
							$("[dialog-close]", body).click(function(){ dialogRef.close(); });
							clearInterval(dialogLinkInterval);
						}
					}, 100);
					if(options.after) { $.bithive.run(options.after); }
				}
			};
			
			if(btnClose!=null) { dialogOptions.buttons = btnClose; }
			var dialog = BootstrapDialog.show(dialogOptions);
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

		KeysFromData: function(elem, data) {
			if(typeof data == "undefined") { return string; }
			var string = elem.html();
			var newString = string.replace(/\{:([\w]*):\}/g, function(str, key) {
				return (typeof data[key]!=="undefined" && data[key] !== null) ? data[key] : "";
			});
			elem.html(newString);
		},

		enumerate: function(elem) {
			$(elem).each(function(x){
				$(this).html((x+1));
			});
		},

		print: function() {
			$("body").children().not("#bithive-loading").hideShow();
			$("body").addClass("bg-print");
			let printContent = $("#doccontent").clone();
			$(".no-print, .dropdown", printContent).remove();
			$("body").append(printContent);
			window.print();
			printContent.remove();
			$("body").children().not("#bithive-loading").hideShow();
			$("body").removeClass("bg-print");
		},

		loadDoc: function(target, href, after) {
			$(target).load(href, function(){
				$.bithive.apply($(this));
				if(after) { after(); }
			});
		},

		/*
			target:
				_blank
				_self
				jquery selector
				function
		*/
		postLink: function(btn, href, values, target) {
			if(typeof target!="undefined" && (target=="_blank" || target=="_self")) {
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
			} else {
				var formData = new FormData();
				if(values) {
					jQuery.each(values, function(key, value) {
						formData.append(key, value);
					});
				}

				var gyros = $("<div>").gyros({top: "-10px", width:"60px", stroke:2});
				btn.after(gyros).hide();

				$.ajax({
					type: "POST",
					url: href,
					data: formData,
					contentType: false,
					cache: false,
					processData: false,
					success: function(response) {
						gyros.remove();
						btn.show();
						$.bithive.ResponseHandler(response, btn, gyros, target);
					},
					error: function(response) {
						$.bithive.alert(response);
					}
				});
			}
		},

		parseMoney: function(str, decimal) {
			if(!decimal) { decimal = "."; }
			if(decimal==".") {
				return parseFloat(str.replace(/,/g, ""));
			} else {
				return parseFloat(str.replace(/./g, "").replace(/,/g, "."));
			}			
		},

		// jsonfill-id = nombre del indice en el JSON
		// jsonfill-attr = atributo al cual se asignará el valor
		jsonFiller: function(parsed, targetElement, func) {
			$.when(jQuery.each(parsed, function(key, value) {
				var target = $("[jsonfill-id='"+key+"']", targetElement);

				if(target.hasAttr("jsonfill-attr")) {
					target.attr(target.attr("jsonfill-attr"), value);
				} else if(target.is(":input")) {
					target.val(value);
				} else {
					target.html(value);
				}
			})).then(()=>{
				if(func) { func(); }
			});
		},

		prepareToPDF: function(elem) {
			let pdf = $("<div>").html(elem.clone());
			pdf.appendTo("body");
			
			let pdfContent = "";
			if($("form", pdf).length) {
				pdfContent = jQuery.formDataToJSON($("form", pdf), true);
			} else {
				$("*", pdf).not(":visible").remove();
				$(".no-print, .dropdown-menu", pdf).remove();

				// tablas
				$("div.pdf-table", pdf).each(function() {
					$("> div", $(this)).each(function() {
						$("> div", $(this)).each(function() {
							$(this).replaceWith($("<td>").html($(this).html()));
						});
						$(this).replaceWith($("<tr>", {valing:"top"}).html($(this).html()));
					});
					$(this).replaceWith($("<table>").attr({"data-pdfcss": "width:240px;border:solid 1px #000000"}).html($(this).html()));
				});
			
				// styles
				pdf.cssInline(["table", "thead", "tbody", "tr", "th", "div"], [
					"color", "background-color", "font-size", "display",
					"margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
					"padding", "padding-top", "padding-right", "padding-bottom", "padding-left", 
				]);
				$("[data-inlinecss]", pdf).each(function(k, v) {
					var attrs = $(v).attr("data-pdfcss")+";" || "";
					attrs += $.bithive.CSSToPDFConvert($(v).data("inlinecss"), 190, 1200);
					$(v).attr("data-pdfcss", attrs);
				});
			
				pdfContent = pdf.html();
			}

			pdf.remove();
			return pdfContent;
		},

		CSSToPDFConvert: function(inline, mm, px) {
			var regex = /(width|border-left|padding-left|margin-left|border-right|padding-right|margin-right):([0-9\.]+)(px|em|rem)/g;
			var matchs = $.getMatchAll(inline, regex);
			$.each(matchs, function(k, v){
				var regex = new RegExp(v[0], "g");
				var val = parseFloat(v[2]);
				if(v[3]!="px") { val = val/16; }
				if(val>0) {
					inline = inline.replace(regex, v[1] + ":" + (val * mm / px).toFixed(4)+"mm");
				}
			}); 
	
			var regex = /(height|border-top|padding-top|margin-top|border-bottom|padding-bottom|margin-bottom):([0-9\.]+)(px|em|rem)/g;
			var matchs = $.getMatchAll(inline, regex);
			$.each(matchs, function(k, v){
				var regex = new RegExp(v[0], "g");
				var val = parseFloat(v[2]);
				if(v[3]!="px") { val = val/16; }
				if(val>0) {
					inline = inline.replace(regex, v[1] + ":" + (val * mm / px).toFixed(4)+"mm");
				}
			});
	
			inline = inline.replace(/font\-family:(.*?);/g, "font-family:helvetica;");
			inline = inline.replace(/font\-size:(.*?);/g, "");
	
			return inline;
		},

		btrigger: {
			set: function(params) {
				if(typeof params[2]=="undefined") { ref = $.uid(); }
				$.removeCookie("btrigger_"+params[2]);
				$.cookie("btrigger_"+params[2], [params[0], params[1]]);
			},

			run: function() {
				$.each($.cookie(), function(k,i) {
					if(k.substr(0,9)=="btrigger_") {
						let evn = $.cookie(k);
						$(evn[0]).trigger(evn[1]);
					}
				});
			},

			clear: function() {
				$.each($.cookie(), function(k,i) {
					if(k.substr(0,9)=="btrigger_") {
						$.removeCookie(k);
					}
				});
			}
		},

		rightbar: {
			content: function(content) { 
				if(typeof content=="undefined") { return $("#rightbar-content").text(); }
				$("#rightbar-content").html(content);
			},

			load: function(url, md) {
				if(typeof url!="undefined") {
					$("#rightbar-content").load(url, function(response, status, xhr){
						if(md) {
							let sd = new showdown.Converter();
							$.bithive.rightbar.content(sd.makeHtml($.bithive.rightbar.content()));
						}
						let opened = $("#rightbar").prop("opened") || false;
						if(!opened) { $.bithive.rightbar.open(); }
					});
				}
			},

			open: function() {
				$("#rightbar-close", $("#rightbar")).click(function() { $.bithive.rightbar.close(); });
				$("#rightbar").addClass("rightbar-hover");
				$("#content").addClass("rightbar-open");
				$("#rightbar").prop("opened", true);
			},

			close: function() {
				$("#rightbar").removeClass("rightbar-hover");
				$("#content").removeClass("rightbar-open");
				$("#rightbar").prop("opened", false);
			}
		}
	}
});

// ejecución al inicio ---------------------------------------------------------
$(function() {
	// ctx menu
	$(document).on("click contextmenu", function (e) {
		if($.bithive.ctxmenu.menu) {
			if($(e.target).closest($.bithive.ctxmenu.menu).length === 0) {
				$(".dropdown-menu", $.bithive.ctxmenu.menu).removeClass("show").hide();
				$.bithive.ctxmenu.menu.removeClass("show").hide();
			}
		}
	});

	// tabs
	$(".nav-tabs a").on("shown.bs.tab", function(e) {
		$.bithive.btrigger.set([".nav-tabs a[href='"+$(this).attr("href")+"']","click","tab"]);
	});
});
