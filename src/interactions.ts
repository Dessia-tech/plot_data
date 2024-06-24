import { Subject } from "rxjs"
import { Axis } from "./axes";

export interface HighlightData {
  referencePath: string,
  highlight: boolean,
  select: boolean
}

export const highlightShape: Subject<HighlightData> = new Subject();

export const onAxisSelection: Subject<Axis> = new Subject();
