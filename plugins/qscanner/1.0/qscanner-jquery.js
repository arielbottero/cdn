(function(jQuery) {
    jQuery.extend({
		QScanner: function(params) {
			var $this = this;
			var stopped = false;
			var decoder;
			var theStream;

			// valores por defecto
			this.options = {
				// video element
				viewport	: null,

				// camara
				// user = camara frontal
				// environment = camara trasera
				camera		: "environment",

				// success
				success		: function(code) { alert(code); },

				// nocamera
				nocamera	: function() { alert("Camera not available"); }
			};

			// configuracion
			if(typeof params=="string") { params = { viewport: params }; }
			this.options = $.extend({}, this.options, params);

			// método principal
			this.init = function(params) {
				if(typeof QCodeDecoder=="undefined") {
					throw new Error("Undefined class qcode-decoder.js: https://github.com/cirocosta/qcode-decoder");
				}
				$this.decoder = new QCodeDecoder();
			};

			this.getUserMedia = function(options, successCallback, failureCallback) {
				if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
					return window.navigator.mediaDevices.getUserMedia(options, successCallback, failureCallback);
				} else {
					$this.options.nocamera();
				}
			};

			this.scanner = function(before) {
				if(before) { before(); }
				var video = $($this.options.viewport);
				var constraints = {video: {width:video.width(), height:video.height(), facingMode:{exact: $this.options.camera}}};
				$this.getUserMedia(constraints).then(function(stream) {
					var mediaControl = video[0];
					mediaControl.srcObject = stream;
					$this.theStream = stream;
					$this.decoder.decodeFromVideo(mediaControl, function(er, res){
						if(res && !$this.stopped) {
							$this.stopped = true;
							$this.options.success(res);
						}
					});
				});
			};

			this.close = function() {
				$this.decoder.stop();
				$this.theStream.getTracks()[0].stop();
			},

			this.stop = function() {
				$this.stopped = true;
			},

			this.resume = function() {
				$this.stopped = false;
			},

			// disparador
			this.init(this.options);
			return this;
		}
    });
})(jQuery);