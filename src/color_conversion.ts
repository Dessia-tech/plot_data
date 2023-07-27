export function string_to_hex(str:string): string {
    if (!Object.keys(string_to_hex_dict).includes(str)) {throw new Error('string_to_hex -> Invalid color : ' + str + ' not in list');}
    return string_to_hex_dict[str];
}


function reverse_string_to_hex_dict() {
  var entries = Object.entries(string_to_hex_dict);
  for (let i=0; i<entries.length; i++) {
    entries[i].reverse();
  }
  return Object.fromEntries(entries);
}

export const string_to_hex_dict = {
  red: '#f70000', lightred: '#ed8080', blue: '#0013fe', lightblue: '#c3e6fc', lightskyblue: '#87cefa', green: '#00c112', lightgreen: '#89e892', yellow: '#f4ff00', lightyellow: '#f9ff7b', orange: '#ff8700',
  lightorange: '#ff8700', cyan: '#13f0f0', lightcyan: '#90f7f7', rose: '#ff69b4', lightrose: '#ffc0cb', violet: '#ee82ee', lightviolet: '#eaa5f6', white: '#ffffff', black: '#000000', brown: '#cd8f40',
  lightbrown: '#deb887', grey: '#a9a9a9', lightgrey: '#d3d3d3'
};

export const hex_to_string_dict = reverse_string_to_hex_dict();

function get_rgb_to_string_dict() {
  var entries = Object.entries(hex_to_string_dict);
  for (let i=0; i<entries.length; i++) {
    entries[i][0] = hex_to_rgb(entries[i][0]);
  }
  return Object.fromEntries(entries);
}
export const rgb_to_string_dict = get_rgb_to_string_dict();

export function isColorInDict(str:string): boolean {
  var colors = Object.keys(string_to_hex_dict);
  return colors.includes(str);
}

export function hex_to_string(hexa:string): string {
  if (!Object.keys(hex_to_string_dict).includes(hexa)) { throw new Error('hex_to_string -> Invalid color : ' + hexa + ' is not in list'); }
  return hex_to_string_dict[hexa];
}

export function hexToRgbObj(hex):Object { // Returns an object {r: ..., g: ..., b: ...}
  // var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var result = [hex[1]+hex[2], hex[3]+hex[4], hex[5]+hex[6]];
  return result ? {
    r: parseInt(result[0], 16),
    g: parseInt(result[1], 16),
    b: parseInt(result[2], 16)
  } : null;
}


export function hex_to_rgb(hex:string): string {
  // var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var result = [hex[1]+hex[2], hex[3]+hex[4], hex[5]+hex[6]];
  var r = parseInt(result[0], 16);
  var g = parseInt(result[1], 16);
  var b = parseInt(result[2], 16);
  return rgbToString(r, g, b);
}

export function rgb_to_string(rgb:string): string {
  if (rgb_to_string_dict[rgb]) return rgb_to_string_dict[rgb];
  // otherwise, returns the closest color
  var min_dist = Infinity;
  var closest_string = '';
  var rgb_vect = rgb_strToVector(rgb);
  for (let dict_rgb of Object.keys(rgb_to_string_dict)) {
    let dict_rgb_vect = rgb_strToVector(dict_rgb);
    let distance = Math.sqrt(Math.pow(rgb_vect[0] - dict_rgb_vect[0], 2) +
                             Math.pow(rgb_vect[1] - dict_rgb_vect[1], 2) +
                             Math.pow(rgb_vect[2] - dict_rgb_vect[2], 2));
    if (distance < min_dist) {
      closest_string = rgb_to_string_dict[dict_rgb];
      min_dist = distance;
    }
  }
  return closest_string;
}

export function string_to_rgb(str:string) {
  return hex_to_rgb(string_to_hex(str));
}

export function color_to_string(color:string): string {
  if (isHex(color)) {
    return hex_to_string(color);
  } else if (isRgb(color)) {
    return rgb_to_string(color);
  } else {
    return color;
  }
  // else if (isColorInDict(color)) {
  //   return color;
  // }
  throw new Error('color_to_string : ' + color + ' is not in hex neither in rgb');
}

export function average_color(rgb1:string, rgb2:string): string {
  var rgb_vect1 = rgb_strToVector(rgb1);
  var rgb_vect2 = rgb_strToVector(rgb2);
  var new_r = (rgb_vect1[0] + rgb_vect2[0])/2;
  var new_g = (rgb_vect1[1] + rgb_vect2[1])/2;
  var new_b = (rgb_vect1[2] + rgb_vect2[2])/2;
  return rgbToString(new_r, new_g, new_b);
}

export function rgb_interpolation([r1, g1, b1], [r2, g2, b2], n:number): string[] {
  var color_list = [];
  for (var k=0; k<n; k++) {
    var r = Math.floor(r1*(1-k/n) + r2*k/n);
    var g = Math.floor(g1*(1-k/n) + g2*k/n);
    var b = Math.floor(b1*(1-k/n) + b2*k/n);
    color_list.push(rgbToString(r,g,b));
  }
  return color_list;
}

export function get_interpolation_colors(rgbs:[number, number, number][], nb_pts:number): string[] {
  var nb_seg = rgbs.length - 1;
  var arr = [];
  var color_list = [];
  for (var i=0; i<nb_seg; i++) {arr.push(0);}
  for (var i=0; i<nb_pts; i++) {
    arr[i%nb_seg]++;
  }
  for (let i=0; i<nb_seg; i++) {
    var interpolation_colors = rgb_interpolation(rgbs[i], rgbs[i+1], arr[i]);
    for (let j=0; j<interpolation_colors.length; j++) {
      color_list.push(interpolation_colors[j]);
    }
  }
  return color_list;
}

export function heatmap_color(density, max_density, colors) {
  let step = 1/(colors.length - 1);
  let colors_rgb = colors.map(hex => rgb_strToVector(hex_to_rgb(hex)));
  let norm_val = density/max_density;
  let q = Math.min(Math.floor(norm_val/step), colors.length - 2);
  let cm = q*step;
  let val = (norm_val - cm) / step;
  let color1 = colors_rgb[q];
  let color2 = colors_rgb[q+1];
  let r = Math.floor((1-val)*color1[0] + val*color2[0]);
  let g = Math.floor((1-val)*color1[1] + val*color2[1]);
  let b = Math.floor((1-val)*color1[2] + val*color2[2]);
  let rgb = "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
  return rgbToHex(rgb as rgbColor);
}

export function rgb_strToVector(rgb:string): [number, number, number] {
  var tokens = rgb.slice(4, rgb.length - 1).split(',');
  var r = parseInt(tokens[0],10);
  var g = parseInt(tokens[1],10);
  var b = parseInt(tokens[2],10);
  return [r,g,b];
}

export function tint_rgb(rgb:string, coeff:number): string { //coeff must be between 0 and 1. The higher coeff, the lighter the color
  var result = rgb_strToVector(rgb);
  var r = result[0] + (255 - result[0])*coeff;
  var g = result[1] + (255 - result[1])*coeff;
  var b = result[2] + (255 - result[2])*coeff;
  return rgbToString(r,g,b);
}

export function darken_rgb(rgb: string, coeff:number) { //coeff must be between 0 ans 1. The higher the coeff, the darker the color
  var result = rgb_strToVector(rgb);
  var r = result[0]*(1 - coeff);
  var g = result[1]*(1 - coeff);
  var b = result[2]*(1 - coeff);
  return rgbToString(r,g,b);
}


export function isRgb(str:string):boolean {
  return str.substring(0,4) == 'rgb(';
}

export function isHex(str:string):boolean {
  return str.substring(0,1) == '#';
}

// NEW (need a merge with what's before)
type hslColor =`hsl(${number},${number}%,${number}%)`;
type rgbColor =`rgb(${number},${number},${number})`;
type hexColor =`#${number | string}${number | string}${number | string}`;
export type color = hslColor | rgbColor | hexColor;

export function arrayRgbToHsl(r: number, g: number, b: number): [number, number, number] {
  // HSL and RGB theory https://www.rapidtables.com/convert/color/rgb-to-hsl.html
  let normedR = r / 255;
  let normedG = g / 255;
  let normedB = b / 255;
  const cMax = Math.max(normedR, normedG, normedB);
  const cMin = Math.min(normedR, normedG, normedB);
  const delta = cMax - cMin;
  const l = (cMax + cMin) / 2;
  let h = 0;
  let s = 0;
  if (delta != 0) {
    if (cMax == normedR) h = 60 * (normedG - normedB) / delta;
    else if (cMax == normedG) h = 60 * ((normedB - normedR) / delta + 2);
    else h = 60 * ((normedR - normedG) / delta + 4);
    s = delta / (1 - Math.abs(2 * l - 1));
  }
  return [h, s * 100, l * 100]
};

export function arrayHslToRgb(h: number, s: number, l: number): [number, number, number] {
  // HSL and RGB theory: https://www.rapidtables.com/convert/color/rgb-to-hsl.html
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

export function hslToArray(hslColor: hslColor): [number, number, number] {
  let [h, s, l] = hslColor.split(',');
  return [Number(h.split('hsl(')[1]), Number(s.split('%')[0]), Number(l.split('%')[0])]
}

export function rgbToArray(rgbColor: rgbColor): [number, number, number] {
  // format: `rgb(${r},${g},${b})`
  let [r, g, b] = rgbColor.split(',');
  return [Number(r.split('rgb(')[1]), Number(g), Number(b.split(")")[0])]
}

function componentToHex(component: number): string {
  // RGB and HEX theory: https://www.rapidtables.com/convert/color/hex-to-rgb.html
  var hex = component.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function arrayRgbToHex(r: number, g: number, b: number): hexColor {
  // RGB and HEX theory: https://www.rapidtables.com/convert/color/hex-to-rgb.html
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) as hexColor;
}

export function arrayHexToRgb(hexColor: hexColor): [number, number, number] {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

export function arrayHslToHex(h: number, s: number, l: number): hexColor {
  // https://docs.aspose.com/html/net/tutorial/html-colors/
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function arrayHexToHsl(hexColor: hexColor): [number, number, number] { return arrayRgbToHsl(...arrayHexToRgb(hexColor)) }

export function rgbToString(r: number, g: number, b: number): rgbColor { return `rgb(${r},${g},${b})` }

export function hslToString(h: number, s: number, l: number): hslColor { return `hsl(${h},${s}%,${l}%)` }

export function hslToRgb(hslColor: hslColor): rgbColor { return rgbToString(...arrayHslToRgb(...hslToArray(hslColor))) }

export function rgbToHsl(rgbColor: rgbColor): hslColor { return hslToString(...arrayRgbToHsl(...rgbToArray(rgbColor))) }

export function rgbToHex(rgbColor: rgbColor): hexColor { return arrayRgbToHex(...rgbToArray(rgbColor)) }

export function hexToRgb(hexColor: hexColor): rgbColor { return rgbToString(...arrayHexToRgb(hexColor)) }

export function hexToHsl(hexColor: hexColor): hslColor { return hslToString(...arrayHexToHsl(hexColor)) }

export function hslToHex(hslColor: hslColor): hexColor { return arrayHslToHex(...hslToArray(hslColor)) }

export function colorHsl(color: hexColor | hslColor | rgbColor): hslColor {
  if (color.includes('hsl')) return color as hslColor;
  if (color.includes('rgb')) return rgbToHsl(color as rgbColor);
  if (color.includes('#')) return hexToHsl(color as hexColor);
  throw new Error(`${color} is not a color.`)
}

export function colorHex(color: string): string {
  if (color.includes('#')) return color as hexColor;
  if (color.includes('hsl')) return hslToHex(color as hslColor);
  if (color.includes('rgb')) return rgbToHex(color as rgbColor);
  throw new Error(`${color} is not a color.`)
}

export function colorRgb(color: string): string {
  if (color.includes('rgb')) return color as rgbColor;
  if (color.includes('hsl')) return hslToRgb(color as hslColor);
  if (color.includes('#')) return hexToRgb(color as hexColor);
  throw new Error(`${color} is not a color.`)
}
