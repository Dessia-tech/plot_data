export function arrayRgbToHsl(r: number, g: number, b: number): [number, number, number] {
  // Get [h,s,l] array of HSL color from [r,g,b] array from a RGB color array.
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
    if (h < 0) h += 360;
    s = delta / (1 - Math.abs(2 * l - 1));
  }
  return [h, s * 100, l * 100]
};

export function arrayHslToRgb(h: number, s: number, l: number): [number, number, number] {
  /*
  Get [r,g,b] array of RGB color from [h,s,l] array from a HSL color array.

  The k function is used to determine which of the six segments of the color wheel the current hue falls within,
  and then adjusts the lightness value l based on the saturation and hue values.
  The a variable is used to compute the amount of lightness to be added or subtracted from the lightness value
  based on the saturation value.
  Finally, the f function is used to compute the RGB values for each of the three color channels
  (red (0), green (8), and blue (4)) based on the k function and the a variable.
  The f function returns a value between 0 and 1, which is then scaled up to the appropriate range to represent an RGB
  color value.

  Source: https://www.rapidtables.com/convert/color/hsl-to-rgb.html
  */
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); //
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

export function hslToArray(hslColor: string): [number, number, number] {
  // Get [h,s,l] array from a HSL color (format: hsl(h,s%,l%)).
  let [h, s, l] = hslColor.split(',');
  return [Number(h.split('hsl(')[1]), Number(s.split('%')[0]), Number(l.split('%')[0])]
}

export function rgbToArray(rgbColor: string): [number, number, number] {
  // Get [r,g,b] array from a RGB color (format: rgb(r,g,b)).
  let [r, g, b] = rgbColor.split(',');
  return [Number(r.split('rgb(')[1]), Number(g), Number(b.split(")")[0])]
}

export function componentToHex(component: number): string {
  // Get hexadecimal code of a rgb component.
  // RGB and HEX theory: https://www.rapidtables.com/convert/color/hex-to-rgb.html
  var hex = component.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function arrayRgbToHex(r: number, g: number, b: number): string {
  // Get a Hexadecimal color (format: #RRGGBB with RR, GG, BB in hexadecimal format) from RGB color (rgb(r,g,b)) vector.
  // RGB and HEX theory: https://www.rapidtables.com/convert/color/hex-to-rgb.html
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function arrayHexToRgb(hexColor: string): [number, number, number] {
  // Get RGB color (rgb(r,g,b)) vector from a Hexadecimal color (format: #RRGGBB with RR, GG, BB in hexadecimal format).
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

export function arrayHslToHex(h: number, s: number, l: number): string {
  /*
  Lightness is normalized before any computation, so is saturation.
  The function first calculates the amount of saturation that should be added to the lightness value to create the equivalent
  amount of color. The Math.min() function is used to ensure that the saturation value is not greater than 50%.

  The f function then takes a number as input and calculates the corresponding color value based on the input value and
  the HSL color values.
  The k variable converts the input value (0 for red, 8 for green, 4 for blue) to get the corresponding color.
  The color is then calculated with k, l and some magic numbers.

  The reason for using these numbers (3, 9) in this calculation is because the HSL color model uses a circular color wheel.
  By using 3 and 9 as the modulo values, we ensure that the input value is always within the range of 0 to 11, which
  corresponds to the red, green, and blue colors on the color wheel.

  The f function is called three times with different input values to calculate the red, green, and blue color values.
  The resulting red, green, and blue values are concatenated into a single hexadecimal color value in the format #RRGGBB.

  Source:  https://docs.aspose.com/html/net/tutorial/html-colors/
  */
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function arrayHexToHsl(hexColor: string): [number, number, number] { return arrayRgbToHsl(...arrayHexToRgb(hexColor)) }

export function rgbToString(r: number, g: number, b: number): string { return `rgb(${r},${g},${b})` }

export function hslToString(h: number, s: number, l: number): string { return `hsl(${h},${s}%,${l}%)` }

export function hslToRgb(hslColor: string): string { return rgbToString(...arrayHslToRgb(...hslToArray(hslColor))) }

export function rgbToHsl(rgbColor: string): string { return hslToString(...arrayRgbToHsl(...rgbToArray(rgbColor))) }

export function rgbToHex(rgbColor: string): string { return arrayRgbToHex(...rgbToArray(rgbColor)) }

export function hexToRgb(hexColor: string): string { return rgbToString(...arrayHexToRgb(hexColor)) }

export function hexToHsl(hexColor: string): string { return hslToString(...arrayHexToHsl(hexColor)) }

export function hslToHex(hslColor: string): string { return arrayHslToHex(...hslToArray(hslColor)) }

export function colorHsl(color: string): string {
  if (color.includes('hsl')) return color;
  if (color.includes('rgb')) return rgbToHsl(color);
  if (color.includes('#')) return hexToHsl(color);
  throw new Error(`${color} is not a color.`)
}

export function colorHex(color: string): string {
  if (color.includes('#')) return color ;
  if (color.includes('hsl')) return hslToHex(color);
  if (color.includes('rgb')) return rgbToHex(color);
  throw new Error(`${color} is not a color.`)
}

export function colorRgb(color: string): string {
  if (color.includes('rgb')) return color;
  if (color.includes('hsl')) return hslToRgb(color);
  if (color.includes('#')) return hexToRgb(color);
  throw new Error(`${color} is not a color.`)
}
