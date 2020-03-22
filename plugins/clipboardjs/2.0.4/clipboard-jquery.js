(function(jQuery) {
		jQuery.fn.extend({
		clipboard: function(params) {
			var $this = this;

			// valores por defecto
			this.options = {
				// boostrap modal
				modal				: document.body,

				// copy | cut
				action				: "copy",

				// data source
				mode				: "node", // node | text | html | attr | false (text param)

				// from text param
				text				: false,

				// tag attribute
				attribute			: false,

				// format
				reformat			: false,
				css					: {"color":"#000000", "font-family":"verdana"},
				remlinks			: false,
				
				// false | json_config
				success_after		: function(e) { e.clearSelection(); },
				success_notify		: {
										message: "copied to clipboard",
										classes: "btn btn-success btn-sm margin-sm margin-only-top"
									},

				// false | json_config
				error_after			: function(e) { e.clearSelection(); },
				error_notify		: {
										message: "error on copy",
										classes: "btn btn-danger btn-sm margin-sm margin-only-top"
									}
			};

			if(typeof params=="string") { params = { target: params }; }
			this.options = $.extend({}, this.options, this.hyphened("copy"), params);

			// método principal
			this.init = function(params) {
				if(typeof ClipboardJS=="undefined") {
					throw new Error("Undefined class Clipboard.js: https://clipboardjs.com");
				}

				var id = $this.id();
				var mode = ($this.options.mode!==false) ? $this.options.mode.toLowerCase() : false;

				if(mode=="node") {
					var clipboard = new ClipboardJS("#"+id, {
						target: function() {
							var target = $($this.options.target);

							if($this.options.reformat || $this.options.remlinks) {
								var content = $("<div>").attr("id", id+"_tmp").html(target.html());

								if($this.options.reformat) {
									content.css($this.options.css);
									$("*", content).each(function() { $(this).css($this.options.css); });
								}

								if($this.options.remlinks) {
									$("a", content).contents().unwrap();
								}

								target.parent().append(content);
								return content[0];
							} else {
								return target[0];
							}
						}
					});
				} else if(mode=="text") {
					var clipboard = new ClipboardJS("#"+id, {
						container: $this.options.modal,
						text: function() {
							var content = $($this.options.target).html();
							content = content.replace(/<br(.*?)>/gm, "\n");
							content = content.replace(/<\/?[^>]+(>|$)/g, "");
							content = content.replace(/(\t|&nbsp;)/gm, " ");
							content = content.replace(/( ){2,}/gm," ");
							content = content.replace(/\n(\t| )/gm, "\n");
							content = content.replace(/^(\r\n|\n|\r)/,"");
							content = content.replace(/(\r\n|\n|\r)$/,"");
							return content;
						}
					});
				} else if(mode=="html") {
					var clipboard = new ClipboardJS("#"+id, {
						container: $this.options.modal,
						text: function() {
							var content = $($this.options.target).html();
							content = content.replace(/(\t|&nbsp;)/gm, " ");
							content = content.replace(/( ){2,}/gm," ");
							content = content.replace(/\n(\t| )/gm, "\n");
							return content;
						}
					});
				} else if(mode=="attr") {
					var clipboard = new ClipboardJS("#"+id, {
						container: $this.options.modal,
						text: function() {
							return $($this.options.target).attr($this.options.attribute);
						}
					});
				} else {
					var clipboard = new ClipboardJS("#"+id, {
						container: $this.options.modal,
						text: function() { return $this.options.text; }
					});
				}

				clipboard.on("success", function(e) {
					$("#"+id+"_tmp").remove();
					params.success_after(e);
					if(params.success_notify!==false) {
						$.notify(params.success_notify);
					}
				});

				clipboard.on("error", function(e) {
					params.error_after(e);
					if(params.error_notify!==false) {
						$.notify(params.error_notify);
					}
				});
			};

			// disparador
			this.init(this.options);
		}
		});
})(jQuery);