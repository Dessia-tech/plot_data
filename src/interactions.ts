import { Subject } from "rxjs"
import { RubberBand } from "./shapes";

export interface HighlightData {
  referencePath: string,
  highlight: boolean,
  select: boolean
}

export interface FilterUpdate {
  id: string,
  rubberbands: Map<string, RubberBand>
}

export const highlightShape: Subject<HighlightData> = new Subject();
export const filterUpdate: Subject<FilterUpdate> = new Subject();
