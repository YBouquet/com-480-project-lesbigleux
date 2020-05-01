function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

whenDocumentLoaded(() => {
  console.log('DOM loaded');
  d3.json("data.json").then(generate_graph);
});




function generate_graph(data) {

  const X_1 = 100
  const X_2 = 300
  const RADIUS = 5

  //suppose that events appear first in the json file
  const bipartition = () => {
    const scale = d3.scaleOrdinal([X_1,X_2]);
    return d => scale(d.group);
  };

  x_force = bipartition();


  const drag = (simulation, link) => {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      link
        .attr('stroke', l => l.target == d || l.source == d ? "#ffcc66":"#999")
        .attr('stroke-width', l => l.target == d || l.source == d ? Math.sqrt(5) : Math.sqrt(2));
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      if (x_force(d) == X_1){
        d.fx = d.x > X_2 ? d.x : X_1;
      }else{
        d.fx = d.x < X_1 ? d.x : X_2;
      }
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  const color = () => {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.group)
  }

  const nodes = data.nodes.map(d => Object.create(d));
  const links = data.links.map(d => Object.create(d));


  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).strength(0).id(d=>d.id))
    .force("charge", d3.forceCollide(RADIUS))

  function y_repartitions(nodes, height){
    let groups = {};

    nodes.forEach((n)=>{
      if (Object.keys(groups).reduce((tot,y) => {return tot || y === n.group;}, false)){
        groups[n.group] = groups[n.group] + 1;
      } else {
        groups[n.group] = 0;
      }
    });

    Object.keys(groups).map(k =>{
      groups[k] ={
        "scale" : d3.scaleLinear().domain([0, groups[k]]).range([0, height]),
        "count" : 0
        };
    });

    nodes.forEach((n)=>{
      range = groups[n.group];
      n.y = range['scale'](range['count']);
      groups[n.group]['count'] = groups[n.group]['count']  + 1;
    })
  }

  var svg = d3.select("#undirected_graph");


  simulation.nodes().forEach(d =>{
    d.fx = x_force(d);
  });

  y_repartitions(simulation.nodes(), 700);
/*
.force("charge", d3.forceManyBody())
.force("x", d3.forceX())
.force("y", d3.forceY());
*/



  var link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke-width", Math.sqrt(2));

  var node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", RADIUS)
    .attr("fill", color())
    .call(drag(simulation, link));

  node.append("title")
    .text(d => d.name);

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    node
     .attr("cx", d => d.x)
     .attr("cy", d => d.y);
    });
}
