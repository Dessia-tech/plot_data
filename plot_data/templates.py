""" Templates of html files built from PlotDataObject. """

from string import Template

EMPTY_TEMPLATE = Template('''''')

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

SCATTER_COMMANDS = """
            var plot_data = new PlotData.newScatter(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

CONTOUR_COMMANDS = """
            var plot_data = new PlotData.PlotContour(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

GRAPH_COMMANDS = """
            var plot_data = new PlotData.PlotScatter(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

PARALLELPLOT_COMMANDS = """
            var plot_data = new PlotData.ParallelPlot(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

HISTOGRAM_COMMANDS = """
            var plot_data = new PlotData.Histogram(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction();"""

MULTIPLOT_COMMANDS = """
            var plot_data = new PlotData.MultiplePlots(data, width, height, true, $canvas_id.id);"""

PRIMITIVE_GROUP_CONTAINER_COMMANDS = """
            var primitive_group_container = new PlotData.PrimitiveGroupContainer(data, width, height,
                                                                                 true, 0, 0, $canvas_id.id);
            primitive_group_container.define_canvas($canvas_id.id);
            primitive_group_container.draw_initial();
            primitive_group_container.mouse_interaction(primitive_group_container.isParallelPlot);
            primitive_group_container.regular_layout();"""


def get_html_string(command_name: str):
    return Template(html_template.safe_substitute(plot_commands=globals()[command_name]))
