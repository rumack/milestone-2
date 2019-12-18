// ********** MAP MODULE **********

// Exported functions at bottom of file

let svg;

//Create SVG element
const createSVG = (width, height, DOMTarget) => {
	if (!svg) {
		svg = d3.select(DOMTarget)
				.append("svg")
				.attr("width", width)
				.attr("height", height);
	}
}

const renderBody = (data) => {
	// Define mapping projection constant
	const projection = d3.geoMercator().center([-5.5, 54.35]).scale(8000);
	//Define path generator
	const path = d3.geoPath()
					.projection(projection);

	const mapLines = svg.selectAll("path.map")
						   .data(data.features);

						   mapLines.enter()
						   .append("path")
						   .merge(mapLines)
						   .attr("d", path)
						   .attr("class", (d, i) => {
						   		if (d.properties.JURI === 'NORN') {
						   			if (d.properties.PC_NAME.split(' ').length >  1) {
						   				const constitName = d.properties.PC_NAME.split(' ').join('-');
						   				return `map map-${constitName}`;
						   			}
						   			else {
						   				return d.properties.PC_NAME;
						   			}
						   		} else {
						   			return '';
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
						   		} 
						   })
						   .on('mouseout', function(d, i) {
						   		if (d.properties.JURI === 'NORN') {
						   			d3.select(this).transition().style('fill-opacity', 0.7);
						   		} 
						   })
						   .on('click', function(d, i) {
						   		if (d.properties.PC_NAME === 'BELFAST NORTH') {
						   			d3.selectAll('path.map').transition().remove().attr('d', pathBN);
						   		}
						   });
}


export const renderMap = (data, width, height, DOMTarget) => {
	createSVG(width, height, DOMTarget);
	renderBody(data);
}

// export const updateMap = () {

// }