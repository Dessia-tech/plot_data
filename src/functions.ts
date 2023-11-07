export function equals(a, b) {
    if (a === b) return true;
  
    if (a && b && typeof a == 'object' && typeof b == 'object') {
      if (a.constructor !== b.constructor) return false;
  
      var length, i, keys;
      if (Array.isArray(a)) {
        length = a.length;
        if (a.length != b.length) return false;
        for (i = a.length; i-- !== 0;)
          if (!b.includes(a[i])) return false;
        return true;
      }
  
      if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
  
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;
  
      for (i = length; i-- !== 0;)
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
  
      for (i = length; i-- !== 0;) {
        var key = keys[i];
  
        if (!equals(a[key], b[key])) return false;
      }
  
      return true;
    }
  
    // true if both NaN, false otherwise
    return a !== a && b !== b;
  }
  
  export function uniqueValues(vector: string[]): string[] {
    return vector.filter((value, index, array) => array.indexOf(value) === index)
  }
  
  export function arrayDiff(a: any[], b: any[]): any[] { // TODO: this seems duplicated in PP
    const diff = [];
    a.forEach(value => { if (!b.includes(value)) diff.push(value) });
    return diff
  }
  
  export function arrayIntersection(a: any[], b: any[]): any[] {
    return a.filter(value => b.includes(value));
  }

  export function intersectArrays(arrays: any[][]): any[] {
    if (arrays.length == 1) return arrays[0]
    if (arrays.length == 0) return []
    const arraysIntersection = [];
    const allValues = arrays.concat(...arrays)
    allValues.forEach(value => {
      let inAllArrays = true;
      for (let i=0; i < arrays.length; i++) {
        if (!arrays[i].includes(value)) { inAllArrays = false; break }
      }
      if (inAllArrays) arraysIntersection.push(value);
    })
    return uniqueValues(arraysIntersection)
  }

  export function computeCanvasSize(buttonContainerName: string): [number, number] {
    const buttonsContainer = document.querySelector(buttonContainerName);
    return [0.95 * window.innerWidth, 0.95 * window.innerHeight - buttonsContainer.scrollHeight]
  }

  export function range(start: number, end: number, step: number = 1): number[] {
    let array = [];
    for (let i = start; i < end; i = i + step) array.push(i);
    return array
  }
  
  export function mean(array: number[]): number {
    let sum = 0;
    array.forEach(value => sum += value);
    return sum / array.length
  }
  
  export function standardDeviation(array: number[]): [number, number] {
    const arrayMean = mean(array);
    let sum = 0;
    array.forEach(value => sum += (value - arrayMean)**2);
    return [Math.sqrt(sum / array.length), arrayMean]
  }
  
  export function scaleArray(array: number[]): number[] {
    const [std, mean] = standardDeviation(array);
    return Array.from(array, x => (x - mean) / std)
  }
  
  export function normalizeArray(array: number[]): number[] {
    const maxAbs = Math.max(...array.map(x => Math.abs(x)));
    return array.map(x => x / maxAbs)
  }
  
  export function argMin(array: number[]): [number, number] {
    let min = Number.POSITIVE_INFINITY;
    let argMin = -1;
    array.forEach((value, index) => {
      if (value < min) {
        min = value;
        argMin = index;
      }
    })
    return [min, argMin]
  }
  
  export function argMax(array: number[]): [number, number] {
    let max = Number.NEGATIVE_INFINITY;
    let argMax = -1;
    array.forEach((value, index) => {
      if (value > max) {
        max = value;
        argMax = index;
      }
    })
    return [max, argMax]
  }
  
  export function mapMin(map: Map<any, number>): [any, number] {
    let min = Number.NEGATIVE_INFINITY;
    let keyMin: string;
    map.forEach((value, key) => {
      if (value >= min) {
        min = value;
        keyMin = key;
      }
    })
    return [keyMin, min]
  }
  
  export function mapMax(map: Map<any, number>): [any, number] {
    let max = Number.NEGATIVE_INFINITY;
    let keyMax: string = null;
    map.forEach((value, key) => {
      if (value >= max) {
        max = value;
        keyMax = key;
      }
    })
    return [keyMax, max]
  }
  
  export function sum(array: number[]): number {
    let sum = 0;
    array.forEach(value => sum += value);
    return sum
  }
  