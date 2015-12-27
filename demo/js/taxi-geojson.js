$(document).ready(function(){
	
	var map = L.map('map').setView([31.232757,121.47325], 16);
	var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', {
 	 attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		});
            
    map.addLayer(basemap);
           
	$.ajax({
		context: this,
		type: 'GET',
		dataType: "json",
		url: 'data/D_Friday_eps25_min6.geojson',
		success: function(data, textStatus, jqXHR){

			var group = new L.FeatureGroup();
		    // make the q-clusters
		    var optionQ = {
	            backgroundColor: '#0099dd',
	            dataFormat: 'GeoJSON',
	            clusterTolerance: 100,
	            reportingProperty: 'interval' 
			}
			console.log(data);
			var pointClusterer = new QCluster.PointClusterer(data, 'nigeria', map, 'nigeria-layer', optionQ);
			// group.addLayer(pointClusterer);
			// map.addLayer(group);
			// pointClusterer.clearLayers();


			data.features.forEach(function(d){
				d.date = new Date(d.properties.timestamp).getDate();
				// d.date = new Date(d.properties.timestamp); // this setting get the detailed time format
				d.hour = new Date(d.properties.timestamp).getHours();
			});
			// window.rawData = data; // pass the raw data to crossfilter
			// console.log(window.rawData);



			var taxis = crossfilter(data.features);
            var allTaxi = taxis.groupAll(); // dont know the purpose?
            
			// for date
            var dateTaxi = taxis.dimension(function(d){return d.date;});
            var dateTaxiGroup = dateTaxi.group();
            // for hour
            var hourTaxi = taxis.dimension(function(d){return d.hour;});
            var hourTaxiGroup = hourTaxi.group();

            var dateChart = dc.barChart("#dateChart");
            var hourChart = dc.barChart("#hourChart");

			function CreateGEOJson(filtered){
				var geojson = {};
				geojson['type'] = 'FeatureCollection';
				geojson['features'] = filtered;
				return geojson;
			}

			function dateFiltered(){
				// clear the marker layer
				pointClusterer.removeLayer(pointClusterer.layer);

				// make a new layer with filtered data with new geoJSON for plotting
				pointClusterer = new QCluster.PointClusterer(CreateGEOJson(dateTaxi.top(Infinity)), 'nigeria', map, 'nigeria-layer', optionQ);
			}

			function hourFiltered(){
				// clear the marker layer
				pointClusterer.removeLayer(pointClusterer.layer);

				// make a new layer with filtered data with new geoJSON for plotting
				pointClusterer = new QCluster.PointClusterer(CreateGEOJson(hourTaxi.top(Infinity)), 'nigeria', map, 'nigeria-layer', optionQ);
			}

            dateChart
                .width(400)
                .height(200)
                .transitionDuration(0)
                //    .mouseZoomable(true)
                .margins({top: 10, right: 20, bottom: 40, left: 80})
                .dimension(dateTaxi)
                .group(dateTaxiGroup)
                .on("filtered",dateFiltered)
                .x(d3.time.scale().domain(d3.extent(data.features, function(d) { return d.date; })))
                .xAxis().tickFormat();

            hourChart
                .width(400)
                .height(200)
                .transitionDuration(0)
                //    .mouseZoomable(true)
                .margins({top: 10, right: 20, bottom: 40, left: 80})
                .dimension(hourTaxi)
                .group(hourTaxiGroup)
                .on("filtered",hourFiltered)
                .x(d3.scale.linear().domain([0, 24]))
                .xAxis().tickFormat();

            dc.renderAll();
            
		},
		error: function(jqXHR, textStatus, errorThrown){
		}


	});
});

