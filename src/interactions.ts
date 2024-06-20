import { Subject } from "rxjs"
import { RubberBand } from "./shapes";
import { Axis } from "./axes";

export interface HighlightData {
  referencePath: string,
  highlight: boolean,
  select: boolean
}

export const highlightShape: Subject<HighlightData> = new Subject();

export const rubberbandChange: Subject<RubberBand> = new Subject();
export const onAxisSelection: Subject<[Axis, RubberBand]> = new Subject();
