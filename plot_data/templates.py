from string import Template

contour_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src=$core_path></script>
  </head>
    <div id="app">
        <canvas id="$canvas_id" width="2000" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <!-- Sets the basepath for the library if not in same directory -->

        <script>
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350);

            var data = $data;
            var number_plot_data = data.length;

            var plot_data = new PlotData.PlotContour(
                data, width, height, true, 0, 0, $canvas_id.id
            );
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);
        </script>
    </div>
</html>
''')


scatter_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
    <div id="app">
        <canvas id="$canvas_id" width="490" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <script type="text/javascript">
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350);

            var data = $data;
            var number_plot_data = data.length

            var plot_data = new PlotData.PlotScatter(
                data, width, height, true, 0, 0, $canvas_id.id
            );
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);
        </script>
    </div>
</html>
''')


parallelplot_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
  <body>
    <div id="app">
        <canvas id="$canvas_id" width="490" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <!-- Sets the basepath for the library if not in same directory -->
        <script src=$core_path ></script>

        <script type="text/javascript">
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350);

            var data = $data;
            var number_plot_data = data.length

            var plot_data = new PlotData.ParallelPlot(
                data, width, height, true, 0, 0, $canvas_id.id
            );
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);
        </script>
    </div>
  </body>
</html>
''')


histogram_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
  <body>
    <div id="app">
        <canvas id="$canvas_id" width="490" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <script type="text/javascript">
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350);

            var data = $data;
            var plot_data = new PlotData.Histogram(
                data, width, height, true, 0, 0, $canvas_id.id
            );
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction();
        </script>
    </div>
  </body>
</html>
''')


multiplot_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
  <body>
    <div id="app">
        <canvas id="$canvas_id" width="490" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <script type="text/javascript">
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350);

            var data = $data;
            var number_plot_data = data.length;

            var multiplot = new PlotData.MultiplePlots(
                data, width, height, true, $canvas_id.id
            );
        </script>
    </div>
  </body>
</html>
''')


primitive_group_container_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
  <body>
    <div id="app">
        <canvas id="$canvas_id" width="490" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <script type="text/javascript">
            var width = 750;
            var height = 400;

            var data = $data;
            var number_plot_data = data.length;

            var globalWidth = 1500;
            var globalHeight = 800;
            var primitive_group_container = new PlotData.PrimitiveGroupContainer(
                data, globalWidth, globalHeight, true, 0, 0, $canvas_id.id
            );
            primitive_group_container.define_canvas($canvas_id.id);
            primitive_group_container.draw_initial();
            primitive_group_container.mouse_interaction(
                primitive_group_container.isParallelPlot
            );
            primitive_group_container.regular_layout();
        </script>
    </div>
  </body>
</html>
''')

scatter_matrix_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
  <body>
    <div id="app">
        <canvas id="$canvas_id" width="490" height="490"
                    style="border: 1px solid black;">
        </canvas>

        <!-- Sets the basepath for the library if not in same directory -->
        <script src=$core_path></script>

        <script type="text/javascript">
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350);

            var data = $data;
            var number_plot_data = data.length

            var plot_data = new PlotData.ScatterMatrix(
                data, width, height, true, 0, 0, $canvas_id.id
            );
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);
        </script>
    </div>
  </body>
</html>
''')
