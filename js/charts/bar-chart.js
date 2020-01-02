// ********** BAR CHART MODULE **********

// Exported functions at bottom of file

// Set margins for chart
const margin = {
	top: 100,
	left: 100,
	right: 60,
	bottom: 50
};

// Declare global variables
let svg, xScale, yScale, bodyGroup, tooltip, baseData; 

// Set colour function
const colors = (party) => {
	const colorRange = {
		DUP: '#D32F2F', 
		SF: '#3a5134', 
		SDLP: '#4f953b', 
		UUP: '#FF5722', 
		Alliance: '#FBC02D', 
		Others: '#757575'
	};
	return colorRange[party];
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
			if (obj.score !== null) {
				dataset.push(obj);
			}
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
				.rangeRound([0, width - (margin.right + margin.left)])
				.padding(0.5);
				
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
	.attr('id', 'body-clip-bars')
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
	// Remove obsolete rects
	bars.exit().remove();
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
			.on('mouseout', function(d, i, ns) {
				// Hide tooltip
				tooltip.transition().duration(500).style('opacity', 0);
			})
			// The transition that renders the data rects must come after mouse events - I think!
			.transition()
				.delay((d, i) => i * 25)
				.attr('x', (d, i) => xScale(d.party))
				.attr('y', (d, i) => yScale(d.score) - 5)
				.attr('height', d => (height - (margin.bottom + margin.top)) - (yScale(d.score) - 5))
				.attr('width', xScale.bandwidth())
				.attr('fill', (d, i) => colors(d.party));
				//.attr('pointer-events', 'auto');
}

// Function to render radio buttons
const renderRadioButtons = (width, height, DOMTarget, year, constitID) => {
	const elections = ['2005', '2010', '2015', '2017'];
	// Find current selected year
	const j = elections.indexOf(year);
	// Remove previous radio button form if present
	d3.select('.barchart-form').remove();
	// Initiate form
	const form = d3.select('.bar-chart')
					.append('form')
					.attr('class', 'barchart-form');
	
	// Add radio buttons
	const radios = form.selectAll('input')
				.data(elections)
				.enter()
				.append('input')
				.attr('type', 'radio')
				.attr('class', 'barchart-radio')
				.attr('id', (d, i) => `radio-${i}`)
				.attr('name', 'year')
				.attr('value', (d, i) => d)
				// Default to '2017'
				.property('checked', (d, i) => i === j)
				// Update upon radio button click
				.on('change', function() {
					// Find newly selected year
					const year = this.value;
					// Update chart to show data for selected year
					updateBarchart(baseData, width, height, DOMTarget, year, constitID);	
				})
	// Add radio button labels			
	const labels = form.selectAll('label')
				.data(elections)
				.enter()
				.append('label')
				.attr('class', 'barchart-label')
				.attr('for', (d, i) => `radio-${i}`)
				.text((d) => d)
				.append('span')
				.attr('class', 'barchart-radio-btn');

}

// Function to render the chart body 
const renderBody = (width, height, DOMTarget, datasrc, year, constitID) => {

	if (!bodyGroup) {
		bodyGroup = svg.append('g')
			.attr('class', 'body')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.attr('clip-path', 'url(#body-clip-bars)');
	} 
	renderBars(DOMTarget, width, height, datasrc);
	renderRadioButtons(width, height, DOMTarget, year, constitID);
}

// Export a function that uses all of the above to generate final chart
export const renderChart = (data, width, height, DOMTarget, year, constitID) => {
	baseData = data;
	const chartData = genChartData(data, year, constitID);
	console.log(chartData);
	generateScales(width, height, chartData);
	createSVG(width, height, DOMTarget);
	renderBody(width, height, DOMTarget, chartData, year, constitID);
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
	renderBody(width, height, DOMTarget, chartData, year, constitID);
	renderGraphTitle(width, height, year, chartData);
	updateAxisX();
	updateAxisY();	
}
