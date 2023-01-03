{ // start block scope
	const monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];

	// https://coolors.co/ff686b-c0e0de-4d5061-5c80bc-fec601
	const color = {
		bittersweet: "#ff686b",
		powderBlue: "#c0e0de",
		independence: "#4d5061",
		glaucous: "#5c80bc",
		mikadoYellow: "#fec601"
	}

	fetchData().then(heatmap);

	async function fetchData() {
		const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
		const data = await fetch(url)
			.then(res => res.json())
			.catch(err => { throw err });
		return data;
	}

	function heatmap(data) {
		const width = 400;
		const height = 200;
		const margin = { top: 5, left: 100, bottom: 80, right: 15 };
		const totalWidth = width + margin.left + margin.right;
		const totalHeight = height + margin.top + margin.bottom;

		// svg
		var svg = d3.select("#heatmap-container")
			.append("svg")
			.attr("viewBox", [0, 0, totalWidth, totalHeight])
			.attr("id", "chart");

		// chart group
		const g = svg.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

		// x scale
		const xScale = d3.scaleBand()
			.domain(data.monthlyVariance.map(d => d.year))
			.range([0, width]);

		// y scale
		const yScale = d3.scaleBand()
			.domain(monthNames)
			.range([0, height]);

		// color scale
		var colorScale = d3.scaleSequential()
			.interpolator(d3.interpolateRdYlBu)
			.domain(d3.extent(data.monthlyVariance, d => d.variance).reverse());

		// x axis
		const xAxis = d3.axisBottom(xScale)
			.tickFormat(d => d)
			.tickValues([1760, 1780, 1800, 1820, 1840, 1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000]);
		var xAxisGroup = g.append("g")
			.attr("transform", `translate(0, ${height})`)
			.attr("id", "x-axis")
			.attr("class", "axis")
			.call(xAxis);
		xAxisGroup.append("text")
			.attr("x", width / 2)
			.attr("y", 40)
			.attr("fill", "black")
			.attr("text-anchor", "middle")
			.text("Year");

		// y axis
		const yAxis = d3.axisLeft(yScale)
			.tickFormat(d => d);
		var yAxisGroup = g.append("g")
			.attr("id", "y-axis")
			.attr("class", "axis")
			.call(yAxis);
		yAxisGroup.append("text")
			.attr("x", -height / 2)
			.attr("y", -70)
			.attr("fill", "black")
			.attr("text-anchor", "middle")
			.attr("transform", "rotate(-90)")
			.text("Month");

		// rectangles
		const rects = renderData();
		function renderData() {
			const rects = g.append("g")
				.selectAll("rect")
				.data(data.monthlyVariance)
				.join("rect")
				.attr("x", d => xScale(d.year))
				.attr("y", d => yScale(monthNames[d.month - 1]))
				.attr("width", xScale.bandwidth())
				.attr("height", yScale.bandwidth())
				.attr("fill", d => colorScale(d.variance))
				.attr("class", "cell")
				.attr("data-month", d => d.month - 1)
				.attr("data-year", d => d.year)
				.attr("data-temp", d => d.variance)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			return rects;

			function mouseover() {
				d3.select(this).style("stroke", "black");

				const rect = d3.select(this);
				const m = monthNames[rect.attr("data-month")];
				const y = rect.attr("data-year");
				const t = d3.format(".2f")(data.baseTemperature + parseFloat(rect.attr("data-temp"))) + "° C";
				const v = rect.attr("data-temp")

				tooltip
					.style("top", (mouseY + 20) + "px")
					.style("left", (mouseX + 20) + "px");

				tooltip.style("visibility", "visible")
					.attr("data-year", rect.attr("data-year"))
					.html(`${m} ${y}: ${t}<br>Variance: ${v}`);
			}

			function mouseout() {
				d3.select(this).style("stroke", null);
				tooltip.style("visibility", "hidden");
			}
		}

		// legend
		const legend = renderLegend();
		function renderLegend() {
			const legendGroup = svg.append("g")
				.attr("id", "heatmap-legend");

			const scaleLegendTicks = d3.scaleLinear()
				.domain([0, 7])
				.range(d3.extent(data.monthlyVariance, d => d.variance));
			const legendTicks = d3.range(8).map(scaleLegendTicks);

			var rectY = 250,
				boxWidth = 20,
				boxHeight = 10;
			legendGroup.selectAll("rect")
				.data(legendTicks)
				.join("rect")
				.attr("x", (d, i) => i * boxWidth + margin.left)
				.attr("y", rectY)
				.attr("width", boxWidth)
				.attr("height", boxHeight)
				.attr("fill", d => colorScale(d))
				.attr("stroke", "black");

			const xScaleLegend = d3.scaleBand()
				.domain(legendTicks)
				.range([0, 8 * boxWidth]);
			const legendAxis = d3.axisBottom(xScaleLegend)
				.tickFormat(d => d3.format(".1f")(data.baseTemperature + d));
			legendGroup.append("g")
				.attr("transform", `translate(${margin.left}, ${rectY + boxHeight})`)
				.style("font", "8px sans-serif")
				.call(legendAxis);

			return legendGroup;
		}

		// tooltip

		var tooltip = d3.select("#heatmap-container")
			.append("div")
			.attr("class", "tooltip")
			.style("visibility", "hidden");
	}
} // end block scope
