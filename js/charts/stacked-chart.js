// Set margins for chart
const margin = {
	top: 25,
	left: 50,
	right: 50,
	bottom: 25
};


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

export const renderChart = (data, width, height, DOMTarget) => {
	const chartData = genChartData(data);
	console.log(chartData);


			//Set up stack method
			const stack = d3.stack()
							.keys([  'DUP', 'SF', 'SDLP', 'UUP', 'Alliance', 'Others' ]);
			//Data, stacked
			const series = stack(chartData);
			console.log(series);



			//Set up scales
			const xScale = d3.scaleBand()
				.domain(d3.range(chartData.length))
				.range([0, width - margin.right - margin.left])
				.paddingInner(0.05);
		
			const yScale = d3.scaleLinear()
				.domain([0,				
					d3.max(chartData, function(d) {
						return d.Alliance + d.DUP + d.Others + d.SDLP + d.SF + d.UUP;
					})
				])
				.range([height - margin.top - margin.bottom, 0]);  // <-- Flipped vertical scale
		
			//Create SVG element
			const svg = d3.select(DOMTarget)
						.append("svg")
						.attr('class', 'main__svg')
						.attr("width", width)
						.attr("height", height);

			const bodyGroup = svg.append('g')
									.attr('class', 'body')
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
	
			// Add a rect for each data value
			const rects = groups.selectAll("rect")
				.data(function(d) {
					d = d.map((el) => {
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
				.attr('class', 'rect')
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
				.on('mouseover', (d, i) => {
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
					

				})
				.on('mouseout', (d, i) => {
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
				});

			const years = ['2005', '2010', '2015', '2017'];
			const labels = svg.selectAll('text')
								.data(years);

			labels.enter()
					.append('text')
					.attr('x', (d, i) => {
						return xScale(i) + margin.left + margin.right + 28;
					})
					.attr('y', height)
					.text((d, i) => d)
					.attr('class', 'label--year' );	
	
}