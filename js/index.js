import * as barChart from './d3-charts/bar-chart.js';
import * as areaChart from './d3-charts/area-chart.js';

d3.json('../data/ni-elections.json', (err, d) => {
	if (err) {
		console.log(err);
	}

	// Instantiate column chart, and update in 5 seconds to check transition effects
	barChart.renderChart(d, 450, 350, '.bar-chart', '2017', 'BW');

	setTimeout(() => {
		barChart.updateBarchart(d, 450, 350, '.bar-chart', '2017');
	}, 5000);

	// Instantiate area chart, and update in 5 seconds to check transition effects
	areaChart.renderChart(d, 450, 350, '.area-chart', 'MU');

	setTimeout(() => {
		areaChart.updateAreaChart(d, 450, 350, '.area-chart', 'NA');
	}, 5000);

});

