{ // start block scope

  fetchData().then(treemap);

  async function fetchData() {
    const url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
    const data = await fetch(url)
      .then(res => res.json())
      .catch(err => { throw err });
    return data;
  }

} // end block scope


// draw the treemap
function treemap(data) {
  // sizing
  const width = 1000,
    height = 500

  // svg
  const svg = d3.select("#treemap-container")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("id", "chart");

  // create tree
  const root = d3.hierarchy(data).sum(d => parseFloat(d.value));
  d3.treemap()
    .size([width, height])
    .paddingInner(1)
    .paddingOuter(0)
    (root);

  // color scale
  var categories = new Set(data.children.map(d => d.name))
  var colorScale = d3
    .scaleOrdinal(d3.schemeTableau10)
    .domain(categories);

  // create groups for nodes
  node = svg.selectAll("g")
    .data(root.leaves())
    .join("g");

  // create rectangles
  node.append("rect")
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("fill", (d) => colorScale(d.data.category))
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  // text labels
  node.append("text")
    .attr("x", (d) => d.x0 + 2)
    .attr("y", (d) => d.y0 + 9)
    .text((d) => d.data.name)
    .attr("font-size", "8px")
    .attr("fill", "white");

  // legend
  drawLegend(categories, colorScale);

  // tooltip
  var tooltip = d3.select("#treemap-container")
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

  function mouseover() {
    d3.select(this).style("stroke", "black");

    const rect = d3.select(this);
    const n = rect.attr("data-name");
    const c = rect.attr("data-category");
    const v = rect.attr("data-value")

    tooltip
      .style("top", (mouseY + 20) + "px")
      .style("left", (mouseX + 20) + "px");

    tooltip.style("visibility", "visible")
      .attr("data-value", rect.attr("data-value"))
      .html(`${n}<br>${c}<br>${v}`);
  }

  function mouseout() {
    d3.select(this).style("stroke", null);
    tooltip.style("visibility", "hidden");
  }

}


// draw the legend for categories/colors
function drawLegend(categories, colorScale) {
  const legendWidth = 1000
  const legendHeight = 180
  const boxWidth = 50
  const legendMargin = { top: 0, left: 0, bottom: boxWidth, right: 200 }

  const svg = d3.select("#treemap-container")
    .append("svg")
    .attr("viewBox", [0, 0, legendWidth + legendMargin.right, legendHeight + legendMargin.bottom])
    .attr("id", "legend");

  const xScale = d3.scaleLinear()
    .domain([0, 5])
    .range([0, legendWidth])
  const yScale = d3.scaleLinear()
    .domain([0, 2])
    .range([0, legendHeight])

  const node = svg.selectAll("g")
    .data(categories)
    .join("g")

  node.append("rect")
    .attr("x", (d, i) => xScale(i % 6))
    .attr("y", (d, i) => yScale(parseInt(i / 6) % 3))
    .attr("width", boxWidth)
    .attr("height", boxWidth)
    .attr("class", "legend-item")
    .style("fill", d => colorScale(d))

  node.append("text")
    .attr("x", (d, i) => xScale(i % 6) + boxWidth + 20)
    .attr("y", (d, i) => yScale(parseInt(i / 6) % 3) + 35)
    .attr("font-size", "30px")
    .text(d => d)
}