""" Templates of html files built from PlotDataObject. """

from string import Template

empty_template = Template('''''')

html_template = Template('''
<!DOCTYPE html>
<html lang="en">
  <head>
      <script src=$core_path></script>
  </head>
    <div id="buttons">
        <button name="button" value="OK" type="button" onclick="drawSelectionWindow()"> Draw selection window </button>
        <hr style="border-top: 2px;">
    </div>
    <div id="app">
        <canvas id="$canvas_id" width="$width" height="$height" style="border: 1px solid black;"></canvas>

        <script type="text/javascript">
            var buttonsContainer = document.querySelector("#buttons");
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350) - buttonsContainer.scrollHeight;

            var data = $data;
            $plot_commands

            function drawSelectionWindow() { plot_data.drawSelectionWindow() }
        </script>
    </div>
</html>
''')

scatter_commands = """
            var plot_data = new PlotData.newScatter(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

contour_commands = """
            var plot_data = new PlotData.PlotContour(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

graph_commands = """
            var plot_data = new PlotData.PlotScatter(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

parallelplot_commands = """
            var plot_data = new PlotData.ParallelPlot(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

histogram_commands = """
            var plot_data = new PlotData.Histogram(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction();"""

multiplot_commands = """
            var multiplot = new PlotData.MultiplePlots(data, width, height, true, $canvas_id.id);"""

primitive_group_container_commands = """
            var globalWidth = 1500;
            var globalHeight = 800;
            var primitive_group_container = new PlotData.PrimitiveGroupContainer(data, globalWidth, globalHeight,
                                                                                 true, 0, 0, $canvas_id.id);
            primitive_group_container.define_canvas($canvas_id.id);
            primitive_group_container.draw_initial();
            primitive_group_container.mouse_interaction(primitive_group_container.isParallelPlot);
            primitive_group_container.regular_layout();"""

def get_html_string(command_name: str):
    return Template(html_template.safe_substitute(plot_commands=globals()[command_name]))
