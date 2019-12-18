import * as barChart from './charts/bar-chart.js';
import * as lineChart from './charts/line-chart.js';
import * as pieChart from './charts/pie-chart.js';
import * as map from './charts/map.js';

// Queuing calls for data sources (election data and map data)
const q = d3.queue();
q.defer(d3.json, '../data/ni-elections.json');
q.defer(d3.json, '../data/ireland_norn.json');

// Act on results when returned
q.await((err, data, mapData) => {

	if (err) {
		console.log(err);
	}

	// Instantiate map
	map.renderMap(mapData, 500, 500, '.map');
	// setTimeout(() => {
	// 	map.updateMap(mapData, 500, 300, '.map');
	// }, 5000);

	// Instantiate column chart, and update in 5 seconds to check transition effects
	barChart.renderChart(data, 450, 350, '.bar-chart', '2017', 'BW');
	setTimeout(() => {
		barChart.updateBarchart(data, 450, 350, '.bar-chart', '2017');
	}, 5000);

	// Instantiate line chart, and update in 5 seconds to check transition effects
	lineChart.renderChart(data, 450, 350, '.line-chart', 'BW');
	setTimeout(() => {
		lineChart.updateLineChart(data, 450, 350, '.line-chart');
	}, 5000);

	// Instantiate pie chart, and update in 5 seconds to check transition effects
	pieChart.renderChart(data, 450, 350, '.pie-chart', 'BW');
	setTimeout(() => {
		pieChart.updatePieChart(data, 450, 350, '.pie-chart');
	}, 5000);

});

