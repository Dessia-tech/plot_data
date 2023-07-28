import * as colors  from "../../src/color_conversion";

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
  })
