angular.module('D3Service',[])

.service('d3Service',function(){
	
	//formats for the 3 graphs.
	var formatAsPercentage = d3.format("%"),
		formatAsPercentage1Dec = d3.format(".1%"),
		formatAsInteger = d3.format(",");
	
	//function to draw the pie chart. Passing data as parmeters
	function dsPieChart(data){

		var dataset = data;
		var total = d3.sum(dataset, function(d) {return d.measure; });
			
		//parameters for the pie chart
		var    width = 300,
			   height = 300,
			   outerRadius = Math.min(width, height) / 2,
			   innerRadius = outerRadius * .999,   
			   innerRadiusFinal = outerRadius * .5,
			   innerRadiusFinal3 = outerRadius* .45,
			   color = d3.scale.category20()    ;
			    
		var vis = d3.select("#pieChart")
			 .append("svg:svg")              //create the SVG element inside the <body>
			 .append("g")					
			 .attr("transform", "scale(1)")
			 .data([dataset])                
				 .attr("width", width)
				 .attr("position", "inherit")
				 //set the width and height of our visualization 
				 .attr("height", height)
					.append("svg:g")                
				 .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")") ; 					;
						
		var arc = d3.svg.arc()          
				.outerRadius(outerRadius).innerRadius(innerRadius);
	   
		// for animation
		var arcFinal = d3.svg.arc().innerRadius(innerRadiusFinal).outerRadius(outerRadius);
		var arcFinal3 = d3.svg.arc().innerRadius(innerRadiusFinal3).outerRadius(outerRadius);

		var pie = d3.layout.pie()           //this will create arc data for us given a list of values
		.value(function(d) { return d.measure; });    //we must tell it out to access the value of each element in our data array

		var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
			.data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
			.enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
				.append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
				   .attr("class", "slice")    //allow us to style things in the slices (like text)
				   .on("mouseover", mouseover)
						.on("mouseout", mouseout)
						.on("click", up)
						;
		    				
		arcs.append("svg:path")
			   .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
			   .attr("d", arc)     //this creates the actual SVG path using the associated data (pie) with the arc drawing function
					.append("svg:title") //mouseover title showing the figures
					.text(function(d) { return d.data.category + " : " 
						+ formatAsPercentage((d.data.measure / total)) });						

		d3.selectAll("g.slice").selectAll("path").transition()
				.duration(750)
				.delay(10)
				.attr("d", arcFinal );
			
		arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
				.append("svg:text")
			  .attr("dy", ".35em")
			  .attr("text-anchor", "middle")
			  .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d) + ")rotate(" + angle(d) + ")"; })
			  .text(function(d) { return d.data.category /*+ " : " + d.data.measure */; });
		   
	   function angle(d) {
				var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
				return a > 90 ? a - 180 : a;
		}
				
			
		// Pie chart title			
		vis.append("svg:text")
			.attr("dy", ".35em")
		  .attr("text-anchor", "middle")
		  .text("Mobiles Sold")
		  .attr("class","title");		    


				
		function mouseover() {
		  d3.select(this).select("path").transition()
			  .duration(750)
						.attr("d", arcFinal3);
		}
		
		function mouseout() {
		  d3.select(this).select("path").transition()
			  .duration(750)
						.attr("d", arcFinal);
		}
		
		function up(d, i) {
		
					/* update bar chart when salesMan selects piece of the pie chart */
					//updateBarChart(dataset[i].category);
					updateBarChart(d.data.category, color(i));
					updateLineChart(d.data.category, color(i));
					 
			}
	}
		
	
	//function to update the bar chart
	function updateBarChart(group, colorChosen) {
			
		var currentDatasetBarChart = datasetBarChosen(group);
		
		var basics = dsBarChartBasics();
	
		var margin = basics.margin,
			width = basics.width,
		   height = basics.height,
			colorBar = basics.colorBar,
			barPadding = basics.barPadding	;
		
		var 	xScale = d3.scale.linear()
			.domain([0, currentDatasetBarChart.length])
			.range([0, width]);
		
			
		var yScale = d3.scale.linear()
		  .domain([0, d3.max(currentDatasetBarChart, function(d) { return d.measure; })])
		  .range([height,0]);
		  
		var svg = d3.select("#barChart svg");
		  
		var plot = d3.select("#barChartPlot")
		.datum(currentDatasetBarChart);
	
			/* Note that here we only have to select the elements - no more appending! */
		plot.selectAll("rect")
		  .data(currentDatasetBarChart)
		  .transition()
			.duration(750)
			.attr("x", function(d, i) {
				return xScale(i);
			})
		   .attr("width", width / currentDatasetBarChart.length - barPadding)   
			.attr("y", function(d) {
				return yScale(d.measure);
			})  
			.attr("height", function(d) {
				return height-yScale(d.measure);
			})
			.attr("fill", colorChosen);
		
		plot.selectAll("text.yAxis") // target the text element(s) which has a yAxis class defined
			.data(currentDatasetBarChart)
			.transition()
			.duration(750)
		   .attr("text-anchor", "middle")
		   .attr("x", function(d, i) {
				return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
		   })
		   .attr("y", function(d) {
				return yScale(d.measure) + 14;
		   })
		   .text(function(d) {
				return formatAsInteger(d3.round(d.measure));
		   })
		   .attr("class", "yAxis");
				
	}
		
		 
	/* updates Line chart on request */
	function updateLineChart(group, colorChosen) {

		var currentDatasetLineChart = datasetLineChartChosen(group);   
		//console.log(currentDatasetLineChart);
		var totalData = 0;

		for (var i = currentDatasetLineChart.length - 1; i >= 0; i--) {
			totalData = totalData + currentDatasetLineChart[i].measure;
		};

		var basics = dsLineChartBasics();
		
		var margin = basics.margin,
			width = basics.width,
		   height = basics.height;

		var xScale = d3.scale.linear()
			.domain([0, currentDatasetLineChart.length-1])
			.range([0, width]);

		var yScale = d3.scale.linear()
			.domain([0, d3.max(currentDatasetLineChart, function(d) { return d.measure; })])
			.range([height, 0]);
		
		var line = d3.svg.line()
		.x(function(d, i) { return xScale(i); })
		.y(function(d) { return yScale(d.measure); });

	   var plot = d3.select("#lineChartPlot")
		.datum(currentDatasetLineChart);
		   
		/* descriptive titles as part of plot -- start */
		var dsLength=currentDatasetLineChart.length;
		
		plot.select("text")
			.text(totalData);
		/* descriptive titles -- end */
		   
		plot
		.select("path")
			.transition()
			.duration(750)			    
		   .attr("class", "line")
		   .attr("d", line)	
		   // add color
			.attr("stroke", colorChosen);
		   
		var path = plot
			.selectAll(".dot")
		   .data(currentDatasetLineChart)
		   .transition()
			.duration(750)
		   .attr("class", "dot")
		   .attr("fill", function (d) { return d.measure==d3.min(currentDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(currentDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
		   .attr("cx", line.x())
		   .attr("cy", line.y())
		   .attr("r", 3.5)
		   // add color
			.attr("stroke", colorChosen);
		   
		   path
		   .selectAll("title")
		   .text(function(d) { return d.category + ": " + formatAsInteger(d.measure); })	 ;  

	}	

	/*
		############# Service to plot the D3 charts ###################
		-------------------------------------------
	*/
	
	this.drawD3Chart = function(data) {	
		
		//Remove the plotted chart from the webpage to generate new chart on refresh.
	    jQuery("#pieChart").empty();
	    jQuery("#barChart").empty();
	    jQuery("#lineChart").empty();

		
		//Formaing data for PieChart
		var datasetPieChart = [];
		angular.forEach(data, function(value, key){
			var totalSales = 0;
			
			angular.forEach(value.saleByBrand, function(value, key){
				totalSales = totalSales + value.quantity;
			});

			datasetPieChart.push( {category: value.name, measure: totalSales} );
		});

		//Formating data for BarChart and LineChart
		var datasetBarLineChart = [];
		var brandNames = [];
		
		//creating groups from the data
		angular.forEach(data, function(value, key){
			var groupName = value.name;
			
			angular.forEach(value.saleByBrand, function(value, key){
				datasetBarLineChart.push( { group: groupName, category: value.brand, measure: value.quantity } );
				brandNames.push(value.brand);
			});

		});
		
		brandNames = d3.set(brandNames).values();

		var datasetBarLineChartForAll = [];
		
		for (var i = 0; i < brandNames.length; i++) {
			var measureVal = 0;
			for (var j =  0; j < datasetBarLineChart.length; j++) {
				
				if (brandNames[i] === datasetBarLineChart[j].category) {
					measureVal = measureVal + datasetBarLineChart[j].measure;
					measureVal = measureVal*(Math.random());
				};
			};

			var overallSale = { group: "All", category: brandNames[i], measure : measureVal };
			datasetBarLineChartForAll.push(overallSale);
		};
		
		datasetBarLineChart = datasetBarLineChart.concat(datasetBarLineChartForAll);

		
		//call to the method to draw pie chart.
		dsPieChart(datasetPieChart);

		
		var datasetBarChart = datasetBarLineChart;

		// set initial group value
		var group = "All";

		function datasetBarChosen(group) {
			var ds = [];
			for (x in datasetBarChart) {
				 if(datasetBarChart[x].group==group){
				 	ds.push(datasetBarChart[x]);
				 } 
				}
			return ds;
		}


		function dsBarChartBasics() {

			var margin = {top: 30, right: 5, bottom: 20, left: 50},
			width = 500 - margin.left - margin.right,
		   height = 250 - margin.top - margin.bottom,
			colorBar = d3.scale.category20(),
			barPadding = 1;
			
			return {
				margin : margin, 
				width : width, 
				height : height, 
				colorBar : colorBar, 
				barPadding : barPadding
			}			
			;
		}

		function dsBarChart() {

			var firstDatasetBarChart = datasetBarChosen(group);         	
			
			var basics = dsBarChartBasics();
			
			var margin = basics.margin,
				width = basics.width,
			   height = basics.height,
				colorBar = basics.colorBar,
				barPadding = basics.barPadding;
							
			var 	xScale = d3.scale.linear()
								.domain([0, firstDatasetBarChart.length])
								.range([0, width]);
								
			// Create linear y scale 
			// Purpose: No matter what the data is, the bar should fit into the svg area; bars should not
			// get higher than the svg height. Hence incoming data needs to be scaled to fit into the svg area.  
			var yScale = d3.scale.linear()
					// use the max funtion to derive end point of the domain (max value of the dataset)
					// do not use the min value of the dataset as min of the domain as otherwise you will not see the first bar
				   .domain([0, d3.max(firstDatasetBarChart, function(d) { return d.measure; })])
				   // As coordinates are always defined from the top left corner, the y position of the bar
				   // is the svg height minus the data value. So you basically draw the bar starting from the top. 
				   // To have the y position calculated by the range function
				   .range([height, 0])		   ;
			
			//Create SVG element
			
			var svg = d3.select("#barChart")
					.append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				    .attr("id","barChartPlot");
			var groupBarChart = svg.append("g")
					.attr("transform", "scale(1)");

			var plot = groupBarChart
				    .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
			            
			plot.selectAll("rect")
				   .data(firstDatasetBarChart)
				   .enter()
				   .append("rect")
					.attr("x", function(d, i) {
					    return xScale(i);
					})
				   .attr("width", width / firstDatasetBarChart.length - barPadding)   
					.attr("y", function(d) {
					    return yScale(d.measure);
					})  
					.attr("height", function(d) {
					    return height-yScale(d.measure);
					})
					.attr("fill", "lightgrey");
			
				
			// Add y labels to plot	
			
			plot.selectAll("text")
			.data(firstDatasetBarChart)
			.enter()
			.append("text")
			.text(function(d) {
					return formatAsInteger(d3.round(d.measure));
			})
			.attr("text-anchor", "middle")
			// Set x position to the left edge of each bar plus half the bar width
			.attr("x", function(d, i) {
					return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
			})
			.attr("y", function(d) {
					return yScale(d.measure) + 14;
			})
			.attr("class", "yAxis");
			
			// Add x labels to chart	
			
			var xLabels = groupBarChart
				    .append("g")
				    .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");
			
			xLabels.selectAll("text.xAxis")
				  .data(firstDatasetBarChart)
				  .enter()
				  .append("text")
				  .text(function(d) { return d.category;})
				  .attr("text-anchor", "middle")
					// Set x position to the left edge of each bar plus half the bar width
								   .attr("x", function(d, i) {
								   		return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
								   })
				  .attr("y", 15)
				  .attr("class", "xAxis")  ;			
			 
			// Title
			
			groupBarChart.append("text")
				.attr("x", (width + margin.left + margin.right)/2)
				.attr("y", 15)
				.attr("class","title")				
				.attr("text-anchor", "middle")
				.text("Overall Mobiles Sold 2018");
		}
		
		//call method to draw bar chart.
		dsBarChart();


		/*
		############# PLOT LINE CHART ##################
		-------------------------------------------
		*/

		var datasetLineChart = datasetBarLineChart;

		// set initial category value
		var group = "All";

		function datasetLineChartChosen(group) {
			var ds = [];
			for (x in datasetLineChart) {
				 if(datasetLineChart[x].group==group){
				 	ds.push(datasetLineChart[x]);
				 } 
				}
			return ds;
		}

		function dsLineChartBasics() {

			var margin = {top: 20, right: 10, bottom: 0, left: 50},
			    width = 500 - margin.left - margin.right,
			    height = 150 - margin.top - margin.bottom
			    ;
				
				return {
					margin : margin, 
					width : width, 
					height : height
				}			;
		}


		function dsLineChart() {

			var firstDatasetLineChart = datasetLineChartChosen(group);    

			var totalData = 0;

			for (var i = firstDatasetLineChart.length - 1; i >= 0; i--) {
				totalData = totalData + firstDatasetLineChart[i].measure;
			};
			
			var basics = dsLineChartBasics();
			
			var margin = basics.margin,
				width = basics.width,
			   height = basics.height;

			var xScale = d3.scale.linear()
			    .domain([0, firstDatasetLineChart.length-1])
			    .range([0, width]);

			var yScale = d3.scale.linear()
			    .domain([0, d3.max(firstDatasetLineChart, function(d) { return d.measure; })])
			    .range([height, 0]);
			
			var line = d3.svg.line()
			    //.x(function(d) { return xScale(d.category); })
			    .x(function(d, i) { return xScale(i); })
			    .y(function(d) { return yScale(d.measure); });
			
			var svg = d3.select("#lineChart").append("svg")
				.append("g")					//add g to use Scale on window resize
			    .attr("transform", "scale(1)")
			    .datum(firstDatasetLineChart)
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			    // create group and move it so that margins are respected (space for axis and title)
			    
			var plot = svg
			    .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			    .attr("id", "lineChartPlot");

				/* descriptive titles as part of plot -- start */
			var dsLength=firstDatasetLineChart.length;

			
			plot.append("text")
				.text(totalData.toFixed(2))
				//.text("10000")
				.attr("x",width/2)
				.attr("y",height/2)	;
			
			plot.append("path")
			    .attr("class", "line")
			    .attr("d", line)	
			    // add color
				.attr("stroke", "lightgrey");
			  
			plot.selectAll(".dot")
			    .data(firstDatasetLineChart)
			  	 .enter().append("circle")
			    .attr("class", "dot")
			    //.attr("stroke", function (d) { return d.measure==datasetMeasureMin ? "red" : (d.measure==datasetMeasureMax ? "green" : "steelblue") } )
			    .attr("fill", function (d) { return d.measure==d3.min(firstDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(firstDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
			    //.attr("stroke-width", function (d) { return d.measure==datasetMeasureMin || d.measure==datasetMeasureMax ? "3px" : "1.5px"} )
			    .attr("cx", line.x())
			    .attr("cy", line.y())
			    .attr("r", 3.5)
			    .attr("stroke", "lightgrey")
			    .append("title")
			    .text(function(d) { return d.category + ": " + formatAsInteger(d.measure); });

			
			svg.append("text")
				.attr("x", (width + margin.left + margin.right)/2)
				.attr("y", 15)
				.attr("class","title")				
				.attr("text-anchor", "middle")
				.text("Mobiles Sold in - 2018");	

		}

		//function to draw and update line chart	
		dsLineChart();

	};

});