import { Subject } from "rxjs"
import { RubberBand } from "./shapes";

export interface HighlightData {
  referencePath: string,
  highlight: boolean,
  select: boolean
}

export const highlightShape: Subject<HighlightData> = new Subject();
export const filterUpdate: Subject<Map<string, RubberBand>> = new Subject();