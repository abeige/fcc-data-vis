{ // start block scope

  fetchData().then(barChart);

  async function fetchData() {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    const data = await fetch(url)
      .then(res => res.json())
      .catch(err => { throw err });
    return data;
  }

  function barChart(gdp) {
    // https://coolors.co/4c5454-ff715b-ffffff-1ea896-f6d647
    const color = {
      davysGrey: '#4c5454',
      bittersweet: '#ff715b',
      white: '#ffffff',
      persianGreen: '#1ea896',
      mustard: '#f6d647'
    };

    // constants
    const width = 400;
    const height = 200;
    const margin = { top: 10, left: 60, bottom: 45, right: 15 };
    const totalWidth = width + margin.left + margin.right;
    const totalHeight = height + margin.top + margin.bottom;

    // svg
    var svg = d3.select('#barchart-container')
      .append('svg')
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .attr('id', 'chart');

    // chart group
    var g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // x scale
    const parseTime = d3.timeParse("%Y-%m-%d");
    const xScale = d3.scaleTime()
      .domain([
        d3.min(gdp.data, d => parseTime(d[0])),
        d3.max(gdp.data, d => parseTime(d[0]))
      ])
      .range([0, width]);

    // y scale
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(gdp.data, d => d[1])])
      .range([height, 0]);

    // x axis
    const xAxis = d3.axisBottom(xScale);
    var xAxisGroup = g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('id', 'x-axis')
      .attr('class', 'axis')
      .call(xAxis);
    xAxisGroup.append("text")
      .text("Date")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle");

    // y axis
    const yAxis = d3.axisLeft(yScale);
    var yAxisGroup = g.append('g')
      .attr('id', 'y-axis')
      .attr('class', 'axis')
      .call(yAxis);
    yAxisGroup.append("text")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("fill", color.davysGrey)
      .attr("text-anchor", "middle")
      .attr('transform', 'rotate(-90)')
      .text("GDP (Billions)");

    // bars
    var bars = addBars(g, gdp.data)
    function addBars(g, data) {
      return g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(parseTime(d[0])))
        .attr('y', d => yScale(d[1]))
        .attr('width', 3)
        .attr('height', d => height - yScale(d[1]))
        .attr('fill', color.persianGreen)
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

      function mouseover() {
        const bar = d3.select(this);

        bar.attr('fill', color.bittersweet);


        tooltip
          .style('top', (mouseY + 20) + 'px')
          .style('left', (mouseX + 20) + 'px');

        tooltip.style('visibility', 'visible')
          .attr('data-date', bar.attr('data-date'))
          .html(`${bar.attr('data-date')}<br>$${bar.attr('data-gdp')} billion`);
      }

      function mouseout() {
        d3.select(this).attr('fill', color.persianGreen);
        tooltip.style('visibility', 'hidden');
      }

    }

    // tooltip
    var tooltip = d3.select('#barchart-container')
      .append('div')
      .attr('class', 'tooltip')
      .style('visibility', 'hidden');
  }

} // end block scope
