// ********** LINE CHART MODULE **********

// Exported functions at bottom of file

// Set margins for chart
const margin = {
	top: 60,
	left: 80,
	right: 80,
	bottom: 80
};

// Set colour function
const colors = (party) => {
	const colorRange = {
		DUP: '#c13525', 
		SF: '#6da06f', 
		SDLP: '#b6e9d1', 
		UUP: '#ff8652', 
		Alliance: '#ffbb43', 
		Others: '#afcfcf'
	};
	return colorRange[party];
}

// Declare global variables
let svg, xScale, yScale, bodyGroup, tooltip; 

// Function to parse data needed for chart 
const genChartData = (data, constitID) => {
	// If specific constituency
	if (constitID) {
		// Create array of all constituencies
		const constitArr = data[0].constituencies;
		// Isolate target constituency
		const constitObj = constitArr.filter(el => el.id === constitID)[0];
		// Get constituency full name
		const constitName = constitObj.Constituency;
		// Prepare final data array
		let dataset = [[], [], [], [], [], []];
		const parties = ['DUP', 'SF', 'SDLP', 'UUP', 'Alliance', 'Others'];
		parties.forEach((el, idx) => {
			['2005', '2010', '2015', '2017'].forEach(elem => {
				const obj = {
					constituency: constitName,
					party: el,
					year: new Date(elem),
					vote: constitObj[elem].Scores[el]
				}
				dataset[idx].push(obj);
			})
		})
		// Return final chart data (array)
		return dataset;
	} else {
		// Otherwise, if national level
		// Prepare data array
		let dataset = [[], [], [], [], [], []];
		// Target 'totals' array
		const totalsArray = data[1].totals;
		const parties = ['DUP', 'SF', 'SDLP', 'UUP', 'Alliance', 'Others'];

		parties.forEach((el, idx) => {
			totalsArray.forEach(elem => {
				if (elem.year !== 'Brex') {
					const obj = {
						party: el,
						year: new Date(elem.year),
						vote: elem.Results[el].total,
						seats: elem.Results[el].seats
					}
					dataset[idx].push(obj);
				}
			})
		});
		// Return final chart data (array)
		return dataset;
	}
}

// Create SVG
const createSVG = (width, height, DOMTarget) => {
	if (!svg) {
		svg = d3.select(DOMTarget)
			.append('svg')
			.attr('height', height)
			.attr('width', width);
	}
} 

//Function to render chart title
const renderGraphTitle = (width, height, chartData) => {
	// Prepare for update - if title, remove title
	svg.selectAll('text.title').remove();
	// Check if data obj is for a constituency or for national
	if (chartData[0][0].constituency) {
		const constitName = chartData[0][0].constituency;
		const text = svg.append('text')
			.attr('class', 'title')
	        .attr('x', (width / 2))             
	        .attr('y', (0 + 25));

	    text.append('tspan')
	    	.attr('dx', 0)
	    	.attr("dy", 0)
	        .text(`NI General Election Vote Share`);

	    text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(`Constituency: ${constitName}`);
	// Check if data obj is for a constituency or for national
	} else if (!chartData[0][0].constit) {
		const text = svg.append("text")
			.attr('class', 'title')
	        .attr('x', (width / 2))             
	        .attr('y', 0 + 25 )
	     
	    text.append('tspan')
	    	.attr('dy', 0)
	    	.attr('x', (width / 2))
	        .text(`NI General Election Vote Share`);

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
	        .attr("transform", "rotate(-90)")
	        .attr('y', 0 + 20)
	        .attr('x',0 - (height / 2))
	        .attr('dy', '1em')
	        .style('text-anchor', 'middle')
	        .text('Percentage share of vote');
};

// Function to generate scales
const generateScales = (width, height, chartData) => {
	// Data is in nested arrays so looping to find highest/lowest values in each dataset
	const valuesArrX = [];
	const valuesArrYvote = [];
	const valuesArrYseats = [];
	for (let i = 0; i < chartData.length; i++) {
		for (let j = 0; j < chartData[i].length; j++) {
			valuesArrX.push(chartData[i][j].year);
			valuesArrYvote.push(chartData[i][j].vote);
			valuesArrYseats.push(chartData[i][j].seats);
		}
	}
	const extentX = d3.extent(valuesArrX);
	const extentYvote = d3.max(valuesArrYvote); 
	const extentYseats = d3.extent(valuesArrYseats);
	
	xScale = d3.scaleTime()
				.domain(extentX)
				.range([0, width - (margin.right + margin.left)]);

	yScale = d3.scaleLinear()
				.domain([0, extentYvote])
				.range([height - (margin.top + margin.bottom), 0]);
		
}

// Function to render the x axis
const renderXAxis = (axesGroup, width, height) => {
	const xAxis = d3.axisBottom()
					.scale(xScale)
					.ticks(5);

	axesGroup.append('g')
		.attr('class', 'x axis axis--linechart')
		.attr('transform', () => `translate(${margin.left}, ${height - margin.bottom})`)
		.call(xAxis);

	// Draw x axis grid lines
	d3.selectAll('g.x.axis--linechart g.tick')
		.append('line')
			.classed('grid-line', true)
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 0)
			.attr('y2', -(height - (margin.top + margin.bottom)));
}

// Function to render the y axis
const renderYAxis = (axesGroup, width, height) => {
	const yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(5)
			.tickFormat(d => d + '%');

	axesGroup.append('g')
		.attr('class', 'y axis axis--linechart')
		.attr('transform', () => `translate(${margin.left}, ${margin.top})`)
		.call(yAxis);

	// Draw y axis grid lines
	d3.selectAll('g.y.axis--linechart g.tick')
		.append('line')
		.classed('grid-line', true)
		.attr('x1', 0)
		.attr('y1', 0)
		.attr('x2', width - (margin.left + margin.right));
}

// Function to update x axis
const updateAxisX = () => {
	const xAxis = d3.axisBottom()
					.scale(xScale)
					.ticks(5);

	svg.select('g.x.axis--linechart')
		.transition()
		.call(xAxis);
}

// Function to update y axis
const updateAxisY = () => {
	const yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(5)
			.tickFormat(d => d + '%');

	svg.select('g.y.axis--linechart')
		.transition()
		.call(yAxis);
}

// Function to render the axes
const renderAxes = (width, height) => {
	const axesGroup = svg.append('g')
				.attr('class', 'axes');

	renderXAxis(axesGroup, width, height);
	renderYAxis(axesGroup, width, height);
}

// Setting body clip
const defineBodyClip = (width, height) => {
	// Set padding for body clip
	const padding = 10;
	const clip = svg.append('defs');
	clip.append('clipPath')
	.attr('id', 'body-clip-line')
	.append('rect')
	.attr('x', 0 - padding)
	.attr('y', 0 - padding)
	.attr('width', width - (margin.left + margin.right) + (2 * padding))
	.attr('height', height - (margin.top + margin.bottom) + (2 * padding));
}

// Function to render html for tooltip
const genHTML = data => {
	const html = `
	<h4>${data.party}</h4>
	`;
	return html;
};

// Function to render path line
const renderLines = (datasrc, tooltip) => {
	const line = d3.line()
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.vote));

	const paths = bodyGroup.selectAll('path.line')
						.data(datasrc);

	paths.enter()
			.append('path')
		.merge(paths)
			.style('stroke', (d, i) => colors(d[0].party))
			//.style('stroke-width', 3)
			.attr('class', (d) => `line line-${d[0].party}`)
			// Avoiding arrow function to use 'this'
		.on('mouseover', function(d, i) {
			d3.select(this).classed('line-selected', true).raise();
			d3.selectAll(`.dot_${d[0].party}`).raise();
			// Display tooltip
			tooltip.transition()
					//.duration()
					.style('opacity', .8);
			// Insert tooltip HTML
			tooltip.html(genHTML(d[0]))
					.style('left', () => (d3.event.pageX - 20) + 'px')
					.style('top', () => (d3.event.pageY - 100) + 'px');
		})
		.on('mouseout', function(d, i) {
			d3.selectAll(`.dot_${d[0].party}`).lower();
			d3.select(this).classed('line-selected', false).lower();
			// Hide tooltip
			tooltip.transition().style('opacity', 0);
		})
		.transition()
			.attr('d', (d) => line(d))
	paths.exit()
	.transition()
		.remove();
}

// Function to render the circles
const renderDots = (datasrc, tooltip) => {
	datasrc.forEach((el, idx) => {
		const circle = bodyGroup.selectAll(`circle._${idx}`)
								.data(el);

		circle.enter()
				.append('circle')
			.merge(circle)
				.attr('class', (d, i) => `dot _${idx} dot_${d.party}`)
				.raise()
				
			.on('mouseover', (d, i) => {
				d3.select(`.line-${d.party}`).classed('line-selected', true).raise();
				d3.selectAll(`.dot_${d.party}`).raise();
				// Display tooltip
				tooltip.transition()
						//.duration()
						.style('opacity', .8);
				// Insert tooltip HTML
				tooltip.html(genHTML(d))
						.style('left', () => (d3.event.pageX - 20) + 'px')
						.style('top', () => (d3.event.pageY - 100) + 'px');
			})
			.on('mouseout', (d, i) => {
				d3.selectAll(`.dot_${d.party}`).lower();
				d3.select(`.line-${d.party}`).classed('line-selected', false).lower();
				
				// Hide tooltip
				tooltip.transition().style('opacity', 0)


			})
			.transition()
				.attr('cx', (d) => xScale(d.year))
				.attr('cy', (d) => yScale(d.vote))
				.attr('r', 4.5)
				.style('stroke', (d) => colors(d.party));
			
	});
}

// Function to render the chart body (area, lines and circles)
const renderBody = (width, height, DOMTarget, datasrc) => {

	// Insert and hide tooltip
	if (!tooltip) {
		tooltip = d3.select(DOMTarget)
						  .append('div')
						  .attr('class', 'linechart--tooltip')
						  .style('opacity', 0);
	}
   

	if (!bodyGroup) {
		bodyGroup = svg.append('g')
			.attr('class', 'body')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.attr('clip-path', 'url(#body-clip-line)');
	} 

	renderLines(datasrc, tooltip);
	renderDots(datasrc, tooltip);
	
}
// Export a function that uses all of the above to generate final chart
export const renderChart = (data, width, height, DOMTarget, constitID) => {
	const chartData = genChartData(data, constitID);
	generateScales(width, height, chartData);
	createSVG(width, height, DOMTarget);
	defineBodyClip(width, height);
	renderAxes(width, height);
	renderBody(width, height, DOMTarget, chartData);
	renderGraphTitle(width, height, chartData);
	createAxesLabels(width, height);
	
}	

// Export function to update chart with new data
export const updateLineChart = (data, width, height, DOMTarget, constitID) => {
	const chartData = genChartData(data, constitID);
	generateScales(width, height, chartData);
	createSVG(width, height, DOMTarget);
	defineBodyClip(width, height);
	renderBody(width, height, DOMTarget, chartData);
	renderGraphTitle(width, height, chartData);
	updateAxisX();
	updateAxisY();
}




