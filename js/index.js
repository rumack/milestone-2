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
	map.renderMap(mapData, 500, 500, '.map-ireland');

	// Instantiate column chart
	barChart.renderChart(data, 450, 350, '.bar-chart', '2017', 'BW');
	
	// Instantiate line chart
	lineChart.renderChart(data, 450, 350, '.line-chart', 'BW');

	// Instantiate pie chart
	pieChart.renderChart(data, 450, 350, '.pie-chart', 'BW');

	// Collect array of constituency areas
	const constitArray = Array.from(document.querySelectorAll('.map'));

	// Iterate over array of constituencies to set event listeners and update charts
	constitArray.forEach(el => {
		// Extract class name (constituency code)
		const constitID = el.classList[1];
		el.addEventListener('click', () => {
			// Use class name to update charts
			barChart.updateBarchart(data, 450, 350, '.bar-chart', '2017', `${constitID}`);
			lineChart.updateLineChart(data, 450, 350, '.line-chart', `${constitID}`);
			pieChart.updatePieChart(data, 450, 350, '.pie-chart', `${constitID}`);
		});
		
	});
});

