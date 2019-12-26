const w = 1000;
const h = 1000;
const padding = 100;

function heatMapColorforValue(value) {
  var h = (1.0 - value) * 240;
  return "hsl(" + h + ", 100%, 50%)";
}

function dateWithMonth(month) {
  let date = new Date(0);
  date.setUTCMonth(month);
  return date;
}

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then(function(data) {
  const baseTemp = data.baseTemperature;
  const year = data.monthlyVariance.map(d => d.year);
  const month = data.monthlyVariance.map(d => d.month - 1);
  const variance = data.monthlyVariance.map(d => d.variance);

  const startYear = Math.min(...year);
  const endYear = Math.max(...year);

  d3.select("#titlebox")
    .append("h2")
    .attr("id", "description")
    .html(startYear + " - " + endYear);

  const xScale = d3
    .scaleLinear()
    .domain([d3.min(year), d3.max(year)])
    .range([padding, w - padding]);
  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .rangeRound([h - padding, padding]);

  // Mapping the variance values to 0..1
  const colorScale = d3
    .scaleLinear()
    .domain([
      Math.floor(d3.min(variance) + baseTemp),
      Math.floor(d3.max(variance) + baseTemp) + 1
    ])
    .range([0, 1]);

  const colorScaleInvers = d3
    .scaleLinear()
    .domain([0, 1])
    .range([
      Math.floor(d3.min(variance) + baseTemp),
      Math.floor(d3.max(variance) + baseTemp) + 1
    ]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(month => d3.timeFormat("%B")(dateWithMonth(month)));

  // append x-axis
  svg
    .append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .attr("id", "x-axis")
    .call(xAxis.tickSizeOuter(0))
    .style("font-size", "15px");

  // append y-axis
  svg
    .append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .attr("id", "y-axis")
    .call(yAxis.tickSizeOuter(0))
    .style("font-size", "15px");

  // create & append legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(" + (0.9 * w + 20) + " ," + h / 4 + ")")
    .attr("height", 100)
    .attr("width", 50);

  const colors = [
    heatMapColorforValue(0),
    heatMapColorforValue(0.2),
    heatMapColorforValue(0.4),
    heatMapColorforValue(0.6),
    heatMapColorforValue(0.8),
    heatMapColorforValue(1)
  ];

  const legendText = [
    colorScaleInvers(0),
    colorScaleInvers(0.2),
    colorScaleInvers(0.4),
    colorScaleInvers(0.6),
    colorScaleInvers(0.8),
    colorScaleInvers(1)
  ];

  legend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("x", 5)
    .attr("y", (d, i) => 5 + i * 30)
    .attr("width", 30)
    .attr("height", 30)
    .style("fill", d => d)
    .style("stroke", "black");

  legend
    .selectAll("text")
    .data(legendText)
    .enter()
    .append("text")
    .attr("x", 45)
    .attr("y", (d, i) => 25 + i * 30)
    .text(d => d)
    .style("font-size", "20px");

  // visualize data
  svg
    .selectAll("rect")
    .data(variance)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(year[i]))
    .attr("y", (d, i) => yScale(month[i]))
    .attr("width", ((w - 2 * padding) / year.length) * 12)
    .attr("height", (h - 2 * padding) / 12)
    .attr("class", "cell")
    .attr("data-month", (d, i) => month[i])
    .attr("data-year", (d, i) => year[i])
    .attr("data-temp", d => d + baseTemp)
    .attr("fill", d => heatMapColorforValue(colorScale(d + baseTemp)))
    .on("mouseover", function(d, i) {
      // add information box
      d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("left", padding / 2 + xScale(year[i]) + "px")
        .style("top", padding + yScale(month[i]) + "px")
        .attr("data-year", year[i])
        .html(
          d3.timeFormat("%b")(dateWithMonth(month[i])) +
            " " +
            year[i] +
            "<br>" +
            "Temperature: " +
            d3.format(".2n")(baseTemp + d) +
            "° C"
        )
        .style("pointer-events", "none");
      // add border to rect
      svg
        .append("rect")
        .attr("id", "activebar")
        .attr("x", xScale(year[i]))
        .attr("y", yScale(month[i]))
        .attr("width", ((w - 2 * padding) / year.length) * 12)
        .attr("height", (h - 2 * padding) / 12)
        .attr("fill", "transparent")
        .style("stroke", "black")
        .style("pointer-events", "none");
    })
    .on("mouseout", function(d, i) {
      d3.select("#tooltip").remove();
      svg.select("#activebar").remove();
    });
});
