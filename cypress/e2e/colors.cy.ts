import * as colors  from "../../instrumented/colors";

const rgb = [163, 112, 41];
const hsl = [35, 60, 40];
const hex = "#a37029";

const rgb2 = [255, 107, 181];
const hsl2 = [330, 100, 71];
const hex2 = "#ff6bb5";

describe('COLORS CONVERSION', function () {
    it("should convert hex to hsl", function () {
        const convertedHex = colors.hslToArray(colors.colorHsl(hex));
        expect(convertedHex[0]).to.closeTo(hsl[0], 1);
        expect(convertedHex[1]).to.closeTo(hsl[1], 1);
        expect(convertedHex[2]).to.closeTo(hsl[2], 1);

        const convertedHex2 = colors.hslToArray(colors.colorHsl(hex2));
        expect(convertedHex2[0]).to.closeTo(hsl2[0], 1);
        expect(convertedHex2[1]).to.closeTo(hsl2[1], 1);
        expect(convertedHex2[2]).to.closeTo(hsl2[2], 1);
    });

    it("should convert rgb to hsl", function () {
        const stringRgb = colors.rgbToString(rgb[0], rgb[1], rgb[2]);
        const convertedRgb = colors.hslToArray(colors.colorHsl(stringRgb));
        expect(convertedRgb[0]).to.closeTo(hsl[0], 1);
        expect(convertedRgb[1]).to.closeTo(hsl[1], 1);
        expect(convertedRgb[2]).to.closeTo(hsl[2], 1);

        const stringRgb2 = colors.rgbToString(rgb2[0], rgb2[1], rgb2[2]);
        const convertedRgb2 = colors.hslToArray(colors.colorHsl(stringRgb2));
        expect(convertedRgb2[0]).to.closeTo(hsl2[0], 1);
        expect(convertedRgb2[1]).to.closeTo(hsl2[1], 1);
        expect(convertedRgb2[2]).to.closeTo(hsl2[2], 1);
    });

    it("should convert hex to rgb", function () {
        const convertedHex = colors.rgbToArray(colors.colorRgb(hex));
        expect(convertedHex[0]).to.closeTo(rgb[0], 1);
        expect(convertedHex[1]).to.closeTo(rgb[1], 1);
        expect(convertedHex[2]).to.closeTo(rgb[2], 1);

        const convertedHex2 = colors.rgbToArray(colors.colorRgb(hex2));
        expect(convertedHex2[0]).to.closeTo(rgb2[0], 1);
        expect(convertedHex2[1]).to.closeTo(rgb2[1], 1);
        expect(convertedHex2[2]).to.closeTo(rgb2[2], 1);
    });

    it("should convert hsl to rgb", function () {
        const stringHsl = colors.hslToString(hsl[0], hsl[1], hsl[2]);
        const convertedHsl = colors.rgbToArray(colors.colorRgb(stringHsl));
        expect(convertedHsl[0]).to.closeTo(rgb[0], 1);
        expect(convertedHsl[1]).to.closeTo(rgb[1], 1);
        expect(convertedHsl[2]).to.closeTo(rgb[2], 1);

        const stringHsl2 = colors.hslToString(hsl2[0], hsl2[1], hsl2[2]);
        const convertedHsl2 = colors.rgbToArray(colors.colorRgb(stringHsl2));
        expect(convertedHsl2[0]).to.closeTo(rgb2[0], 1);
        expect(convertedHsl2[1]).to.closeTo(rgb2[1], 1);
        expect(convertedHsl2[2]).to.closeTo(rgb2[2], 1);
    });

    it("should convert rgb to hex", function () {
        const stringRgb = colors.rgbToString(rgb[0], rgb[1], rgb[2]);
        expect(colors.colorHex(stringRgb)).to.equal(hex);
    });

    it("should convert hsl to hex", function () {
        const stringHsl = colors.hslToString(hsl[0], hsl[1], hsl[2]);
        expect(colors.colorHex(stringHsl)).to.equal(hex);
    });

    // Returns a two-digit hexadecimal string for a component between 0 and 255.
    it('should return a two-digit hexadecimal string for a component between 0 and 255', function() {
        expect(colors.componentToHex(0)).to.equal('00');
        expect(colors.componentToHex(255)).to.equal('ff');
        expect(colors.componentToHex(128)).to.equal('80');
    });

    // Returns  null for a non conform color name.
    it('should return null for a non conform color name', function() {
        expect(colors.arrayHexToRgb("colorName")).to.be.null;
    });

    // Returns a two-digit hexadecimal string for the component 255.
    it('should return a two-digit hexadecimal string for the component 255', function() {
        expect(colors.componentToHex(255)).to.equal('ff');
    });

    // Given an invalid color string, all functions should throw an error.
    it('should throw an error when given an invalid color string', function() {
        const color = 'invalid';
        expect(function() { colors.colorHsl(color) }).to.throw(`${color} is not a color.`);
        expect(function() { colors.colorRgb(color) }).to.throw(`${color} is not a color.`);
        expect(function() { colors.colorHex(color) }).to.throw(`${color} is not a color.`);
    });

    // Given a valid HSL color string, the function colorHsl should return the same string.
    it('should return the same string when given a valid HSL color string', function() {
        const color = 'hsl(120, 100%, 50%)';
        expect(colors.colorHsl(color)).to.equal(color);
    });

    // Given a valid RGB color string, the function colorRgb should return the same string.
    it('should return the same string when given a valid RGB color string', function() {
        const color = 'rgb(255, 0, 0)';
        expect(colors.colorRgb(color)).to.equal(color);
    });

    // Given a valid hexadecimal color string, the function colorHex should return the same string.
    it('should return the same string when given a valid hexadecimal color string', function() {
        const color = '#ff0000';
        expect(colors.colorHex(color)).to.equal(color);
    });
})
