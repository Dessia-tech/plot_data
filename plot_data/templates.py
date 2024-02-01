""" Templates of html files built from PlotDataObject. """

from string import Template

EMPTY_TEMPLATE = Template('''''')

HTML_TEMPLATE = Template('''
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
        <button name="mergeON" value="OK" type="button"
        onclick="plot_data.switchMerge()"> Switch Point Merge </button> &nbsp;&nbsp;
        <button name="Zoom" value="OK" type="button"
        onclick="plot_data.switchZoom()"> Zoom Box </button>
        <button name="Zoom+" value="OK" type="button" onclick="plot_data.zoomIn()"> Zoom+ </button>
        <button name="Zoom-" value="OK" type="button" onclick="plot_data.zoomOut()"> Zoom- </button> &nbsp;&nbsp;
        Cluster:&nbsp; <input type="range" class="slider" min="0" max="2500" value="1250"
        onclick="plot_data.simpleCluster(value / 10000)"></input>
        <button name="resetClusters" value="OK" type="button"
        onclick="plot_data.resetClusters()"> Reset clusters </button> &nbsp;&nbsp;
        <button name="resetView" value="OK" type="button"
        onclick="plot_data.resetView()"> Reset view </button> &nbsp;&nbsp;
        <button name="showPoints" value="OK" type="button"
        onclick="plot_data.togglePoints()"> Show points </button>
        <button name="switchOrientation" value="OK" type="button"
        onclick="plot_data.switchOrientation()"> Change Disposition </button>
        <button name="toogleAxes" value="OK" type="button"
        onclick="plot_data.htmlToggleAxes()"> Show / Hide Axes </button>
        <button name="logScale" value="OK" type="button"
        onclick="plot_data.switchLogScale()"> Log Scale</button>
        $specific_buttons
    <hr style="border-top: 2px;">
    </div>
    <div id="app">
        <canvas id="$canvas_id" style="border: 1px solid black;"></canvas>

        <script type="text/javascript">
            const [width, height] = PlotData.computeCanvasSize("#buttons");
            const data = $data;
            $plot_commands
        </script>
    </div>
</html>
''')

EMPTY_BUTTONS = """"""

MULTIPLOT_BUTTONS = """
        <button name="resize" value="OK" type="button" onclick="plot_data.switchResize()"> Resize Figures </button>
        <button name="resizeMP" value="OK" type="button"
        onclick="plot_data.resize(...PlotData.computeCanvasSize('#buttons'))"> Resize Multiplot </button>"""

SCATTER_COMMANDS = """
            const plot_data = new PlotData.Scatter(data, width, height, 0, 0, $canvas_id.id);
            plot_data.setCanvas($canvas_id.id);
            plot_data.draw();
            plot_data.mouseListener();"""

CONTOUR_COMMANDS = """
            const plot_data = new PlotData.Draw(data, width, height, 0, 0, $canvas_id.id);
            plot_data.setCanvas($canvas_id.id);
            plot_data.draw();
            plot_data.mouseListener();"""

GRAPH_COMMANDS = """
            const plot_data = new PlotData.Graph2D(data, width, height, 0, 0, $canvas_id.id);
            plot_data.setCanvas($canvas_id.id);
            plot_data.draw();
            plot_data.mouseListener();"""

PARALLELPLOT_COMMANDS = """
            const plot_data = new PlotData.ParallelPlot(data, width, height, 0, 0, $canvas_id.id);
            plot_data.setCanvas($canvas_id.id);
            plot_data.draw();
            plot_data.mouseListener();"""

HISTOGRAM_COMMANDS = """
            const plot_data = new PlotData.Histogram(data, width, height, 0, 0, $canvas_id.id);
            plot_data.setCanvas($canvas_id.id);
            plot_data.draw();
            plot_data.mouseListener();"""

MULTIPLOT_COMMANDS = """
            const plot_data = new PlotData.Multiplot(data, width, height, $canvas_id.id);"""

PRIMITIVE_GROUP_CONTAINER_COMMANDS = """
            const plot_data = new PlotData.PrimitiveGroupContainer(data, width, height, true, 0, 0, $canvas_id.id);
            plot_data.setCanvas($canvas_id.id);
            plot_data.draw();
            plot_data.mouseListener();"""


def get_html_string(command_name: str, button_name: str):
    return Template(HTML_TEMPLATE.safe_substitute(plot_commands=globals()[command_name],
                                                  specific_buttons=globals()[button_name]))
