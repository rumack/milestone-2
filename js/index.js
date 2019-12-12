import * as barChart from './d3-charts/bar-chart.js';

d3.json('../data/ni-elections.json', (err, d) => {
	if (err) {
		console.log(err);
	}
	
	// Instantiate chart, and update in 5 seconds to check transition effects
	barChart.renderChart(d, 450, 350, '.bar-chart', '2015', 'BW');
	setTimeout(() => {
		barChart.updateBarchart(d, 450, 350, '.bar-chart', '2017');
	}, 5000);

});

