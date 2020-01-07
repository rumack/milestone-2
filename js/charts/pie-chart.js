// ********** PIE CHART MODULE **********

// Exported functions at bottom of file

// Declare global variables
let svg, pieGroup, bodyGroup, legend; 
const duration = 1000;


// Set margins for chart
const margin = {
	top: 30,
	left: 30,
	right: 30,
	bottom: 30
};

// Set colour function
const colors = (idx) => {
	const colorRange = ['#192a56', '#c23616'];
	return colorRange[idx];
}

// Function to parse data for Brexit figures (either by constituency, or nationally)
const genChartData = (data, constitID) => {
	if (constitID) {
		// Create array of all constituencies
		const constitArr = data[0].constituencies;
		// Prepare final data array
		let dataset = [];
		// Isolate target constituency
		const constitObj = constitArr.filter(el => el.id === constitID)[0];
		// Get constituency full name
		const constitName = constitObj.Constituency;
		// Prepare data objects
		const dataObj1 = {
			id: 'remain',
			value: constitObj.Brex.Remain,
			// If constituency, include constitName for rendering name in title in later function
			constit: constitName ? constitName : null
		};
		const dataObj2 = {
			id: 'leave',
			value: constitObj.Brex.Leave
		};
		dataset.push(dataObj1, dataObj2);
		return dataset;
	} else {
		// Target Brexit data in 'totals' array
		const brexitObj = data[1].totals[4];
		// Prepare final data array
		let dataset = [];
		// Prepare data objects
		const dataObj1 = {
			id: 'remain',
			value: brexitObj.Remain
		};
		const dataObj2 = {
			id: 'leave',
			value: brexitObj.Leave
		};
		dataset.push(dataObj1, dataObj2);
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

const renderLegend = (width, height, data, arc, outerRadius) => {
	if (!legend) {
		legend = svg.append("g")
						.attr('class', 'legendGroup')
						.attr('transform', `translate(20, ${height - 65})`);
	}
	const rects = legend.selectAll('rect.legend')
						.data(data)
						.enter()
						.append('rect')
						.attr('class', 'legend')
						// activated hover on assocaited wedges
						.on('mouseover', (d, i) => {
							d3.select(`path.arc-${i}`)
								//.transition()
								.attr('d', arcTween(outerRadius, 0, arc))
								
							})
			    		.on('mouseout', (d, i) => {
			    			// Indexing the class name to ease selection from other parts of the code
			    			d3.select(`path.arc-${i}`)
			    			// Using the same tweening function as the one declared in the renderPie function 
			    				.attr('d', arcTween(outerRadius - 5, 0, arc))
			    		})
						.transition()
						.attr('x', 30)
						.attr('y', (d, i) => i * 25)
						.attr('width', 15)
						.attr('height', 15)
						.style('fill', (d, i) => {
							return colors(i)
						});

	const text = legend.selectAll('text.legend-text')
						.data(data)
						.enter()
						.append('text')
						.attr('class', 'legend-text')
						// activated hover on assocaited wedges
						.on('mouseover', (d, i) => {
							d3.select(`path.arc-${i}`)
							.attr('d', arcTween(outerRadius, 0, arc))
							})
			    		.on('mouseout', (d, i) => {
			    			// Indexing the class name to ease selection from other parts of the code
			    			d3.select(`path.arc-${i}`)
			    			.attr('d', arcTween(outerRadius - 5, 0, arc))
			    		})
						.transition()
						.attr('x', 55)
						.attr('y', (d, i) => i * 25 + 11)
						.attr("font-family", "sans-serif")
                		.attr("font-size", "1rem")
						.attr('fill', (d, i) => colors(i))
						.text(d => d.id.toUpperCase());  
}

//Function to render chart title
const renderGraphTitle = (width, height, chartData, constitID) => {
	// Prepare for update - if title, remove title
	svg.selectAll('text.title').remove();

	if (constitID) {

		const text = svg.append('text')
			.attr('class', 'title')
	      	.attr('x', (width / 2))             
	       	.attr('y', (0 + 25));

        text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`Result: Brexit referendum, 2016`);

        text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(`Constituency: ${chartData[0].constit}`);
	} else {
		const text = svg.append('text')
			.attr('class', 'title')
	      	.attr('x', (width / 2))             
	       	.attr('y', (0 + 25));

        text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`Result: Brexit referendum, 2016`);

        text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(`All constituencies`);
	}
}

// Tweening function for arc hover effect - adapted from a Mike Bostock block

function arcTween(outerRadius, delay, arc) {
	return function() {
		d3.select(this).transition().delay(delay).attrTween('d', function(d) {
			let i = d3.interpolate(d.outerRadius, outerRadius);
			return function(t) {
				d.outerRadius = i(t);
				return arc(d);
			}
		})
	}
}

const renderPie = (width, height, datasrc) => {

	const outerRadius = height / 3;
 	const innerRadius = outerRadius / 3;

    const pie = d3.pie()
    		.padAngle(.04)
            .sort((d) => d.id)
            .value((d) => d.value);

    const arc = d3.arc()
            .padRadius(outerRadius)
            .innerRadius(innerRadius);

    if (!pieGroup)
        pieGroup = bodyGroup.append('g')
                .attr('class', 'pie');

    renderSlices(pie, arc, datasrc, outerRadius);
    renderLabels(pie, arc, datasrc, outerRadius);
    renderLegend(width, height, datasrc, arc, outerRadius);
}


const renderSlices = (pie, arc, datasrc, outerRadius) => {

    const slices = pieGroup.selectAll('path.arc')
            .data(pie(datasrc));

    slices.enter()
            .append('path')
        .merge(slices)
        	.each((d) => d.outerRadius = outerRadius - 5)
            .attr('class', (d, i) => `arc arc-${i}`)
            .attr('fill', (d, i) => colors(i))
            .on('mouseover', arcTween(outerRadius, 0, arc))
    		.on('mouseout', arcTween(outerRadius - 5, 150, arc))
            .transition()
			.attrTween('d', function (d) {
                let currentArc = this.__current__;

                if (!currentArc)
                    currentArc = {startAngle: 0,
                                    endAngle: 0};

                const interpolate = d3.interpolate(currentArc, d);

                this.__current__ = interpolate(1);

                return (t) => arc(interpolate(t));
            });
}


const renderLabels = (pie, arc, datasrc, outerRadius) => {
    const labels = pieGroup.selectAll('text.pie-label')
            .data(pie(datasrc));
            
    labels.enter()
        		.append('text')	
		  .merge(labels)
		  		.each((d) => d.outerRadius = outerRadius - 5)
		  		.text((d) => `${d.data.value.toFixed(1)}%`)
		  		.attr('class', 'pie-label')
		  		.attr('pointer-events', 'none')
		  		.style('opacity', 0)
		  		.transition()
            	.duration(duration)
            	.attr('transform', (d) => {
		            	return `translate(${arc.centroid(d)})`;
		          })
            	.attr('text-anchor', 'middle')
            	.style('opacity', 1);  	  
}

// Function to render the chart body
const renderBody = (width, height, datasrc) => {

	if (!bodyGroup) {
		bodyGroup = svg.append('g')
			.attr('class', 'body')
			.attr('transform', `translate(${width / 2}, ${height / 2 + 25})`);
	} 
	renderPie(width, height, datasrc);
}


// Export a function that uses all of the above to generate final chart

export const renderChart = (data, width, height, DOMTarget, constitID) => {
	const chartData = genChartData(data, constitID);
	createSVG(width, height, DOMTarget);
	renderGraphTitle(width, height, chartData, constitID);
	renderBody(width, height, chartData);
	
}	

// Export function to update chart with new data

export const updatePieChart = (data, width, height, DOMTarget, constitID) => {
	const chartData = genChartData(data, constitID);
	createSVG(width, height, DOMTarget);
	renderGraphTitle(width, height, chartData, constitID);
	renderBody(width, height, chartData);	
}


