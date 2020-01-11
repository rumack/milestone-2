// ********** LINE CHART MODULE **********

// Exported functions at bottom of file

// Set margins for chart
const margin = {
	top: 100,
	left: 100,
	right: 60,
	bottom: 40
};

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
			.attr('viewBox', `0 0 ${width} ${height}`);
			// .attr('height', height)
			// .attr('width', width);
	}
} 

const renderGraphTitle = (width, height, chartData) => {
	// Prepare for update - if title, remove title
	svg.selectAll('text.title').remove();
		
		const text = svg.append('text')
			.attr('class', 'title')
	        .attr('x', (width / 2))             
	        .attr('y', (0 + 25));

	    text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`NI General Election Vote Share`);

	    text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(() => chartData[0][0].seats ? 'All constituencies' : `Constituency: ${chartData[0][0].constituency}` );
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
				.rangeRound([0, width - (margin.right + margin.left)]);

	yScale = d3.scaleLinear()
				.domain([0, extentYvote])
				.rangeRound([height - (margin.top + margin.bottom), 0]);
		
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
	paths.exit()
	.transition()
		.remove();

	paths.enter()
			.append('path')
			
		.merge(paths)
			.attr('class', (d) => `line line_party line_${d[0].party}`)
			// Avoiding arrow function to use 'this'
		.on('mouseover', function(d, i) {
			d3.select(this).classed('line-selected', true).raise();
			d3.selectAll(`.dot_${d[0].party}`).raise();
			// Display tooltip
			tooltip.transition()
					.style('opacity', 1);
			// Insert tooltip HTML
			tooltip.html(genHTML(d[0]))
					.style('left', () => (d3.event.pageX - 40) + 'px')
					.style('top', () => (d3.event.pageY - 50) + 'px');
		})
		.on('mouseout', function(d, i) {
			d3.selectAll(`.dot_${d[0].party}`).lower();
			d3.select(this).classed('line-selected', false).lower();
			// Hide tooltip
			tooltip.transition().style('opacity', 0);
		})
		.transition()
			.style('stroke', (d, i) => colors(d[0].party))
			.attr('d', (d) => line(d));
	
}

const renderSelectMenu = (width, height, datasrc) => {
	const options = ['All Parties','DUP', 'SF', 'SDLP', 'UUP', 'Alliance', 'Others'];
	// If menu exists, restore default
	d3.selectAll('.linechart-select-menu').remove();
	d3.selectAll('path.line').style('opacity', 1).style('visibility', 'visible');
	d3.selectAll('circle.dot').style('opacity', 1).style('visibility', 'visible');
		
	const selectMenu = d3.select('.line-chart')
					.append('select')
					.attr('class', 'linechart-select-menu');
					
	selectMenu.selectAll('menuOptions')
				.data(options)
				.enter()
				.append('option')

				.text(d => d)
				.attr('value', (d) => d);

	selectMenu.on('change', function() {
		const selected = d3.select(this).property('value');
		if (selected === 'All Parties') {
			d3.selectAll('path.line_party')
				//.transition()
				.style('opacity', 1)
				.style('visibility', 'visible');
			d3.selectAll('circle.dot')
				//.transition()
				.style('opacity', 1)
				.style('visibility', 'visible')
				.raise();
		} else {
			const partiesToHide = options.filter(el => el !== 'All Parties' && el !== selected);
			d3.select(`path.line_${selected}`)
				//.transition()
				.style('opacity', 1)
				.style('visibility', 'visible');
			d3.selectAll(`circle.dot_${selected}`)
				//.transition()
				.style('opacity', 1)
				.style('visibility', 'visible');
			partiesToHide.forEach(el => {
				d3.select(`path.line_${el}`)
					//.transition()
					.style('opacity', 0)
					.style('visibility', 'hidden');
				d3.selectAll(`circle.dot_${el}`)
					//.transition()
					.style('opacity', 0)
					.style('visibility', 'hidden');
			})
		}
	})
}

// Function to render the circles
const renderDots = (datasrc, tooltip) => {
	datasrc.forEach((el, idx) => {
		const circle = bodyGroup.selectAll(`circle._${idx}`)
								.data(el);

		circle.exit()
			.transition()
			.remove();

		circle.enter()
				.append('circle')
			.merge(circle)
				.attr('class', (d, i) => `dot _${idx} dot_${d.party}`)
				.raise()
				
			.on('mouseover', (d, i) => {
				d3.select(`.line_${d.party}`).classed('line-selected', true).raise();
				d3.selectAll(`.dot_${d.party}`).raise();
				// Display tooltip
				tooltip.transition()
						.style('opacity', .8);
				// Insert tooltip HTML
				tooltip.html(genHTML(d))
						.style('left', () => (d3.event.pageX - 40) + 'px')
						.style('top', () => (d3.event.pageY - 50) + 'px');
			})
			.on('mouseout', (d, i) => {
				d3.selectAll(`.dot_${d.party}`).lower();
				d3.select(`.line_${d.party}`).classed('line-selected', false).lower();
				// Hide tooltip
				tooltip.transition().style('opacity', 0);
			})
			.transition()
				.attr('cx', (d) => xScale(d.year))
				.attr('cy', (d) => yScale(d.vote))
				.attr('r', 5.5)
				.style('stroke', (d) => colors(d.party));
			
	});
}

// Function to render the chart body (area, lines and circles)
const renderBody = (width, height, DOMTarget, datasrc) => {

	// Insert and hide tooltip
	if (!tooltip) {
		tooltip = d3.select(DOMTarget)
						  .append('div')
						  .attr('class', 'tooltip linechart--tooltip')
						  .style('opacity', 0);
	}
   

	if (!bodyGroup) {
		bodyGroup = svg.append('g')
			.attr('class', 'body')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.attr('clip-path', 'url(#body-clip-line)');
	} 

	renderSelectMenu(width, height, datasrc);
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
	//renderButtons(width, height, chartData);
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




