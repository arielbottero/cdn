/*** SimpleOMap v1.0
GitHub @hytcom
*/
jQuery.extend({
	simpleOMap : {
		target: null,
		map: null,
		markers: [],
		baseLayer: new ol.layer.Tile({source: new ol.source.OSM() }),
		settings: {
			width: "100%",
			height: "100%",
			zoom: 12,
			minzoom: 2,
			maxzoom: 18,
			click: null,
			clusters: {
				active: false,
				click: null,
				grid: 40,
				image: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
			},
			draggable: false,
			dragend: null,
			layers: null
		},

		create: function(options) {
			let $this = this;
			$.extend($this.settings, options);
			$this.target = $(options.target);
			$this.target.width($this.settings.width).height($this.settings.height);

			if($this.settings.layers===null) {
				$this.settings.layers = [$this.baseLayer];
			}
			$this.map = new ol.Map({
				target: $this.target[0],
				layers: $this.settings.layers,
				view: new ol.View({
					center: ol.proj.fromLonLat([$this.coord(options.lng), $this.coord(options.lat)]),
					minZoom: $this.settings.minzoom,
					maxZoom: $this.settings.maxzoom,
					zoom: $this.settings.zoom
				})
			});

			return this;
		},

		addMarker: function(coords) {
			var $this = this;
			if(!Array.isArray(coords) && typeof(coords)=="object") { coords = [coords]; }

			
			$.each(coords, function(i, e) {
				let point = e;
				let lat = point.lat || point.x;
				let lng = point.lng || point.y;

				let marker = new ol.Feature({
					geometry: new ol.geom.Point(
						ol.proj.fromLonLat([$this.coord(lng), $this.coord(lat)])
					)
				});

				// marker.setStyle(new ol.style.Style({
				// 	image: new ol.style.Icon({
				// 		imgSize: [20, 20],
				// 		offset: [0, 0],
				// 		opacity: 1,
				// 		scale: 0.35,
				// 		// src: $this.faMarker("fas fa-dice-d6")
				// 		src: "/images/mapicons/school.png"
				// 	})
				// }));

				// var marker = new google.maps.Marker({
				// 	map: $this.map,
				// 	position: position,
				// 	title: point.title || "lat:"+lat+", lng:"+lng,
				// 	source: point,
				// 	draggable: $this.settings.draggable
				// });
				
				// if(typeof $this.settings.click == "function") {
				// 	marker.addListener("click", function() {
				// 		$this.settings.click(point);
				// 	});
				// }

				// if($this.settings.draggable && typeof $this.settings.dragend == "function") {
				// 	marker.addListener("dragend", function() {
				// 		$this.settings.dragend(marker);
				// 	});
				// }

				$this.markers.push(marker);
			});

		// 	if(this.settings.clusters.active) { this.createClusters(); }

			let layerMarkers = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: this.markers
				}),

				style: new ol.style.Style({
					image: new ol.style.Icon({
						anchor: [0.5, 0.5],
						anchorXUnits: "fraction",
						anchorYUnits: "fraction",
						src: "/images/mapicons/school.svg"
					})
					// text: new ol.style.Text({
					// 	text: '\uf041',
					// 	font: 'normal 38px "Font Awesome 5 Pro"',
					// 	fill: new ol.style.Fill({
					// 		color: '#ff0000'
					// 	})
					// })
				})
			});

			this.map.addLayer(layerMarkers);

			return this;
		},

		coord: function(coord) {
			return parseFloat(coord.replace(/,/, "."));
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

		// centerOn: function(coords) {
		// 	var coords = (typeof coords!="string") ? coords : coords.split(",");
		// 	this.map.setZoom(16);
		// 	this.map.setCenter({lat:parseFloat(coords[0]), lng:parseFloat(coords[1])});
		// },

		faMarker: function(classes) {
			var icon = document.createElement("i");
			icon.className = classes;
			document.body.appendChild(icon);
			var glyph	= window.getComputedStyle(icon,":before").getPropertyValue("content");
			var color	= window.getComputedStyle(icon).color;
			var size	= window.getComputedStyle(icon).fontSize || 20;
			document.body.removeChild(icon);
			size = parseInt(size);
		
			glyph = glyph.charCodeAt(1).toString(16);
		
			var canvas, ctx;
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
	}
});