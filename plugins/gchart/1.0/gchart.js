(function($) {
	jQuery.fn.gChart = function(source, config) {
		if(this.hasProp("gChartObject")) {
			if(typeof source=="string") {
				switch(source) {
					case "chart": return this.prop("gChartObject").chart;
					case "data": return this.prop("gChartObject").data;
					case "redraw": return this.prop("gChartObject").redraw;
				}
				return this;
			}
		}

		var $this = this;
		this.loaded = false;
		this.source;
		this.chart;
		this.data;

		// inicio
		if(typeof google=="undefined" || typeof google.charts=="undefined") { throw new Error("Undefined class google.charts: https://www.gstatic.com/charts/loader.js"); }
		if(typeof config=="undefined" || !config) { config = {"packages":["corechart"]}; }
		google.charts.load("current", config);
		google.charts.setOnLoadCallback(function() {
			$this.loaded = true;
			$this.draw(source);
		});

		this.redraw = function(data, append) {
			if(append) {
				$this.source.data = $.extend($this.source.data, data);
				for(let x in data) {
					$this.data.addRow(data[x]);
				}
			} else {
				$this.source.data = data;
				for(let x in data) {
					for(let y in data[x]) {
						$this.data.setValue(parseInt(x), parseInt(y), data[x][y]);
					}
				}
			}
			$this.chart.draw($this.data, $this.source.options);
		};

		this.draw = function(source, newdata) {
			if(!$this.loaded) { return false; }

			// table
			$this.data = new google.visualization.DataTable();
			for(let x in source.columns) {
				if(jQuery.isArray(source.columns[x])) {
					$this.data.addColumn(source.columns[x][0], source.columns[x][1]);
				} else {
					$this.data.addColumn(source.columns[x]);
				}
			}
			
			// data
			$this.data.addRows(source.data);

			// chart
			$this.chart = new google.visualization[source.chartType](this[0]);
			
			// click event
			if(typeof source.click == "function") {
				google.visualization.events.addListener($this.chart, "select", function() {
					source.click($this);
				}); 
			}

			if(typeof source.ready == "function") {
				google.visualization.events.addListener($this.chart, "ready", function() {
					source.ready($this);
				}); 
			}

			// save source
			$this.source = source;

			// draw
			$this.chart.draw($this.data, source.options);
		};

		this.prop("gChartObject", $this);
	}
})(jQuery);