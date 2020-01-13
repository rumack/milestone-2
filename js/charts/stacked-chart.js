// Set margins for chart
const margin = {
	top: 80,
	left: 50,
	right: 100,
	bottom: 40
};

let svg;


// Function to parse data needed for chart 
const genChartData = (data) => {
		// Prepare data obj
		let dataobj = {};
		// Target 'totals' array
		let totalsArr = data[1].totals;
		// Remove Brexit data from end of array
		totalsArr = totalsArr.slice(0, totalsArr.length -1);
		// Merge data for each year into array of objects
		const dataArr = totalsArr.map(el => {
			const year = el.year;
			const dataObj = {};
			Object.entries(el.Results).forEach(entry => {
				dataObj[entry[0]] = entry[1].seats
			})
			// Add election year to data objet
			dataObj.year = year;
			// Declare array of constits and winning parties
			const allConstitsArr = [];
			// Parse base data for the seats data
			data[0].constituencies.forEach(elem => {
				
				const singleConstitArr = [];
				singleConstitArr.push(elem.id);
				singleConstitArr.push(elem[year].Winner.Party)
		
				allConstitsArr.push(singleConstitArr);
			});
			dataObj.constits = allConstitsArr;
			return dataObj;
		});
		// Target data for required year
		return dataArr.reverse();
}

// Get constituency name from constituency ID
const getConstitFullName = (id) => {
	const constits = {
						'BE': 'Belfast East',
						'BN': 'Belfast North',
						'BS': 'Belfast South',
						'BW': 'Belfast South',
						'EA': 'East Antrim',
						'EL': 'East Londonderry',
						'FAST': 'Fermanagh and South Tyrone',
						'F': 'Foyle',
						'LV': 'Lagan Valley',
						'MU': 'Mid Ulster',
						'NAA': 'Newry and Armagh',
						'NA': 'North Antrim',
						'ND': 'North Down',
						'SA': 'South Antrim',
						'SD': 'South Down',
						'S': 'Strangford',
						'UB': 'Upper Bann',
						'WT': 'West Tyrone'
					};
	return constits[id];
}
	
// Set colour function (by index)
const colors = (i) => {
	const colorRange = [
	'#D32F2F',
	'#3a5134', 
	'#4f953b',
	'#FF5722',
	'#FBC02D',
	'#757575'
	];
	return colorRange[i];
}	

// Set colour function (by party name param)
const setColor = (party) => {
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

const generateScales = (chartData, width, height, scale) => {
	//Set up scales
	const scales = {
		x: d3.scaleBand()
					.domain(d3.range(chartData.length))
					.range([0, width - margin.right - margin.left])
					.paddingInner(0.05),

		y: d3.scaleLinear()
					.domain([0,				
						d3.max(chartData, function(d) {
							return d.Alliance + d.DUP + d.Others + d.SDLP + d.SF + d.UUP;
						})
					])
					.range([height - margin.top - margin.bottom, 0])
	}
	return scales[scale];
	
}

const createSvg = (width, height, DOMTarget) => {
	//Create SVG element
	svg = d3.select(DOMTarget)
				.append('svg')
				.attr('class', 'main__svg')
				.attr('viewBox', `0 0 ${width} ${height}`);
				// .attr("width", width)
				// .attr("height", height);
}

const renderBody = (chartData, width, height) => {

	//Set up stack method
	const stack = d3.stack()
					.keys([  'DUP', 'SF', 'SDLP', 'UUP', 'Alliance', 'Others' ]);
	//Data, stacked
	const series = stack(chartData);
			
	const bodyGroup = svg.append('g')
						.attr('class', 'main__svg--body')
						.attr('width', width - margin.left - margin.right)
						.attr('height', height - margin.top - margin.bottom)
						.attr('transform', `translate(${margin.left}, ${margin.top})`);
	
	// Add a group for each row of data
	const groups = bodyGroup.selectAll("g")
		.data(series)
		.enter()
		.append("g")
		.attr('class', (d, i) => `group-${d.key}`)
		.style("fill", function(d, i) {
			return colors(i);
		});

	return groups;
}

const renderGraphTitle = (width, height) => {
	// Prepare for update - if title, remove title
	svg.selectAll('text.title').remove();
		// Get constituency name
		const text = svg.append('text')
			.attr('class', 'main__svg--title title')
	        .attr('x', (width - margin.left) / 2 )             
	        .attr('y', (0 + 30));

	    text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`Tally of seats by year and by party`);

	    text.append('tspan')
	    .attr('class', 'main__svg--title title sub-title')
	    	.attr('x', (width - margin.left) / 2 )
	    	.attr('dy', '2em')
	    	.text(() => '(Hover over chart to see data on the map)');
}

const renderLegend = (width, height) => {
	const parties = ['DUP', 'SF', 'SDLP', 'UUP', 'Alliance', 'Others'];
	const legend = d3.select('.main__svg').append('g').attr('class', 'main__svg-legend--group');
	legend.selectAll('text')
			.data(parties.reverse())
			.enter()
			.append('text')
			.attr('class', 'main__svg-legend--text')
			.attr('x', width - 85)
			.attr('y', (d, i) => (height / 2 - 35) + i * 25)
			.text((d,i) => d)
			.on('mouseover', (d, i) => {
				d3.select(`.legend-rect-${d}`).transition().style('fill-opacity', .95);
				const className = d;
				d3.select(`.group-${d}`).selectAll('rect.main__svg--rect').transition().style('fill-opacity', .95);
			})
			.on('mouseout', (d, i) => {
				d3.select(`.legend-rect-${d}`).transition().style('fill-opacity', .75);
				const className = `.group-${d}`;
				d3.select(`.group-${d}`).selectAll('rect.main__svg--rect').transition().style('fill-opacity', .75);
			});;

	legend.selectAll('rect')
			.data(parties)
			.enter()
			.append('rect')
			.attr('class', (d, i) => `main__svg-legend--rect legend-rect-${d}`)
			.attr('x', width - 35)
			.attr('y', (d, i) => (height / 2 - 49) + i * 25)
			.attr('width', width / 23)
			.attr('height', height / 15)
			.style('fill', (d, i) => setColor(d))
			.style('fill-opacity', .75)
			.on('mouseover', (d, i) => {
				d3.select(`.legend-rect-${d}`).transition().style('fill-opacity', .95);
				const className = d;
				d3.select(`.group-${d}`).selectAll('rect.main__svg--rect').transition().style('fill-opacity', .95);
			})
			.on('mouseout', (d, i) => {
				d3.select(`.legend-rect-${d}`).transition().style('fill-opacity', .75);
				const className = `.group-${d}`;
				d3.select(`.group-${d}`).selectAll('rect.main__svg--rect').transition().style('fill-opacity', .75);
			});

}

const generateStaticHTML = () => {
	const html = `
	
			<div class='main__static--block'>
				<h4 class='main__static--heading-static'>Region:</h4>
				<p class='main__static--para-static'>North of Ireland</p>
			</div>
			<div class='main__static--block'>
				<h4 class='main__static--heading-static'>Constituencies:</h4>
				<p class='main__static--para-static'>18</p>
			</div>
			<div class='main__static--block'>
				<h4 class='main__static--heading-static'>Dataset:</h4>
				<p class='main__static--para-static'>General Elections (2001 - 2019)</p>
			</div>
	
	`
	return html;
}


const generateDynamicHTML = (year, party, targetConstits) => {
	const seatsTotal = targetConstits.length;
	// Get full name for each constituency from id, wrap in <p> tags and save to constant
	const constitsList = targetConstits.map(el => `<li class='main__dynamic--list-item'>${getConstitFullName(el[0])}</li>`).join('');
	
	const html = `
	
		<div class='main__dynamic--block'>
			<h4 class='main__dynamic--heading'>Year:</h4>
			<p class='main__dynamic--para'>${year}</p>
		</div>
		<div class='main__dynamic--block'>
			<h4 class='main__dynamic--heading'>Party:</h4>
			<p class='main__dynamic--para'>${party}</p>
		</div>
		<div class='main__dynamic--block'>
			<h4 class='main__dynamic--heading'>Seats:</h4>
			<p class='main__dynamic--para'>${seatsTotal}</p>
		</div>
		<div class='main__dynamic--block-constits'>
			<h4 class='main__dynamic--heading'>Constituencies:</h4>
			<ul class='main__dynamic--list'>${constitsList}</ul>
		</div>
	
	`
	return html;
}

const renderRects = (chartData, groups, width, height) => {
	// d3.select('.main__dynamic')
	// 			.style('opacity', 0)
	// 			.html(generateStaticHTML())
	// 			.transition().duration(500).style('opacity', 1)
	// 			.style('visibility', 'visible');
	// d3.select('.main__dynamic').html(generateStaticHTML());

	d3.selectAll('.main__dynamic').transition().remove();
	d3.selectAll('.main__static').transition().remove();
	d3.select('.main').append('div').attr('class', 'main__static');
	d3.select('.main__static')
		.style('opacity', 0)
		.html(generateStaticHTML())
		.transition().duration(500).style('opacity', 1)
		.style('visibility', 'visible');

	console.log(chartData);
	const xScale = generateScales(chartData, width, height, 'x'); 
	const yScale = generateScales(chartData, width, height, 'y'); 
	// Add a rect for each data value
	const rects = groups.selectAll("rect")
		.data(function(d) {
			d = d.map((el) => {
				// Adding party name data to the join - will need it later
				const partyName = d.key;
				el.party = partyName;
				return el;
			});
			return d; 
		})
		.enter()
		.append("rect")
		.attr('id', (d, i) => {
			// get year
			const year = d.data.year;
			const party = d.party;
			return `${party}-${year}`;
		})
		.attr('class', 'main__svg--rect')
		.style('fill-opacity', .75)
		.attr("x", function(d, i) {
			//console.log(i);
			return xScale(i);
		})
		.attr("y", function(d) {
			return yScale(d[1]); 
		})
		.attr("height", function(d) {
			return yScale(d[0]) - yScale(d[1]);  
		})
		.attr("width", xScale.bandwidth())
		.on('mouseover', function(d, i) {

			// Get party, year and list of associated constituencies
			const party = d.party;
			const year = d.data.year;
			const targetConstits = d.data.constits.filter(el => {
				// Arrange discrepacncy between 'Others' in the DOM and 'IND' in target data
				if (party === 'Others') {
					return el[1] === 'IND';
				} else {
					return el[1] === party;
				}
			});
			targetConstits.forEach(el => {
				d3.select(`.constit.${el[0]}`)
					.transition()
					.duration(500)
					.style('fill', setColor(d.party) );
			})

			// Add opacity hover effects
			d3.select(this).transition().style('fill-opacity', .95);
			d3.select(`.legend-rect-${party}`).transition().style('fill-opacity', .95);

			
			d3.selectAll('.main__dynamic').transition().remove();
			d3.selectAll('.main__static').transition().remove();
			d3.select('.main').append('div').attr('class', 'main__dynamic');
			d3.select('.main__dynamic')
				.style('opacity', 0)
				.html(generateDynamicHTML(year, party, targetConstits))
				.transition().duration(500).style('opacity', 1)
				.style('visibility', 'visible');

		})
		.on('mouseout', function(d, i) {
			
			const party = d.party;
			const year = d.data.year;
			const targetConstits = d.data.constits.filter(el => {
				// Arrange discrepacncy between 'Others' in the DOM and 'IND' in target data
				if (party === 'Others') {
					return el[1] === 'IND';
				} else {
					return el[1] === party;
				}
			});
			targetConstits.forEach(el => {
				d3.select(`.constit.${el[0]}`)
					.transition()
					.duration(500)
					.style('fill', '#c6c6c6' );
			})

			// remove opacity hover effects
			d3.select(this).transition().style('fill-opacity', .75);
			d3.select(`.legend-rect-${party}`).transition().style('fill-opacity', .75);

			d3.selectAll('.main__dynamic').transition().remove();
			d3.selectAll('.main__static').transition().remove();
			d3.select('.main').append('div').attr('class', 'main__static');
			d3.select('.main__static')
				.style('opacity', 0)
				.html(generateStaticHTML())
				.transition().duration(500).style('opacity', 1)
				.style('visibility', 'visible');

		});
}

const renderLabels = (chartData, width, height) => {

	const years = ['2001', '2005', '2010', '2015', '2017'];

	const xScale = generateScales(years, width, height, 'x'); 
	//const yScale = generateScales(chartData, width, height, 'y'); 

	

	const labelGroup = svg.append('g')
					.attr('class', 'main__svg-label')
					.attr('transform', `translate(${margin.left}, ${height - 10})`);

	const labels = labelGroup.selectAll('text')
						.data(years);

	labels.enter()
			.append('text')
			.attr('class', 'main__svg-label--year' )
			.text((d, i) => d)
			.attr('x', (d, i) => {
				const textWidth = d3.select('text.main__svg-label--year').node().getBBox().width;
				const indent = (xScale.bandwidth() - textWidth) / 2;
				return xScale(i) + indent;
			})
			.attr('y', 0)
			.on('mouseover', function(d, i) {
				
				// Prepare selection to add border (adding svg rect element)
				const selection = d3.select(this);
				// Get boundary box coords of text label
				const rect = this.getBBox();
				// Define offsets (padding)
				const offsetX = 8;
				const offsetY = 4;
				// Define path for rect
				const pathCoords = [
							        {x: rect.x-offsetX, y: rect.y-offsetY }, 
							        {x: rect.x+offsetX + rect.width, y: rect.y-offsetY}, 
							        {x: rect.x+offsetX + rect.width, y: rect.y+offsetY + rect.height }, 
							        {x: rect.x-offsetX, y: rect.y+offsetY + rect.height},
							        {x: rect.x-offsetX, y: rect.y-offsetY },
							    ];
			    // Specify the function for generating path data
			    var line = d3.line()
			        .x(function(d){return d.x;})
			        .y(function(d){return d.y;});
			    // Draw the line
			    labelGroup.append("path")
			    	.attr('class', 'main__svg-label--box')
			    	.attr('fill-opacity', 0)
			    	.lower()
			    	.transition()
			    	.duration(500)
			        .attr("d", line(pathCoords))
			        // Control transition to correct opacity
			        .styleTween('fill-opacity', () => d3.interpolateNumber(0, .6));
			    // Select the label and style for mouseover
			    selection.transition().duration(500).style('fill', 'white').style('fill-opacity', .9);

			    // Update dynamic display

			    
			    // Target relevant constituencies in map to highlight
				const targetYear = chartData.filter(el => el.year === d);
				targetYear[0].constits.forEach(el => {
					d3.select(`.constit.${el[0]}`)
					.transition()
					.duration(500)
					.style('fill', setColor(el[1]));
				})
			})

			.on('mouseout', function(d, i) {
				d3.selectAll('path.main__svg-label--box')
					.transition()
					.duration(500)
					.styleTween('fill-opacity', () => d3.interpolateNumber(.6, 0))
					.remove();

				// Select the label and style for mouseover
				const selection = d3.select(this);
			    selection.transition().duration(500).style('fill', 'black').style('fill-opacity', .6);


				const targetYear = chartData.filter(el => el.year === d);
				targetYear[0].constits.forEach(el => {
					d3.select(`.constit.${el[0]}`)
					.transition()
					.duration(500)
					.style('fill', '#c6c6c6');
				})
			});	
}


export const renderChart = (data, width, height, DOMTarget) => {
	const chartData = genChartData(data);		
	createSvg(width, height, DOMTarget);	
	const groups = renderBody(chartData, width, height);
	renderGraphTitle(width, height);
	renderRects(chartData, groups, width, height);
	renderLabels(chartData, width, height);
	
	renderLegend(width, height);
}