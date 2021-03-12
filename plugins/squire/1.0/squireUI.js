squireUI = function(selector, options) {
	Squire.prototype.getContent = function() {
		var div = document.createElement("DIV");
		div.appendChild(this.getSelection().cloneContents().cloneNode(true));
		return div.firstChild;
	};

	Squire.prototype.testPresenceinSelection = function(name, action, format, validation) {
		var path = this.getPath();
		var test = (validation.test(path) | this.hasFormat(format));

		if(name==action && test) {
			return true;
		} else {
			return false;
		}
	};

	var defaultOp = {
		ui			: "simple",
		color		: false,
		smallbar	: false,
		tags		: null,
		height		: false		
	};

	if(!options) {
		var options = defaultOp;
	} else {
		var options = $.extend(defaultOp, options);
	}

	$(selector).each(function() {
		var textarea = $(this).clone();

		/*
		var config		= {};
		config.ui		= $(this).attr("squireUI") || options.ui;
		config.color	= $(this).attr("squireUI-color") || options.color;
		config.smallbar	= $(this).attr("squireUI-smallbar") || options.smallbar;
		config.tags		= $(this).attr("squireUI-tags") || options.tags;
		config.height	= $(this).attr("squireUI-height") || options.height;
		*/
		var config = $.extend(options,  $(this).hyphened("squi"));

		// path relativo
		var retrievePath = function() {
			var scripts = document.getElementsByTagName("script");
			if(scripts && scripts.length > 0) {
				for(var i in scripts) {
					if(scripts[i].src && scripts[i].src.match(new RegExp("squire\\.js\?.*$"))) {
						return scripts[i].src.replace(new RegExp("(.*)squire\\.js\?.*$"), "$1");
					}
				}
			}
		};
		var currentpath = retrievePath();

		// css
		$("head").append($("<link rel='stylesheet' href='"+currentpath+"squireUI.css' type='text/css' media='screen' />"));

		// iframe
		var iframe = document.createElement("iframe");
		iframe.className = "squireUI-iframe";
		iframe.squire;
		
		// editor
		var editor = document.createElement("div");
		$(editor).load(currentpath+"ui/"+config.ui+".html?ui="+jQuery.uid(), function() {
			// container
			var container = this;
			
			// toolbar
			$(".squireUI-button", editor).click(function() {
				var iframe = $(this).parents().eq(3).find("iframe")[0];
				var action = $(this).data("action");

				test = {
					value: $(this).data("action"),
					testBold: iframe.squire.testPresenceinSelection("bold", action, "B", (/>B\b/)),
					testItalic: iframe.squire.testPresenceinSelection("italic", action, "I", (/>I\b/)),
					testUnderline: iframe.squire.testPresenceinSelection("underline", action, "U", (/>U\b/)),
					testUnorderedList: iframe.squire.testPresenceinSelection("makeUnorderedList", action, "UL", (/>UL\b/)),
					testOrderedList: iframe.squire.testPresenceinSelection("makeOrderedList", action, "OL", (/>OL\b/)),
					testLink: iframe.squire.testPresenceinSelection("makeLink", action, "A", (/>A\b/)),
					testImage: iframe.squire.testPresenceinSelection("insertImage", action, "IMG", (/>IMG\b/)),
					testQuote: iframe.squire.testPresenceinSelection("increaseQuoteLevel", action, "blockquote", (/>blockquote\b/)),
					isNotValue: function(a) { return (a==action && this.value !== ""); }
				};

				iframe.squire.alignRight		= function() { iframe.squire.setTextAlignment("right"); };
				iframe.squire.alignCenter		= function() { iframe.squire.setTextAlignment("center"); };
				iframe.squire.alignLeft			= function() { iframe.squire.setTextAlignment("left"); };
				iframe.squire.alignJustify		= function() { iframe.squire.setTextAlignment("justify"); };
				iframe.squire.makeHeading		= function() { iframe.squire.setFontSize("2em"); iframe.squire.bold(); };

				let dialog;
				switch(true) {
					case test.testBold: iframe.squire.removeBold(); break;
					case test.testItalic: iframe.squire.removeItalic(); break;
					case test.testUnderline: iframe.squire.removeUnderline(); break;
					case test.testLink:
						if(iframe.squire.getContent()) {
							let el = $(iframe.squire.getContent().nextSibling);
							dialog = BootstrapDialog.show({
								title: "Insertar Enlace",
								draggable: true,
								animate: true,
								draggable: true,
								message: $("<div></div>").html($(".squireUILink", container).html()),
								onhidden: function(e) {
									let modal = dialog.getModalBody();
									$(".squireUILinkURL", modal).val("");
									$(".squireUILinkURL", modal).addClass("empty");
									$(".squireUILinkTargetBlank", modal).prop("checked", true);
								},
								onshown: function(e) {
									let modal = dialog.getModalBody();
									let href = el.attr("href");
									let target = el.attr("target");

									// href
									if(href) { $(".squireUILinkURL", modal).removeClass("empty"); }
									$(".squireUILinkURL", modal).val(href);
									
									// target
									if(target && target.toLowerCase()=="_self") {
										$(".squireUILinkTargetSelf", modal).prop("checked", true);
									} else {
										$(".squireUILinkTargetBlank", modal).prop("checked", true);
									}

									$(".squireUILinkSubmit", modal).click(function () {
										let newhref = $(".squireUILinkURL", modal).val();
										let newtarget = $("input[name=squireUILinkTarget]:checked", modal).val();
										iframe.squire.makeLink(newhref, {target:newtarget});
										dialog.close();
									});
						
									$(".squireUILinkClear", modal).click(function () {
										iframe.squire.removeLink();
										dialog.close();
									});	
								}
							});
						}
						break;
					
					/*
					case test.testImage:
						e = iframe.squire.getContent();
						var src = e.src;
						var width = e.width;
						var height = e.height;
						// href
						if(href) { $(".squireUILinkURL", container).removeClass("empty"); }
						$(".squireUILinkURL", container).val(href);
						
						// target
						if(target.toLowerCase()=="_self") {
							$(".squireUILinkTargetSelf", container).prop("checked", true);
						} else {
							$(".squireUILinkTargetBlank", container).prop("checked", true);
						}

						$(".squireUILink", container).modal("show");
						break;
					*/
					
					case test.testOrderedList:
					case test.testUnorderedList:
						iframe.squire.removeList();
						break;

					case test.testQuote: iframe.squire.decreaseQuoteLevel(); break;

					case test.isNotValue("getHTML"):
						dialog = BootstrapDialog.show({
							title: "Código Fuente",
							draggable: true,
							animate: true,
							draggable: true,
							cssClass: "dialog-xl",
							message: $("<div></div>").html($(".squireUISource", container).html()),
							onhidden: function(e) {
								let modal = dialog.getModalBody();
								$(".squireUILinkURL", modal).val("");
								$(".squireUILinkURL", modal).addClass("empty");
								$(".squireUILinkTargetBlank", modal).prop("checked", true);
							},
							onshown: function(e) {
								let modal = dialog.getModalBody();
								$(".squireUISourceCode").val(iframe.squire.getHTML());
								$(".squireUISourceSubmit", modal).click(function () {
									iframe.squire.setHTML($(".squireUISourceCode", modal).val());
									textarea.html(iframe.squire.getHTML());
									dialog.close();
								});
								
							},
							onhidden: function(e) {
								$(".squireUISourceCode").text();
							}
						});
						break;

					case test.isNotValue("makeLink"):
						dialog = BootstrapDialog.show({
							title: "Insertar Enlace",
							draggable: true,
							animate: true,
							draggable: true,
							message: $("<div></div>").html($(".squireUILink", container).html()),
							onhidden: function(e) {
								let modal = dialog.getModalBody();
								$(".squireUILinkURL", modal).val("");
								$(".squireUILinkURL", modal).addClass("empty");
								$(".squireUILinkTargetBlank", modal).prop("checked", true);
							},
							onshown: function(e) {
								let modal = dialog.getModalBody();
								$(".squireUILinkSubmit", modal).click(function () {
									let href = $(".squireUILinkURL", modal).val();
									let target = $("input[name=squireUILinkTarget]:checked", modal).val();
									iframe.squire.makeLink(href, {target:target});
									dialog.close();
								});
					
								$(".squireUILinkClear", modal).click(function () {
									iframe.squire.removeLink();
									dialog.close();
								});	
							}
						});
						break;

					/*
					case test.isNotValue("insertImage"):
						dialog = BootstrapDialog.show({
							title: "Insertar Imagen",
							draggable: true,
							animate: true,
							message: $("<div></div>").html($(".squireUIImage", container).html())
						});
						break;
					*/

					case test.isNotValue("selectFont"):
						iframe.squire[action](prompt("Value:"));
						break;

					case test.isNotValue("setTextColour"):
						dialog = BootstrapDialog.show({
							title: "Color del Texto",
							draggable: true,
							animate: true,
							message: $("<div></div>").html($(".squireUITextColor", container).html()),
							onshown: function(e) {
								let modal = dialog.getModalBody();
								$(".squireUITextColorBack div", modal).each(function(){
									$(this).css("cursor", "pointer");
									$(this).hover(
										function(){ $(this).css({"border":"solid 1px #000000"}); },
										function(){ $(this).css({"border":"none"}); }
									);
									$(this).click(function(){
										iframe.squire.setHighlightColour($(this).prop("title"));
										dialog.close();
									});
								});
				
								$(".squireUITextColorFore div", modal).each(function(){
									$(this).css("cursor", "pointer");
									$(this).hover(
										function(){ $(this).css({"border":"solid 1px #000000"}); },
										function(){ $(this).css({"border":"none"}); }
									);
									$(this).click(function(){
										iframe.squire.setTextColour($(this).prop("title"));
										dialog.close();
									});
								});
							}
						});
						break;

					default:
						iframe.squire[action]();
						iframe.squire.focus();
				}
			});

			// UI
			// bar ---------------------------------------------------------------------------------
			if(config.color) { $(".squireUI-toolbar", container).css({"background-color" : config.color}); }
			if(config.smallbar) {
				$(".squireUI-toolbar", container).addClass("squireUI-small");
			}
			
			// images ------------------------------------------------------------------------------
			$(".squireUIImage", container).on("show.bs.modal", function (e) {
			});

			$(".squireUIImage", container).on("hidden.bs.modal", function (e) {
				$(".squireUIImageURL", container).val("");
				$(".squireUIImageWidth", container).val("");
				$(".squireUIImageHeight", container).val("");

				$(".squireUIImageURL", container).addClass("empty");
				$(".squireUIImageWidth", container).addClass("empty");
				$(".squireUIImageHeight", container).addClass("empty");
			});

			$(".squireUIImageSubmit", container).click(function () {
				var src = $(".squireUIImageURL", container).val();
				var width = $(".squireUIImageWidth", container).val();
				var height = $(".squireUIImageHeight", container).val();
				
				var attr = {};
				if(width) { attr.width = width; }
				if(height) { attr.height = height; }
				iframe.squire.insertImage(src, attr);
				$(".squireUIImage", container).modal("hide");
			});
		});

		// eventos
		iframe.addEventListener("load", function() {
			var doc = iframe.contentDocument;

			if(doc.compatMode!=="CSS1Compat") {
				doc.open();
				doc.write("<!DOCTYPE html><title></title>");
				doc.close();
			}

			if(iframe.squire) { return; }

			striptags = function(input, allowed) {
				allowed = (((allowed || '') + '')
					.toLowerCase()
					.match(/<[a-z][a-z0-9]*>/g) || [])
					.join('');
				
				var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
				return input.replace(commentsAndPhpTags, '')
					.replace(tags, function ($0, $1) {
						if($1=="a") {
							return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
						} else {
							return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? '<'+$1+'>' : '';
						}
					}
				);
			}

			iframe.squire = new Squire(doc);
			
			// eventos
			iframe.squire.addEventListener("keyup", function() {
				textarea.html(iframe.squire.getHTML());
				textarea.trigger("change");
			});

			iframe.squire.addEventListener("blur", function() {
				textarea.html(iframe.squire.getHTML());
				textarea.trigger("change");
			});

			iframe.squire.addEventListener("pathChange", function() {
				textarea.html(iframe.squire.getHTML());
				textarea.trigger("change");
			});

			iframe.squire.addEventListener("willPaste", function(e) {
				var get = document.createElement("div");
				get.appendChild(e.fragment);
			
				var set = document.createElement("div");
				if(options.tags) {
					set.innerHTML = striptags(get.innerHTML, options.tags);
				} else {
					set.innerHTML = get.innerHTML;
				}
				
				var frag = document.createDocumentFragment();
				while(set.firstChild) {
					frag.appendChild(set.firstChild);
				}

				e.fragment = frag;
				textarea.trigger("change");
			});
			
			iframe.contentWindow.squireUI = iframe.squire;
			iframe.squire.setHTML(textarea.text());
		});

		// print
		textarea.css("display", "none");
		var div = $("<div class='squireUI'>").append(textarea).append(editor).append(iframe);
		div.css({ "width": "100%" })
		
		if(config.height!==false) {
			$(".squireUI-iframe", div).css({
				"min-height": 0,
				"height": parseInt(config.height)+"px"
			});
		}

		$(this).replaceWith(div);
	});
}

function componentFromStr(numStr, percent) {
    var num = Math.max(0, parseInt(numStr, 10));
    return percent ?
        Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}

function rgbToHex(rgb) {
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
        r = componentFromStr(result[1], result[2]);
        g = componentFromStr(result[3], result[4]);
        b = componentFromStr(result[5], result[6]);
    
        hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;
}