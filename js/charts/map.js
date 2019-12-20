import * as barChart from './bar-chart.js';
import * as lineChart from './line-chart.js';
import * as pieChart from './pie-chart.js';
import * as utils from '../utilities.js';

// ********** MAP MODULE **********

// Exported functions at bottom of file

let svg, tooltip, btn, displayBox, displayBtn, displayHeading;

//Create SVG element
const createSVG = (width, height, DOMTarget) => {
	if (!svg) {
		svg = d3.select(DOMTarget)
				.append("svg")
				.attr('id', 'svg-map')
				.attr("width", width)
				.attr("height", height);
	}
}

// Function to render html for tooltip
const genTooltipHTML = data => {
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

// Function to render html for constituency display
const genDisplayBoxHTML = data => {
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

// Setting gradient transparency overlay
const defineGradient = (width, height) => {
	const svgDefs = svg.append('defs');
	const gradient = svgDefs.append('linearGradient')
							.attr('id', 'gradient')
							.attr('x1', '0%')
							.attr('x2', '0%')
							.attr('y1', '100%')
							.attr('y2', '0%');

	gradient.append('stop')
			.attr('class', 'stop-bottom')
			.attr('offset', '0%');
	gradient.append('stop')
			.attr('class', 'stop-top')
			.attr('offset', '20%');

	svg.append('rect')
		.attr('width', width)
		.attr('height', height)
		.classed('filled', true)
		.attr('pointer-events', 'none');

}

const renderBody = (mapData, data, DOMTarget) => {
	// Define mapping projection constant
	const projection = d3.geoMercator().center([-7.9, 54.7]).scale(11000);
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
	// Create 'all constituencies' button and hide it
	if (!displayBox) {
		displayBox = d3.select(DOMTarget)
				.append('div')
				.attr('class', 'display-box')
				.style('visibility', 'hidden')
				.style('opacity', 0);

		displayHeading = displayBox.append('h4')

		displayBtn = displayBox.append('button')
								.attr('class', 'display-btn')
								.text('Show overall result');

				
	}

	const mapLines = svg.selectAll("path.constit")
						   .data(mapData.features);

						   mapLines.enter()
						   .append("path")
						   .merge(mapLines)
						   .attr("d", path)
						   .attr('pointer-events', 'auto')
						   .attr("class", (d, i) => {
						   		const constitID = d.properties.PC_ID;
						   		if (d.properties.JURI === 'NORN') {
					   				return `constit ${constitID}`;
						   		} else {
						   			return 'constit-rep';	
						   		} 
						   })
						   .style("stroke-width", "3")
						   .style("stroke", "white")
						   .style('fill', (d, i) => {
						   		return 'darkolivegreen';	
						   })
						   .on('mouseover', function(d, i) {
						   		if (d.properties.JURI === 'NORN') {
						   			if (!this.classList.contains('constit-selected')) {
						   				this.classList.add('constit-hovered');
						   			}
						   			// Add tooltip on hover
									tooltip.html(genTooltipHTML(d));
									tooltip.transition()
											.duration(500)
											.style('visibility', 'visible')
											.style('opacity', 1)
											.style('left', () => (d3.event.pageX - 40) + 'px')
											.style('top', () => (d3.event.pageY - 50) + 'px');
							   	} 
						   		
						   })
						   .on('mouseout', function(d, i) {
						   		this.classList.remove('constit-hovered');
						   		// Hide tooltip
								tooltip.transition().duration(500).style('opacity', 0).style('visibility', 'hidden');
						   })
						   // When a constituency is selected, show the 'constituency display box'
						   .on('click', function(d, i) {
						   		// Target only northern constituencies
						   		if (d.properties.JURI === 'NORN') {
							   		// Set color opacity of selected constituency
									// Remove 'hovered' class from selected element
									this.classList.remove('constit-hovered');
									// Remove 'selected' class from siblings of selected constituency
									utils.getAllSiblings(this).forEach(elem => elem.classList.remove('constit-selected'));
									if (d.properties.JURI === 'NORN') {
										// Add 'selected' class to selected constituency
										this.classList.add('constit-selected');
										// Prepare display box information (constituency name)
										const title = document.createTextNode(d.properties.PC_NAME);
										const h4 = document.querySelector('.display-box h4');
										// Remove any previous constituency names and add current
										while (h4.firstChild) {
											h4.firstChild.remove();
										}
										h4.appendChild(title);
										//Make display box visible
										displayBox.transition()
										   			.style('visibility', 'visible')
													.style('opacity', 1);	
										displayHeading.transition()
													.style('visibility', 'visible')
													.style('opacity', 1)
										displayBtn.transition()		
													.style('visibility', 'visible')
													.style('opacity', 1);				
									}
						   		}
						   		
						   });
	
	//Actions when the 'all constituencies' button is clicked
	d3.select('.display-btn').on('click', function(d, i) {
		// Hide the display box
		displayBox.transition().style('visibility', 'hidden').style('opacity', 0);
		// Remove selection effect from all constituencies
		Array.from(document.querySelectorAll('.constit')).forEach(el => el.classList.remove('constit-selected'));	
		// Then update charts
		lineChart.updateLineChart(data, 450, 350, '.line-chart');
		barChart.updateBarchart(data, 450, 350, '.bar-chart', '2017');
		
		pieChart.updatePieChart(data, 450, 350, '.pie-chart');
				
	});
}

export const renderMap = (mapData, data, width, height, DOMTarget) => {

	createSVG(width, height, DOMTarget);
	
	renderBody(mapData, data, DOMTarget);
	defineGradient(width, height);
}
