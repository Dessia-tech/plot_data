""" Templates of html files built from PlotDataObject. """

from string import Template

EMPTY_TEMPLATE = Template('''''')

html_template = Template('''
<!DOCTYPE html>
<html lang="en">
    <style>
    .slider {
      -webkit-appearance: none;
      height: 10px;
      background: #d3d3d3;
      outline: none;
      opacity: 0.7;
      -webkit-transition: .2s;
      transition: opacity .2s;
    }

    .slider:hover {
      opacity: 1;
    }

    .slider::-moz-range-thumb {
      width: 25px;
      height: 10px;
      background: #04AA6D;
      cursor: pointer;
    }
    </style>
    <head>
        <script src=$core_path></script>
    </head>
    <div id="buttons">
        <button name="mergeON" value="OK" type="button" onclick="plot_data.switchMerge()"> Switch Point Merge </button> &nbsp;&nbsp;
        <button name="Zoom" value="OK" type="button" onclick="plot_data.switchZoom()"> Zoom Box </button>
        <button name="Zoom+" value="OK" type="button" onclick="plot_data.zoomIn()"> Zoom+ </button>
        <button name="Zoom-" value="OK" type="button" onclick="plot_data.zoomOut()"> Zoom- </button> &nbsp;&nbsp;
        Cluster:&nbsp; <input type="range" class="slider" min="0" max="2500" value="1250" onclick="plot_data.simpleCluster(value / 10000)"></input>
        <button name="resetClusters" value="OK" type="button" onclick="plot_data.resetClusters()"> Reset clusters </button> &nbsp;&nbsp;
        <button name="resetView" value="OK" type="button" onclick="plot_data.resetView()"> Reset view </button> &nbsp;&nbsp;
        <button name="showPoints" value="OK" type="button" onclick="plot_data.togglePoints()"> Show points </button>
        <button name="switchOrientation" value="OK" type="button" onclick="plot_data.switchOrientation()"> Change Disposition </button>
    <hr style="border-top: 2px;">
    </div>
    <div id="app">
        <canvas id="$canvas_id" style="border: 1px solid black;"></canvas>

        <script type="text/javascript">
            var buttonsContainer = document.querySelector("#buttons");
            var width = 0.95*window.innerWidth;
            var height = Math.max(0.95*window.innerHeight, 350) - buttonsContainer.scrollHeight;

            var data = $data;
            $plot_commands
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
            var plot_data = new PlotData.newGraph2D(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

PARALLELPLOT_COMMANDS = """
            var plot_data = new PlotData.newParallelPlot(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

HISTOGRAM_COMMANDS = """
            var plot_data = new PlotData.Histogram(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.define_canvas($canvas_id.id);
            plot_data.draw_initial();
            plot_data.mouse_interaction(plot_data.isParallelPlot);"""

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
