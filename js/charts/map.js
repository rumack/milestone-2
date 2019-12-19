// ********** MAP MODULE **********

// Exported functions at bottom of file

let svg, tooltip;

//Create SVG element
const createSVG = (width, height, DOMTarget) => {
	if (!svg) {
		svg = d3.select(DOMTarget)
				.append("svg")
				.attr("width", width)
				.attr("height", height);
	}
}

// Function to render html for tooltip
const genHTML = data => {
	// Rendering the text in lower case
	const text = data.properties.PC_NAME.toLowerCase();
	// Rendering first letter in capital form (except 'and')
	const textArray = text.split(' ');
	const finalText = textArray
							.map(el => {
								if (el === "and") {
									return el.toLowerCase();
								} else {
									return el.substring(0, 1).toUpperCase()+el.substring(1);
								}
							})
							.join(' ');
	const html = `
		<h4>${finalText}</h4>
		`;
	return html;
};

const renderBody = (data, DOMTarget) => {
	// Define mapping projection constant
	const projection = d3.geoMercator().center([-5.5, 54.35]).scale(8000);
	//Define path generator
	const path = d3.geoPath()
					.projection(projection);
	// Create tooltip and hide it 
	if (!tooltip) {
		tooltip = d3.select(DOMTarget)
					  .append('div')
					  .attr('class', 'tooltip map-tooltip')
					  .style('visibility', 'hidden')
					  .style('opacity', 0);
	}

	const mapLines = svg.selectAll("path.map")
						   .data(data.features);

						   mapLines.enter()
						   .append("path")
						   .merge(mapLines)
						   .attr("d", path)
						   .attr("class", (d, i) => {
						   		const constitID = d.properties.PC_ID;
						   		if (d.properties.JURI === 'NORN') {
					   				return `map ${constitID}`;
						   		} else {
						   			return d.properties.PC_NAME;	
						   		} 
						   })
						   .style("stroke-width", "3")
						   .style("stroke", "white")
						   .style('fill', (d, i) => {
						   		// if (d.properties.JURI !== 'NORN') {
						   			return 'darkolivegreen';
						   		// }
						   })
						   .style('fill-opacity', (d, i) => {
						   		if (d.properties.JURI !== 'NORN') {
						   			return 0.4;
						   		} else {
						   			return 0.7;
						   		}
						   })
						   .on('mouseover', function(d, i) {
						   		if (d.properties.JURI === 'NORN') {
						   			d3.select(this).transition().style('fill-opacity', 1);

						   			// Add tooltip on hover
									tooltip.html(genHTML(d));

											

									tooltip.transition()
											.duration(500)
											.style('visibility', 'visible')
											.style('opacity', 1)
											.style('left', () => (d3.event.pageX - 40) + 'px')
											.style('top', () => (d3.event.pageY - 50) + 'px');
							   		} 
						   		
						   })
						   .on('mouseout', function(d, i) {
						   		if (d.properties.JURI === 'NORN') {
						   			d3.select(this).transition().style('fill-opacity', 0.7);
						   		} 
						   		// Hide tooltip
								tooltip.transition().duration(500).style('opacity', 0).style('visibility', 'hidden');
						   });
}


export const renderMap = (data, width, height, DOMTarget) => {
	createSVG(width, height, DOMTarget);
	renderBody(data, DOMTarget);
}

// export const updateMap = () {

// }