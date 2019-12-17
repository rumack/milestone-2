import * as barChart from './charts/bar-chart.js';
import * as lineChart from './charts/line-chart.js';
import * as pieChart from './charts/pie-chart.js';

d3.json('../data/ni-elections.json', (err, d) => {
	if (err) {
		console.log(err);
	}

	// Instantiate column chart, and update in 5 seconds to check transition effects
	barChart.renderChart(d, 450, 350, '.bar-chart', '2017', 'BW');

	setTimeout(() => {
		barChart.updateBarchart(d, 450, 350, '.bar-chart', '2017');
	}, 5000);

	// Instantiate line chart, and update in 5 seconds to check transition effects
	lineChart.renderChart(d, 450, 350, '.line-chart', 'BW');

	setTimeout(() => {
		lineChart.updateLineChart(d, 450, 350, '.line-chart');
	}, 5000);

	// Instantiate pie chart, and update in 5 seconds to check transition effects
	pieChart.renderChart(d, 450, 350, '.pie-chart', 'BW');

	setTimeout(() => {
		pieChart.updatePieChart(d, 450, 350, '.pie-chart');
	}, 5000);
});

