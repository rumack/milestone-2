import * as barChart from './charts/bar-chart.js';
import * as lineChart from './charts/line-chart.js';
import * as pieChart from './charts/pie-chart.js';
import * as stackedChart from './charts/stacked-chart.js';
import * as map from './charts/map.js';
import * as utils from './utilities.js';

// Queuing calls for data sources (election data and map data)
const q = d3.queue();
q.defer(d3.json, '../data/ni-elections.json');
q.defer(d3.json, '../data/ireland_norn.json');

// Act on results when returned
q.await((err, data, mapData) => {

	if (err) {
		console.log(err);
	}

	//Instantiate stacked chart
	stackedChart.renderChart(data, 400, 300, '.main__chart');

	// Instantiate map
	map.renderMap(mapData, data, 350, 325, '.main__map');

	// Instantiate column chart
	barChart.renderChart(data, 450, 375, '.bar-chart', '2017');
	
	// Instantiate line chart
	lineChart.renderChart(data, 450, 375, '.line-chart');

	// Instantiate pie chart
	pieChart.renderChart(data, 450, 375, '.pie-chart');

});

