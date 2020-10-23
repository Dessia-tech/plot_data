"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rgb_interpolations = exports.rgb_interpolation = exports.rgb_to_string = exports.string_to_hex = exports.hex_to_string = exports.rgb_to_hex = exports.componentToHex = exports.genColor = exports.getCurvePoints = exports.move_elements = exports.remove_at_index = exports.drawLines = exports.Shape = exports.MyMath = exports.HatchingSet = exports.WindowSizeSet = exports.PointColorSet = exports.PointSizeSet = exports.PointShapeSet = exports.ColorSurfaceSet = exports.PlotDataState = exports.Attribute = exports.PlotDataArc2D = exports.PlotDataScatter = exports.PlotDataGraph2D = exports.PlotDataTooltip = exports.PlotDataAxis = exports.PlotDataPoint2D = exports.PlotDataCircle2D = exports.PlotDataLine2D = exports.PlotDataContour2D = exports.ParallelPlot = exports.PlotScatter = exports.PlotContour = exports.PlotData = void 0;
var PlotData = /** @class */ (function () {
    function PlotData(data, width, height, coeff_pixel) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.coeff_pixel = coeff_pixel;
        this.scroll_x = 0;
        this.scroll_y = 0;
        this.colour_to_plot_data = {};
        this.select_on_click = [];
        this.color_surface_on_mouse = 'lightskyblue';
        this.color_surface_on_click = 'blue';
        this.tooltip_ON = false;
        this.axis_ON = false;
        this.link_object_ON = false;
        this.graph_ON = false;
        this.tooltip_list = [];
        this.zoom_rect_x = 0;
        this.zoom_rect_y = 0;
        this.zoom_rect_w = 0;
        this.zoom_rect_h = 0;
        this.zw_x = 0;
        this.zw_y = 0;
        this.zw_w = 0;
        this.zw_h = 0;
        this.reset_rect_x = 0;
        this.reset_rect_y = 0;
        this.reset_rect_w = 0;
        this.reset_rect_h = 0;
        this.select_x = 0;
        this.select_y = 0;
        this.select_w = 0;
        this.select_h = 0;
        this.sort_list_points = [];
        this.graph_to_display = [];
        this.graph1_button_x = 0;
        this.graph1_button_y = 0;
        this.graph1_button_w = 0;
        this.graph1_button_h = 0;
        this.nb_graph = 0;
        this.graph_colorlist = [];
        this.graph_name_list = [];
        this.graph_text_spacing_list = [];
        this.decalage_axis_x = 50;
        this.decalage_axis_y = 20;
        this.last_point_list = [];
        this.scatter_point_list = [];
        this.refresh_point_list_bool = true;
        this.buttons_ON = true; //Pour activer/désactiver les boutons sur le canvas 
        this.attribute_list = [];
        this.axis_list = [];
        this.to_display_list = [];
        this.axis_y_start = 0;
        this.axis_y_end = 0;
        this.y_step = 0;
        this.axis_x_start = 0;
        this.axis_x_end = 0;
        this.x_step = 0;
        this.move_index = -1;
        this.vertical = false;
        this.disp_x = 0;
        this.disp_y = 0;
        this.disp_w = 0;
        this.disp_h = 0;
        this.selected_axis_name = '';
        this.inverted_axis_list = [];
        this.rubber_bands = [];
        this.rubber_last_min = 0;
        this.rubber_last_max = 0;
        this.points_axis_coord = [];
    }
    PlotData.prototype.define_canvas = function () {
        var canvas = document.getElementById('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context_show = canvas.getContext("2d");
        var hiddenCanvas = document.createElement("canvas");
        hiddenCanvas.width = this.width;
        hiddenCanvas.height = this.height;
        this.context_hidden = hiddenCanvas.getContext("2d");
    };
    PlotData.prototype.set_canvas_size = function (height, width) {
        this.height = height;
        this.width = width;
    };
    PlotData.prototype.draw_initial = function () {
        this.init_scale = Math.min(this.width / (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX), this.height / (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY));
        this.scale = this.init_scale;
        if ((this.axis_ON) && !(this.graph_ON)) {
            this.init_scaleX = (this.width - this.decalage_axis_x) / (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX);
            this.init_scaleY = (this.height - this.decalage_axis_y) / (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY);
            this.scaleX = this.init_scaleX;
            this.scaleY = this.init_scaleY;
            this.last_mouse1X = (this.width / 2 - (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX) * this.scaleX / 2) / this.scaleX - this.coeff_pixel * this.minX + this.decalage_axis_x / (2 * this.scaleX);
            this.last_mouse1Y = (this.height / 2 - (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY) * this.scaleY / 2) / this.scaleY - this.coeff_pixel * this.minY - this.decalage_axis_y / (2 * this.scaleY);
        }
        else if ((this.axis_ON) && (this.graph_ON)) {
            this.init_scaleX = (this.width - this.decalage_axis_x) / (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX);
            this.init_scaleY = (this.height - this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5)) / (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY);
            this.scaleX = this.init_scaleX;
            this.scaleY = this.init_scaleY;
            this.last_mouse1X = (this.width / 2 - (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX) * this.scaleX / 2) / this.scaleX - this.coeff_pixel * this.minX + this.decalage_axis_x / (2 * this.scaleX);
            this.last_mouse1Y = (this.height / 2 - (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY) * this.scaleY / 2) / this.scaleY - this.coeff_pixel * this.minY - (this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5)) / (2 * this.scaleY);
        }
        else {
            this.scaleX = this.init_scale;
            this.scaleY = this.init_scale;
            this.last_mouse1X = (this.width / 2 - (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX) * this.scaleX / 2) / this.scaleX - this.coeff_pixel * this.minX;
            this.last_mouse1Y = (this.height / 2 - (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY) * this.scaleY / 2) / this.scaleY - this.coeff_pixel * this.minY;
        }
        this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
    };
    PlotData.prototype.draw_empty_canvas = function (hidden) {
        if (hidden) {
            this.context = this.context_hidden;
        }
        else {
            this.context = this.context_show;
        }
        this.context.clearRect(0, 0, this.width, this.height);
    };
    PlotData.prototype.draw_contour = function (hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
        if (d['type'] == 'contour') {
            this.context.beginPath();
            if (hidden) {
                this.context.fillStyle = d.mouse_selection_color;
            }
            else {
                this.context.strokeStyle = d.plot_data_states[show_state].color_line;
                this.context.lineWidth = d.plot_data_states[show_state].stroke_width;
                this.context.fillStyle = 'white';
                if (d.plot_data_states[show_state].hatching != null) {
                    this.context.fillStyle = this.context.createPattern(d.plot_data_states[show_state].hatching.canvas_hatching, 'repeat');
                }
                if (d.plot_data_states[show_state].color_surface != null) {
                    this.context.fillStyle = d.plot_data_states[show_state].color_surface.color;
                }
                if (this.select_on_mouse == d) {
                    this.context.fillStyle = this.color_surface_on_mouse;
                }
                for (var j = 0; j < this.select_on_click.length; j++) {
                    var z = this.select_on_click[j];
                    if (z == d) {
                        this.context.fillStyle = this.color_surface_on_click;
                    }
                }
            }
            for (var j = 0; j < d.plot_data_primitives.length; j++) {
                var elem = d.plot_data_primitives[j];
                if (j == 0) {
                    var first_elem = true;
                }
                else {
                    var first_elem = false;
                }
                elem.draw(this.context, first_elem, mvx, mvy, scaleX, scaleY);
            }
            this.context.fill();
            this.context.stroke();
            this.context.closePath();
        }
    };
    PlotData.prototype.draw_point = function (hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
        if (d['type'] == 'point') {
            if (hidden) {
                this.context.fillStyle = d.mouse_selection_color;
            }
            else {
                this.context.fillStyle = d.color_fill;
                this.context.lineWidth = d.stroke_width;
                this.context.strokeStyle = d.color_stroke;
                var shape = d.point_shape;
                if (shape == 'crux') {
                    this.context.strokeStyle = d.color_fill;
                }
                if (this.select_on_mouse == d) {
                    this.context.fillStyle = this.color_surface_on_mouse;
                }
                for (var j = 0; j < this.select_on_click.length; j++) {
                    var z = this.select_on_click[j];
                    if (z == d) {
                        if (shape == 'crux') {
                            this.context.strokeStyle = this.color_surface_on_click;
                        }
                        else {
                            this.context.fillStyle = this.color_surface_on_click;
                        }
                    }
                }
            }
            var x = scaleX * (1000 * d.cx + mvx);
            var y = scaleY * (1000 * d.cy + mvy);
            var length = 1000 * d.size;
            var is_inside_canvas = ((x + length >= 0) && (x - length <= this.width) && (y + length >= 0) && (y - length <= this.height));
            if (is_inside_canvas === true) {
                this.context.beginPath();
                d.draw(this.context, this.context_hidden, mvx, mvy, scaleX, scaleY);
                this.context.fill();
                this.context.stroke();
                this.context.closePath();
            }
        }
    };
    PlotData.prototype.draw_axis = function (mvx, mvy, scaleX, scaleY, d) {
        if (d['type'] == 'axis') {
            this.context.beginPath();
            d.draw(this.context, mvx, mvy, scaleX, scaleY, this.width, this.height, this.init_scaleX, this.init_scaleY, this.minX, this.maxX, this.minY, this.maxY, this.scroll_x, this.scroll_y, this.decalage_axis_x, this.decalage_axis_y);
            this.context.closePath();
            this.context.fill();
        }
    };
    PlotData.prototype.draw_tooltip = function (d, mvx, mvy) {
        if (d['type'] == 'tooltip') {
            this.tooltip_ON = true;
            d.manage_tooltip(this.context, mvx, mvy, this.scaleX, this.scaleY, this.width, this.height, this.tooltip_list);
        }
    };
    PlotData.prototype.find_min_dist = function (d, mvx, mvy, step) {
        var x0 = this.scaleX * (1000 * d.point_list[0].cx + mvx);
        var y0 = this.scaleY * (1000 * d.point_list[0].cy + mvy);
        var x1 = this.scaleX * (1000 * d.point_list[step].cx + mvx);
        var y1 = this.scaleY * (1000 * d.point_list[step].cy + mvy);
        var min_dist = this.distance([x0, y0], [x1, y1]);
        for (var i = 1; i < d.point_list.length - step; i = i + step) {
            x0 = this.scaleX * (1000 * d.point_list[i].cx + mvx);
            y0 = this.scaleY * (1000 * d.point_list[i].cy + mvy);
            x1 = this.scaleX * (1000 * d.point_list[i + step].cx + mvx);
            y1 = this.scaleY * (1000 * d.point_list[i + step].cy + mvy);
            var dist = this.distance([x0, y0], [x1, y1]);
            if (dist < min_dist) {
                min_dist = dist;
            }
        }
        return min_dist;
    };
    PlotData.prototype.draw_graph2D = function (d, hidden, mvx, mvy) {
        var _a;
        if ((d['type'] == 'graph2D') && (this.graph_to_display[d.id] === true)) {
            this.context.beginPath();
            this.context.setLineDash(d.dashline);
            this.context.strokeStyle = d.graph_colorstroke;
            this.context.lineWidth = d.graph_linewidth;
            for (var i = 0; i < d.segments.length; i++) {
                if (i == 0) {
                    d.segments[i].draw(this.context, true, mvx, mvy, this.scaleX, this.scaleY);
                }
                else {
                    d.segments[i].draw(this.context, false, mvx, mvy, this.scaleX, this.scaleY);
                }
            }
            this.context.stroke();
            this.context.setLineDash([]);
            _a = this.get_nb_points_inside_canvas(d.point_list, mvx, mvy), this.index_first_in = _a[0], this.nb_points_in = _a[1], this.index_last_in = _a[2];
            var step = d.display_step;
            var min_dist = this.find_min_dist(d, mvx, mvy, step);
            while ((min_dist < 20) && (step < d.point_list.length)) {
                min_dist = this.find_min_dist(d, mvx, mvy, step);
                step++;
            }
            for (var i = 0; i < d.point_list.length; i = i + step) {
                var point = d.point_list[i];
                this.draw_point(hidden, 0, mvx, mvy, this.scaleX, this.scaleY, point);
            }
        }
        else if ((d['type'] == 'graph2D') && (this.graph_to_display[d.id] === false)) {
            this.delete_clicked_points(d.point_list);
            this.delete_tooltip(d.point_list);
        }
    };
    PlotData.prototype.draw_scatterplot = function (d, hidden, mvx, mvy) {
        if (d['type'] == 'ScatterPlot') {
            if (((this.scroll_x % 5 == 0) || (this.scroll_y % 5 == 0)) && this.refresh_point_list_bool) {
                this.scatter_point_list = this.refresh_point_list(d.point_list, mvx, mvy);
                this.refresh_point_list_bool = false;
            }
            if ((this.scroll_x % 5 != 0) && (this.scroll_y % 5 != 0)) {
                this.refresh_point_list_bool = true;
            }
            for (var i = 0; i < this.scatter_point_list.length; i++) {
                var point = this.scatter_point_list[i];
                this.draw_point(hidden, 0, mvx, mvy, this.scaleX, this.scaleY, point);
            }
            for (var i = 0; i < this.tooltip_list.length; i++) {
                if (!this.is_include(this.tooltip_list[i], this.scatter_point_list)) {
                    this.tooltip_list = this.remove_selection(this.tooltip_list[i], this.tooltip_list);
                }
            }
        }
    };
    PlotData.prototype.draw_vertical_parallel_axis = function (nb_axis, mvx) {
        for (var i = 0; i < nb_axis; i++) {
            if (i == this.move_index) {
                var current_x = this.axis_x_start + i * this.x_step + mvx;
            }
            else {
                var current_x = this.axis_x_start + i * this.x_step;
            }
            this.context.beginPath();
            Shape.drawLine(this.context, [[current_x, this.axis_y_start], [current_x, this.axis_y_end]]);
            var attribute_name = this.axis_list[i]['name'];
            this.context.font = '10px sans-serif';
            this.context.textAlign = 'center';
            if (attribute_name == this.selected_axis_name) {
                this.context.strokeStyle = 'blue';
            }
            else {
                this.context.strokeStyle = 'lightgrey';
            }
            this.context.fillStyle = 'black';
            this.context.fillText(attribute_name, current_x, this.axis_y_end - 20);
            this.context.stroke();
            var attribute_type = this.axis_list[i]['type'];
            var list = this.axis_list[i]['list'];
            if (attribute_type == 'float') {
                var min = list[0];
                var max = list[1];
                if (min == max) {
                    var current_y_1 = (this.axis_y_start + this.axis_y_end) / 2;
                    Shape.drawLine(this.context, [[current_x - 3, current_y_1], [current_x + 3, current_y_1]]);
                    var current_grad_1 = MyMath.round(min, 3);
                    this.context.textAlign = 'end';
                    this.context.textBaseline = 'middle';
                    this.context.fillText(current_grad_1, current_x - 5, current_y_1);
                }
                else {
                    var grad_step = (max - min) / 9;
                    var y_step = (this.axis_y_end - this.axis_y_start) / 9;
                    for (var j = 0; j < 10; j++) {
                        var current_y = this.axis_y_start + j * y_step;
                        if (this.inverted_axis_list[i] === true) {
                            var current_grad = MyMath.round(max - j * grad_step, 3);
                        }
                        else {
                            current_grad = MyMath.round(min + j * grad_step, 3);
                        }
                        Shape.drawLine(this.context, [[current_x - 3, current_y], [current_x + 3, current_y]]);
                        this.context.textAlign = 'end';
                        this.context.textBaseline = 'middle';
                        this.context.fillText(current_grad, current_x - 5, current_y);
                    }
                }
            }
            else { //ie string
                var nb_attribute = list.length;
                if (nb_attribute == 1) {
                    y_step = (this.axis_y_end - this.axis_y_start) / 2;
                }
                else {
                    y_step = (this.axis_y_end - this.axis_y_start) / (nb_attribute - 1);
                }
                for (var j = 0; j < nb_attribute; j++) {
                    var current_y = this.axis_y_start + j * y_step;
                    if (this.inverted_axis_list[i] === true) {
                        current_grad = list[nb_attribute - j - 1].toString();
                    }
                    else {
                        current_grad = list[j].toString();
                    }
                    Shape.drawLine(this.context, [[current_x - 3, current_y], [current_x + 3, current_y]]);
                    this.context.textAlign = 'end';
                    this.context.textBaseline = 'middle';
                    this.context.fillText(current_grad, current_x - 5, current_y);
                }
            }
            this.context.stroke();
            this.context.fill();
            this.context.closePath();
        }
    };
    PlotData.prototype.draw_horizontal_parallel_axis = function (nb_axis, mvy) {
        for (var i = 0; i < nb_axis; i++) {
            if (i == this.move_index) {
                var current_y = this.axis_y_start + i * this.y_step + mvy;
            }
            else {
                var current_y = this.axis_y_start + i * this.y_step;
            }
            this.context.beginPath();
            Shape.drawLine(this.context, [[this.axis_x_start, current_y], [this.axis_x_end, current_y]]);
            var attribute_name = this.axis_list[i]['name'];
            this.context.font = '10px sans-serif';
            this.context.textAlign = 'center';
            if (attribute_name == this.selected_axis_name) {
                this.context.strokeStyle = 'blue';
            }
            else {
                this.context.strokeStyle = 'black';
            }
            this.context.fillStyle = 'black';
            this.context.fillText(attribute_name, this.axis_x_start, current_y + 15);
            this.context.stroke();
            var attribute_type = this.axis_list[i]['type'];
            var list = this.axis_list[i]['list'];
            if (attribute_type == 'float') {
                var min = list[0];
                var max = list[1];
                if (max == min) {
                    var current_x_1 = (this.axis_x_start + this.axis_x_end) / 2;
                    Shape.drawLine(this.context, [[current_x_1, current_y - 3], [current_x_1, current_y + 3]]);
                    var current_grad_2 = min;
                    this.context.fillText(current_grad_2, current_x_1, current_y - 5);
                }
                else {
                    var grad_step = (max - min) / 9;
                    var x_step = (this.axis_x_end - this.axis_x_start) / 9;
                    for (var j = 0; j < 10; j++) {
                        var current_x = this.axis_x_start + j * x_step;
                        if (this.inverted_axis_list[i] === true) {
                            var current_grad = MyMath.round(max - j * grad_step, 3);
                        }
                        else {
                            current_grad = MyMath.round(min + j * grad_step, 3);
                        }
                        Shape.drawLine(this.context, [[current_x, current_y - 3], [current_x, current_y + 3]]);
                        this.context.textAlign = 'center';
                        this.context.fillText(current_grad, current_x, current_y - 5);
                    }
                }
            }
            else {
                var nb_attribute = list.length;
                if (nb_attribute == 1) {
                    x_step = (this.axis_x_end - this.axis_x_start) / 2;
                }
                else {
                    x_step = (this.axis_x_end - this.axis_x_start) / (nb_attribute - 1);
                }
                for (var j = 0; j < nb_attribute; j++) {
                    var current_x = this.axis_x_start + j * x_step;
                    if (this.inverted_axis_list[i] === true) {
                        current_grad = list[nb_attribute - j - 1].toString();
                    }
                    else {
                        current_grad = list[j].toString();
                    }
                    Shape.drawLine(this.context, [[current_x, current_y - 3], [current_x, current_y + 3]]);
                    this.context.textAlign = 'middle';
                    this.context.fillText(current_grad, current_x, current_y - 5);
                }
            }
            this.context.stroke();
            this.context.fill();
            this.context.closePath();
        }
    };
    PlotData.prototype.draw_parallel_axis = function (nb_axis, mv) {
        if (this.vertical === true) {
            this.draw_vertical_parallel_axis(nb_axis, mv);
        }
        else {
            this.draw_horizontal_parallel_axis(nb_axis, mv);
        }
    };
    PlotData.prototype.get_index_of_element = function (val, list) {
        if (!this.is_include(val, list)) {
            throw new Error('cannot get index of element');
        }
        ;
        for (var i = 0; i < list.length; i++) {
            if (val == list[i]) {
                return i;
            }
        }
    };
    PlotData.prototype.get_coord_on_parallel_plot = function (attribute_type, current_list, elt, axis_coord_start, axis_coord_end, inverted) {
        if (attribute_type == 'float') {
            var min = current_list[0];
            var max = current_list[1];
            if (min == max) {
                var current_axis_coord = (axis_coord_start + axis_coord_end) / 2;
            }
            else {
                var delta_y = elt - min;
                var delta_axis_coord = (axis_coord_end - axis_coord_start) * delta_y / (max - min);
                if (inverted === true) {
                    var current_axis_coord = axis_coord_end - delta_axis_coord;
                }
                else {
                    current_axis_coord = axis_coord_start + delta_axis_coord;
                }
            }
        }
        else {
            var color = elt;
            if (current_list.length == 1) {
                current_axis_coord = (axis_coord_start + axis_coord_end) / 2;
            }
            else {
                var color_index = this.get_index_of_element(color, current_list);
                var axis_coord_step = (axis_coord_end - axis_coord_start) / (current_list.length - 1);
                if (inverted === true) {
                    current_axis_coord = axis_coord_end - color_index * axis_coord_step;
                }
                else {
                    current_axis_coord = axis_coord_start + color_index * axis_coord_step;
                }
            }
        }
        return current_axis_coord;
    };
    PlotData.prototype.is_inside_band = function (real_x, real_y, axis_index) {
        if (this.rubber_bands[axis_index].length == 0) {
            return true;
        }
        var rubber_min = this.rubber_bands[axis_index][0];
        var rubber_max = this.rubber_bands[axis_index][1];
        if (this.vertical === true) {
            var coord_ax = (real_y - this.axis_y_end) / (this.axis_y_start - this.axis_y_end);
        }
        else {
            coord_ax = (real_x - this.axis_x_start) / (this.axis_x_end - this.axis_x_start);
        }
        if ((coord_ax >= rubber_min) && (coord_ax <= rubber_max)) {
            return true;
        }
        return false;
    };
    PlotData.prototype.draw_parallel_coord_lines = function (nb_axis) {
        for (var i = 0; i < this.to_display_list.length; i++) {
            var to_display_list_i = this.to_display_list[i];
            var current_attribute_type = this.axis_list[0]['type'];
            var current_list = this.axis_list[0]['list'];
            var selected = true;
            var seg_list = [];
            if (this.vertical === true) {
                var current_x = this.axis_x_start;
                var current_axis_y = this.get_coord_on_parallel_plot(current_attribute_type, current_list, to_display_list_i[0], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[0]);
            }
            else {
                var current_x = this.get_coord_on_parallel_plot(current_attribute_type, current_list, to_display_list_i[0], this.axis_x_start, this.axis_x_end, this.inverted_axis_list[0]);
                var current_axis_y = this.axis_y_start;
            }
            selected = selected && this.is_inside_band(current_x, current_axis_y, 0);
            seg_list.push([current_x, current_axis_y]);
            for (var j = 1; j < nb_axis; j++) {
                var next_attribute_type = this.axis_list[j]['type'];
                var next_list = this.axis_list[j]['list'];
                if (this.vertical === true) {
                    var next_x = this.axis_x_start + j * this.x_step;
                    var next_axis_y = this.get_coord_on_parallel_plot(next_attribute_type, next_list, to_display_list_i[j], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[j]);
                }
                else {
                    var next_x = this.get_coord_on_parallel_plot(next_attribute_type, next_list, to_display_list_i[j], this.axis_x_start, this.axis_x_end, this.inverted_axis_list[j]);
                    var next_axis_y = this.axis_y_start + j * this.y_step;
                }
                selected = selected && this.is_inside_band(next_x, next_axis_y, j);
                seg_list.push([next_x, next_axis_y]);
            }
            this.context.beginPath();
            if (selected === true) {
                this.context.strokeStyle = this.parallel_plot_lineColor;
            }
            else {
                this.context.strokeStyle = string_to_hex('lightgrey');
            }
            this.context.lineWidth = this.parallel_plot_linewidth;
            Shape.drawLine(this.context, seg_list);
            this.context.stroke();
            this.context.closePath();
        }
    };
    PlotData.prototype.draw_rubber_bands = function (mvx) {
        var rect_width = 10;
        var opacity = 0.5;
        var colorfill = string_to_hex('lightblue');
        var colorstroke = string_to_hex('white');
        var linewidth = 0.1;
        for (var i = 0; i < this.rubber_bands.length; i++) {
            if (this.rubber_bands[i].length != 0) {
                if (this.vertical) {
                    var minY = this.rubber_bands[i][0];
                    var maxY = this.rubber_bands[i][1];
                    var real_minY = this.axis_y_end + minY * (this.axis_y_start - this.axis_y_end);
                    var real_maxY = this.axis_y_end + maxY * (this.axis_y_start - this.axis_y_end);
                    var current_x = this.axis_x_start + i * this.x_step;
                    if (i == this.move_index) {
                        Shape.rect(current_x - rect_width / 2 + mvx, real_minY, rect_width, real_maxY - real_minY, this.context, colorfill, colorstroke, linewidth, opacity);
                    }
                    else {
                        Shape.rect(current_x - rect_width / 2, real_minY, rect_width, real_maxY - real_minY, this.context, colorfill, colorstroke, linewidth, opacity);
                    }
                }
                else {
                    var minX = this.rubber_bands[i][0];
                    var maxX = this.rubber_bands[i][1];
                    var real_minX = this.axis_x_start + minX * (this.axis_x_end - this.axis_x_start);
                    var real_maxX = this.axis_x_start + maxX * (this.axis_x_end - this.axis_x_start);
                    var current_y = this.axis_y_start + i * this.y_step;
                    if (i == this.move_index) {
                        Shape.rect(real_minX, current_y - rect_width / 2 + mvx, real_maxX - real_minX, rect_width, this.context, colorfill, colorstroke, linewidth, opacity);
                    }
                    else {
                        Shape.rect(real_minX, current_y - rect_width / 2, real_maxX - real_minX, rect_width, this.context, colorfill, colorstroke, linewidth, opacity);
                    }
                }
            }
        }
    };
    PlotData.prototype.refresh_to_display_list = function (elements) {
        this.to_display_list = [];
        for (var i = 0; i < elements.length; i++) {
            var to_display = [];
            for (var j = 0; j < this.axis_list.length; j++) {
                var attribute_name = this.axis_list[j]['name'];
                var type = this.axis_list[j]['type'];
                if (type == 'color') {
                    var elt = rgb_to_string(elements[i][attribute_name]);
                }
                else {
                    elt = elements[i][attribute_name];
                }
                to_display.push(elt);
            }
            this.to_display_list.push(to_display);
        }
    };
    PlotData.prototype.refresh_axis_bounds = function (nb_axis) {
        if (this.vertical === true) {
            this.axis_x_start = 50;
            this.axis_x_end = this.width - 50;
            this.x_step = (this.axis_x_end - this.axis_x_start) / (nb_axis - 1);
            this.axis_y_start = this.height - 25;
            this.axis_y_end = 50;
        }
        else {
            this.axis_x_start = 40;
            this.axis_x_end = this.width - 50;
            this.axis_y_start = 25;
            this.axis_y_end = this.height - 25;
            this.y_step = (this.axis_y_end - this.axis_y_start) / (nb_axis - 1);
        }
    };
    PlotData.prototype.add_to_axis_list = function (to_disp_attributes_names) {
        for (var i = 0; i < to_disp_attributes_names.length; i++) {
            for (var j = 0; j < this.attribute_list.length; j++) {
                if (to_disp_attributes_names[i] == this.attribute_list[j]['name']) {
                    this.axis_list.push(this.attribute_list[j]);
                }
            }
        }
    };
    PlotData.prototype.add_axis_to_parallelplot = function (name) {
        for (var i = 0; i < this.axis_list.length; i++) {
            if (name == this.axis_list[i]['name']) {
                throw new Error('Cannot add an attribute that is already displayed');
            }
        }
        for (var i = 0; i < this.attribute_list.length; i++) {
            if (this.attribute_list[i]['name'] == name) {
                var attribute_to_add = this.attribute_list[i];
            }
        }
        this.add_to_axis_list([attribute_to_add]);
    };
    PlotData.prototype.remove_axis_from_parallelplot = function (name) {
        var is_in_axislist = false;
        for (var i = 0; i < this.axis_list.length; i++) {
            if (this.axis_list[i]['name'] == name) {
                is_in_axislist = true;
                this.axis_list = this.remove_selection(this.axis_list[i], this.axis_list);
            }
        }
        if (is_in_axislist === false) {
            throw new Error('Cannot remove axis that is not displayed');
        }
    };
    PlotData.prototype.zoom_button = function (x, y, w, h) {
        if ((x < 0) || (x + h > this.width) || (y < 0) || (y + 2 * h > this.height)) {
            throw new Error("Invalid x or y, the zoom button is out of the canvas");
        }
        this.context.strokeStyle = 'black';
        this.context.beginPath();
        this.context.lineWidth = "2";
        this.context.fillStyle = 'white';
        this.context.rect(x, y, w, h);
        this.context.rect(x, y + h, w, h);
        this.context.moveTo(x, y + h);
        this.context.lineTo(x + w, y + h);
        Shape.crux(this.context, x + w / 2, y + h / 2, h / 3);
        this.context.moveTo(x + w / 2 - h / 3, y + 3 * h / 2);
        this.context.lineTo(x + w / 2 + h / 3, y + 3 * h / 2);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    };
    PlotData.prototype.zoom_window_button = function (x, y, w, h) {
        if ((x < 0) || (x + h > this.width) || (y < 0) || (y + h > this.height)) {
            throw new Error("Invalid x or y, the zoom window button is out of the canvas");
        }
        this.context.strokeStyle = 'black';
        if (this.zw_bool) {
            Shape.createButton(x, y, w, h, this.context, "Z ON", "12px Arial");
        }
        else {
            Shape.createButton(x, y, w, h, this.context, "Z OFF", "12px Arial");
        }
    };
    PlotData.prototype.reset_button = function (x, y, w, h) {
        if ((x < 0) || (x + h > this.width) || (y < 0) || (y + h > this.height)) {
            throw new Error("Invalid x or y, the reset button is out of the canvas");
        }
        this.context.strokeStyle = 'black';
        Shape.createButton(x, y, w, h, this.context, "Reset", "12px Arial");
    };
    PlotData.prototype.selection_button = function (x, y, w, h) {
        if ((x < 0) || (x + h > this.width) || (y < 0) || (y + h > this.height)) {
            throw new Error("Invalid x or y, the selection button is out of the canvas");
        }
        this.context.strokeStyle = 'black';
        if (this.select_bool) {
            Shape.createButton(x, y, w, h, this.context, "S ON", "12px Arial");
        }
        else {
            Shape.createButton(x, y, w, h, this.context, "S OFF", "12px Arial");
        }
    };
    PlotData.prototype.graph_buttons = function (y, w, h, police) {
        this.context.font = police;
        this.graph1_button_x = this.width / 2;
        for (var i = 0; i < this.graph_name_list.length; i++) {
            var text_w = this.context.measureText(this.graph_name_list[i]).width;
            this.graph_text_spacing_list.push(text_w + 10);
            this.graph1_button_x = this.graph1_button_x - (w + text_w + 10) / 2;
        }
        var text_spacing_sum_i = 0;
        for (var i = 0; i < this.nb_graph; i++) {
            if (this.graph_to_display[i] === true) {
                Shape.createGraphButton(this.graph1_button_x + i * w + text_spacing_sum_i, y, w, h, this.context, this.graph_name_list[i], police, this.graph_colorlist[i], false);
            }
            else {
                Shape.createGraphButton(this.graph1_button_x + i * w + text_spacing_sum_i, y, w, h, this.context, this.graph_name_list[i], police, this.graph_colorlist[i], true);
            }
            text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
        }
    };
    PlotData.prototype.disp_button = function (x, y, w, h, police) {
        Shape.createButton(x, y, w, h, this.context, 'Disp', police);
    };
    PlotData.prototype.zoom_window_action = function (mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil) {
        this.context_show.setLineDash([]);
        this.context_hidden.setLineDash([]);
        var zoom_coeff_x = this.width / Math.abs(mouse2X - mouse1X);
        var zoom_coeff_y = this.height / Math.abs(mouse2Y - mouse1Y);
        if ((this.scaleX * zoom_coeff_x < scale_ceil) && (this.scaleY * zoom_coeff_y < scale_ceil)) {
            this.last_mouse1X = this.last_mouse1X - Math.min(mouse1X, mouse2X) / this.scaleX;
            this.last_mouse1Y = this.last_mouse1Y - Math.min(mouse1Y, mouse2Y) / this.scaleY;
            this.scaleX = this.scaleX * zoom_coeff_x;
            this.scaleY = this.scaleY * zoom_coeff_y;
            this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
            this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        }
    };
    PlotData.prototype.selection_window_action = function (mouse1X, mouse1Y, mouse2X, mouse2Y) {
        this.context_show.setLineDash([]);
        this.context_hidden.setLineDash([]);
        for (var i = 0; i < this.plot_datas.length; i++) {
            var d = this.plot_datas[i];
            var in_rect = Shape.Is_in_rect(this.scaleX * (1000 * d.cx + this.last_mouse1X), this.scaleY * (1000 * d.cy + this.last_mouse1Y), Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
            if ((d['type'] == "point") && (in_rect === true) && !(this.is_include(d, this.select_on_click))) {
                this.select_on_click.push(d);
            }
            else if (d['type'] == 'graph2D') {
                for (var j = 0; j < d.point_list.length; j++) {
                    var x = this.scaleX * (1000 * d.point_list[j].cx + this.last_mouse1X);
                    var y = this.scaleY * (1000 * d.point_list[j].cy + this.last_mouse1Y);
                    in_rect = Shape.Is_in_rect(x, y, Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
                    if ((in_rect === true) && !(this.is_include(d.point_list[j], this.select_on_click))) {
                        this.select_on_click.push(d.point_list[j]);
                    }
                }
            }
            else if (d['type'] == 'ScatterPlot') {
                for (var j = 0; j < this.scatter_point_list.length; j++) {
                    var x = this.scaleX * (1000 * this.scatter_point_list[j].cx + this.last_mouse1X);
                    var y = this.scaleY * (1000 * this.scatter_point_list[j].cy + this.last_mouse1Y);
                    in_rect = Shape.Is_in_rect(x, y, Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
                    if ((in_rect === true) && !(this.is_include(this.scatter_point_list[j], this.select_on_click))) {
                        this.select_on_click.push(this.scatter_point_list[j]);
                    }
                }
            }
        }
        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
    };
    PlotData.prototype.zoom_in_button_action = function () {
        var old_scaleX = this.scaleX;
        var old_scaleY = this.scaleY;
        this.scaleX = this.scaleX * 1.2;
        this.scaleY = this.scaleY * 1.2;
        this.last_mouse1X = this.last_mouse1X - (this.width / (2 * old_scaleX) - this.width / (2 * this.scaleX));
        this.last_mouse1Y = this.last_mouse1Y - (this.height / (2 * old_scaleY) - this.height / (2 * this.scaleY));
        this.scroll_x = 0;
        this.scroll_y = 0;
    };
    PlotData.prototype.zoom_out_button_action = function () {
        var old_scaleX = this.scaleX;
        var old_scaleY = this.scaleY;
        this.scaleX = this.scaleX / 1.2;
        this.scaleY = this.scaleY / 1.2;
        this.last_mouse1X = this.last_mouse1X - (this.width / (2 * old_scaleX) - this.width / (2 * this.scaleX));
        this.last_mouse1Y = this.last_mouse1Y - (this.height / (2 * old_scaleY) - this.height / (2 * this.scaleY));
        this.scroll_x = 0;
        this.scroll_y = 0;
    };
    PlotData.prototype.click_on_zoom_window_action = function () {
        this.zw_bool = !this.zw_bool;
        this.select_bool = false;
    };
    PlotData.prototype.click_on_reset_action = function () {
        this.scaleX = this.init_scaleX;
        this.scaleY = this.init_scaleY;
        this.scale = this.init_scale;
        this.scroll_x = 0;
        this.scroll_y = 0;
        if ((this.axis_ON === true) && (this.graph_ON === false)) {
            this.last_mouse1X = (this.width / 2 - (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX) * this.scaleX / 2) / this.scaleX - this.coeff_pixel * this.minX + this.decalage_axis_x / (2 * this.scaleX);
            this.last_mouse1Y = (this.height / 2 - (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY) * this.scaleY / 2) / this.scaleY - this.coeff_pixel * this.minY - this.decalage_axis_y / (2 * this.scaleY);
        }
        else if ((this.axis_ON === true) && (this.graph_ON === true)) {
            this.last_mouse1X = (this.width / 2 - (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX) * this.scaleX / 2) / this.scaleX - this.coeff_pixel * this.minX + this.decalage_axis_x / (2 * this.scaleX);
            this.last_mouse1Y = (this.height / 2 - (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY) * this.scaleY / 2) / this.scaleY - this.coeff_pixel * this.minY - (this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5)) / (2 * this.scaleY);
        }
        else {
            this.last_mouse1X = (this.width / 2 - (this.coeff_pixel * this.maxX - this.coeff_pixel * this.minX) * this.scaleX / 2) / this.scaleX - this.coeff_pixel * this.minX;
            this.last_mouse1Y = (this.height / 2 - (this.coeff_pixel * this.maxY - this.coeff_pixel * this.minY) * this.scaleY / 2) / this.scaleY - this.coeff_pixel * this.minY;
        }
    };
    PlotData.prototype.click_on_selection_button_action = function () {
        this.zw_bool = false;
        this.select_bool = !this.select_bool;
    };
    PlotData.prototype.graph_button_action = function (mouse1X, mouse1Y) {
        var text_spacing_sum_i = 0;
        for (var i = 0; i < this.nb_graph; i++) {
            var click_on_graph_i = Shape.Is_in_rect(mouse1X, mouse1Y, this.graph1_button_x + i * this.graph1_button_w + text_spacing_sum_i, this.graph1_button_y, this.graph1_button_w, this.graph1_button_h);
            if (click_on_graph_i === true) {
                this.graph_to_display[i] = !this.graph_to_display[i];
            }
            text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
        }
    };
    PlotData.prototype.invert_rubber_bands = function (index_list) {
        var _a, _b;
        if (index_list == 'all') {
            for (var i = 0; i < this.rubber_bands.length; i++) {
                if (this.rubber_bands[i].length != 0) {
                    _a = [1 - this.rubber_bands[i][1], 1 - this.rubber_bands[i][0]], this.rubber_bands[i][0] = _a[0], this.rubber_bands[i][1] = _a[1];
                }
            }
        }
        else {
            for (var i = 0; i < index_list.length; i++) {
                if (this.rubber_bands[index_list[i]].length != 0) {
                    _b = [1 - this.rubber_bands[index_list[i]][1], 1 - this.rubber_bands[index_list[i]][0]], this.rubber_bands[index_list[i]][0] = _b[0], this.rubber_bands[index_list[i]][1] = _b[1];
                }
                else {
                    throw new Error('invert_rubber_bands() : asking to inverted empty array');
                }
            }
        }
    };
    PlotData.prototype.change_disposition_action = function () {
        this.vertical = !this.vertical;
        this.refresh_axis_bounds(this.axis_list.length);
        this.invert_rubber_bands('all');
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
    };
    PlotData.prototype.create_rubber_band = function (mouse1X, mouse1Y, selected_axis_index, e) {
        var mouse2X = e.offsetX;
        var mouse2Y = e.offsetY;
        var isDrawing_rubber_band = true;
        if (this.vertical) {
            var minY = Math.max(Math.min((mouse1Y - this.axis_y_end) / (this.axis_y_start - this.axis_y_end), (mouse2Y - this.axis_y_end) / (this.axis_y_start - this.axis_y_end)), 0);
            var maxY = Math.min(Math.max((mouse1Y - this.axis_y_end) / (this.axis_y_start - this.axis_y_end), (mouse2Y - this.axis_y_end) / (this.axis_y_start - this.axis_y_end)), 1);
            this.rubber_bands[selected_axis_index] = [minY, maxY];
        }
        else {
            var minX = Math.max(Math.min((mouse1X - this.axis_x_start) / (this.axis_x_end - this.axis_x_start), (mouse2X - this.axis_x_start) / (this.axis_x_end - this.axis_x_start)), 0);
            var maxX = Math.min(Math.max((mouse1X - this.axis_x_start) / (this.axis_x_end - this.axis_x_start), (mouse2X - this.axis_x_start) / (this.axis_x_end - this.axis_x_start)), 1);
            this.rubber_bands[selected_axis_index] = [minX, maxX];
        }
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
        return [isDrawing_rubber_band, mouse2X, mouse2Y];
    };
    PlotData.prototype.rubber_band_translation = function (mouse1X, mouse1Y, selected_band_index, e) {
        var mouse2X = e.offsetX;
        var mouse2Y = e.offsetY;
        if (this.vertical) {
            var deltaY = (mouse2Y - mouse1Y) / (this.axis_y_start - this.axis_y_end);
            var new_minY = Math.max(this.rubber_last_min + deltaY, 0);
            var new_maxY = Math.min(this.rubber_last_max + deltaY, 1);
            this.rubber_bands[selected_band_index] = [new_minY, new_maxY];
        }
        else {
            var deltaX = (mouse2X - mouse1X) / (this.axis_x_end - this.axis_x_start);
            var new_minX = Math.max(this.rubber_last_min + deltaX, 0);
            var new_maxX = Math.min(this.rubber_last_max + deltaX, 1);
            this.rubber_bands[selected_band_index] = [new_minX, new_maxX];
        }
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
        return [mouse2X, mouse2Y];
    };
    PlotData.prototype.rubber_band_resize = function (mouse1X, mouse1Y, selected_border, e) {
        var _a, _b;
        var mouse2X = e.offsetX;
        var mouse2Y = e.offsetY;
        var axis_index = selected_border[0];
        var border_number = selected_border[1];
        if (this.vertical) {
            var deltaY = (mouse2Y - mouse1Y) / (this.axis_y_start - this.axis_y_end);
            if (border_number == 0) {
                var new_minY = Math.max(this.rubber_last_min + deltaY, 0);
                this.rubber_bands[axis_index][0] = new_minY;
            }
            else {
                var new_maxY = Math.min(this.rubber_last_max + deltaY, 1);
                this.rubber_bands[axis_index][1] = new_maxY;
            }
        }
        else {
            var deltaX = (mouse2X - mouse1X) / (this.axis_x_end - this.axis_x_start);
            if (border_number == 0) {
                var new_minX = Math.max(this.rubber_last_min + deltaX, 0);
                this.rubber_bands[axis_index][0] = new_minX;
            }
            else {
                var new_maxX = Math.min(this.rubber_last_max + deltaX, 1);
                this.rubber_bands[axis_index][1] = new_maxX;
            }
        }
        if (this.rubber_bands[axis_index][0] > this.rubber_bands[axis_index][1]) {
            _a = [this.rubber_bands[axis_index][1], this.rubber_bands[axis_index][0]], this.rubber_bands[axis_index][0] = _a[0], this.rubber_bands[axis_index][1] = _a[1];
            border_number = 1 - border_number;
            _b = [this.rubber_last_max, this.rubber_last_min], this.rubber_last_min = _b[0], this.rubber_last_max = _b[1];
        }
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
        var is_resizing = true;
        return [border_number, mouse2X, mouse2Y, is_resizing];
    };
    // initialize_points_axis_coord() {
    //   for (let i=0; i<this.to_display_list.length; i++) {
    //     var 
    //     for (let j=0; j<this.axis_list.length; j++) {
    //       if (this.vertical) {
    //         this.get_coord_on_parallel_plot(this.axis_list[j]['type'], this.axis_list[j]['list'], this.to_display_list[i][j], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[j]);
    //       }
    //     }
    //   }
    // }
    PlotData.prototype.mouse_down_interaction = function (mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e) {
        mouse1X = e.offsetX;
        mouse1Y = e.offsetY;
        mouse2X = e.offsetX;
        mouse2Y = e.offsetY;
        isDrawing = true;
        return [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing];
    };
    PlotData.prototype.mouse_move_interaction = function (isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e) {
        if ((isDrawing === true) && !(this.zw_bool || this.select_bool)) {
            mouse_moving = true;
            mouse2X = e.offsetX;
            mouse2Y = e.offsetY;
            this.draw(false, 0, this.last_mouse1X + mouse2X / this.scaleX - mouse1X / this.scaleX, this.last_mouse1Y + mouse2Y / this.scaleY - mouse1Y / this.scaleY, this.scaleX, this.scaleY);
            this.draw(true, 0, this.last_mouse1X + mouse2X / this.scaleX - mouse1X / this.scaleX, this.last_mouse1Y + mouse2Y / this.scaleY - mouse1Y / this.scaleY, this.scaleX, this.scaleY);
        }
        else if ((isDrawing === true) && (this.zw_bool || this.select_bool)) {
            mouse_moving = true;
            mouse2X = e.offsetX;
            mouse2Y = e.offsetY;
            this.context_show.setLineDash([]);
            this.context_hidden.setLineDash([]);
            this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
            this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
            this.context_show.beginPath();
            this.context_show.lineWidth = 1;
            this.context_show.strokeStyle = 'black';
            this.context_show.setLineDash([5, 5]);
            this.context_show.rect(mouse1X, mouse1Y, mouse2X - mouse1X, mouse2Y - mouse1Y);
            this.context_show.stroke();
            this.context_show.closePath();
            this.context_hidden.beginPath();
            this.context_hidden.lineWidth = 1;
            this.context_hidden.strokeStyle = 'black';
            this.context_hidden.setLineDash([5, 5]);
            this.context_hidden.rect(mouse1X, mouse1Y, mouse2X - mouse1X, mouse2Y - mouse1Y);
            this.context_hidden.stroke();
            this.context_hidden.closePath();
        }
        else {
            var mouseX = e.offsetX;
            var mouseY = e.offsetY;
            var col = this.context_hidden.getImageData(mouseX, mouseY, 1, 1).data;
            var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            this.select_on_mouse = this.colour_to_plot_data[colKey];
            this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
            this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        }
        return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
    };
    PlotData.prototype.mouse_up_interaction = function (mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y) {
        var scale_ceil = 400 * this.init_scale;
        var scale_floor = this.init_scale / 3;
        var click_on_plus = Shape.Is_in_rect(mouse1X, mouse1Y, this.zoom_rect_x, this.zoom_rect_y, this.zoom_rect_w, this.zoom_rect_h);
        var click_on_minus = Shape.Is_in_rect(mouse1X, mouse1Y, this.zoom_rect_x, this.zoom_rect_y + this.zoom_rect_h, this.zoom_rect_w, this.zoom_rect_h);
        var click_on_zoom_window = Shape.Is_in_rect(mouse1X, mouse1Y, this.zw_x, this.zw_y, this.zw_w, this.zw_h);
        var click_on_reset = Shape.Is_in_rect(mouse1X, mouse1Y, this.reset_rect_x, this.reset_rect_y, this.reset_rect_w, this.reset_rect_h);
        var click_on_select = Shape.Is_in_rect(mouse1X, mouse1Y, this.select_x, this.select_y, this.select_w, this.select_h);
        var click_on_graph = false;
        var text_spacing_sum_i = 0;
        for (var i = 0; i < this.nb_graph; i++) {
            var click_on_graph_i = Shape.Is_in_rect(mouse1X, mouse1Y, this.graph1_button_x + i * this.graph1_button_w + text_spacing_sum_i, this.graph1_button_y, this.graph1_button_w, this.graph1_button_h);
            click_on_graph = click_on_graph || click_on_graph_i;
            text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
        }
        var click_on_button = click_on_plus || click_on_minus || click_on_zoom_window || click_on_reset || click_on_select || click_on_graph;
        if (mouse_moving) {
            if (this.zw_bool) {
                this.zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil);
            }
            else if (this.select_bool) {
                this.selection_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y);
            }
            else {
                this.last_mouse1X = this.last_mouse1X + mouse2X / this.scaleX - mouse1X / this.scaleX;
                this.last_mouse1Y = this.last_mouse1Y + mouse2Y / this.scaleY - mouse1Y / this.scaleY;
            }
        }
        else {
            var col = this.context_hidden.getImageData(mouse1X, mouse1Y, 1, 1).data;
            var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            var click_plot_data = this.colour_to_plot_data[colKey];
            if (this.is_include(click_plot_data, this.select_on_click)) {
                this.select_on_click = this.remove_selection(click_plot_data, this.select_on_click);
            }
            else {
                this.select_on_click.push(click_plot_data);
            }
            if (this.tooltip_ON) {
                if (this.is_include(click_plot_data, this.tooltip_list) && (!this.is_include(click_plot_data, this.select_on_click))) {
                    this.tooltip_list = this.remove_selection(click_plot_data, this.tooltip_list);
                }
                else if (!this.is_include(click_plot_data, this.tooltip_list) && this.is_include(click_plot_data, this.select_on_click)) {
                    this.tooltip_list.push(click_plot_data);
                }
            }
            if (this.contains_undefined(this.select_on_click) && !click_on_button) {
                this.select_on_click = [];
                this.tooltip_list = [];
            }
            if ((click_on_plus === true) && (this.scaleX * 1.2 < scale_ceil) && (this.scaleY * 1.2 < scale_ceil)) {
                this.zoom_in_button_action();
            }
            else if ((click_on_minus === true) && (this.scaleX / 1.2 > scale_floor) && (this.scaleY / 1.2 > scale_floor)) {
                this.zoom_out_button_action();
            }
            else if (click_on_zoom_window === true) {
                this.click_on_zoom_window_action();
            }
            else if (click_on_reset === true) {
                this.click_on_reset_action();
            }
            else if (click_on_select === true) {
                this.click_on_selection_button_action();
            }
            else if (click_on_graph) {
                this.graph_button_action(mouse1X, mouse1Y);
            }
            this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        }
        var isDrawing = false;
        mouse_moving = false;
        return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
    };
    PlotData.prototype.wheel_interaction = function (mouse3X, mouse3Y, e) {
        var scale_ceil = 400 * this.init_scale;
        var scale_floor = this.init_scale / 100;
        var zoom_coeff = 1.1;
        var event = -e.deltaY;
        mouse3X = e.offsetX;
        mouse3Y = e.offsetY;
        if ((mouse3Y >= this.height - this.decalage_axis_y) && (mouse3X > this.decalage_axis_x) && this.axis_ON) {
            var old_scaleX = this.scaleX;
            if ((event > 0) && (this.scaleX * zoom_coeff < scale_ceil)) {
                this.scaleX = this.scaleX * zoom_coeff;
                this.scroll_x = this.scroll_x - e.deltaY / Math.abs(e.deltaY);
                this.last_mouse1X = this.last_mouse1X - ((this.width / 2) / old_scaleX - (this.width / 2) / this.scaleX);
            }
            else if ((event < 0) && this.scaleX / zoom_coeff > scale_floor) {
                this.scaleX = this.scaleX / zoom_coeff;
                this.scroll_x = this.scroll_x - e.deltaY / Math.abs(e.deltaY);
                this.last_mouse1X = this.last_mouse1X - ((this.width / 2) / old_scaleX - (this.width / 2) / this.scaleX);
            }
        }
        else if ((mouse3X <= this.decalage_axis_x) && (mouse3Y < this.height - this.decalage_axis_y) && this.axis_ON) {
            var old_scaleY = this.scaleY;
            if ((event > 0) && (this.scaleY * zoom_coeff < scale_ceil)) {
                this.scaleY = this.scaleY * zoom_coeff;
                this.scroll_y = this.scroll_y - e.deltaY / Math.abs(e.deltaY);
                this.last_mouse1Y = this.last_mouse1Y - ((this.height / 2) / old_scaleY - (this.height / 2) / this.scaleY);
            }
            else if ((event < 0) && this.scaleY / zoom_coeff > scale_floor) {
                this.scaleY = this.scaleY / zoom_coeff;
                this.scroll_y = this.scroll_y - e.deltaY / Math.abs(e.deltaY);
                this.last_mouse1Y = this.last_mouse1Y - ((this.height / 2) / old_scaleY - (this.height / 2) / this.scaleY);
            }
        }
        else {
            var old_scaleY = this.scaleY;
            var old_scaleX = this.scaleX;
            if ((event > 0) && (this.scaleX * zoom_coeff < scale_ceil) && (this.scaleY * zoom_coeff < scale_ceil)) {
                this.scaleX = this.scaleX * zoom_coeff;
                this.scaleY = this.scaleY * zoom_coeff;
                this.scroll_x = this.scroll_x - e.deltaY / Math.abs(e.deltaY);
                this.scroll_y = this.scroll_y - e.deltaY / Math.abs(e.deltaY);
                this.last_mouse1X = this.last_mouse1X - (mouse3X / old_scaleX - mouse3X / this.scaleX);
                this.last_mouse1Y = this.last_mouse1Y - (mouse3Y / old_scaleY - mouse3Y / this.scaleY);
            }
            else if ((event < 0) && (this.scaleX / zoom_coeff > scale_floor) && (this.scaleY / zoom_coeff > scale_floor)) {
                this.scaleX = this.scaleX / zoom_coeff;
                this.scaleY = this.scaleY / zoom_coeff;
                this.scroll_x = this.scroll_x - e.deltaY / Math.abs(e.deltaY);
                this.scroll_y = this.scroll_y - e.deltaY / Math.abs(e.deltaY);
                this.last_mouse1X = this.last_mouse1X - (mouse3X / old_scaleX - mouse3X / this.scaleX);
                this.last_mouse1Y = this.last_mouse1Y - (mouse3Y / old_scaleY - mouse3Y / this.scaleY);
            }
        }
        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        return [mouse3X, mouse3Y];
    };
    PlotData.prototype.mouse_move_axis_inversion = function (isDrawing, e, selected_name_index) {
        isDrawing = true;
        this.move_index = selected_name_index;
        if (this.vertical === true) {
            var mouse2X = e.offsetX;
            var axis_x = this.axis_x_start + this.move_index * this.x_step;
            this.draw(false, 0, mouse2X - axis_x, 0, this.scaleX, this.scaleY);
            this.draw(true, 0, mouse2X - axis_x, 0, this.scaleX, this.scaleY);
        }
        else {
            var mouse2Y = e.offsetY;
            var axis_y = this.axis_y_start + this.move_index * this.y_step;
            this.draw(false, 0, mouse2Y - axis_y, 0, this.scaleX, this.scaleY);
            this.draw(true, 0, mouse2Y - axis_y, 0, this.scaleX, this.scaleY);
        }
        return [mouse2X, mouse2Y, isDrawing];
    };
    PlotData.prototype.initialize_click_on_axis = function (nb_axis, mouse1X, mouse1Y, click_on_axis) {
        click_on_axis = false;
        var selected_axis_index = -1;
        for (var i = 0; i < nb_axis; i++) {
            if (this.vertical === true) {
                var current_x = this.axis_x_start + i * this.x_step;
                var bool = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - 5, this.axis_y_end, 10, this.axis_y_start - this.axis_y_end);
            }
            else {
                var current_y = this.axis_y_start + i * this.y_step;
                var bool = Shape.Is_in_rect(mouse1X, mouse1Y, this.axis_x_start, current_y - 5, this.axis_x_end - this.axis_x_start, 10);
            }
            click_on_axis = click_on_axis || bool;
            if (bool) {
                click_on_axis = true;
                selected_axis_index = i;
                break;
            }
        }
        return [click_on_axis, selected_axis_index];
    };
    PlotData.prototype.initialize_click_on_name = function (nb_axis, mouse1X, mouse1Y) {
        var click_on_name = false;
        var selected_name_index = -1;
        for (var i = 0; i < nb_axis; i++) {
            var attribute_name = this.axis_list[i]['name'];
            var text_w = this.context.measureText(attribute_name).width;
            var text_h = parseInt(this.context.font.split('px')[0], 10);
            if (this.vertical === true) {
                var current_x = this.axis_x_start + i * this.x_step;
                click_on_name = click_on_name || Shape.Is_in_rect(mouse1X, mouse1Y, current_x - text_w / 2, this.axis_y_end - 20 - text_h / 2, text_w, text_h);
            }
            else {
                var current_y = this.axis_y_start + i * this.y_step;
                click_on_name = click_on_name || Shape.Is_in_rect(mouse1X, mouse1Y, this.axis_x_start - text_w / 2, current_y + 15 - text_h / 2, text_w, text_h);
            }
            if (click_on_name === true) {
                selected_name_index = i;
                break;
            }
        }
        return [click_on_name, selected_name_index];
    };
    PlotData.prototype.initialize_click_on_bands = function (mouse1X, mouse1Y) {
        var rect_width = 10;
        var border_size = 10;
        var click_on_band = false;
        var click_on_border = false;
        var selected_band_index = -1;
        var selected_border = [];
        for (var i = 0; i < this.rubber_bands.length; i++) {
            if (this.rubber_bands[i].length != 0) {
                if (this.vertical) {
                    var minY = this.rubber_bands[i][0];
                    var maxY = this.rubber_bands[i][1];
                    this.rubber_last_min = minY;
                    this.rubber_last_max = maxY;
                    var real_minY = this.axis_y_end + minY * (this.axis_y_start - this.axis_y_end);
                    var real_maxY = this.axis_y_end + maxY * (this.axis_y_start - this.axis_y_end);
                    var current_x = this.axis_x_start + i * this.x_step;
                    var is_in_upper_border = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - rect_width / 2, real_minY - border_size / 2, rect_width, border_size);
                    var is_in_lower_border = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - rect_width / 2, real_maxY - border_size / 2, rect_width, border_size);
                    var is_in_rubber_band = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - rect_width / 2, real_minY, rect_width, real_maxY - real_minY);
                }
                else {
                    var minX = this.rubber_bands[i][0];
                    var maxX = this.rubber_bands[i][1];
                    this.rubber_last_min = minX;
                    this.rubber_last_max = maxX;
                    var real_minX = this.axis_x_start + minX * (this.axis_x_end - this.axis_x_start);
                    var real_maxX = this.axis_x_start + maxX * (this.axis_x_end - this.axis_x_start);
                    var current_y = this.axis_y_start + i * this.y_step;
                    is_in_upper_border = Shape.Is_in_rect(mouse1X, mouse1Y, real_minX - border_size / 2, current_y - rect_width / 2, border_size, rect_width);
                    is_in_lower_border = Shape.Is_in_rect(mouse1X, mouse1Y, real_maxX - border_size / 2, current_y - rect_width / 2, border_size, rect_width);
                    is_in_rubber_band = Shape.Is_in_rect(mouse1X, mouse1Y, real_minX, current_y - rect_width / 2, real_maxX - real_minX, rect_width);
                }
            }
            if (is_in_upper_border) {
                click_on_border = true;
                selected_border = [i, 0];
                break;
            }
            else if (is_in_lower_border) {
                click_on_border = true;
                selected_border = [i, 1];
                break;
            }
            else if (is_in_rubber_band && !is_in_upper_border && !is_in_lower_border) {
                click_on_band = true;
                selected_band_index = i;
                break;
            }
        }
        return [click_on_band, click_on_border, selected_band_index, selected_border];
    };
    PlotData.prototype.mouse_up_axis_interversion = function (mouse1X, mouse1Y, e) {
        if (this.vertical === true) {
            var mouse3X = e.offsetX;
            if (mouse3X > mouse1X) {
                var new_index = Math.floor((mouse3X - this.axis_x_start) / this.x_step);
            }
            else {
                var new_index = Math.ceil((mouse3X - this.axis_x_start) / this.x_step);
            }
        }
        else {
            var mouse3Y = e.offsetY;
            ;
            if (mouse3Y > mouse1Y) {
                var new_index = Math.floor((mouse3Y - this.axis_y_start) / this.y_step);
            }
            else {
                var new_index = Math.ceil((mouse3Y - this.axis_y_start) / this.y_step);
            }
        }
        // var value:Attribute = this.axis_list[this.move_index].copy();
        // this.axis_list = this.remove_selection(this.axis_list[this.move_index], this.axis_list);
        // this.axis_list.splice(new_index, 0, value);
        // var rubber_band = this.copy_list(this.rubber_bands[this.move_index]);
        // this.rubber_bands = this.remove_selection(this.rubber_bands[this.move_index], this.rubber_bands);
        // this.rubber_bands.splice(new_index, 0, rubber_band);
        this.axis_list = move_elements(this.move_index, new_index, this.axis_list);
        this.rubber_bands = move_elements(this.move_index, new_index, this.rubber_bands);
        this.inverted_axis_list = move_elements(this.move_index, new_index, this.inverted_axis_list);
        this.move_index = -1;
        var click_on_axis = false;
        var mvx = 0;
        var mvy = 0;
        this.refresh_to_display_list(this.elements);
        this.draw(false, 0, mvx, mvy, this.scaleX, this.scaleY);
        this.draw(true, 0, mvx, mvy, this.scaleX, this.scaleY);
        return [mouse3X, mouse3Y, click_on_axis];
    };
    PlotData.prototype.select_title_action = function (selected_name_index) {
        this.inverted_axis_list[selected_name_index] = !this.inverted_axis_list[selected_name_index];
        if (this.rubber_bands[selected_name_index].length != 0) {
            this.invert_rubber_bands([selected_name_index]);
        }
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
    };
    PlotData.prototype.select_axis_action = function (selected_axis_index, click_on_band, click_on_border) {
        if (this.rubber_bands[selected_axis_index].length == 0) {
            var attribute_name = this.axis_list[selected_axis_index]['name'];
            if (attribute_name == this.selected_axis_name) {
                this.selected_axis_name = '';
            }
            else {
                this.selected_axis_name = attribute_name;
            }
        }
        else if ((this.rubber_bands[selected_axis_index].length != 0) && !click_on_band && !click_on_border) {
            this.rubber_bands[selected_axis_index] = [];
        }
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
    };
    PlotData.prototype.rubber_band_size_check = function (selected_axis_index) {
        if (this.rubber_bands[selected_axis_index].length != 0 && Math.abs(this.rubber_bands[selected_axis_index][0] - this.rubber_bands[selected_axis_index][1]) <= 0.02) {
            this.rubber_bands[selected_axis_index] = [];
        }
        this.draw(false, 0, 0, 0, this.scaleX, this.scaleY);
        this.draw(true, 0, 0, 0, this.scaleX, this.scaleY);
        var isDrawing_rubber_band = false;
        var is_resizing = false;
        return [isDrawing_rubber_band, is_resizing];
    };
    PlotData.prototype.mouse_up_interaction_pp = function (click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, isDrawing_rubber_band, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e) {
        var _a, _b;
        var mouseX = e.offsetX;
        var mouseY = e.offsetY;
        var click_on_disp = Shape.Is_in_rect(mouseX, mouseY, this.disp_x, this.disp_y, this.disp_w, this.disp_h);
        if (click_on_axis && !mouse_moving) {
            this.select_axis_action(selected_axis_index, click_on_band, click_on_border);
        }
        else if (click_on_name && mouse_moving) {
            _a = this.mouse_up_axis_interversion(mouse1X, mouse1Y, e), mouse3X = _a[0], mouse3Y = _a[1], click_on_axis = _a[2];
        }
        else if (click_on_name && !mouse_moving) {
            this.select_title_action(selected_name_index);
        }
        else if (isDrawing_rubber_band || is_resizing) {
            _b = this.rubber_band_size_check(selected_axis_index), isDrawing_rubber_band = _b[0], is_resizing = _b[1];
        }
        if (click_on_disp) {
            this.change_disposition_action();
        }
        mouse_moving = false;
        isDrawing = false;
        return [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, isDrawing_rubber_band, is_resizing];
    };
    PlotData.prototype.mouse_interaction = function (parallelplot) {
        var _this = this;
        var isDrawing = false;
        var mouse_moving = false;
        var mouse1X = 0;
        var mouse1Y = 0;
        var mouse2X = 0;
        var mouse2Y = 0;
        var mouse3X = 0;
        var mouse3Y = 0;
        var click_on_axis = false;
        var selected_axis_index = -1;
        var click_on_name = false;
        var selected_name_index = -1;
        var click_on_band = false;
        var click_on_border = false;
        var selected_band_index = -1;
        var selected_border = [];
        var isDrawing_rubber_band = false;
        var is_resizing = false;
        var canvas = document.getElementById('canvas');
        canvas.addEventListener('mousedown', function (e) {
            var _a, _b, _c, _d;
            _a = _this.mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e), mouse1X = _a[0], mouse1Y = _a[1], mouse2X = _a[2], mouse2Y = _a[3], isDrawing = _a[4];
            if (parallelplot) {
                _b = _this.initialize_click_on_axis(_this.axis_list.length, mouse1X, mouse1Y, click_on_axis), click_on_axis = _b[0], selected_axis_index = _b[1];
                _c = _this.initialize_click_on_name(_this.axis_list.length, mouse1X, mouse1Y), click_on_name = _c[0], selected_name_index = _c[1];
                _d = _this.initialize_click_on_bands(mouse1X, mouse1Y), click_on_band = _d[0], click_on_border = _d[1], selected_band_index = _d[2], selected_border = _d[3];
            }
        });
        canvas.addEventListener('mousemove', function (e) {
            var _a, _b, _c, _d, _e;
            if (parallelplot) {
                if (isDrawing) {
                    mouse_moving = true;
                    if (click_on_name) {
                        _a = _this.mouse_move_axis_inversion(isDrawing, e, selected_name_index), mouse2X = _a[0], mouse2Y = _a[1], isDrawing = _a[2];
                    }
                    else if (click_on_axis && !click_on_band && !click_on_border) {
                        _b = _this.create_rubber_band(mouse1X, mouse1Y, selected_axis_index, e), isDrawing_rubber_band = _b[0], mouse2X = _b[1], mouse2Y = _b[2];
                    }
                    else if (click_on_band) {
                        _c = _this.rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e), mouse2X = _c[0], mouse2Y = _c[1];
                    }
                    else if (click_on_border) {
                        _d = _this.rubber_band_resize(mouse1X, mouse1Y, selected_border, e), selected_border[1] = _d[0], mouse2X = _d[1], mouse2Y = _d[2], is_resizing = _d[3];
                    }
                }
            }
            else {
                _e = _this.mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e), isDrawing = _e[0], mouse_moving = _e[1], mouse1X = _e[2], mouse1Y = _e[3], mouse2X = _e[4], mouse2Y = _e[5];
            }
        });
        canvas.addEventListener('mouseup', function (e) {
            var _a, _b;
            if (parallelplot) {
                _a = _this.mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, isDrawing_rubber_band, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e), mouse3X = _a[0], mouse3Y = _a[1], click_on_axis = _a[2], isDrawing = _a[3], mouse_moving = _a[4], isDrawing_rubber_band = _a[5], is_resizing = _a[6];
            }
            else {
                _b = _this.mouse_up_interaction(mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y), isDrawing = _b[0], mouse_moving = _b[1], mouse1X = _b[2], mouse1Y = _b[3], mouse2X = _b[4], mouse2Y = _b[5];
            }
        });
        canvas.addEventListener('wheel', function (e) {
            var _a;
            if (!parallelplot) {
                _a = _this.wheel_interaction(mouse3X, mouse3Y, e), mouse3X = _a[0], mouse3Y = _a[1];
            }
        });
    };
    PlotData.prototype.contains_undefined = function (list) {
        for (var i = 0; i < list.length; i++) {
            if (typeof list[i] === "undefined") {
                return true;
            }
        }
        return false;
    };
    PlotData.prototype.remove_selection = function (val, list) {
        var temp = [];
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            if (val != d) {
                temp.push(d);
            }
        }
        return temp;
    };
    PlotData.prototype.is_include = function (val, list) {
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            if (val == d) {
                return true;
            }
        }
        return false;
    };
    PlotData.prototype.get_nb_points_inside_canvas = function (list_points, mvx, mvy) {
        var bool = true;
        var k = 0;
        var index_first_in = -1;
        var nb_points_in = 0;
        var index_last_in = -1;
        while ((k < list_points.length) && bool) {
            var x = this.scaleX * (1000 * list_points[k].cx + mvx);
            var y = this.scaleY * (1000 * list_points[k].cy + mvy);
            var is_inside_canvas = (x >= 0) && (x <= this.width) && (y >= 0) && (y <= this.height);
            if (is_inside_canvas === true) {
                index_first_in = k;
                bool = false;
            }
            else {
                k++;
            }
        }
        if (index_first_in == -1) {
            return [index_first_in, nb_points_in, index_last_in];
        }
        while (k < list_points.length) {
            var x = this.scaleX * (1000 * list_points[k].cx + mvx);
            var y = this.scaleY * (1000 * list_points[k].cy + mvy);
            var is_inside_canvas = (x >= 0) && (x <= this.width) && (y >= 0) && (y <= this.height);
            if (is_inside_canvas === true) {
                index_last_in = k;
                nb_points_in++;
            }
            k++;
        }
        return [index_first_in, nb_points_in, index_last_in];
    };
    PlotData.prototype.is_inside_canvas = function (point, mvx, mvy) {
        var x = this.scaleX * (1000 * point.cx + mvx);
        var y = this.scaleY * (1000 * point.cy + mvy);
        length = 100 * point.size;
        return (x + length >= 0) && (x <= this.width - length) && (y + length >= 0) && (y - length <= this.height);
    };
    PlotData.prototype.get_points_inside_canvas = function (list_points, mvx, mvy) {
        var new_list_points = [];
        for (var i = 0; i < list_points.length; i++) {
            if (this.is_inside_canvas(list_points[i], mvx, mvy)) {
                new_list_points.push(list_points[i]);
            }
        }
        return new_list_points;
    };
    PlotData.prototype.distance = function (p1, p2) {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    };
    PlotData.prototype.copy_list = function (list) {
        var new_list = [];
        for (var i = 0; i < list.length; i++) {
            new_list.push(list[i]);
        }
        return new_list;
    };
    PlotData.prototype.hashing_point = function (point, nb_x, nb_y, mvx, mvy) {
        var x_step = this.width / nb_x;
        var y_step = this.height / nb_y;
        var x = this.scaleX * (1000 * point.cx + mvx);
        var y = this.scaleY * (1000 * point.cy + mvy);
        var i = Math.ceil(x / x_step);
        var j = Math.ceil(y / y_step);
        var key = 100 * i + j;
        return [key, point];
    };
    PlotData.prototype.hashing_list = function (point_list, nb_x, nb_y, mvx, mvy) {
        var dict = [];
        for (var k = 0; k < point_list.length; k++) {
            var point_dict = this.hashing_point(point_list[k], nb_x, nb_y, mvx, mvy);
            dict.push(point_dict);
        }
        return dict;
    };
    PlotData.prototype.dehashing_list = function (hashed_point_list) {
        var point_list = [];
        for (var i = 0; i < hashed_point_list.length; i++) {
            point_list.push(hashed_point_list[i][1]);
        }
        return point_list;
    };
    PlotData.prototype.refresh_point_list = function (point_list, mvx, mvy) {
        var new_point_list = this.copy_list(point_list);
        var i = 0;
        var length = new_point_list.length;
        while (i < length) {
            var size_i = new_point_list[i].size;
            var xi = this.scaleX * (1000 * new_point_list[i].cx + mvx);
            var yi = this.scaleY * (1000 * new_point_list[i].cy + mvy);
            var bool = false;
            var j = i + 1;
            while (j < length) {
                var size_j = new_point_list[j].size;
                if (size_i >= size_j) {
                    var max_size_index = i;
                }
                else {
                    var max_size_index = j;
                }
                var xj = this.scaleX * (1000 * new_point_list[j].cx + mvx);
                var yj = this.scaleY * (1000 * new_point_list[j].cy + mvy);
                if (this.distance([xi, yi], [xj, yj]) < 1000 * (new_point_list[i].size + new_point_list[j].size)) {
                    var new_cx = (new_point_list[i].cx + new_point_list[j].cx) / 2;
                    var new_cy = (new_point_list[i].cy + new_point_list[j].cy) / 2;
                    var new_shape = new_point_list[i].shape;
                    var new_point_size = new_point_list[i].point_size;
                    var new_color_fill = new_point_list[i].color_fill;
                    var new_color_stroke = new_point_list[i].color_stroke;
                    var new_stroke_width = new_point_list[i].stroke_width;
                    var point = new PlotDataPoint2D(new_cx, new_cy, new_shape, new_point_size, new_color_fill, new_color_stroke, new_stroke_width, 'point', '');
                    var size_coeff = 1.15;
                    point.size = new_point_list[max_size_index].size * size_coeff;
                    var point_i = new_point_list[i];
                    var point_j = new_point_list[j];
                    this.delete_clicked_points([point_i, point_j]);
                    this.delete_tooltip([point_i, point_j]);
                    new_point_list = this.remove_selection(new_point_list[i], new_point_list);
                    new_point_list = this.remove_selection(new_point_list[j - 1], new_point_list);
                    new_point_list.push(point);
                    this.colour_to_plot_data[point.mouse_selection_color] = point;
                    bool = true;
                    break;
                }
                else {
                    j++;
                }
            }
            if (bool) {
                length--;
            }
            else {
                i++;
            }
        }
        return new_point_list;
    };
    PlotData.prototype.delete_clicked_points = function (point_list) {
        var i = 0;
        while (i < this.select_on_click.length) {
            if (this.is_include(this.select_on_click[i], point_list)) {
                this.select_on_click = this.remove_selection(this.select_on_click[i], this.select_on_click);
            }
            else {
                i++;
            }
        }
    };
    PlotData.prototype.delete_tooltip = function (point_list) {
        var i = 0;
        while (i < this.tooltip_list.length) {
            if (this.is_include(this.tooltip_list[i], point_list)) {
                this.tooltip_list = this.remove_selection(this.tooltip_list[i], this.tooltip_list);
            }
            else {
                i++;
            }
        }
    };
    PlotData.prototype.is_intersecting = function (seg1, seg2) {
        var p0 = seg1[0];
        var p1 = seg1[1];
        var q0 = seg2[0];
        var q1 = seg2[1];
        if (this.vertical === true && ((p0[1] < q0[1] && p1[1] > q1[1]) || (p0[1] > q0[1] && p1[1] < q1[1]))) {
            return true;
        }
        else if (this.vertical === false && ((p0[0] < q0[0] && p1[0] > q1[0]) || (p0[0] > q0[0] && p1[0] < q1[0]))) {
            return true;
        }
        return false;
    };
    PlotData.prototype.counting_intersections = function (segments) {
        if (segments.length < 2) {
            return 0;
        }
        var nb = 0;
        for (var i = 1; i < segments.length; i++) {
            for (var j = 0; j < i; j++) {
                if (this.is_intersecting(segments[i], segments[j])) {
                    nb++;
                }
            }
        }
        return nb;
    };
    return PlotData;
}());
exports.PlotData = PlotData;
var PlotContour = /** @class */ (function (_super) {
    __extends(PlotContour, _super);
    function PlotContour(data, width, height, coeff_pixel) {
        var _this = _super.call(this, data, width, height, coeff_pixel) || this;
        _this.data = data;
        _this.width = width;
        _this.height = height;
        _this.coeff_pixel = coeff_pixel;
        _this.plot_datas = [];
        for (var i = 0; i < data.length; i++) {
            var d = _this.data[i];
            var a = PlotDataContour2D.deserialize(d);
            if (isNaN(_this.minX)) {
                _this.minX = a.minX;
            }
            else {
                _this.minX = Math.min(_this.minX, a.minX);
            }
            ;
            if (isNaN(_this.maxX)) {
                _this.maxX = a.maxX;
            }
            else {
                _this.maxX = Math.max(_this.maxX, a.maxX);
            }
            ;
            if (isNaN(_this.minY)) {
                _this.minY = a.minY;
            }
            else {
                _this.minY = Math.min(_this.minY, a.minY);
            }
            ;
            if (isNaN(_this.maxY)) {
                _this.maxY = a.maxY;
            }
            else {
                _this.maxY = Math.max(_this.maxY, a.maxY);
            }
            ;
            _this.colour_to_plot_data[a.mouse_selection_color] = a;
            _this.plot_datas.push(a);
        }
        _this.define_canvas();
        _this.mouse_interaction(false);
        return _this;
    }
    PlotContour.prototype.draw = function (hidden, show_state, mvx, mvy, scaleX, scaleY) {
        this.draw_empty_canvas(hidden);
        for (var i = 0; i < this.plot_datas.length; i++) {
            var d = this.plot_datas[i];
            this.draw_contour(hidden, show_state, mvx, mvy, scaleX, scaleY, d);
        }
    };
    return PlotContour;
}(PlotData));
exports.PlotContour = PlotContour;
var PlotScatter = /** @class */ (function (_super) {
    __extends(PlotScatter, _super);
    function PlotScatter(data, width, height, coeff_pixel) {
        var _this = _super.call(this, data, width, height, coeff_pixel) || this;
        _this.data = data;
        _this.width = width;
        _this.height = height;
        _this.coeff_pixel = coeff_pixel;
        if (_this.buttons_ON) {
            _this.zoom_rect_x = _this.width - 45;
            _this.zoom_rect_y = 10;
            _this.zoom_rect_w = 35;
            _this.zoom_rect_h = 25;
            _this.zw_x = _this.width - 45;
            _this.zw_y = 70;
            _this.zw_w = 35;
            _this.zw_h = 30;
            _this.reset_rect_x = _this.width - 45;
            _this.reset_rect_y = 110;
            _this.reset_rect_w = 35;
            _this.reset_rect_h = 30;
            _this.select_x = _this.width - 45;
            _this.select_y = 150;
            _this.select_w = 35;
            _this.select_h = 30;
            _this.graph1_button_y = 10;
            _this.graph1_button_w = 30;
            _this.graph1_button_h = 15;
        }
        _this.plot_datas = [];
        var graphID = 0;
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var a;
            if (d['type'] == 'point') {
                a = PlotDataPoint2D.deserialize(d);
                if (isNaN(_this.minX)) {
                    _this.minX = a.minX;
                }
                else {
                    _this.minX = Math.min(_this.minX, a.minX);
                }
                ;
                if (isNaN(_this.maxX)) {
                    _this.maxX = a.maxX;
                }
                else {
                    _this.maxX = Math.max(_this.maxX, a.maxX);
                }
                ;
                if (isNaN(_this.minY)) {
                    _this.minY = a.minY;
                }
                else {
                    _this.minY = Math.min(_this.minY, a.minY);
                }
                ;
                if (isNaN(_this.maxY)) {
                    _this.maxY = a.maxY;
                }
                else {
                    _this.maxY = Math.max(_this.maxY, a.maxY);
                }
                ;
                _this.colour_to_plot_data[a.mouse_selection_color] = a;
                _this.plot_datas.push(a);
            }
            else if (d['type'] == 'axis') {
                _this.axis_ON = true;
                a = PlotDataAxis.deserialize(d);
                _this.plot_datas.push(a);
            }
            else if (d['type'] == 'tooltip') {
                a = PlotDataTooltip.deserialize(d);
                _this.plot_datas.push(a);
            }
            else if (d['type'] == 'graph2D') {
                _this.graph_ON = true;
                a = PlotDataGraph2D.deserialize(d);
                a.id = graphID;
                graphID++;
                _this.graph_colorlist.push(a.point_list[0].color_fill);
                _this.graph_to_display.push(true);
                _this.graph_name_list.push(a.name);
                for (var j = 0; j < a.point_list.length; j++) {
                    var point = a.point_list[j];
                    if (isNaN(_this.minX)) {
                        _this.minX = point.minX;
                    }
                    else {
                        _this.minX = Math.min(_this.minX, point.minX);
                    }
                    ;
                    if (isNaN(_this.maxX)) {
                        _this.maxX = point.maxX;
                    }
                    else {
                        _this.maxX = Math.max(_this.maxX, point.maxX);
                    }
                    ;
                    if (isNaN(_this.minY)) {
                        _this.minY = point.minY;
                    }
                    else {
                        _this.minY = Math.min(_this.minY, point.minY);
                    }
                    ;
                    if (isNaN(_this.maxY)) {
                        _this.maxY = point.maxY;
                    }
                    else {
                        _this.maxY = Math.max(_this.maxY, point.maxY);
                    }
                    ;
                    _this.colour_to_plot_data[point.mouse_selection_color] = point;
                }
                _this.plot_datas.push(a);
            }
            else if (d['type'] == 'ScatterPlot') {
                a = PlotDataScatter.deserialize(d);
                for (var j = 0; j < a.point_list.length; j++) {
                    var point = a.point_list[j];
                    if (isNaN(_this.minX)) {
                        _this.minX = point.minX;
                    }
                    else {
                        _this.minX = Math.min(_this.minX, point.minX);
                    }
                    ;
                    if (isNaN(_this.maxX)) {
                        _this.maxX = point.maxX;
                    }
                    else {
                        _this.maxX = Math.max(_this.maxX, point.maxX);
                    }
                    ;
                    if (isNaN(_this.minY)) {
                        _this.minY = point.minY;
                    }
                    else {
                        _this.minY = Math.min(_this.minY, point.minY);
                    }
                    ;
                    if (isNaN(_this.maxY)) {
                        _this.maxY = point.maxY;
                    }
                    else {
                        _this.maxY = Math.max(_this.maxY, point.maxY);
                    }
                    ;
                    _this.colour_to_plot_data[point.mouse_selection_color] = point;
                }
                _this.plot_datas.push(a);
            }
        }
        _this.nb_graph = graphID;
        _this.define_canvas();
        _this.mouse_interaction(false);
        return _this;
    }
    PlotScatter.prototype.draw = function (hidden, show_state, mvx, mvy, scaleX, scaleY) {
        this.draw_empty_canvas(hidden);
        for (var i = 0; i < this.plot_datas.length; i++) {
            var d = this.plot_datas[i];
            this.draw_graph2D(d, hidden, mvx, mvy);
            this.draw_scatterplot(d, hidden, mvx, mvy);
            this.draw_point(hidden, show_state, mvx, mvy, scaleX, scaleY, d);
            this.draw_axis(mvx, mvy, scaleX, scaleY, d);
            this.draw_tooltip(d, mvx, mvy);
        }
        if (this.buttons_ON) {
            //Drawing the zooming button 
            this.zoom_button(this.zoom_rect_x, this.zoom_rect_y, this.zoom_rect_w, this.zoom_rect_h);
            //Drawing the button for zooming window selection
            this.zoom_window_button(this.zw_x, this.zw_y, this.zw_w, this.zw_h);
            //Drawing the reset button
            this.reset_button(this.reset_rect_x, this.reset_rect_y, this.reset_rect_w, this.reset_rect_h);
            //Drawing the selection button
            this.selection_button(this.select_x, this.select_y, this.select_w, this.select_h);
            //Drawing the enable/disable graph button
            this.graph_buttons(this.graph1_button_y, this.graph1_button_w, this.graph1_button_h, '10px Arial');
        }
    };
    return PlotScatter;
}(PlotData));
exports.PlotScatter = PlotScatter;
var ParallelPlot = /** @class */ (function (_super) {
    __extends(ParallelPlot, _super);
    function ParallelPlot(data, width, height, coeff_pixel) {
        var _this = _super.call(this, data, width, height, coeff_pixel) || this;
        _this.data = data;
        _this.width = width;
        _this.height = height;
        _this.coeff_pixel = coeff_pixel;
        if (_this.buttons_ON) {
            _this.disp_x = _this.width - 35;
            _this.disp_y = _this.height - 25;
            _this.disp_w = 30;
            _this.disp_h = 20;
        }
        var data_show = data[0];
        _this.parallel_plot_lineColor = data_show['line_color'];
        _this.parallel_plot_linewidth = data_show['line_width'];
        _this.elements = data_show['elements'];
        var to_disp_attribute_names = data_show['to_disp_attributes'];
        if (data_show['disposition'] == 'vertical') {
            _this.vertical = true;
        }
        else if (data_show['disposition'] == 'horizontal') {
            _this.vertical = false;
        }
        else {
            throw new Error('Axis disposition must be vertical or horizontal');
        }
        var serialized_attribute_list = data_show['attribute_list'];
        for (var i = 0; i < serialized_attribute_list.length; i++) {
            _this.attribute_list.push(Attribute.deserialize(serialized_attribute_list[i]));
        }
        _this.initialize_attribute_list(_this.elements);
        _this.add_to_axis_list(to_disp_attribute_names);
        _this.initialize_data_lists();
        var nb_axis = _this.axis_list.length;
        if (nb_axis <= 1) {
            throw new Error('At least 2 axis are required');
        }
        ;
        _this.refresh_axis_bounds(nb_axis);
        _this.refresh_to_display_list(_this.elements);
        _this.define_canvas();
        _this.mouse_interaction(true);
        return _this;
    }
    ParallelPlot.prototype.initialize_attribute_list = function (elements) {
        for (var i = 0; i < this.attribute_list.length; i++) {
            var attribute_name = this.attribute_list[i]['name'];
            var type = this.attribute_list[i]['type'];
            var value = [attribute_name, type];
            if (type == 'float') {
                var min = this.elements[0][attribute_name];
                var max = this.elements[0][attribute_name];
                for (var j = 0; j < this.elements.length; j++) {
                    var elt = this.elements[j][attribute_name];
                    if (elt < min) {
                        min = elt;
                    }
                    if (elt > max) {
                        max = elt;
                    }
                }
                this.attribute_list[i]['list'] = [min, max];
            }
            else { //ie string
                var list = [];
                for (var j = 0; j < this.elements.length; j++) {
                    if (type == 'color') {
                        var elt = rgb_to_string(this.elements[j][attribute_name]);
                    }
                    else {
                        var elt = this.elements[j][attribute_name];
                    }
                    if (!this.is_include(elt, list)) {
                        list.push(elt);
                    }
                }
                this.attribute_list[i]['list'] = list;
            }
        }
    };
    ParallelPlot.prototype.draw_initial = function () {
        this.init_scale = 1;
        this.scale = 1;
        this.scaleX = 1;
        this.scaleY = 1;
        this.last_mouse1X = 0;
        this.last_mouse1Y = 0;
        this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
    };
    ParallelPlot.prototype.draw = function (hidden, show_state, mvx, mvy, scaleX, scaleY) {
        this.draw_empty_canvas(hidden);
        this.draw_rubber_bands(mvx);
        var nb_axis = this.axis_list.length;
        this.draw_parallel_coord_lines(nb_axis);
        this.draw_parallel_axis(nb_axis, mvx);
        if (this.buttons_ON) {
            this.disp_button(this.disp_x, this.disp_y, this.disp_w, this.disp_h, '10px Arial');
        }
    };
    ParallelPlot.prototype.initialize_data_lists = function () {
        for (var i = 0; i < this.axis_list.length; i++) {
            this.inverted_axis_list.push(false);
            this.rubber_bands.push([]);
        }
    };
    return ParallelPlot;
}(PlotData));
exports.ParallelPlot = ParallelPlot;
var PlotDataContour2D = /** @class */ (function () {
    function PlotDataContour2D(plot_data_primitives, plot_data_states, type, name) {
        this.plot_data_primitives = plot_data_primitives;
        this.plot_data_states = plot_data_states;
        this.type = type;
        this.name = name;
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        for (var i = 0; i < this.plot_data_primitives.length; i++) {
            var d = plot_data_primitives[i];
            this.minX = Math.min(this.minX, d.minX);
            this.maxX = Math.max(this.maxX, d.maxX);
            this.minY = Math.min(this.minY, d.minY);
            this.maxY = Math.max(this.maxY, d.maxY);
        }
        this.mouse_selection_color = genColor();
    }
    PlotDataContour2D.deserialize = function (serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            plot_data_states.push(PlotDataState.deserialize(d));
        }
        var temp = serialized['plot_data_primitives'];
        var plot_data_primitives = [];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            if (d['type'] == 'line') {
                plot_data_primitives.push(PlotDataLine2D.deserialize(d));
            }
            if (d['type'] == 'circle') {
                plot_data_primitives.push(PlotDataCircle2D.deserialize(d));
            }
            if (d['type'] == 'arc') {
                plot_data_primitives.push(PlotDataArc2D.deserialize(d));
            }
        }
        return new PlotDataContour2D(plot_data_primitives, plot_data_states, serialized['type'], serialized['name']);
    };
    return PlotDataContour2D;
}());
exports.PlotDataContour2D = PlotDataContour2D;
var PlotDataLine2D = /** @class */ (function () {
    function PlotDataLine2D(data, plot_data_states, type, name) {
        this.data = data;
        this.plot_data_states = plot_data_states;
        this.type = type;
        this.name = name;
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        this.minX = Math.min(this.data[0], this.data[2]);
        this.maxX = Math.max(this.data[0], this.data[2]);
        this.minY = Math.min(this.data[1], this.data[3]);
        this.maxY = Math.max(this.data[1], this.data[3]);
    }
    PlotDataLine2D.deserialize = function (serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataLine2D(serialized['data'], plot_data_states, serialized['type'], serialized['name']);
    };
    PlotDataLine2D.prototype.draw = function (context, first_elem, mvx, mvy, scaleX, scaleY) {
        if (first_elem) {
            context.moveTo(scaleX * (1000 * this.data[0] + mvx), scaleY * (1000 * this.data[1] + mvy));
        }
        context.lineTo(scaleX * (1000 * this.data[2] + mvx), scaleY * (1000 * this.data[3] + mvy));
    };
    return PlotDataLine2D;
}());
exports.PlotDataLine2D = PlotDataLine2D;
var PlotDataCircle2D = /** @class */ (function () {
    function PlotDataCircle2D(data, cx, cy, r, plot_data_states, type, name) {
        this.data = data;
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.plot_data_states = plot_data_states;
        this.type = type;
        this.name = name;
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        this.minX = this.cx - this.r;
        this.maxX = this.cx + this.r;
        this.minY = this.cy - this.r;
        this.maxY = this.cy + this.r;
    }
    PlotDataCircle2D.deserialize = function (serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataCircle2D(serialized['data'], serialized['cx'], serialized['cy'], serialized['r'], plot_data_states, serialized['type'], serialized['name']);
    };
    PlotDataCircle2D.prototype.draw = function (context, first_elem, mvx, mvy, scaleX, scaleY) {
        context.arc(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), scaleX * 1000 * this.r, 0, 2 * Math.PI);
    };
    return PlotDataCircle2D;
}());
exports.PlotDataCircle2D = PlotDataCircle2D;
var PlotDataPoint2D = /** @class */ (function () {
    function PlotDataPoint2D(cx, cy, shape, point_size, color_fill, color_stroke, stroke_width, type, name) {
        this.cx = cx;
        this.cy = cy;
        this.shape = shape;
        this.point_size = point_size;
        this.color_fill = color_fill;
        this.color_stroke = color_stroke;
        this.stroke_width = stroke_width;
        this.type = type;
        this.name = name;
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        this.k = 1;
        if (point_size < 1) {
            throw new Error('Invalid point_size');
        }
        this.size = this.k * point_size / 400;
        this.minX = this.cx - 2.5 * this.size;
        this.maxX = this.cx + 2.5 * this.size;
        this.minY = this.cy - 5 * this.size;
        this.maxY = this.cy + 5 * this.size;
        this.mouse_selection_color = genColor();
    }
    PlotDataPoint2D.deserialize = function (serialized) {
        return new PlotDataPoint2D(serialized['cx'], serialized['cy'], serialized['shape'], serialized['size'], rgb_to_hex(serialized['color_fill']), rgb_to_hex(serialized['color_stroke']), serialized['stroke_width'], serialized['type'], serialized['name']);
    };
    PlotDataPoint2D.prototype.draw = function (context, context_hidden, mvx, mvy, scaleX, scaleY) {
        var show_states = 0;
        if (this.shape == 'circle') {
            context.arc(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), 1000 * this.size, 0, 2 * Math.PI);
            context.stroke();
        }
        else if (this.shape == 'square') {
            context.rect(scaleX * (1000 * this.cx + mvx) - 1000 * this.size, scaleY * (1000 * this.cy + mvy) - 1000 * this.size, 1000 * this.size * 2, 1000 * this.size * 2);
            context.stroke();
        }
        else if (this.shape == 'crux') {
            context.rect(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), 1000 * this.size, 100 * this.size);
            context.rect(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), -1000 * this.size, 100 * this.size);
            context.rect(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), 100 * this.size, 1000 * this.size);
            context.rect(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), 100 * this.size, -1000 * this.size);
            context.fillStyle = context.strokeStyle;
            context.stroke();
            context_hidden.beginPath();
            context_hidden.arc(scaleX * (1000 * this.cx + mvx), scaleY * (1000 * this.cy + mvy), 1000 * this.size, 0, 2 * Math.PI);
            context_hidden.stroke();
            context_hidden.closePath();
        }
        else {
            throw new Error('Invalid shape for point');
        }
    };
    PlotDataPoint2D.prototype.copy = function () {
        return new PlotDataPoint2D(this.cx, this.cy, this.shape, this.point_size, this.color_fill, this.color_stroke, this.stroke_width, this.type, this.name);
    };
    return PlotDataPoint2D;
}());
exports.PlotDataPoint2D = PlotDataPoint2D;
var PlotDataAxis = /** @class */ (function () {
    function PlotDataAxis(nb_points_x, nb_points_y, font_size, graduation_color, axis_color, name, arrow_on, axis_width, grid_on, type) {
        this.nb_points_x = nb_points_x;
        this.nb_points_y = nb_points_y;
        this.font_size = font_size;
        this.graduation_color = graduation_color;
        this.axis_color = axis_color;
        this.name = name;
        this.arrow_on = arrow_on;
        this.axis_width = axis_width;
        this.grid_on = grid_on;
        this.type = type;
    }
    PlotDataAxis.deserialize = function (serialized) {
        return new PlotDataAxis(serialized['nb_points_x'], serialized['nb_points_y'], serialized['font_size'], rgb_to_hex(serialized['graduation_color']), rgb_to_hex(serialized['axis_color']), serialized['name'], serialized['arrow_on'], serialized['axis_width'], serialized['grid_on'], serialized['type']);
    };
    PlotDataAxis.prototype.draw_graduations = function (context, mvx, mvy, scaleX, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, minY, maxY, x_step, y_step, font_size) {
        //pour l'axe des x
        var i = 0;
        context.textAlign = 'center';
        var x_nb_digits = Math.max(0, 1 - Math.floor(MyMath.log10(x_step)));
        var delta_x = maxX - minX;
        var grad_beg_x = minX - 10 * delta_x;
        var grad_end_x = maxX + 10 * delta_x;
        while (grad_beg_x + i * x_step < grad_end_x) {
            if ((scaleX * (1000 * (grad_beg_x + i * x_step) + mvx) > axis_x_start) && (scaleX * (1000 * (grad_beg_x + i * x_step) + mvx) < axis_x_end)) {
                if (this.grid_on === true) {
                    context.strokeStyle = 'lightgrey';
                    Shape.drawLine(context, [[scaleX * (1000 * (grad_beg_x + i * x_step) + mvx), axis_y_start], [scaleX * (1000 * (grad_beg_x + i * x_step) + mvx), axis_y_end + 3]]);
                }
                else {
                    Shape.drawLine(context, [[scaleX * (1000 * (grad_beg_x + i * x_step) + mvx), axis_y_end - 3], [scaleX * (1000 * (grad_beg_x + i * x_step) + mvx), axis_y_end + 3]]);
                }
                context.fillText(MyMath.round(grad_beg_x + i * x_step, x_nb_digits), scaleX * (1000 * (grad_beg_x + i * x_step) + mvx), axis_y_end + font_size);
            }
            i++;
        }
        //pour l'axe des y
        i = 0;
        var real_minY = -maxY;
        var real_maxY = -minY;
        var delta_y = maxY - minY;
        var grad_beg_y = real_minY - 10 * delta_y;
        var grad_end_y = real_maxY + 10 * delta_y;
        context.textAlign = 'end';
        context.textBaseline = 'middle';
        var y_nb_digits = Math.max(0, 1 - Math.floor(MyMath.log10(y_step)));
        while (grad_beg_y + (i - 1) * y_step < grad_end_y) {
            if ((scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy) > axis_y_start) && (scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy) < axis_y_end)) {
                if (this.grid_on === true) {
                    context.strokeStyle = 'lightgrey';
                    Shape.drawLine(context, [[axis_x_start - 3, scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy)], [axis_x_end, scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy)]]);
                }
                else {
                    Shape.drawLine(context, [[axis_x_start - 3, scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy)], [axis_x_start + 3, scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy)]]);
                }
                context.fillText(MyMath.round(grad_beg_y + i * y_step, y_nb_digits), axis_x_start - 5, scaleY * (-1000 * (grad_beg_y + i * y_step) + mvy));
            }
            i++;
        }
        context.stroke();
    };
    PlotDataAxis.prototype.draw = function (context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, minX, maxX, minY, maxY, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y) {
        // Dessin du repère
        context.beginPath();
        context.strokeStyle = this.axis_color;
        context.lineWidth = this.axis_width;
        var axis_x_start = decalage_axis_x;
        var axis_x_end = width;
        var axis_y_start = 0;
        var axis_y_end = height - decalage_axis_y;
        //Flèches
        if (this.arrow_on === true) {
            Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
            Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);
            Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
            Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
        }
        //Axes
        Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);
        Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);
        context.stroke();
        //Graduations
        if (scroll_x % 5 == 0) {
            var kx = 1.1 * scaleX / init_scaleX;
            this.x_step = (maxX - minX) / (kx * (this.nb_points_x - 1));
        }
        if (scroll_y % 5 == 0) {
            var ky = 1.1 * scaleY / init_scaleY;
            this.y_step = (maxY - minY) / (ky * (this.nb_points_y - 1));
        }
        context.font = this.font_size.toString() + 'px Arial';
        context.fillStyle = this.graduation_color;
        context.strokeStyle = this.axis_color;
        this.draw_graduations(context, mvx, mvy, scaleX, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, minY, maxY, this.x_step, this.y_step, this.font_size);
        context.closePath();
    };
    return PlotDataAxis;
}());
exports.PlotDataAxis = PlotDataAxis;
var PlotDataTooltip = /** @class */ (function () {
    function PlotDataTooltip(colorfill, text_color, font, tp_radius, to_plot_list, opacity, type, name) {
        this.colorfill = colorfill;
        this.text_color = text_color;
        this.font = font;
        this.tp_radius = tp_radius;
        this.to_plot_list = to_plot_list;
        this.opacity = opacity;
        this.type = type;
        this.name = name;
    }
    PlotDataTooltip.deserialize = function (serialized) {
        return new PlotDataTooltip(rgb_to_hex(serialized['colorfill']), rgb_to_hex(serialized['text_color']), serialized['font'], serialized['tp_radius'], serialized['to_plot_list'], serialized['opacity'], serialized['type'], serialized['name']);
    };
    PlotDataTooltip.prototype.draw = function (context, object, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height) {
        context.beginPath();
        var textfills = [];
        var text_max_length = 0;
        for (var i = 0; i < this.to_plot_list.length; i++) {
            if (this.to_plot_list[i] == 'cx') {
                var text = 'x : ' + MyMath.round(object.cx, 4).toString();
                var text_w = context.measureText(text).width;
            }
            else if (this.to_plot_list[i] == 'cy') {
                var text = 'y : ' + MyMath.round(-object.cy, 4).toString();
                var text_w = context.measureText(text).width;
            }
            else if (this.to_plot_list[i] == 'shape') {
                var text = 'shape : ' + object.plot_data_states[0]['shape_set']['shape'];
                var text_w = context.measureText(text).width;
            }
            textfills.push(text);
            if (text_w > text_max_length) {
                text_max_length = text_w;
            }
        }
        var font_size = Number(this.font.split('px')[0]);
        var tp_height = (textfills.length + 0.25) * font_size;
        var cx = object.cx;
        var cy = object.cy;
        var point_size = object.point_size;
        var decalage = 2.5 * point_size + 5;
        var tp_x = scaleX * (1000 * cx + mvx) + decalage;
        var tp_y = scaleY * (1000 * cy + mvy) - 1 / 2 * tp_height;
        var tp_width = text_max_length + 25;
        if (tp_x + tp_width > canvas_width) {
            tp_x = scaleX * (1000 * cx + mvx) - decalage - tp_width;
        }
        if (tp_y < 0) {
            tp_y = scaleY * (1000 * cy + mvy);
        }
        if (tp_y + tp_height > canvas_height) {
            tp_y = scaleY * (1000 * cy + mvy) - tp_height;
        }
        Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tp_radius, context);
        context.strokeStyle = 'black';
        context.globalAlpha = this.opacity;
        context.fillStyle = this.colorfill;
        context.stroke();
        context.fill();
        context.fillStyle = this.text_color;
        context.textAlign = 'start';
        context.textBaseline = 'Alphabetic';
        var x_start = tp_x + 1 / 10 * tp_width;
        context.font = this.font;
        var current_y = tp_y + 0.75 * font_size;
        for (var i = 0; i < textfills.length; i++) {
            context.fillText(textfills[i], x_start, current_y);
            current_y = current_y + font_size;
        }
        context.closePath();
        context.globalAlpha = 1;
    };
    PlotDataTooltip.prototype.manage_tooltip = function (context, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, tooltip_list) {
        for (var i = 0; i < tooltip_list.length; i++) {
            if (!(typeof tooltip_list[i] === "undefined")) {
                this.draw(context, tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height);
            }
        }
    };
    return PlotDataTooltip;
}());
exports.PlotDataTooltip = PlotDataTooltip;
var PlotDataGraph2D = /** @class */ (function () {
    function PlotDataGraph2D(point_list, dashline, graph_colorstroke, graph_linewidth, segments, display_step, type, name) {
        this.point_list = point_list;
        this.dashline = dashline;
        this.graph_colorstroke = graph_colorstroke;
        this.graph_linewidth = graph_linewidth;
        this.segments = segments;
        this.display_step = display_step;
        this.type = type;
        this.name = name;
        this.id = 0;
    }
    PlotDataGraph2D.deserialize = function (serialized) {
        var point_list = [];
        var temp = serialized['serialized_point_list'];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            point_list.push(PlotDataPoint2D.deserialize(d));
        }
        var segments = [];
        temp = serialized['serialized_segments'];
        for (i = 0; i < temp.length; i++) {
            var d = temp[i];
            segments.push(PlotDataLine2D.deserialize(d));
        }
        return new PlotDataGraph2D(point_list, serialized['dashline'], rgb_to_hex(serialized['graph_colorstroke']), serialized['graph_linewidth'], segments, serialized['display_step'], serialized['type'], serialized['name']);
    };
    return PlotDataGraph2D;
}());
exports.PlotDataGraph2D = PlotDataGraph2D;
var PlotDataScatter = /** @class */ (function () {
    function PlotDataScatter(point_list, type, name) {
        this.point_list = point_list;
        this.type = type;
        this.name = name;
    }
    PlotDataScatter.deserialize = function (serialized) {
        var point_list = [];
        var temp = serialized['serialized_point_list'];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            point_list.push(PlotDataPoint2D.deserialize(d));
        }
        return new PlotDataScatter(point_list, serialized['type'], serialized['name']);
    };
    return PlotDataScatter;
}());
exports.PlotDataScatter = PlotDataScatter;
var PlotDataArc2D = /** @class */ (function () {
    function PlotDataArc2D(cx, cy, r, data, angle1, angle2, plot_data_states, type, name) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.data = data;
        this.angle1 = angle1;
        this.angle2 = angle2;
        this.plot_data_states = plot_data_states;
        this.type = type;
        this.name = name;
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        if ((this.cx - this.r) < this.minX) {
            this.minX = this.cx - this.r;
        }
        if ((this.cx - this.r) > this.maxX) {
            this.maxX = this.cx + this.r;
        }
        if ((this.cy - this.r) < this.minY) {
            this.minY = this.cy - this.r;
        }
        if ((this.cy + this.r) > this.maxY) {
            this.maxY = this.cy + this.r;
        }
    }
    PlotDataArc2D.deserialize = function (serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
            var d = temp[i];
            plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataArc2D(serialized['cx'], serialized['cy'], serialized['r'], serialized['data'], serialized['angle1'], serialized['angle2'], plot_data_states, serialized['type'], serialized['name']);
    };
    PlotDataArc2D.prototype.draw = function (context, first_elem, mvx, mvy, scaleX, scaleY) {
        var ptsa = [];
        for (var l = 0; l < this.data.length; l++) {
            ptsa.push(scaleX * (1000 * this.data[l]['x'] + mvx));
            ptsa.push(scaleY * (1000 * this.data[l]['y'] + mvy));
        }
        var tension = 0.4;
        var isClosed = false;
        var numOfSegments = 16;
        drawLines(context, getCurvePoints(ptsa, tension, isClosed, numOfSegments));
    };
    return PlotDataArc2D;
}());
exports.PlotDataArc2D = PlotDataArc2D;
var Attribute = /** @class */ (function () {
    function Attribute(name, type) {
        this.name = name;
        this.type = type;
    }
    Attribute.deserialize = function (serialized) {
        return new Attribute(serialized['name'], serialized['type']);
    };
    Attribute.prototype.copy = function () {
        var attribute_copy = new Attribute(this.name, this.type);
        attribute_copy['list'] = this.list;
        return attribute_copy;
    };
    return Attribute;
}());
exports.Attribute = Attribute;
var PlotDataState = /** @class */ (function () {
    function PlotDataState(color_surface, color_map, hatching, opacity, dash, marker, color_line, shape_set, point_size, point_color, window_size, stroke_width, name) {
        this.color_surface = color_surface;
        this.color_map = color_map;
        this.hatching = hatching;
        this.opacity = opacity;
        this.dash = dash;
        this.marker = marker;
        this.color_line = color_line;
        this.shape_set = shape_set;
        this.point_size = point_size;
        this.point_color = point_color;
        this.window_size = window_size;
        this.stroke_width = stroke_width;
        this.name = name;
    }
    PlotDataState.deserialize = function (serialized) {
        var color_surface = null;
        if (serialized['color_surface'] != null) {
            color_surface = ColorSurfaceSet.deserialize(serialized['color_surface']);
        }
        var hatching = null;
        if (serialized['hatching'] != null) {
            hatching = HatchingSet.deserialize(serialized['hatching']);
        }
        var shape_set = null;
        if (serialized['shape_set'] != null) {
            shape_set = PointShapeSet.deserialize(serialized['shape_set']);
        }
        var window_size = null;
        if (serialized['window_size'] != null) {
            window_size = WindowSizeSet.deserialize(serialized['window_size']);
        }
        var point_size = null;
        if (serialized['point_size'] != null) {
            point_size = PointSizeSet.deserialize(serialized['point_size']);
        }
        var point_color = null;
        if (serialized['point_color'] != null) {
            point_color = PointColorSet.deserialize(serialized['point_color']);
        }
        return new PlotDataState(color_surface, serialized['color_map'], hatching, serialized['opacity'], serialized['dash'], serialized['marker'], serialized['color_line'], shape_set, point_size, point_color, window_size, serialized['stroke_width'], serialized['name']);
    };
    PlotDataState.prototype.copy = function () {
        return new PlotDataState(this.color_surface, this.color_map, this.hatching, this.opacity, this.dash, this.marker, this.color_line, this.shape_set, this.point_size, this.point_color, this.window_size, this.stroke_width, this.name);
    };
    return PlotDataState;
}());
exports.PlotDataState = PlotDataState;
var ColorSurfaceSet = /** @class */ (function () {
    function ColorSurfaceSet(name, color) {
        this.name = name;
        this.color = color;
    }
    ColorSurfaceSet.deserialize = function (serialized) {
        return new ColorSurfaceSet(serialized['name'], serialized['color']);
    };
    return ColorSurfaceSet;
}());
exports.ColorSurfaceSet = ColorSurfaceSet;
var PointShapeSet = /** @class */ (function () {
    function PointShapeSet(name, shape) {
        this.name = name;
        this.shape = shape;
    }
    PointShapeSet.deserialize = function (serialized) {
        return new PointShapeSet(serialized['name'], serialized['shape']);
    };
    return PointShapeSet;
}());
exports.PointShapeSet = PointShapeSet;
var PointSizeSet = /** @class */ (function () {
    function PointSizeSet(name, size) {
        this.name = name;
        this.size = size;
    }
    PointSizeSet.deserialize = function (serialized) {
        return new PointSizeSet(serialized['name'], serialized['size']);
    };
    return PointSizeSet;
}());
exports.PointSizeSet = PointSizeSet;
var PointColorSet = /** @class */ (function () {
    function PointColorSet(name, color_fill, color_stroke) {
        this.name = name;
        this.color_fill = color_fill;
        this.color_stroke = color_stroke;
    }
    PointColorSet.deserialize = function (serialized) {
        return new PointColorSet(serialized['name'], serialized['color_fill'], serialized['color_stroke']);
    };
    return PointColorSet;
}());
exports.PointColorSet = PointColorSet;
var WindowSizeSet = /** @class */ (function () {
    function WindowSizeSet(name, height, width) {
        this.name = name;
        this.height = height;
        this.width = width;
    }
    WindowSizeSet.deserialize = function (serialized) {
        return new WindowSizeSet(serialized['name'], serialized['height'], serialized['width']);
    };
    return WindowSizeSet;
}());
exports.WindowSizeSet = WindowSizeSet;
var HatchingSet = /** @class */ (function () {
    function HatchingSet(name, stroke_width, hatch_spacing) {
        this.name = name;
        this.stroke_width = stroke_width;
        this.hatch_spacing = hatch_spacing;
        this.canvas_hatching = this.generate_canvas();
    }
    HatchingSet.deserialize = function (serialized) {
        return new HatchingSet(serialized['name'], serialized['stroke_width'], serialized['hatch_spacing']);
    };
    HatchingSet.prototype.generate_canvas = function () {
        var nb_hatch = 20;
        var max_size = nb_hatch * this.hatch_spacing;
        var p_hatch = document.createElement("canvas");
        p_hatch.width = max_size;
        p_hatch.height = max_size;
        var pctx = p_hatch.getContext("2d");
        pctx.lineCap = 'square';
        pctx.strokeStyle = 'black';
        pctx.lineWidth = this.stroke_width;
        pctx.beginPath();
        var pos_x = -Math.pow(Math.pow(max_size, 2) / 2, 0.5);
        var pos_y = Math.pow(Math.pow(max_size, 2) / 2, 0.5);
        for (var i = 0; i <= 2 * nb_hatch; i++) {
            pos_x = pos_x + this.hatch_spacing;
            pos_y = pos_y - this.hatch_spacing;
            pctx.moveTo(pos_x, pos_y);
            pctx.lineTo(pos_x + max_size, pos_y + max_size);
        }
        pctx.stroke();
        return p_hatch;
    };
    return HatchingSet;
}());
exports.HatchingSet = HatchingSet;
var MyMath = /** @class */ (function () {
    function MyMath() {
    }
    MyMath.round = function (x, n) {
        return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
    };
    MyMath.log10 = function (x) {
        return Math.log(x) / Math.log(10);
    };
    return MyMath;
}());
exports.MyMath = MyMath;
var Shape = /** @class */ (function () {
    function Shape() {
    }
    Shape.drawLine = function (context, list) {
        context.moveTo(list[0][0], list[0][1]);
        for (var i = 1; i < list.length; i++) {
            context.lineTo(list[i][0], list[i][1]);
        }
    };
    Shape.crux = function (context, cx, cy, length) {
        this.drawLine(context, [[cx, cy], [cx - length, cy]]);
        this.drawLine(context, [[cx, cy], [cx + length, cy]]);
        this.drawLine(context, [[cx, cy], [cx, cy - length]]);
        this.drawLine(context, [[cx, cy], [cx, cy + length]]);
    };
    Shape.roundRect = function (x, y, w, h, radius, context) {
        var r = x + w;
        var b = y + h;
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = "1";
        context.moveTo(x + radius, y);
        context.lineTo(r - radius, y);
        context.quadraticCurveTo(r, y, r, y + radius);
        context.lineTo(r, y + h - radius);
        context.quadraticCurveTo(r, b, r - radius, b);
        context.lineTo(x + radius, b);
        context.quadraticCurveTo(x, b, x, b - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.stroke();
        context.closePath();
    };
    Shape.Is_in_rect = function (x, y, rect_x, rect_y, rect_w, rect_h) {
        return ((x >= rect_x) && (x <= rect_x + rect_w) && (y >= rect_y) && (y <= rect_y + rect_h));
    };
    Shape.createButton = function (x, y, w, h, context, text, police) {
        context.beginPath();
        context.fillStyle = 'white';
        context.lineWidth = "3";
        context.rect(x, y, w, h);
        context.stroke();
        context.fill();
        context.closePath();
        context.beginPath();
        context.fillStyle = "black";
        context.textAlign = "center";
        context.font = police;
        context.fillText(text, x + w / 2, y + h / 1.8);
        context.fill();
        context.closePath();
    };
    Shape.createGraphButton = function (x, y, w, h, context, text, police, colorfill, strikeout) {
        context.beginPath();
        context.fillStyle = colorfill;
        context.rect(x, y, w, h);
        context.fill();
        context.closePath();
        context.beginPath();
        context.fillStyle = 'grey';
        context.textAlign = 'start';
        context.textBaseline = 'middle';
        context.font = police;
        context.fillText(text, x + w + 5, y + h / 1.8);
        context.fill();
        if (strikeout === true) {
            var text_w = context.measureText(text).width;
            context.lineWidth = 1.5;
            context.strokeStyle = 'grey';
            Shape.drawLine(context, [[x + w + 5, y + h / 1.8], [x + w + 5 + text_w, y + h / 2]]);
            context.stroke();
        }
        context.closePath();
    };
    Shape.rect = function (x, y, w, h, context, colorfill, colorstroke, linewidth, opacity) {
        context.beginPath();
        context.fillStyle = colorfill;
        context.strokeStyle = colorstroke;
        context.lineWidth = linewidth;
        context.globalAlpha = opacity;
        context.rect(x, y, w, h);
        context.fill();
        context.stroke();
        context.closePath();
        context.globalAlpha = 1;
    };
    return Shape;
}());
exports.Shape = Shape;
function drawLines(ctx, pts) {
    // ctx.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length - 1; i += 2)
        ctx.lineTo(pts[i], pts[i + 1]);
}
exports.drawLines = drawLines;
function remove_at_index(i, list) {
    return list.slice(0, i).concat(list.slice(i + 1, list.length));
}
exports.remove_at_index = remove_at_index;
function move_elements(old_index, new_index, list) {
    var elt = list[old_index];
    if (old_index < new_index) {
        list.splice(new_index + 1, 0, elt);
        list = remove_at_index(old_index, list);
    }
    else {
        list.splice(new_index, 0, elt);
        list = remove_at_index(old_index + 1, list);
    }
    return list;
}
exports.move_elements = move_elements;
function getCurvePoints(pts, tension, isClosed, numOfSegments) {
    // use input value if provided, or use a default value
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;
    var _pts = [], res = [], // clone array
    x, y, // our x,y coords
    t1x, t2x, t1y, t2y, // tension vectors
    c1, c2, c3, c4, // cardinal points
    st, t, i; // steps based on num. of segments
    // clone array so we don't change the original
    //
    _pts = pts.slice(0);
    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    }
    else {
        _pts.unshift(pts[1]); //copy 1. point and insert at beginning
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]); //copy last point and append
        _pts.push(pts[pts.length - 1]);
    }
    // ok, lets start..
    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i = 2; i < (_pts.length - 4); i += 2) {
        for (t = 0; t <= numOfSegments; t++) {
            // calc tension vectors
            t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
            t2x = (_pts[i + 4] - _pts[i]) * tension;
            t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
            t2y = (_pts[i + 5] - _pts[i + 1]) * tension;
            // calc step
            st = t / numOfSegments;
            // calc cardinals
            c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
            c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
            c4 = Math.pow(st, 3) - Math.pow(st, 2);
            // calc x and y cords with common control vectors
            x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;
            //store points in array
            res.push(x);
            res.push(y);
        }
    }
    return res;
}
exports.getCurvePoints = getCurvePoints;
var nextCol = 1;
function genColor() {
    var ret = [];
    // via http://stackoverflow.com/a/15804183
    if (nextCol < 16777215) {
        ret.push(nextCol & 0xff); // R
        ret.push((nextCol & 0xff00) >> 8); // G
        ret.push((nextCol & 0xff0000) >> 16); // B
        nextCol += 50;
    }
    var col = "rgb(" + ret.join(',') + ")";
    return col;
}
exports.genColor = genColor;
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
exports.componentToHex = componentToHex;
function rgb_to_hex(rgb) {
    var tokens = rgb.slice(4, rgb.length - 1).split(',');
    var r = parseInt(tokens[0], 10);
    var g = parseInt(tokens[1], 10);
    var b = parseInt(tokens[2], 10);
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
exports.rgb_to_hex = rgb_to_hex;
var color_dict = [['red', '#f70000'], ['lightred', '#ed8080'], ['blue', '#0013fe'], ['lightblue', '#adb3ff'], ['green', '#00c112'], ['lightgreen', '#89e892'], ['yellow', '#f4ff00'], ['lightyellow', '#f9ff7b'], ['orange', '#ff8700'],
    ['lightorange', '#ff8700'], ['cyan', '#13f0f0'], ['lightcyan', '#90f7f7'], ['rose', '#FF69B4'], ['lightrose', '#FFC0CB'], ['violet', '#EE82EE'], ['lightviolet', '#eaa5f6'], ['white', '#ffffff'], ['black', '#000000'], ['brown', '#cd8f40'],
    ['lightbrown', '#DEB887'], ['grey', '#A9A9A9'], ['lightgrey', '#D3D3D3']];
function hex_to_string(hexa) {
    for (var i = 0; i < color_dict.length; i++) {
        if (hexa.toUpperCase() === color_dict[i][1].toUpperCase()) {
            return color_dict[i][0];
        }
    }
    throw new Error('Invalid color : not in list');
}
exports.hex_to_string = hex_to_string;
function string_to_hex(str) {
    for (var i = 0; i < color_dict.length; i++) {
        if (str.toUpperCase() === color_dict[i][0].toUpperCase()) {
            return color_dict[i][1];
        }
    }
    throw new Error('Invalid color : not in list');
}
exports.string_to_hex = string_to_hex;
function rgb_to_string(rgb) {
    return hex_to_string(rgb_to_hex(rgb));
}
exports.rgb_to_string = rgb_to_string;
function rgb_interpolation(_a, _b, n) {
    var r1 = _a[0], g1 = _a[1], b1 = _a[2];
    var r2 = _b[0], g2 = _b[1], b2 = _b[2];
    var color_list = [];
    for (var k = 0; k < n; k++) {
        var r = Math.floor(r1 * (1 - k / n) + r2 * k / n);
        var g = Math.floor(g1 * (1 - k / n) + g2 * k / n);
        var b = Math.floor(b1 * (1 - k / n) + b2 * k / n);
        color_list.push([r, g, b]);
    }
    return color_list;
}
exports.rgb_interpolation = rgb_interpolation;
function rgb_interpolations(rgbs, nb_pts) {
    var nb_seg = rgbs.length - 1;
    var arr = [];
    var color_list = [];
    for (var i = 0; i < nb_seg; i++) {
        arr.push(0);
    }
    for (var i = 0; i < nb_pts; i++) {
        arr[i % nb_seg]++;
    }
    for (var i = 0; i < nb_seg; i++) {
        color_list.push(rgb_interpolation(rgbs[i], rgbs[i + 1], arr[i]));
    }
    return color_list;
}
exports.rgb_interpolations = rgb_interpolations;
