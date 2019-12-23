// ********** BAR CHART MODULE **********

// Exported functions at bottom of file

// Set margins for chart
const margin = {
	top: 100,
	left: 100,
	right: 60,
	bottom: 60
};

// Declare global variables
let svg, xScale, yScale, bodyGroup, tooltip; 

// Set color function
const colors = (idx) => {
	const colorRange = ['#c13525', '#6da06f', '#b6e9d1', '#ff8652', '#ffbb43', '#afcfcf'];
	return colorRange[idx];
}

// Function to parse data for chart specific data
const genChartData = (data, year, constitID) => {
	if (constitID) {
		// Create array of all constituencies
		const constitArr = data[0].constituencies;
		// Isolate target constituency
		const constitObj = constitArr.filter(el => el.id === constitID)[0];
		// Get constituency full name
		const constitName = constitObj.Constituency;
		// Prepare final data array
		let dataset = [];
		// Store the election scores for specific year in an object
		const dataobj = constitObj[year].Scores;
		// Loop through the object to create final bar chart dataset
		for (const [key, value] of Object.entries(dataobj)) {
			let obj = {};
			obj.party = key;
			obj.score = value;
			obj.constit = constitName;
			dataset.push(obj);
		};
		// Return final chart data (array)
		return dataset;
	} else {
		// Prepare data object for paesed data
		let dataset = [];
		// Target 'totals' array
		const totalsArray = data[1].totals;
		// Filter 'totals' array to target specific year
		const totalsData = totalsArray.filter(el => el.year === year)[0];
		// Store the election scores for specific year in an object
		const dataobj = totalsData.Results;
		// Loop through the object to create final bar chart dataset
		for (const [key, value] of Object.entries(dataobj)) {
			let obj = {};
			obj.party = key;
			obj.score = value.total;
			obj.seats = value.seats
			dataset.push(obj);
		}
		// Return final chart data (array)
		return dataset;
	}
}

// Create SVG
const createSVG = (width, height, DOMTarget) => {

	if (!svg) {
		svg = d3.select(DOMTarget)
			.append('svg')
			.attr('class', 'svg--bar')
			.attr('height', height)
			.attr('width', width);
	}
} 

//Function to render chart title
const renderGraphTitle = (width, height, year, chartData) => {
	// Prepare for update - if title, remove title
	svg.selectAll('text.title').remove();
	// Check if data obj is for a constituency or for national
	if (!chartData[0].seats) {
		const constitName = chartData[0].constit;
		const text = svg.append('text')
			.attr('class', 'title')
	        .attr('x', (width / 2))             
	        .attr('y', (0 + 25));

	    text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`Vote share by party - General Election, ${year}`);

	    text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(`Constituency: ${constitName}`);
	// Check if data obj is for a constituency or for national
	} else if (chartData[0].seats) {
		const text = svg.append('text')
			.attr('class', 'title')
	        .attr('x', (width / 2))             
	        .attr('y', 0 + 25 )
	     
	    text.append('tspan')
	    	.attr('dy', 0)
	    	.attr('x', (width / 2))
	        .text(`Vote share by party - General Election, ${year}`);

	    text.append('tspan')
	    	.attr('dy', '2em')
	    	.attr('x', (width / 2))
	    	.text('All constituencies');
	}	
}

// Function to render the axis label on y
const createAxesLabels = (width, height) => {
	// Add the text label for the Y axis
    svg.append('text')
	    	.attr('class', 'label y')
	        .attr('transform', 'rotate(-90)')
	        .attr('y', 0 + 20)
	        .attr('x',0 - (height / 2))
	        .attr('dy', '1em')
	        .style('text-anchor', 'middle')
	        .text('Percentage share of vote');
};

// Function to generate scales
const generateScales = (width, height, chartData) => {
	// Looping to A) find highest/lowest values for Y axis
	// 			  B) get array of parties for the x axis domain, excluding those with score of false (no candidate)
	const xDomain = [];
	const yArray = [];
	chartData.forEach(obj => {
		if (obj.score !== null) {
			xDomain.push(obj.party);
			yArray.push(obj.score);
		}
	});
	// Finding the min and max values of y axis
	const yExtent = d3.extent(yArray);
	// Set scale for axes
	xScale = d3.scaleBand()
				.domain(xDomain)
				.range([0, width - (margin.right + margin.left)])
				.padding(0.4);
				
	yScale = d3.scaleLinear()
				.domain(yExtent)
				.rangeRound([height - (margin.top + margin.bottom), 0]);
};

// Function to render the x axis
const renderXAxis = (axesGroup, width, height) => {
	const xAxis = d3.axisBottom()
					.scale(xScale);
		
			axesGroup.append('g')
			.attr('class', 'x axis axis--barchart')
			.attr('transform', () => `translate(${margin.left}, ${height - margin.bottom})`)
			.call(xAxis);
};

// Function to render the y axis
const renderYAxis = (axesGroup, width, height) => {
	const yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(5)
			.tickFormat(d => d + '%');
	
		axesGroup.append('g')
		.attr('class', 'y axis axis--barchart')
		.attr('transform', () => `translate(${margin.left}, ${margin.top})`)
		.call(yAxis);
	
};

// Function to update the x axis
const updateAxisX = () => {
	const xAxis = d3.axisBottom()
					.scale(xScale);
	svg.select('g.x.axis--barchart')
		.transition()
		.call(xAxis);
}

// Function to update the y axis
const updateAxisY = () => {
	const yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(4)
			.tickFormat(d => d + '%');
	svg.select('g.y.axis--barchart')
		.transition()
		.call(yAxis);
}

// Function to render the axes
const renderAxes = (width, height) => {

	const axesGroup = svg.append('g')
				.attr('class', 'axes');
	
	renderXAxis(axesGroup, width, height);
	renderYAxis(axesGroup, width, height);
};

// Setting body clip
const defineBodyClip = (width, height) => {
	// Set padding for body clip
	const padding = 1;
	svg.append('defs')
	.append('clipPath')
	.attr('id', 'body-clip')
	.append('rect')
	.attr('x', 0 - padding)
	.attr('y', 0 - padding)
	.attr('width', width - (margin.left + margin.right) + (2 * padding))
	.attr('height', height - (margin.top + margin.bottom) + (2 * padding));
}

// Function to render html for tooltip
const genHTML = data => {
	const html = `
	<h4>${data.party}: <span>${data.score}%</span></h4>
	`;
	return html;
};

// Function to render bars for chart
const renderBars = (DOMTarget, width, height, datasrc) => {
	const barPadding = 1;
	// Create tooltip and hide it (bugfix: if it doesn't already exist)
	if (!tooltip) {
		tooltip = d3.select(DOMTarget)
					  .append('div')
					  .attr('class', 'tooltip barchart-tooltip')
					  .style('opacity', 0);
	}
	
	// Join the data
	const bars = bodyGroup.selectAll('rect.bar')
							.data(datasrc);
	// Add rects 					
	bars.enter()
			.append('rect')
		.merge(bars)
			.attr('class', 'bar')
			// Add tooltip on hover
			.on('mouseover', function(d) {

				tooltip.html(genHTML(d))
						.style('left', () => (d3.event.pageX - 40) + 'px')
						.style('top', () => (d3.event.pageY - 50) + 'px');

				tooltip.transition()
						.duration(500)
						.style('opacity', 1);

				
			})
			// Remove tooltip on mouseout
			.on('mouseout', function(d) {
				// Hide tooltip
				tooltip.transition().duration(500).style('opacity', 0);
			})
			// The transition that renders the data rects must come after mouse events - I think!
			.transition()
				.attr('x', (d, i) => xScale(d.party))
				.attr('y', (d, i) => yScale(d.score) - 5)
				.attr('height', d => (height - (margin.bottom + margin.top)) - (yScale(d.score) - 5))
				.attr('width', xScale.bandwidth() - barPadding)
				.attr('fill', (d, i) => colors(i));
				//.attr('pointer-events', 'auto');
}

// Function to render radio buttons
const renderRadioButtons = (width, height, datasrc) => {
	const elections = ['2005', '2010', '2015', '2017'];
	const j = 3;
	// If menu exists, restore default
	d3.selectAll('.barchart-form').remove();
	
		
	const form = d3.select('.bar-chart')
					.append('form')
					.attr('class', 'barchart-form');
					
	const labels = form.selectAll('label')
				.data(elections)
				.enter()
				.append('label')
				.text((d) => d)
				.insert('input')
				.attr({
					type: 'radio',
					class: 'radio-year',
					name: 'year',
					value: function (d, i) {
						return i;
					}
				})
				.property('checked', (d, i) => i === j);

	selectMenu.on('change', function() {
		const selected = d3.select(this).property('value');
		const tspans = d3.select('.svg-bar').selectAll('tspan');
		console.log(tspans);
		// switch(selected) {
		// 	case '2017':
		// 	updateBarchart()
		// }
		
	})
}

// Function to render the chart body 
const renderBody = (width, height, DOMTarget, datasrc) => {

	if (!bodyGroup) {
		bodyGroup = svg.append('g')
			.attr('class', 'body')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.attr('clip-path', 'url(#body-clip)');
	} 
	renderBars(DOMTarget, width, height, datasrc);
	//renderRadioButtons(width, height, datasrc);

}

// Export a function that uses all of the above to generate final chart
export const renderChart = (data, width, height, DOMTarget, year, constitID) => {
	const chartData = genChartData(data, year, constitID);
	generateScales(width, height, chartData);
	createSVG(width, height, DOMTarget);
	
	renderBody(width, height, DOMTarget, chartData);
	defineBodyClip(width, height);
	createAxesLabels(width, height);
	renderGraphTitle(width, height, year, chartData);
	renderAxes(width, height);
}	

// Export function to update chart with new data
export const updateBarchart = (data, width, height, DOMTarget, year, constitID) => {
	const chartData = genChartData(data, year, constitID);
	generateScales(width, height, chartData);
	createSVG(width, height, DOMTarget);
	renderBody(width, height, DOMTarget, chartData);
	renderGraphTitle(width, height, year, chartData);
	updateAxisX();
	updateAxisY();	
}
