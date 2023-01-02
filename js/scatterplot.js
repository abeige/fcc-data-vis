{ // start block scope

  fetchData().then(scatterplot);

  async function fetchData() {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    const data = await fetch(url)
      .then(res => res.json())
      .catch(err => { throw err });
    return data;
  }

  function scatterplot(data) {
    // https://coolors.co/0a2463-fb3640-605f5e-247ba0-f5f5f5
    const color = {
      royalBlueDark: "#0a2463",
      redSalsa: "#fb3640",
      graniteGray: "#605f5e",
      cgBlue: "#247ba0",
      cultured: "#f5f5f5"
    };

    const width = 400;
    const height = 300;
    const margin = { top: 10, left: 70, bottom: 45, right: 15 };
    const totalWidth = width + margin.left + margin.right;
    const totalHeight = height + margin.top + margin.bottom;

    // svg
    var svg = d3.select('#scatterplot-container')
      .append('svg')
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .attr('id', 'chart')

    // chart group
    var g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // x scale
    const xScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.Year) - 1,
        d3.max(data, d => d.Year) + 1,
      ])
      .range([0, width]);

    // y scale
    const parseTime = d3.timeParse("%M:%S");
    const yScale = d3.scaleTime()
      .domain(d3.extent(data, d => parseTime(d.Time))).nice()
      .range([0, height]);

    // x axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d);
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
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => d3.timeFormat('%M:%S')(d));
    var yAxisGroup = g.append('g')
      .attr('id', 'y-axis')
      .attr('class', 'axis')
      .call(yAxis);
    yAxisGroup.append("text")
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Time (minutes)');

    // dots
    const dots = renderData(g, data);
    function renderData(group, data) {
      const dots = g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(parseTime(d.Time)))
        .attr('r', 3)
        .attr('fill', d => d.Doping == '' ? color.royalBlueDark : color.redSalsa)
        .attr('class', 'dot')
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => parseTime(d.Time))
        .attr('data-time', d => d.Time)
        .attr('data-name', d => d.Name)
        .attr('data-nationality', d => d.Nationality)
        .attr('data-doping', d => d.Doping)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

      return dots;

      function mouseover() {
        const dot = d3.select(this);

        tooltip
          .style('top', (mouseY + 20) + 'px')
          .style('left', (mouseX + 20) + 'px');

        tooltip.style('visibility', 'visible')
          .attr('data-year', dot.attr('data-xvalue'))
          .html(`${dot.attr('data-name')}, ${dot.attr('data-nationality')}<br>Time: ${dot.attr('data-time')}<br>${dot.attr('data-doping') == '' ? '' : 'Doping: ' + dot.attr('data-doping')}`);
      }

      function mouseout() {
        tooltip.style('visibility', 'hidden');
      }
    }

    var legend = svg.append('g')
      .attr('id', 'legend');
    legend.append('rect')
      .attr('x', 350)
      .attr('y', 50)
      .attr('width', 95)
      .attr('height', 50)
      .attr('fill', color.cultured)
      .attr('stroke', 'black');
    legend.append('circle')
      .attr('cx', 365)
      .attr('cy', 65)
      .attr('r', 3)
      .attr('fill', color.royalBlueDark);
    legend.append('text')
      .text('No Doping')
      .attr('x', 375)
      .attr('y', 68)
      .attr('font-size', 10);
    legend.append('circle')
      .attr('cx', 365)
      .attr('cy', 85)
      .attr('r', 3)
      .attr('fill', color.redSalsa);
    legend.append('text')
      .text('Doping')
      .attr('x', 375)
      .attr('y', 88)
      .attr('font-size', 10);

    // tooltip
    var tooltip = d3.select('#scatterplot-container')
      .append('div')
      .attr('class', 'tooltip')
      .style('visibility', 'hidden');

  }

} // end block scope
