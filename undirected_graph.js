import {generate_sunburst, clear_sunburst} from "./seq_sunburst.js"

function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

const sunburst_promise = d3version5.text("data/sunburst_data.csv");


const width = 800;
const height = 500;

whenDocumentLoaded(() => {
  console.log('DOM loaded');
  const graph_promise = d3version5.json("data/network_data.json")
  var year_selector = document.getElementById('network_year');
  year_selector.addEventListener('change', function(){
    clear_sunburst()
    graph_promise.then(d=>generate_graph(d, year_selector.value));
  });

  d3version5.select('#visu_container').append('svg')
    .attr('width', '100%')
    .attr('height', 'auto')
    .attr('viewBox', '0,-50,1630,580')
    .attr('id', 'context_container')
  graph_promise.then(d=>generate_graph(d, year_selector.value));
});



function generate_graph(data, year) {

  const X_1 = 350
  const X_2 = 450
  const RADIUS = 7


  const bipartition = () => {
    const scale = d3version5.scaleOrdinal([X_1,X_2]);
    return d => scale(d.group);
  };

  const x_force = bipartition();

  const drag = (simulation, link) => {
    function dragstarted(d) {
      if (!d3version5.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      link
        .attr('stroke', l => l.target == d || l.source == d ? "#6E0D25":"#999")
        .attr('stroke-width', l => l.target == d || l.source == d ? Math.sqrt(5) : Math.sqrt(2));
    }

    function dragged(d) {
      d.fx = Math.min(Math.max(d3version5.event.x, 0), width);
      d.fy = Math.min(Math.max(d3version5.event.y, 0), height);
    }

    function dragended(d) {
      if (!d3version5.event.active) simulation.alphaTarget(0);
      if (x_force(d) == X_1){
        d.fx = d.x > X_2 ? d.x : X_1;
      }else{
        d.fx = d.x < X_1 ? d.x : X_2;
      }
      d.fy = null;
    }

    return d3version5.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  const color = () => {
    const scale = d3version5.scaleOrdinal(d3version5.schemeCategory10);
    return d => scale(d.group)
  }

  const filtered_links = data.links.filter(l => l.year_award == year)
  const targets_list = filtered_links.map(l => l.target)
  const sources_list = filtered_links.map(l => l.source)
  const filtered_nodes = data.nodes.filter(n => sources_list.includes(n.id) || targets_list.includes(n.id))

  const comparator = (a,b) =>{
    return a.name > b.name ? 1 : -1;
  }
  const nodes = filtered_nodes.map(d => Object.create(d)).sort(comparator);
  const links = filtered_links.map(d => Object.create(d)).sort(comparator);


  const simulation = d3version5.forceSimulation(nodes)
    .force("link", d3version5.forceLink(links).strength(0).id(d=>d.id))
    .force("charge", d3version5.forceCollide(RADIUS));

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
        "scale" : d3version5.scaleLinear().domain([0, groups[k]]).range([20, height]),
        "count" : 0
        };
    });

    nodes.forEach((n)=>{
      var range = groups[n.group];
      n.y = range['scale'](range['count']);
      groups[n.group]['count'] = groups[n.group]['count']  + 1;
    })
  }

  d3version5.select("#network_container").remove()
  var svg = d3version5.select("#context_container").append('g')
    .attr('id', 'network_container');


  simulation.nodes().forEach(d =>{
    d.fx = x_force(d);
  });

  y_repartitions(simulation.nodes(), height);

  var block_colors = [
    { 'x': 10, 'y': 10, 'color':"#f0af5b", 'stroke':"#ffcc66", 'text': 'Drag A Country HERE'},
    {'x':X_2 + 180, 'y':10, 'color':"#79ceed", 'stroke':"#46dcf0", 'text': 'Drag An Event HERE'}];
  const blocks_width =  X_1 - 200
  var blocks = svg.selectAll("g")
    .data(block_colors)
    .enter()
    .append("g")
    .attr("transform", d=>"translate(" + d.x + "," + d.y + ")");

  blocks.append('rect')
    .attr("width", blocks_width)
    .attr("height", height )
    .attr("fill", d =>d.color)
    .attr("fill-opacity", .70)
    .attr("stroke", d =>d.stroke)
    .attr("stroke_width", 1.5);

  blocks.append('text')
    .attr('x', blocks_width / 2)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('fill', '#F3EFE2')
    .attr('font-weight', 'bold')
    .attr('font-size', '15px')
    .text(d=>d.text);

  var link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke-width", Math.sqrt(2));

  var node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g");

  node.append('circle')
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("r", RADIUS)
    .attr("fill", color())
    .attr('class', 'node')
    .call(drag(simulation, link))
    .on('click', d => sunburst_promise.then(function(text){
      if (d.group === "event"){
          generate_sunburst(d3version5.csvParseRows(text), d.name, year, width)
      }
    }));


  node.append('text')
    .attr('font-size', '13px')
    .attr('font-weight', 'bold')
    .attr('class', 'node_text')
    .text(function(d){
      return d.name;
    });

  simulation.on("tick", () => {
    d3version5.selectAll(".node")
      .attr("cx", d => Math.min(Math.max(d.x, 0), width)) //d.x
      .attr("cy", d => Math.min(Math.max(d.y, 0), height)); //d.y
    link
      .attr("x1", d => Math.min(Math.max(d.source.x, 0), width))
      .attr("y1", d => Math.min(Math.max(d.source.y, 0), height))
      .attr("x2", d => Math.min(Math.max(d.target.x, 0), width))
      .attr("y2", d => Math.min(Math.max(d.target.y, 0), height));
    d3version5.selectAll('.node_text')
      .attr("x", d=> {
        var result;
        if (d.group == 'event'){
            result = d.x - 10;
            if (d.x >= X_2){
            result = d.x + 10;
          }
        } else{
          result = d.x + 10;
          if (d.x <= X_1){
            result = d.x - 10;
          }
        }
        return result;
      })
      .attr("y", d => d.y + 5)
      .attr("text-anchor", d=> {
        var result;
        if (d.group == 'event'){
          result ="end";
          if (d.x >= X_2){
            result = "start";
          }
        } else{
          result = "start";
          if (d.x <= X_1){
            result = "end";
          }
        }
        return result;})
        });
}
