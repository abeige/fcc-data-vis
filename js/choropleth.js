{ // start block scope

	fetchData().then(choropleth);

	async function fetchData() {
		const urlMap =
			"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
		const urlData =
			"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

		const map = await fetch(urlMap)
			.then((res) => res.json())
			.catch((err) => {
				throw err;
			});

		const data = await fetch(urlData)
			.then((res) => res.json())
			.catch((err) => {
				throw err;
			});

		return { map, data };
	}

	function choropleth(obj) {
		console.log("here");

		const { map, data } = obj;

		var width = 1000,
			height = 630;

		var svg = d3
			.select("#choropleth-container")
			.append("svg")
			.attr("viewBox", [0, 0, width, height]);

		var dataLookup = data.reduce((map, obj) => {
			map[obj.fips] = obj;
			return map;
		}, {});

		drawMap();
		function drawMap() {
			// color scale
			var colorScale = d3
				.scaleSequential()
				.interpolator(d3.interpolateBlues)
				.domain(d3.extent(data, (d) => d.bachelorsOrHigher));

			// draw county boundaries
			const counties = svg
				.append("g")
				.attr("id", "counties")
				.selectAll("path")
				.data(topojson.feature(map, map.objects.counties).features)
				.join("path")
				.attr("d", d3.geoPath())
				.attr("fill", (d) => colorScale(dataLookup[d.id].bachelorsOrHigher))
				.style("stroke", "rgba(255,255,255,0.1)")
				.attr("class", "county")
				.attr("data-fips", (d) => dataLookup[d.id].fips)
				.attr("data-education", (d) => dataLookup[d.id].bachelorsOrHigher)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			// draw state boundaries
			const states = svg
				.append("g")
				.attr("id", "states")
				.selectAll("path")
				.data(topojson.feature(map, map.objects.states).features)
				.join("path")
				.attr("d", d3.geoPath())
				.attr("fill", "none")
				.style("stroke", "#fff")
				.style("stroke-width", "0.07em");

			drawLegend();
			function drawLegend() {
				const legendGroup = svg.append("g").attr("id", "legend");

				const scaleLegendTicks = d3
					.scaleLinear()
					.domain([0, 4])
					.range(d3.extent(data, (d) => d.bachelorsOrHigher));
				const legendTicks = d3.range(5).map(scaleLegendTicks);
				console.log(legendTicks);

				legendGroup
					.selectAll("rect")
					.data(legendTicks)
					.join("rect")
					.attr("x", (d, i) => i * 50 + 590)
					.attr("y", 40)
					.attr("width", 50)
					.attr("height", 15)
					.attr("fill", (d) => colorScale(d));

				const xScaleLegend = d3
					.scaleBand()
					.domain(legendTicks)
					.range([0, 5 * 50]);
				const legendAxis = d3
					.axisBottom(xScaleLegend)
					.tickFormat((d) => d3.format(".1f")(d) + "%");
				legendGroup
					.append("g")
					.attr("transform", `translate(590, 55)`)
					.style("font", "13px sans-serif")
					.call(legendAxis);

				return legendGroup;
			}

			// tooltip
			var tooltip = d3
				.select("#choropleth-container")
				.append("div")
				.attr("class", "tooltip")
				.style("visibility", "hidden");

			function mouseover() {
				d3.select(this).style("stroke", "black");

				const county = d3.select(this);
				const c = dataLookup[county.attr("data-fips")].area_name;
				const s = dataLookup[county.attr("data-fips")].state;
				const e =
					d3.format(".2f")(parseFloat(county.attr("data-education"))) + "%";

				tooltip.style("top", mouseY + 20 + "px").style("left", mouseX + 20 + "px");
				tooltip
					.style("visibility", "visible")
					.attr("data-education", county.attr("data-education"))
					.html(`${c}, ${s}: ${e}`);
			}

			function mouseout() {
				d3.select(this).style("stroke", null);
				tooltip.style("visibility", "hidden");
			}
		}
	}

} // end block scope

