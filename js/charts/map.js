// Width and height (maps)
			const w = 500;
			const h = 350;
			const padding = 20;

			// Define mapping variables
			const projectionBN = d3.geoMercator().center([-5.7, 54.6179994]).scale(55000);
			const projectionNI = d3.geoMercator().center([-5.5, 54.35]).scale(8000);

			//Define path generator
			const path = d3.geoPath()
							.projection(projectionNI);

			const pathBN = d3.geoPath()
							.projection(projectionBN);

			//Create SVG element
			const svg = d3.select(".brexit_gradation")
							.append("svg")
							.attr("width", w)
							.attr("height", h);

			// Queuing calls for data sources (election data and map data)
			const q = d3.queue();
			q.defer(d3.json, 'ni-elections.json');
			q.defer(d3.json, 'ireland_norn.json');

			// Act on results when returned
			q.await((err, data, mapData) => {
				if (err) {
					throw err;
				} else {
					console.log(data);
					console.log(mapData);

					svg.selectAll("path.map")
							   .data(mapData.features)
							   .enter()
							   .append("path")
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
							   		if (d.properties.JURI !== 'NORN') {
							   			return 'darkolivegreen';
							   		}
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
				
			})