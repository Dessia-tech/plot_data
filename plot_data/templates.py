from string import Template

contour_template = Template('''<div id="app"></div>
<canvas id="$canvas_id" width="2000" height="490"
            style="border: 1px solid black;">
</canvas>

<script>var exports = {};</script>
<!-- Sets the basepath for the library if not in same directory -->
<script type="text/javascript" src=$core_path ></script>

<script type="text/javascript">
	var width = 0.95*window.innerWidth; 
	var height = Math.max(0.95*window.innerHeight, 350);
	var coeff_pixel = 1000;

  	var data = $data;
	var number_plot_data = data.length;

	var plot_data = new PlotContour(data, width, height, 1000, true, 0, 0, $canvas_id.id);
	plot_data.define_canvas($canvas_id.id);
	plot_data.draw_initial();
    plot_data.mouse_interaction(plot_data.isParallelPlot);
</script>
''')


scatter_template = Template('''<div id="app"></div>
<canvas id="$canvas_id" width="490" height="490"
            style="border: 1px solid black;">
</canvas>


<script>var exports = {};</script>
<!-- Sets the basepath for the library if not in same directory -->
<script type="text/javascript" src=$core_path ></script>

<script type="text/javascript">
	var width = 0.95*window.innerWidth; 
	var height = Math.max(0.95*window.innerHeight, 350);
	var coeff_pixel = 1000;

  	var data = $data;
	var number_plot_data = data.length

	var plot_data = new PlotScatter(data, width, height, 1000, true, 0, 0, $canvas_id.id);
	plot_data.define_canvas($canvas_id.id);
	plot_data.draw_initial();
	plot_data.mouse_interaction(plot_data.isParallelPlot); //true if parallel plot, false otherwise
</script>
''')



parallelplot_template = Template('''<div id="app"></div>
<canvas id="$canvas_id" width="490" height="490"
            style="border: 1px solid black;">
</canvas>


<script>var exports = {};</script>
<!-- Sets the basepath for the library if not in same directory -->
<script type="text/javascript" src=$core_path ></script>

<script type="text/javascript">
	var width = 0.95*window.innerWidth; 
	var height = Math.max(0.95*window.innerHeight, 350);
	var coeff_pixel = 1000;

	  var data = $data;
	var number_plot_data = data.length

	var plot_data = new ParallelPlot(data, width, height, 1000, true, 0, 0, $canvas_id.id);
	plot_data.define_canvas($canvas_id.id);
	plot_data.draw_initial();
	plot_data.mouse_interaction(plot_data.isParallelPlot); //true if parallel plot, false otherwise
</script>
''')




multiplot_template = Template('''<div id="app"></div>
<canvas id="$canvas_id" width="490" height="490"
            style="border: 1px solid black;">
</canvas>


<script>var exports = {};</script>
<!-- Sets the basepath for the library if not in same directory -->
<script type="text/javascript" src=$core_path ></script>

<script type="text/javascript">
	var width = 0.95*window.innerWidth; 
	var height = Math.max(0.95*window.innerHeight, 350);
	var coeff_pixel = 1000;

    var data = $data;
	var number_plot_data = data.length;

	var multiplot = new MultiplePlots(data, width, height, 1000, true, $canvas_id.id);
</script> 
''')


primitive_group_container_template = Template('''<div id="app"></div>
<canvas id="$canvas_id" width="490" height="490"
            style="border: 1px solid black;">
</canvas>


<script>var exports = {};</script>
<!-- Sets the basepath for the library if not in same directory -->
<script type="text/javascript" src=$core_path ></script>

<script type="text/javascript">
	var width = 750,
			height = 400;
	var show_state = 1
	var coeff_pixel = 1000

  	var data = $data;
	var number_plot_data = data.length

	globalWidth = 1500;
	globalHeight = 800;
	var primitive_group_container = new PrimitiveGroupContainer(data, globalWidth, globalHeight, 1000, true, 0, 0, $canvas_id.id);
	primitive_group_container.define_canvas($canvas_id.id);
	primitive_group_container.draw_initial();
	primitive_group_container.mouse_interaction(primitive_group_container.isParallelPlot);
	primitive_group_container.regular_layout();
</script> 
''')



