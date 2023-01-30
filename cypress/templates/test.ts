export var htmlString = (
'<!DOCTYPE html>' +              
'<html lang="en">' +               
    '<head>' +
        '<script src=$core_path></script>' +
    '</head>' +
    '<div id="app">' +
        '<canvas id="$canvas_id" width="490" height="490" style="border: 1px solid black;">' +
        '</canvas>' +
        '<script type="text/javascript">' +
            'var width = 0.95*window.innerWidth;' +
            'var height = Math.max(0.95*window.innerHeight, 350);' +
            'var data = $data;' +
            'var number_plot_data = data.length;' +
            'var plot_data = new PlotData.PlotScatter(data, width, height, true, 0, 0, $canvas_id.id);' +
            'plot_data.define_canvas($canvas_id.id);' +
            'plot_data.draw_initial();' +
            'plot_data.mouse_interaction(plot_data.isParallelPlot);' +
        '</script>' +
    '</div>' +
'</html>')