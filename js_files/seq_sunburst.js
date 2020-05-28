const width_trail = 950;
const width_sunburst = 600;
const height = 400;
const radius = Math.min(width_sunburst, height) / 2;



const breadcrumbWidth = 75
const breadcrumbHeight = 30
const string_threshold = 15

const b = {
  w: 75, h: 30, s: 3, t: 10
};

const root_domain = ["Nominees", "Winners", "Films", "People"];


export function clear_sunburst(){
  d3version5.select("#chart > *").remove();
  d3version5.select("#sidebar").style("visibility", 'hidden');
}


export function generate_sunburst(lists, event, year, x0)
{
  const data = buildHierarchy(lists.filter(d => d[2] === event && d[3] == year).map(d=> [d[0], d[1]]));
  const award_names = data.children.map(d => d.name)

  const awards_color = chroma.scale(['#6E0D25', '#c9ae22', '#1c5c1d', '#2822a8']).classes(award_names.length);
  const color = [
    d3version5.scaleOrdinal(d3version5.quantize(awards_color, data.children.length)),
    d3version5.scaleOrdinal()
      .domain(["Nominees", "Winners", "Films", "People", "Price"])
      .range(["#815ecc", "#db841a", "#d61818", "#0c9136", "#bfad2c"])
  ]

  /*
  const color = d3version5
    .scaleOrdinal()
    .domain(["Oscar", "Nominees", "Winners", "Films", "People", "Price"])
    .range(["#7c6561", "#815ecc", "#db841a", "#d61818","#0c9136", "#bfad2c"])
    */
  d3version5.select('#sunburst_container').remove();

  d3version5.select('#context_container').append('g')
    .attr("transform", "translate(" + x0 + ","+ breadcrumbHeight + ")")
    .attr("id", "sunburst_container")
    .attr('visibility','')
    .append('text')
    .attr('y', '-30')
    .attr('font-weight', 'normal')
    .attr('font-size', '25px')
    .text('What does ' + event + ' consist of in ' + year + '?');

  initializeBreadcrumbTrail(x0);

  drawLegend(color[1], x0);
  d3version5.select("#togglelegend").on("click", toggleLegend);

  const root = d3version5.partition().size([2 * Math.PI, radius * radius])(
    d3version5
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
    );

  const viz = d3version5.select("#sunburst_container").append("g")
    .attr("width", width_sunburst )
    .attr("height", height)
    .append("g")
    .attr("id", "container")
    .attr("transform", "translate(" + width_sunburst / 2 + "," + (50 + height / 2)  + ")");

  //const svg = d3version5.select("#sunburst");

  var element = viz.node();
  element.value = { sequence: [], percentage: 0.0 };


  const label = viz
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#888")
    .style("visibility", "hidden");

  label
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.1em")
    .attr("font-size", "3em")
    .text("");

  label
    .append("tspan")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "1.5em")
    .text("of visits begin with this sequence");

  viz
    .attr("viewBox", `${-radius} ${-radius} ${width_sunburst} ${width_sunburst}`)
    .style("max-width", `${width_sunburst}px`)
    .style("font", "12px sans-serif");

  let  arc = d3version5
          .arc()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(1 / radius)
          .padRadius(radius)
          .innerRadius(d => Math.sqrt(d.y0))
          .outerRadius(d => Math.sqrt(d.y1) - 1)

  const path = viz
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .enter()
    .append("path")
    .attr("fill", d => {
      var m_color;
      if (award_names.includes(d.data.name) && d.parent && d.parent.data.name == 'root'){
        m_color = color[0](d.data.name);
      }else{
        m_color = color[1](root_domain.includes(d.data.name)? d.data.name : "Price")
      }
      return m_color;
    })
    .attr("d", arc);


  const mousearc = d3version5
            .arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => Math.sqrt(d.y0))
            .outerRadius(radius);

  viz
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      d3version5.select("#trail")
       .style("visibility", "hidden");

      path.attr("fill-opacity", 1);
      label.style("visibility", "hidden");
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      updateBreadcrumbs(element.value, award_names, color);

      // Update the value of this view
      /*
        element.value = { sequence: [], percentage: 0.0 };
        element.dispatchEvent(new CustomEvent("input"));
      */
    })
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .enter()
    .append("path")
    .attr("d", mousearc)
    .on("mouseenter", d => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path
        .attr("fill-opacity", node =>
          sequence.indexOf(node) >= 0 ? 1.0 : 0.3
        );
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text(percentage + "%");
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      // Update the value of this view with the currently hovered sequence and percentage
      updateBreadcrumbs(element.value, award_names, color);
    });


}


function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        if (typeof children != 'undefined'){
          children.push(childNode);
        }
      }
    }
  }
  return root;
}

function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];

  const finalWidth = (Math.floor(d.data.name.length / string_threshold) + 1 )* breadcrumbWidth;
  points.push(`0,0`);
  points.push(`${finalWidth},0`);
  points.push(`${finalWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${finalWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }

  return points.join(" ");
}


function initializeBreadcrumbTrail(x0) {
  // Add the svg area.
  d3version5.select("#trail_container").remove()
  var trail = d3version5.select("#context_container").append("svg")
      .attr('x', x0)
      .attr("width", width_trail)
      .attr("height", 50)
      .attr("viewBox", `0 0 ${breadcrumbWidth * 11} ${breadcrumbHeight}`)
      .attr('id', 'trail_container')
      .append('g')
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
}



function updateBreadcrumbs(sunburst, award_names, color) {
  // Data join; key function combines name and depth (= position in sequence).
      d3version5.select('#trail').selectAll('*').remove();

      const svg = d3version5.select('#trail')
      .append("g")
      .style("font", "10px sans-serif")
      .style("margin", "5px");

      const g = svg
      .selectAll("g")
      .data(sunburst.sequence)
      .enter()
      .append("g")
        .attr("transform", (d, i) => {
          var incrementer = 0;
          var mObj = d;
          while(mObj.parent && mObj.parent.data.name != "root"){
            incrementer += Math.floor(mObj.parent.data.name.length / string_threshold) + 1;
            mObj = mObj.parent
          }
          return `translate(${incrementer * breadcrumbWidth}, 0)`;
        });


      g.append("polygon")
      .attr("points", breadcrumbPoints)
      .attr("fill", d => {
        var m_c = color[1]
        if (award_names.includes(d.data.name)){
          m_c = color[0]
        }

        return m_c(m_c.domain().includes(d.data.name)? d.data.name: "Price");
        })
      .attr("fill-opacity", .70)
      .attr("stroke", "white");

      g.append("text")
      .attr("x", (d,i) => (breadcrumbWidth * (Math.floor(d.data.name.length / string_threshold) + 1 )  + 10) / 2)
      .attr("y", 15)
      .attr("dy", "0.35em")
      .attr("font-weight", 'bold')
      .attr("text-anchor", "middle")
      .attr("class", "sequence_text")
      .text(d => d.data.name)


      svg
        .append("text")
        .text(sunburst.percentage > 0 ? sunburst.percentage + "%" : "")
        .attr("x", ()=>{
          var multiplier = 0
          sunburst.sequence.forEach(d =>{
            multiplier = multiplier + (Math.floor(d.data.name.length / string_threshold) + 1 )
          })
          return (multiplier + 0.5) * breadcrumbWidth;
        })
        .attr("y", breadcrumbHeight / 2)
        .attr("dy", "0.55em")
        .attr("text-anchor", "middle")
        .style('fill', 'black');


      // Make the breadcrumb trail visible, if it's hidden.
      d3version5.select("#trail")
      .style("visibility", "");
}

function drawLegend(color, x0) {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 100, h: 30, s: 3, r: 3
  };

  d3version5.select("#legend").remove()
  d3version5.select("#context_container").append('g')
    .attr('transform', "translate(" + (x0 + width_sunburst) + ","+ breadcrumbHeight*2 + ")")
    .style("visibility", '')
    .attr('id', 'legend');

  var legend = d3version5.select("#legend").append("svg")
      .attr("width", li.w)
      .attr("height", d3version5.keys(color.domain()).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(color.domain().map((d,i)=> {return {'domain':d, 'range':color.range()[i]}}))
      .enter().append("g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.range; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.domain; });
}

function toggleLegend() {
  var legend = d3version5.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}
