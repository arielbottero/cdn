/*** SimpleOMap v1.0
GitHub @hytcom
*/
jQuery.extend({
	simpleOMap : {
		target: null,
		map: null,
		layers: {},
		markers: {},
		baseLayer: new ol.layer.Tile({ source: new ol.source.OSM() }),

		settings: {
			lat: 0,
			lng: 0,
			width: "100%",
			height: "100%",
			zoom: 12,
			click: null,
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

			// init
			$this.map = new ol.Map({
				target: $this.mapid,
				view: $this.setCenter($this.settings.lat, $this.settings.lng)
			});
			
			// layers
			if($this.settings.layers===null) { $this.settings.layers = [["base", $this.baseLayer]]; }
			$this.addLayers($this.settings.layers);

			// on click
			if($this.settings.click) {
				$this.map.on("singleclick", function(evt) {
					let feature = $this.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
						return feature;
					});

					if(feature) {
						let coordinates = feature.getGeometry().getCoordinates();
						$this.settings.click(feature.values_.data, coordinates);
					}
				});
			}

			return this;
		},

		addLayers: function(layers) {
			for(let x in layers) {
				this.layers[layers[x][0]] = layers[x][1];
				this.map.addLayer(layers[x][1]);
			}
		},

		/* fa icon by classname */
		// marker: {
		// 	type: "fa",
		// 	class: "fas fa-school",
		// 	color: "#FF0000"
		// },

		/* image */
		// marker: {
		// 	type: "image",
		// 	url: "https://www.lavanguardia.com/files/image_449_220/uploads/2017/07/19/5fa3cc4195df5.jpeg",
		// 	scale: .15
		// }

		/* text */
		// marker: {
		// 	type: "text",
		// 	string: "escuela",
		// 	scale: .75
		// }
		// coords = array[object{lat,lng}]
		// coords = object{id:object{lat,lng}}
		addMarker: function(layerName, coords) {
			let $this = this;
			let markers = [];

			$this.markers[layerName] = {};
			$.each(coords, function(i, e) {
				let point = e;
				let id = point.id || $.uid();
				let lat = point.lat || point.x;
				let lng = point.lng || point.y;

				marker = new ol.Feature({
					geometry: new ol.geom.Point($this.position(lat, lng)),
					data: point
				});

				if(point.marker) {
					let style = null;
					let nScale = point.marker.scale ? point.marker.scale : 1;
					let sColor = point.marker.color ? point.marker.color : "#AB0000";
					switch(point.marker.type.toLowerCase()) {
						case "fa":
							style = new ol.style.Style({
								text: new ol.style.Text($this.faMarker(point.marker))
							});
							break;

						case "image":
							style = new ol.style.Style({
								image: new ol.style.Icon({
									scale: nScale,
									src: point.marker.url
								})
							});
							break;

						case "text":
							style = new ol.style.Style({
								text: new ol.style.Text({
									text: point.marker.string,
									scale: nScale,
									textBaseline: "bottom",
									font: '900 16px "Sans"',
									fill: new ol.style.Fill({ color: sColor })
								})
							});
							break;
					}

					marker.setStyle(style);
				}
				
				markers.push(marker);
				$this.markers[layerName][id] = marker;
			});

			let layerMarkers;
			if(!$this.layers[layerName]) {
				layerMarkers = new ol.layer.Vector({
					source: new ol.source.Vector({
						features: markers
					})
				});
				$this.addLayers([[layerName, layerMarkers]]);
			} else {
				layerMarkers = $this.layers[layerName];
				layerMarkers.getSource().addFeatures(markers);
			}

			// fit zoom
			let layerExtent = layerMarkers.getSource().getExtent();
			if(isFinite(layerExtent[0])) {
				$this.map.getView().fit(layerExtent);
			} else {
				$this.map.getView().setZoom(2);
			}

			return this;
		},

		removeMarker: function(layerName, id) {
			this.layers[layerName].getSource().removeFeature(this.markers[layerName][id]);
			return this;
		},

		removeMarkers(layerName) {
			this.map.removeLayer(this.layers[layerName]);
			delete this.layers[layerName];
			return this;
		},

		coord: function(coord) {
			if(typeof(coord)=="string") { coord = coord.replace(/,/, "."); }
			return parseFloat(coord);
		},

		position: function(lat, lng) {
			return ol.proj.fromLonLat([this.coord(lng), this.coord(lat)]);
		},

		setCenter: function(lat, lng, zoom) {
			if(!zoom) { zoom = this.settings.zoom; }
			return new ol.View({
				center: this.position(lat, lng),
				zoom: zoom
			})
		},

		faMarker: function(options) {
			let sClass = options.class ? options.class : "fas fa-home";
			let sColor = options.color ? options.color : "#AB0000";
			let nScale = options.scale ? parseFloat(options.scale) : 1;

			let icon = document.createElement("i");
			icon.className = sClass;
			document.body.appendChild(icon);
			let glyph = window.getComputedStyle(icon,":before").getPropertyValue("content");
			document.body.removeChild(icon);

			return {
				text: glyph.replace(/"/g, ""),
				scale: nScale,
				textBaseline: "bottom",
				font: '900 16px "Font Awesome 5 Pro"',
				fill: new ol.style.Fill({ color: sColor })
			};
		},

		fitZoom: function() {
			this.map.getView().fit(this.map.getView().calculateExtent());
			return this;
		}


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



		// addresscoords: function(address, after) {
		// 	var geocoder = new google.maps.Geocoder();
		// 	geocoder.geocode({"address":address}, function(results, status) {
		// 		after(results, status);
		// 	});
		// }


	}
});