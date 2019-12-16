import * as barChart from './d3-charts/bar-chart.js';
import * as lineChart from './d3-charts/line-chart.js';

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
	lineChart.renderChart(d, 450, 350, '.line-chart', 'MU');

	setTimeout(() => {
		lineChart.updateLineChart(d, 450, 350, '.line-chart', 'NA');
	}, 5000);

});

