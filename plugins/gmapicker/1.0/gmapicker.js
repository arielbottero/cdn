(function($) {
	var sPluginName = "gmapicker";
  	
	// inicio del plugin
	function Plugin(element) {
		this.element	= element;	// elemento seleccionado
		this.el			= $(element); // jQuery element
		this.name		= sPluginName; // nombre del plugin
		this.map		= null;
		this.mapdiv		= null;
		this.info		= {lat: 0, lng: 0 };

		// valores por defecto
		this.options			= {};
		this.options.lat		= 0;
		this.options.lng		= 0;
		this.options.zoom		= 15;
		this.options.width		= null;
		this.options.height		= "300px";
		this.options.addmark	= false;
		this.options.center		= true;
		this.options.multiple	= false;
		this.options.draggable	= true;
		this.options.display	= true;
		this.options.onload		= null; // function(map) {}
		this.options.after		= null; // function(map) {}
		this.options.disabled	= false;
	}

	// funciones del plugin
	Plugin.prototype = {
		init: function(options) {
			// se extienden los valores default
			this.options = $.extend({}, this.options, options);

			// this
			var $this = this;

			// map
			$this.mapdiv = $("<div>");
			$this.el.after($this.mapdiv);
			
			if(!this.options.display) {
				$this.mapdiv.css("display", "none");
				this.el.click(function() {
					$this.mapdiv.toggle("fast", function(){
						$this.loadMap();
					});
				});
			} else {
				this.loadMap();
			}

			return this;
		},

		loadMap: function() {
			if(this.map!=null) { return true; }
			var width = (this.options.width!=null) ? this.options.width : "auto";
			var after = this.options.after || null;
			this.map = new GMaps({
				el: this.mapdiv[0],
				width: width,
				height: this.options.height,
				lat: this.options.lat,
				lng: this.options.lng,
				zoom: this.options.zoom
			});
			this.info.lat = this.options.lat;
			this.info.lng = this.options.lng;

			if(this.options.address) {
				var onload = this.options.onload || function() {};
				var $this = this;
				GMaps.geocode({
					address: this.options.address,
					callback: function(results, status) {
						if(status=="OK") {
							$this.MapInfo(results[0]);
							if($this.options.center) { $this.center(); }
							onload($this);
							$this.mark({after:after});
						}
					}
				});
			} else {
				if(typeof this.options.onload == "function") {
					this.options.onload(this);
				}
			}
		},

		address: function(options) {
			var address = options.address || options;
			var after = options.after || function() {};

			var $this = this;
			GMaps.geocode({
				address: address,
				callback: function(results, status) {
					if(status=="OK") {
						$this.MapInfo(results[0]);
						if($this.options.center) { $this.center(); }
						after($this);
					}
				}
			});
		},
		
		mark: function(options) {
			var options = options || {};
			var lat = options.lat || this.info.lat;
			var lng = options.lng || this.info.lng;
			var after = options.after || this.options.after;

			if(this.options.center) { this.center(lat, lng); }
			if(!this.options.multiple) { this.map.removeMarkers(); }

			var $this = this;
			if(this.options.disabled) {
				this.map.addMarker({lat: lat, lng: lng});
			} else {
				this.map.addMarker({
					lat: lat,
					lng: lng,
					draggable: this.options.draggable,
					dragend: function(marker) {
						GMaps.geocode({
							lat: marker.latLng.lat(),
							lng: marker.latLng.lng(),
							callback: function(results, status) {
								if(status=="OK") {
									$this.MapInfo(results[0]);
									if($this.options.center) { $this.center(); }
									if(typeof after=="function") { after($this); }
								}
							}
						});
					}
				});
			}
			this.info = {
				lat: lat,
				lng: lng,
				link: "https://maps.google.com/maps?z=15&q="+lat+","+lng
			};

			if($this.options.center) { $this.center(); }
			if(typeof after=="function") { after($this); }
		},
		
		center: function(options) {
			var options = options || {};
			var lat = options.lat || this.info.lat;
			var lng = options.lng || this.info.lng;
			this.map.setCenter(lat, lng);
		},

		container: function() {
			return this.mapdiv;
		},

		MapInfo: function(info) {
			this.info = {
				lat: info.geometry.location.lat(),
				lng: info.geometry.location.lng(),
				link: "https://maps.google.com/maps?z=15&q="+info.geometry.location.lat()+","+info.geometry.location.lng()
			};
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