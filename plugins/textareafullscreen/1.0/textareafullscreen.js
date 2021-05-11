/*

 jQuery Textarea Fullscreen Editor v1.0
 Fullscreen text editor plugin for jQuery.

 :For more details visit http://github.com/CreoArt/jquery.textareafullscreen

 - CreoArt <support@creoart.org>
 - http://github.com/CreoArt

 Licensed under Apache - https://raw.githubusercontent.com/CreoArt/jquery.textareafullscreen/master/LICENSE

*/
(function($) {
    "use strict";

    var isFullscreen = false,
        overlay,
        transitionDuration = 300,
        settings = {
            overlay: true,
            maxWidth: "",
            maxHeight: ""
        };
    var methods = {

        init: function(opts) {
            settings = settings || {};
            $.extend(true, settings, settings);
            $.extend(true, settings, opts);

            var el = $(this);
            if(!el.is("textarea") && !el.is("div") && !el.is("pre") && !el.is("code")) { return; }
			
            var content = '<div class="tx-editor-wrapper"><div class="tx-editor"><a href="#" class="tx-icon"></a></div></div>';
            var wrapper = $(content).insertAfter(this);
            var editor = wrapper.find(".tx-editor");
            var icon = editor.find(".tx-icon");
            editor.append(el);

            el.css({"resize": "none"});

            // ESC = closes the fullscreen mode
            $(".tx-editor > textarea").on("keydown", function(e) {
                if(e.keyCode == 27 && $(this).parent().hasClass("expanded")) {
                    icon.trigger("click");
                    e.stopPropagation();
                }
            });

            // fullscreen icon click event
            icon.on("click.txeditor.icon", function(e) {
                e.preventDefault();
                methods[isFullscreen ? "minimize" : "expand"]($(this).parent());
            });
            return this;
        },

        showOverlay: function(editor) {
            // $('<div class="tx-editor-overlay" />').appendTo("body")
            $('<div class="tx-editor-overlay" />').prependTo(editor.parent())
                .fadeTo(0, 1)
                .click(function() {
                    methods.minimize(editor);
                });
            return this;
        },

        removeOverlay: function() {
            var overlay = $(".tx-editor-overlay");
            if (overlay.length) {
                overlay.fadeTo(0, 0, function() {
                    $(this).remove();
                });
            }
            return this;
        },

        expand: function(editor) {
			editor.find("textarea").css({width: "100%", height: "100%"}).on("keydown", function(e) {
                if(e.keyCode==9 || e.which==9) {
                    e.preventDefault();
                    var s = this.selectionStart;
                    this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                    this.selectionEnd = s+1;
                }
            });
			
            settings.maxWidth ? editor.css("max-width", settings.maxWidth) : "";
            settings.maxHeight ? editor.css("max-height", settings.maxHeight) : "";
            if(settings.overlay) { methods.showOverlay(editor); }

            $(window).on("resize.txeditor", function() {
                relocate(editor);
            });

            editor.addClass("expanded");
            transitions(editor);

            return this;
        },

        minimize: function(editor) {
			editor.find("textarea").css({width: "", height: ""}).off("keydown");
            $(window).off("resize.txeditor", relocate(editor))
            editor.removeClass("expanded").css({"max-width": "none", "max-height": "none"});
            if(settings.overlay) { methods.removeOverlay(); }
            transitions(editor);

            return this;
        },

        /*
        destroy: function() {
            methods.removeOverlay();
            wrapper.insertBefore(el);
            wrapper.remove();

            $(window).off('keyup.txeditor')
                .off('resize.txeditor');

            return this;
        },
        */
    };

    var transitions = function (editor) {
        var el = editor.find("textarea");
		relocate(editor);
		if(isFullscreen) {
			el.focus();
			isFullscreen = false;
		} else {
			el.focus();
			editor.css("opacity", 1);
			isFullscreen = true;
		}

		return;
    };

    function relocate(el) {
        var yPos = 0 | ((($(window).height() - el.height()) / 2));
        var xPos = 0 | (($(window).width() - el.width()) / 2);
        el.css({"top": yPos, "left": xPos});

    }

    $.fn.textareafullscreen = function(method) {
        $.extend(methods, transitions);
        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + "does not exist on jQuery.textareafullscreen");
        }
    };
})(jQuery);
