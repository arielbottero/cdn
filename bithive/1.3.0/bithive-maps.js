jQuery.extend(jQuery.bithive, {
	mapMark: function(url, selector, address) {
		jQuery.ajax({
			url: url+address,
			success: function(src) {
				$(selector).attr("src", src);
			}
		});
	},

	mapAddress: function(url, selector, address, target) {
		target = (!target) ? $("body") : $(target);
		let coords = $("[geofill='coords']", target);
		if(coords.length) { if(coords.val()!="") { address = coords.val(); } }

		$(selector)
			.prop("lastsearch", false)
			.on("showmap", function(e){
				$(selector+"_coords").gmapicker({
					address: address,
					height: "280px",
					center: true,
					onload: function(map) {
						$(selector).prop("gmap", map);
					},
					after: function(m) {
						$(selector).val(m.info.lat+","+m.info.lng);
						if($(selector+"_coords").val()!=m.info.lat+","+m.info.lng) {
							$(selector).blur();
						}
					}
				});
			})
			.on("paste blur", function() {
				let locator = $(this);
				let search = locator.val();
				if(locator.prop("lastsearch")!=search) {
					locator.prop("lastsearch", search);
					setTimeout(function() {
						jQuery.ajax({
							url: url+search,
							dataType: "json",
							success: function(data) {
								if(data.results.length) {
									let lat = data.results[0].geometry.location.lat;
									let lng = data.results[0].geometry.location.lng;
									$(selector).prop("gmap").mark({lat: lat, lng: lng, center: true});
									$(selector+"_coords").val(lat+","+lng);
									$(selector+"_coords_span").html("Lat:"+lat+", Lng:"+lng);

									$("[geofill]", target).each(function(){
										let el = $(this);
										let val = el.attr("geofill");
										if(val=="coords") {
											el.val(lat+","+lng);
											if(el.hasAttr("onfill")) { el.change(); }
										} else if(val=="formatted_address") {
											el.val(data.results[0].formatted_address);
										} else {
											$.each(data.results[0].address_components, function(){
												if(jQuery.inArray(val, this.types)>=0) {
													el.val(this.long_name);
													return true;
												}
											});
										}
									});
								}
							}
						});
					}, 100);
				}
			})
			.trigger("showmap")
		;
	}
});