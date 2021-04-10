/*** SimpleOMap v1.0
GitHub @hytcom
*/
jQuery.extend({
	simpleOMap : {
		target: null,
		map: null,
		markers: [],
		baseLayer: new OpenLayers.Layer.OSM(),
		settings: {
			width: "100%",
			height: "100%",
			zoom: 12,
			// minzoom: 2,
			// maxzoom: 18,
			// click: null,
			// clusters: {
			// 	active: false,
			// 	click: null,
			// 	grid: 40,
			// 	image: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
			// },
			// draggable: false,
			// dragend: null,
			layers: null
		},

		create: function(options) {
			let $this = this;

			$.extend($this.settings, options);
			$this.target = $(options.target);
			$this.mapid = $this.target.id();
			$this.target.width($this.settings.width).height($this.settings.height);

			var controls = {
				controls: [
				//   new OpenLayers.Control.Navigation(),
				//   new OpenLayers.Control.PanZoomBar(),
				//   new OpenLayers.Control.Attribution()
				]
			};

			if($this.settings.layers===null) { $this.settings.layers = [$this.baseLayer]; }

			$this.map = new OpenLayers.Map($this.mapid, controls);
			$this.addLayers($this.settings.layers);
			$this.setCenter(options.lat, options.lng);

			return this;
		},

		addLayers: function(layers) {
			for(let x in layers) {
				this.map.addLayer(layers[x]);
			}
		},

		addMarker: function(coords) {
			let $this = this;
			if(!Array.isArray(coords) && typeof(coords)=="object") { coords = [coords]; }
			
			let markers = [];
			$.each(coords, function(i, e) {
				let point = e;
				let lat = point.lat || point.x;
				let lng = point.lng || point.y;
				point.marker = $this.position(lat, lng);
				markers.push(point);
			});

		// 	if(this.settings.clusters.active) { this.createClusters(); }


			let layerMarkers = new OpenLayers.Layer.Markers("Markers");
			$this.map.addLayer(layerMarkers);

			for(let x in markers) {
				console.debug($this.faMarker("fas fa-home"))
				let icon = new OpenLayers.Icon($this.faMarker("fas fa-home"), 30, 10);

				let mark = new OpenLayers.Marker(markers[x].marker, icon);
				layerMarkers.addMarker(mark);

				// click event
				if(typeof $this.settings.click == "function") {
					mark.events.register("click", layerMarkers, function(){
						$this.settings.click(markers[x]);
					});
				}
			}

			return this;
		},

		coord: function(coord) {
			return parseFloat(coord.replace(/,/, "."));
		},

		position: function(lat, lng) {
			var fromProjection = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
			var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
			return new OpenLayers.LonLat(this.coord(lng), this.coord(lat)).transform( fromProjection, toProjection);
		},

		// clearMarkers: function(remove) {
		// 	var $this = this;
		// 	for(let i = 0; i < $this.markers.length; i++) {
		// 		$this.markers[i].setMap(null);
		// 	}
		// 	if(remove) { $this.markers = []; }
		// },

		// createClusters: function() {
		// 	var $this = this;
		// 	var toClustered = [];
		// 	for(mark in this.markers) {
		// 		if(this.markers[mark].visible) {
		// 			toClustered.push(this.markers[mark]);
		// 		}
		// 	}

		// 	this.clusterer = new MarkerClusterer(this.map, toClustered, {
		// 		zoomOnClick: false,
		// 		imagePath: $this.settings.clusters.image,
		// 		gridSize: $this.settings.clusters.grid
		// 	});

		// 	if(typeof $this.settings.clusters.click == "function") {
		// 		google.maps.event.addListener($this.clusterer, "click", function (c) {
		// 			$this.settings.clusters.click(c.getMarkers());
		// 		});
		// 	}

		// 	return this;
		// },

		// updateClusters: function() {
		// 	this.clusterer.clearMarkers();
		// 	this.createClusters();
		// },

		// getBounds: function() {
		// 	var bounds = new google.maps.LatLngBounds();
		// 	for(var x = 0; x < this.markers.length; x++) {
		// 		bounds.extend(this.markers[x].getPosition());
		// 	}

		// 	return bounds;
		// },

		// fitZoom: function() {
		// 	this.map.fitBounds(this.getBounds());
		// 	return this;
		// },

		faMarker: function(classes) {
			let icon = document.createElement("i");
			icon.className = classes;
			document.body.appendChild(icon);
			let glyph	= window.getComputedStyle(icon,":before").getPropertyValue("content");
			let color	= window.getComputedStyle(icon).color;
			let size	= window.getComputedStyle(icon).fontSize || 20;
			document.body.removeChild(icon);
			size = parseInt(size);
		
			glyph = glyph.charCodeAt(1).toString(16);
		
			let canvas, ctx;
			canvas = document.createElement("canvas");
			canvas.width = canvas.height = size;
			ctx = canvas.getContext("2d");
			ctx.fillStyle = color;
		
			ctx.font = size+"px Font Awesome 5 Pro";
			ctx.fillText(String.fromCharCode(parseInt(glyph, 16)), 0, size*.8);
			return canvas.toDataURL();
		},

		// addresscoords: function(address, after) {
		// 	var geocoder = new google.maps.Geocoder();
		// 	geocoder.geocode({"address":address}, function(results, status) {
		// 		after(results, status);
		// 	});
		// }

		setCenter: function(lat, lng, zoom) {
			if(!zoom) { zoom = this.settings.zoom; }
			this.map.setCenter(this.position(lat, lng), zoom);
		},

		fitZoom: function() {
			let view = this.map.getView();
			let extent = view.calculateExtent(this.map.getSize());
			let res = view.getResolution();
			view.fit(extent, this.map.getSize());
			view.setResolution(res);
		}
	}
});