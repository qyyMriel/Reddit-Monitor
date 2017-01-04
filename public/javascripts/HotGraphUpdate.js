function HotGraphUpdate(){
  var defaults = {
      margin: {top: 24, right: 0, bottom: 0, left: 0},
      rootname: "TOP",
      format: ",d",
      title: "",
      width: 960,
      height: 680
  };

  function main(o, data) {
    var root,
        opts = $.extend(true, {}, defaults, o),
        formatNumber = d3.format(opts.format),
        rname = opts.rootname,
        margin = opts.margin,
        theight = 36 + 16;
//size
  $('#chart2').width(opts.width).height(opts.height);
  var width = opts.width - margin.left - margin.right,
      height = opts.height - margin.top - margin.bottom - theight,
      transitioning;
//color
  var color = d3.scale.category20c();

  var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);

  var treemap = d3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d._children; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

  var svg = d3.select("#chart2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");

  var grandparent = svg.append("g")
      .attr("class", "grandparent");

  grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);

  grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");

  if (opts.title) {
    $("#chart2").prepend("<div class='titlediv'><p class='title'>" + opts.title + "</p></div>");
  }
  if (data instanceof Array) {
    root = { key: rname, values: data };
  } else {
    root = data;
    }

    initialize(root);
    accumulate(root);
    layout(root);
    //console.log(root);
    display(root);

    if (window.parent !== window) {
      var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
      window.parent.postMessage({height: myheight}, '*');
    }

    function initialize(root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
      return (d._children = d.values)
          ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
          : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d._children) {
        treemap.nodes({_children: d._children});
        d._children.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          layout(c);
        });
      }
    }

    function display(d) {
      grandparent
          .datum(d.parent)
          .on("click", transition)
        .select("text")
          .text(name(d));

      var g1 = svg.insert("g", ".grandparent")
          .datum(d)
          .attr("class", "depth");

      var g = g1.selectAll("g")
          .data(d._children)
        .enter().append("g");

      g.filter(function(d) { return d._children; })
          .classed("children", true)
          .on("click", transition);

      var children = g.selectAll(".child")
          .data(function(d) { return d._children || [d]; })
        .enter().append("g");

      children.append("rect")
          .attr("class", "child")
          .call(rect)
        .append("title")
          .text(function(d) { return d.key; });
      // 改动部分
      children.append("text")
          .attr("class", "ctext")
          .text(function(d) {
                if(d.key){
                    if(d.key.length>d.dx/13){
                        return d.key.slice(0,d.dx/13);}
                    if(d.key.length>d.dx/10){
                        return d.key.slice(0,d.dx/10);}
                    return d.key;

                }
                return d.key;
            }).call(text2);
       children.append("text")
          .attr("class", "ltext")
          .text(function(d) {
                if(d.key){
                    if(d.key.length>d.dx/13){
                        return d.key.slice(d.dx/13,d.dx*2/13)+"..";}
                    if(d.key.length>d.dx/10){
                        return d.key.slice(d.dx/10,d.dx*2/10)+"..";}
                    return "";

                }
                return d.key;
            })
          .call(new_text);


      children.append("text")
          .attr("class", "ctext")
          .text(function(d) {
                if(d.comment1){
                    return d.comment1.slice(0,d.dx/8);
                }
                return "";
            })
          .call(first_text);

          children.append("text")
          .attr("class", "ltext")
          .text(function(d) {
                if(d.comment1){
                    return d.comment1.slice(d.dx/8,d.dx*2/8);
                }
                return "";
            })
          .call(second_text);





      g.append("rect")
          .attr("class", "parent")
          .call(rect);

      var t = g.append("text")
          .attr("class", "ptext")
          .attr("dy", "1.25em")

      t.append("tspan")
          .attr("class","ctspan")
          // .attr("dy","2.0em")
          .text(function(d) { return d.key});

      t.call(text);



      var multi = 400.0;
      var x_start = 82
      var dx = 30
      var color_line = "#3498db";
      var axis_color = "#1b4f72";
      var font_color = "White";
      var numberfont_family = "Courier New";
      var col_width = 20;
      var text_dx_1;
      var text_dx_2;
      var font_changed = 19
      var font_original = 17


     var titleLine = g.append("line")
                      .attr("class", "m1")
                      .attr("cursor","pointer")
                      .attr("x1", 120)
                      .attr("x2", 840)
                      .attr("y1", function(d) { return (35 - d.radius + 5)})
                      .attr("y2",  function(d) { return (35 - d.radius + 5)}).style({
                          stroke: 'white',
                          opacity: 0.5,
                          'stroke-width': function(d) { return d.radius+35}
                      }).on('mouseover', function(d){
                                var nodeSelectionOn = d3.select(this).style({opacity:'0.8'});
                      }).on('mouseout', function(d){
                               var nodeSelectionOff = d3.select(this).style({opacity:'0.5'});
                      })
                      .on("click",function(d,i) { window.open(d.urls);});

       var rightLine = g.append("line")
                .attr("class", "m1")
                .attr("x1", 480)
                .attr("x2", 950)
                .attr("y1", function(d) { return (400 - d.radius + 5)})
                .attr("y2",  function(d) { return (400 - d.radius + 5)}).style({
                    stroke: function(d){
                      var extent = 0.1;
                      if(d.sentiment != undefined){
                        if((d.sentiment / 20 ) > extent) return "#fc8d59";
                        if((d.sentiment / 20 ) < -extent) return "#91bfdb ";
                        else return "#fbeee6";
                      }
                    },
                    opacity: 1,
                    'stroke-width': function(d) { return d.radius+350}
                });


       var title = g.append("text")
                      .attr("class", "ll")
                      .attr("font-size",20)
                      .attr("font-family", "American Typewriter")
                      .attr("text-anchor", "middle")
                      .append("tspan")
                      .attr("x",480)
                      .attr("y", 40)
                      .text(function(d) { return (d.emoji)})
                      .attr("fill","red")
                      .attr("opacity", "1")
                      .append("tspan")
                      .attr("dx", "1.0em")
                      .attr("fill","black")
                      .text(function(d) { return d.title})
                      .append("tspan")
                      .attr("dx", "1.0em")
                      .attr("fill","red")
                      .text(function(d) { return d.score})
                      .attr("opacity", "1")
                      .append("tspan")
                      .attr("dx", "0.3em")
                      .text(function(d) { return d.leaf})
                      .attr("opacity", "1");


      var titleBarChart = g.append("text")
                  .attr("class", "ll")
                  .attr("font-size",20)
                  .attr("font-family", "Comic Sans MS")
                  .attr("text-anchor", "middle")
                  .append("tspan")
                  .attr("x",480)
                  .attr("y", 100)
                  .text(function(d) { return d.titleBarChart})
                  .attr("opacity", "1");
                         

      var col0 = g.append("line").attr("class", "child")
                  .attr("x1", x_start)
                  .attr("x2", x_start)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis0/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      opcaity: 0.5,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text0.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text0.style({"font-size" : font_original});
                       });

                  var text0 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .append("tspan")
                     .style("fill", font_color)
                     .attr("x",x_start-10)
                     .attr("y", function(d) { return (550 - (multi*d.dis0/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis0})
                     .attr("opacity", function(d){
                       if((d.dis0) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });

      var col1 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*1)
                  .attr("x2", x_start+dx*1)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis1/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text1.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text1.style({"font-size" : font_original});
                       });

                  var text1 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start+dx*1-10)
                     .attr("y", function(d) { return (550 - (multi*d.dis1/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis1})
                     .attr("opacity", function(d){
                       if((d.dis1) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


      var col2 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*2)
                  .attr("x2", x_start+dx*2)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis2/(d.max-0.0)))}).style({
                      stroke: color_line,
                      'stroke-width': function(d) { return d.radius + col_width}
                  });



      var col3 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*3)
                  .attr("x2", x_start+dx*3)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis3/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text3.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text3.style({"font-size" : font_original});
                       });

                  var text3 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*3 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis3/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis3})
                     .attr("opacity", function(d){
                       if((d.dis3) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });

      var col4 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*4)
                  .attr("x2", x_start+dx*4)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis4/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text4.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text4.style({"font-size" : font_original});
                       });

                  var text4 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*4 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis4/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis4})
                     .attr("opacity", function(d){
                       if((d.dis4) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });

      var col5 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*5)
                  .attr("x2", x_start+dx*5)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis5/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text5.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text5.style({"font-size" : font_original});
                       });

                  var text5 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("fill", font_color)
                     .attr("font-family",numberfont_family)
                     .attr("color", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*5 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis5/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis5})
                     .attr("opacity", function(d){
                       if((d.dis5) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });

      var col6 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*6)
                .attr("x2", x_start+dx*6)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis6/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text6.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text6.style({"font-size" : font_original});
                     });

                var text6 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*6 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis6/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis6})
                   .attr("opacity", function(d){
                     if((d.dis6) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

         var col7 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*7)
                .attr("x2", x_start+dx*7)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis7/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text7.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text7.style({"font-size" : font_original});
                     });

                var text7 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*7 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis7/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis7})
                   .attr("opacity", function(d){
                     if((d.dis7) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

        var col8 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*8)
                .attr("x2", x_start+dx*8)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis8/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text8.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text8.style({"font-size" : font_original});
                     });

                var text8 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*8 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis8/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis8})
                   .attr("opacity", function(d){
                     if((d.dis8) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

         var col9 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*9)
                .attr("x2", x_start+dx*9)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis9/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text9.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text9.style({"font-size" : font_original});
                     });

                var text9 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*9 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis9/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis9})
                   .attr("opacity", function(d){
                     if((d.dis8) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

        var col10 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*10)
                .attr("x2", x_start+dx*10)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis10/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text10.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text10.style({"font-size" : font_original});
                     });

                var text10 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*10 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis10/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis10})
                   .attr("opacity", function(d){
                     if((d.dis10) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

        var col11 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*11)
                .attr("x2", x_start+dx*11)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis11/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text11.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text11.style({"font-size" : font_original});
                     });

                var text11 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*11 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis11/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis11})
                   .attr("opacity", function(d){
                     if((d.dis11) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

      var col12 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*12)
                .attr("x2", x_start+dx*12)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis12/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text12.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text12.style({"font-size" : font_original});
                     });

                var text12 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*12 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis12/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis12})
                   .attr("opacity", function(d){
                     if((d.dis12) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });


       var col13 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*13)
                .attr("x2", x_start+dx*13)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis13/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text13.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text13.style({"font-size" : font_original});
                     });

                var text13 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*13 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis13/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis13})
                   .attr("opacity", function(d){
                     if((d.dis13) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

       var col14 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*14)
                .attr("x2", x_start+dx*14)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis14/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text14.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text14.style({"font-size" : font_original});
                     });

                var text14 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*14 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis14/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis14})
                   .attr("opacity", function(d){
                     if((d.dis14) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

       var col15 = g.append("line").attr("class", "child")
                .attr("x1", x_start+dx*15)
                .attr("x2", x_start+dx*15)
                .attr("y1", function(d) { return (550 - d.radius + 5)})
                .attr("y2", function(d) { return (550 - (multi*d.dis15/(d.max-0.0)))}).style({
                    stroke: color_line,
                    opacity: 0.8,
                    'stroke-width': function(d) { return d.radius + col_width}
                }).on('mouseover', function(d){
                               var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                               text15.style({"font-size" : font_changed});
                     }).on('mouseout', function(d){
                              var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                               text15.style({"font-size" : font_original});
                     });

                var text15 = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",font_original)
                   .attr("font-family",numberfont_family)
                   .attr("fill", font_color)
                   .append("tspan")
                   .attr("x",x_start + dx*15 - 10)
                   .attr("y", function(d) { return (550 - (multi*d.dis15/(d.max-0.0)) + 20)})
                   .text(function(d) { return d.dis15})
                   .attr("opacity", function(d){
                     if((d.dis15) == 0){
                       return "0";
                     }else{
                       return "1";
                     }
                   });

      var col16 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*16)
                  .attr("x2", x_start+dx*16)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis16/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text16.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text16.style({"font-size" : font_original});
                       });

                  var text16 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*16 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis16/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis16})
                     .attr("opacity", function(d){
                       if((d.dis16) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


        var col17 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*17)
                  .attr("x2", x_start+dx*17)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis17/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text17.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text17.style({"font-size" : font_original});
                       });

                  var text17 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*17 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis17/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis17})
                     .attr("opacity", function(d){
                       if((d.dis17) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });

       var col18 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*18)
                  .attr("x2", x_start+dx*18)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis18/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text18.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text18.style({"font-size" : font_original});
                       });

                  var text18 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*18 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis18/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis18})
                     .attr("opacity", function(d){
                       if((d.dis18) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


      var col19 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*19)
                  .attr("x2", x_start+dx*19)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis19/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text19.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text19.style({"font-size" : font_original});
                       });

                  var text19 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*19 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis19/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis19})
                     .attr("opacity", function(d){
                       if((d.dis19) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


      var col20 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*20)
                  .attr("x2", x_start+dx*20)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis20/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text20.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text20.style({"font-size" : font_original});
                       });

                  var text20 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*20 - 10)
                     .attr("y", function(d) { return (550 - (multi*d.dis20/(d.max-0.0)) + 20)})
                     .text(function(d) { return d.dis20})
                     .attr("opacity", function(d){
                       if((d.dis20) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


        var col21 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*21)
                  .attr("x2", x_start+dx*21)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis21/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text21.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text21.style({"font-size" : font_original});
                       });

                  var text21 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*21-10)
                     .attr("y", function(d) { return (550 - (multi*d.dis21/(d.max-0.0))+20)})
                     .text(function(d) { return d.dis21})
                     .attr("opacity", function(d){
                       if((d.dis21) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


         var col22 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*22)
                  .attr("x2", x_start+dx*22)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis22/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text22.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text22.style({"font-size" : font_original});
                       });

                  var text22 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*22-10)
                     .attr("y", function(d) { return (550 - (multi*d.dis22/(d.max-0.0))+20)})
                     .text(function(d) { return d.dis22})
                     .attr("opacity", function(d){
                       if((d.dis22) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


       var col23 = g.append("line").attr("class", "child")
                  .attr("x1", x_start+dx*23)
                  .attr("x2", x_start+dx*23)
                  .attr("y1", function(d) { return (550 - d.radius + 5)})
                  .attr("y2", function(d) { return (550 - (multi*d.dis23/(d.max-0.0)))}).style({
                      stroke: color_line,
                      opacity: 0.8,
                      'stroke-width': function(d) { return d.radius + col_width}
                  }).on('mouseover', function(d){
                                 var nodeSelectionOn = d3.select(this).style({opacity:'1'});
                                 text23.style({"font-size" : font_changed});
                       }).on('mouseout', function(d){
                                var nodeSelectionOff = d3.select(this).style({opacity:'0.8'});
                                 text23.style({"font-size" : font_original});
                       });

                  var text23 = g.append("text")
                     .attr("class", "ll")
                     .attr("font-size",font_original)
                     .attr("font-family",numberfont_family)
                     .attr("fill", font_color)
                     .append("tspan")
                     .attr("x",x_start + dx*23-10)
                     .attr("y", function(d) { return (550 - (multi*d.dis23/(d.max-0.0))+20)})
                     .text(function(d) { return d.dis23})
                     .attr("opacity", function(d){
                       if((d.dis23) == 0){
                         return "0";
                       }else{
                         return "1";
                       }
                     });


      var xAxis = g.append("line").attr("class", "child")
                    .attr("x1", 70)
                    .attr("x2", 930)
                    .attr("y1", function(d) { return (550 - d.radius + 5)})
                    .attr("y2", function(d) { return (550 - d.radius + 5)}).style({
                      stroke: axis_color,
                      'stroke-width': function(d) { return d.radius}});
      var yAxis = g.append("line").attr("class", "child")
                    .attr("x1", 70)
                    .attr("x2", 70)
                    .attr("y1", function(d) { return (550 - d.radius + 5)})
                    .attr("y2", function(d) { return (550 - d.radius + 5 - multi)}).style({
                      stroke: axis_color,
                      'stroke-width': function(d) { return d.radius}});

      // add x and y ticks

      var gap = "2.1em"

      var xTicks = g.append("text")
                   .attr("class", "ll")
                   .attr("font-size",10)
                   .attr("font-family", numberfont_family)
                   .attr("text-anchor", "middle")
                   .append("tspan")
                   .attr("x", 410)
                   .attr("y", 565)
                   .attr("opacity", function(d){
                      if(isNaN(d.radius)){
                        return "0"
                      }else{
                        return "1"
                      }
                    })
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return (d.radius-5)})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius-4})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius - 3})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius - 2})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius - 1})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius - 0})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 1})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 2})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 3})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 4})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 5})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 6})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 7})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 8})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 9})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 10})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 11})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 12})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 13})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 14})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 15})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx",gap)
                   .text(function(d) { return d.radius + 16})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 17})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.radius + 18})
                   .attr("opacity", "1")
                   .append("tspan")
                   .attr("dx", gap)
                   .text(function(d) { return d.times})
                   .attr("opacity", "1")


      


          children.selectAll("rect")
              .style("fill", function(d) {
                var extent = 0.1;
                 var fill = (d.key+"").slice(0,1);

                if(d.sentiment != undefined){
                    if((d.sentiment / 20 ) > extent) return "#fc8d59";
                    if((d.sentiment / 20 ) < -extent) return "#91bfdb ";
                    else return "#fbeee6";
                }else{
                    if((fill) == "\u263A") return "#fc8d59";  
                    else if((fill) == "\u2639") return "#91bfdb";  
                    else return "#fbeee6";
                }
          });

      // g.selectAll("rect")
      //     .style("fill", function(d) { return color(d.key); });

      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;

        var g2 = display(d),
            t1 = g1.transition().duration(750),
            t2 = g2.transition().duration(750);

        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null);

        // Draw child nodes on top of parent nodes.
        svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

        // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0);

        // Transition to the new view.
        t1.selectAll(".ltext").call(new_text).style("fill-opacity", 0);
        t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
        t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
        t1.selectAll(".ll").call(text).style("fill-opacity", 0);
        t1.selectAll(".l1").style("fill-opacity", 0);

        t2.selectAll(".ltext").call(new_text).style("fill-opacity", 1);
        t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
        t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
        t2.selectAll(".ll").call(text2).style("fill-opacity", 1); 
        t2.selectAll(".l1").style("fill-opacity", 1);
        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);

        // Remove the old node when the transition is finished.
        t1.remove().each("end", function() {
          svg.style("shape-rendering", "crispEdges");
          transitioning = false;
        });
      }

      return g;
    }

    function text(text) {
      text.selectAll("tspan")
          .attr("x", function(d) { return x(d.x) + 6; })
      text.attr("x", function(d) { return x(d.x) + 6; })
          .attr("y", function(d) { return y(d.y) + 6; })
          .attr("color","#2980b9")
          .attr("font-weight", 50)
        //  .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })

    }

    function text2(text) {
      text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 20; })
          .attr("y", function(d) { return y(d.y + d.dy) - 62; })
         // .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })
      }

    function text3(text) {
      text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 150; })
          .attr("y", function(d) { return y(d.y + d.dy) - 40; })
        //  .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })

    }

     function new_text(text) {
      text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 20; })
          .attr("y", function(d) { return y(d.y + d.dy) - 40; })
         // .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })
      }

        function first_text(text) {
      text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 20; })
          .attr("y", function(d) { return y(d.y + d.dy) - 120; })
        //  .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })
      }
       function second_text(text) {
      text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 20; })
          .attr("y", function(d) { return y(d.y + d.dy) - 80; })
        //  .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })
      }


       function third_text(text) {
      text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 20; })
          .attr("y", function(d) { return y(d.y + d.dy) - 40; })
        //  .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })
      }

    function rect(rect) {
      rect.attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
          .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
          .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    }

    function name(d) {
      return d.parent
          ? name(d.parent) + " / " + d.key
          : d.key;
    }
  }
var space = "\n"
  this.start = function(data){
          var newData = d3.nest().key(function(d) { return d.subReddit; }).key(function(d) { return d.emoji+"\n"+ d.titleKeyword; }).entries(data);
           main({title: "The Reddit Monitor of Hot Threads"}, {key: "Reddit", values: newData});
  }



}
