import { PlotScatter } from "../subplots";
import { baseData } from "./baseDataset";

const _WIDTH = 1280;
const _HEIGHT = 720;

describe("Hello", () {
    it("devrait renvoyer hello", () {
        let plotScatter = new PlotScatter(baseData, _WIDTH, _HEIGHT, true, 0, 0, '', false);
        expect(plotScatter.plotObject["package_version"]).toBe("hello");
    }); 
    it("devrait faire 5 caracteres", () {
        var text = "tra";
        expect(text.length).toBe(5);
    }); 
});