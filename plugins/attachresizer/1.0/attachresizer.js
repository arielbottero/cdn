(function(jQuery) {
		jQuery.fn.extend({ // jQuery.extend || jQuery.fn.extend
		attachresizer: function() {
			var $this = this;
			this.attach = $(this);
			this.target;
			this.outputWidth;
			this.outputHeight;
			this.cropper;
			this.inputhidden;
			
			this.init = function() {
				$this.outputWidth = $this.attach.attr("output-width");
				$this.outputHeight = $this.attach.attr("output-height");

				var buttons = $("<div>", {class:"attachresizer-buttons row"}).appendTo($this.attach);
				
				var gallery = $("<div>", {class:"col"});
				gallery.html($this.ResizerButton()).appendTo(buttons);

				navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
				if(typeof navigator.getUserMedia=="function") {
					navigator.getUserMedia({video: true}, 
						function(stream){
							var camera = $("<div>", {class:"col"});
							camera.html($this.ResizerButton(true)).appendTo(buttons);
						}, function(err) { console.log("UserMedia not present") } 
					);
				}
				
				$this.attach.prop("attachresizer", $this);
			};

			this.ResizerButton = function(camera) {
				var paddingClass = (camera) ? "pl-n": "pr-n";
				return $("<div>", {class: paddingClass})
					.css({"position": "relative"})
					.html(
						$("<div>", {class:"btn btn-primary c-pointer"})
							.css({
								"position": "absolute",
								"z-index": "1",
								"top": "0",
								"right": "0",
								"left": "0",
								"height": "8rem",
								"width": "100%",
								"padding": "30px"
							})
							.html(function() {
								return (camera) ? '<i class="fas fa-camera text-ww c-pointer"></i>' : '<i class="fas fa-image text-ww c-pointer"></i>'
							})
					).prepend(function() {
						let input =	$("<input>", {class:"c-pointer", type:"file", accept:"image/*"})
							.css({
								"overflow": "hidden",
								"position": "relative",
								"z-index": "2",
								"margin": "0",
								"opacity": "0",
								"height": "8rem",
								"width": "100%"
							})
							.change(function(){
								$this.target = $("<div>", {class:"d-inline-block w-100"}).css("position", "relative").appendTo($this.attach);
								$this.AttachResizer(this);
							})
						;
		
						if(camera) { input.attr("capture", "camera"); }
						return input;
					})
				;
			};
	
			this.FirstResize = function(img) {
				// var width = img.width;
				// var height = img.height;
				var width = parseInt($this.outputWidth);
				var height = parseInt(img.height * $this.outputWidth / img.width);
				var canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height);
				img.src = canvas.toDataURL("image/jpeg");
			};
	
			this.AttachResizer = function(input) {
				var width = $this.target.width();
				var height = $this.outputHeight * width / $this.outputWidth;
				$this.target.height(height);
		
				var reader = new FileReader();  
				reader.onload = function(e) {
					$("<div>")
						.css({"position":"absolute", "z-index": "3", "width":"32px", "opacity":".7", "right":"0"})
						.addClass("text-center m-xs")
						.append(
							$("<i>")
							.addClass("btn btn-sm btn-danger fas fa-trash")
							.click(function(){
								$(this).parent().remove();
								img.remove();
								$this.cropper.destroy();
								inputbox.show();
								$this.target.height("0px").css("margin-top", "0px");
							})
						)
						.append(
							$("<i>")
							.addClass("btn btn-sm btn-info fas fa-redo my-xs")
							.click(function(){
								$this.cropper.rotate(90);
							})
						)
						.append(
							$("<i>")
							.addClass("btn btn-sm btn-info fas fa-undo")
							.click(function(){
								$this.cropper.rotate(-90);
							})
						)
						.appendTo($this.target)
					;

					var inputbox = $(".attachresizer-buttons", $this.attach).hide();
					$this.inputhidden = $("<input>", {type: "hidden", name: $this.attach.attr("name")}).appendTo($this.attach);
		
					var img = $("<img>").prop("firstime", true).attr({src: e.target.result, width: "100%"}).appendTo($this.target);
					img[0].onload = function() {
						if(img.prop("firstime")) {
							img.prop("firstime", false);
							$this.FirstResize(this);
						} else {
							$this.cropper = new Cropper(this, {
								minCropBoxWidth: width,
								minCropBoxHeight: height,
								minCanvasWidth: width,
								minCanvasHeight: height,
								maxCanvasWidth: width,
								maxCanvasHeight: height,
								dragMode: "move",
								guides: false,
								cropBoxMovable: false,
								cropBoxResizable: false,
								toggleDragModeOnDblclick: false,
								checkOrientation: false
							});
						}
					};
				}
		
				reader.readAsDataURL(input.files[0]);
			};

			this.toField = function(type) {
				if(!$this.cropper) { console.log("Error: Missing cropper object"); return $this; }
				if(!type) { type = "jpeg"; }
				$this.inputhidden.val($this.cropper.getCroppedCanvas({width: $this.outputWidth, height: $this.outputHeight}).toDataURL("image/"+type));
				return $this;
			};

			this.toURL = function(type) {
				if(!$this.cropper) { console.log("Error: Missing cropper object"); return $this; }
				if(!type) { type = "jpeg"; }
				return $this.cropper.getCroppedCanvas({width: $this.outputWidth, height: $this.outputHeight}).toDataURL("image/"+type);
			};

			this.toBlob = function(functype, type) {
				if(!$this.cropper) { console.log("Error: Missing cropper object"); return $this; }
				if(!type) { type = "jpeg"; }
				$this.cropper.getCroppedCanvas({width: $this.outputWidth, height: $this.outputHeight}).toBlob("image/"+type);
				return $this;
			};

			// disparador
			this.init();
		}
	});
})(jQuery);