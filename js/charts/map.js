import * as barChart from './bar-chart.js';
import * as lineChart from './line-chart.js';
import * as pieChart from './pie-chart.js';
import * as utils from '../utilities.js';

// ********** MAP MODULE **********

// Exported functions at bottom of file

let svg, tooltip, btn;

//Create SVG element
const createSVG = (width, height, DOMTarget) => {
	if (!svg) {
		svg = d3.select(DOMTarget)
				.append('svg')
				.attr('id', 'svg-map')
				.attr('class', 'main__map-svg')
				.attr('viewBox', `0 0 ${width} ${height}`);
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
								if (el === 'and') {
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
								if (el === 'and') {
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

const genProfileHomeHTML = () => {
	const html = `
					<div class="profile__home">
						<h3 class="profile__home--heading">Click the map above to see constituency profile and to update the charts below</h3>
					</div>

				`
	return html;
}

const genProfileHTML = (d, data) => {
	
	const constitName = d.properties.PC_NAME.toLowerCase();
	const constitNameFormatted = constitName.split(' ').map(el => {
		if (el === 'and') {
			return el.toLowerCase();
		} else {
			return el.substring(0, 1).toUpperCase()+el.substring(1);
		}
	}).join(' ');
	
	const constitsObj = data[0].constituencies.filter(el => el.id === d.properties.PC_ID)[0];
	const electorate = constitsObj['2019'].Electorate;
	const turnout = constitsObj['2019'].Turnout;
	const mp = constitsObj['2019'].Winner.Candidate;
	const party = constitsObj['2019'].Winner.Party;
	const html = `
				<div class="profile__details">	
					<div class="profile__block">
						<h3 class="profile__heading">Constituency:</h3>
						<p class="profile__para">${constitNameFormatted}</p>
					</div>
					<div class="profile__block">
						<h3 class="profile__heading">Current MP:</h3>
						<p class="profile__para">${mp}, ${party}</p>
					</div>	
					<div class="profile__block">
						<h3 class="profile__heading">Electorate (2019):</h3>
						<p class="profile__para">${electorate}</p>
					</div>
					<div class="profile__block">
						<h3 class="profile__heading">Turnout (2019):</h3>
						<p class="profile__para">${turnout}%</p>
					</div>
					
				</div>
			`;
	return html;
	
	
}

// Setting gradient transparency overlay
const defineGradient = (width, height) => {
	const svgDefs = svg.append('defs');
	const gradient = svgDefs.append('linearGradient')
							.attr('id', 'map--gradient')
							.attr('x1', '100%')
							.attr('x2', '80%')
							.attr('y1', '0%')
							.attr('y2', '100%');

	gradient.append('stop')
			.attr('class', 'stop-top')
			.attr('offset', '75%');
	gradient.append('stop')
			.attr('class', 'stop-bottom')
			.attr('offset', '100%');
	

	svg.append('rect')
		.attr('width', width)
		.attr('height', height)
		.classed('filled', true)
		.attr('pointer-events', 'none');

}

const renderBody = (mapData, data, DOMTarget) => {
	// Define mapping projection constant
	const projection = d3.geoMercator().center([-4.1, 54.0599]).scale(5500);
	//Define path generator
	const path = d3.geoPath()
					.projection(projection);
	// Insert profile home html
	d3.select('.profile__container')
			   			.style('opacity', 0)
			   			.html(genProfileHomeHTML())
			   			.transition().duration(500)
			   			.style('opacity', 1);
	// Create tooltip and hide it 
	if (!tooltip) {
		tooltip = d3.select(DOMTarget)
					  .append('div')
					  .attr('class', 'tooltip main__map--tooltip')
					  .style('visibility', 'hidden')
					  .style('opacity', 0);
	}

	const mapLines = svg.selectAll('path.constit')
						   .data(mapData.features);

						   mapLines.enter()
						   .append('path')
						   .merge(mapLines)
						   .attr('d', path)
						   .attr('pointer-events', 'auto')
						   .attr('class', (d, i) => {
						   		const constitID = d.properties.PC_ID;
						   		if (d.properties.JURI === 'NORN') {
					   				return `constit ${constitID}`;
						   		} else {
						   			return 'constit-rep';	
						   		} 
						   })
						   .style('stroke-width', '2')
						   .style('stroke', 'white')
						   .style('fill', '#c6c6c6')
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
											.style('left', () => (d3.event.pageX - 80) + 'px')
											.style('top', () => (d3.event.pageY) + 'px');
							   	} 
						   		
						   })
						   .on('mouseout', function(d, i) {
						   		this.classList.remove('constit-hovered');
						   		// Hide tooltip
								tooltip.transition().duration(500).style('opacity', 0).style('visibility', 'hidden');
						   })
						   // When a constituency is selected... '
						   .on('click', function(d, i) {
						   		const constitID = d.properties.PC_ID;
						   		barChart.updateBarchart(data, 450, 375, '.bar-chart', '2019', `${constitID}`);
								lineChart.updateLineChart(data, 450, 375, '.line-chart', `${constitID}`);
								pieChart.updatePieChart(data, 450, 375, '.pie-chart', `${constitID}`);
						   	
								// Remove 'hovered' class from selected element
								this.classList.remove('constit-hovered');
								// Remove 'selected' class from siblings of selected constituency
								utils.getAllSiblings(this).forEach(elem => elem.classList.remove('constit-selected'));
								// Add 'selected' class to selected constituency, if not already selected
								if (this.classList.contains('constit-selected')) {
						   			this.classList.remove('constit-selected');
						   			d3.select('.profile__container')
							   			.style('opacity', 0)
							   			.html(genProfileHomeHTML())
							   			.transition().duration(500)
							   			.style('opacity', 1);
									// Update charts
									lineChart.updateLineChart(data, 450, 375, '.line-chart');
									barChart.updateBarchart(data, 450, 375, '.bar-chart', '2019');
									pieChart.updatePieChart(data, 450, 375, '.pie-chart');
											
								} else {
						   			this.classList.add('constit-selected');
						   			d3.select('.profile__container')
							   			.style('opacity', 0)
							   			.html(genProfileHTML(d, data))
							   			.transition().duration(500)
							   			.style('opacity', 1);
								}	
						   });
	
	
}

export const renderMap = (mapData, data, width, height, DOMTarget) => {

	createSVG(width, height, DOMTarget);
	
	renderBody(mapData, data, DOMTarget);
	defineGradient(width, height);
}
