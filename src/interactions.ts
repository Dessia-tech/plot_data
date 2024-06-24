import { BehaviorSubject, ReplaySubject, Subject } from "rxjs"
import { Axis } from "./axes";
import { RubberBand } from "./shapes";

export interface HighlightData {
  referencePath: string,
  highlight: boolean,
  select: boolean
}

export const highlightShape: Subject<HighlightData> = new Subject();

export const onAxisSelection: Subject<Axis> = new Subject();
export const rubberbandsChange: BehaviorSubject<Map<String, RubberBand>> = new BehaviorSubject(new Map<String, RubberBand>());
