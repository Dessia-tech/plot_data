export function equals(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equals(a[i], b[i])) return false;
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

export function isInteger(value: number): boolean {
  return Math.floor(value) == value
}

export function isIntegerArray(array: number[]): boolean {
  return !array.some(value => !isInteger(value) && value != null)
}

export function getTenPower(value: number): number {
  return value != 0 ? Math.floor(Math.log10(Math.abs(value))) : 0
}

export function uniqueValues<T>(vector: T[]): T[] {
  return vector.filter((value, index, array) => array.indexOf(value) === index)
}

export function addInitZero(value: string | number): string {
  const str = typeof value == "number" ? value.toString() : value;
  return str.length == 1 ? `0${str}` : str
}

export function datesInMilliseconds(dateTicks: number[]): string[] {
  return dateTicks.map(tick => {
    const date = new Date(tick);
    return `${date.getMilliseconds()} ms`
  });
}

export function datesInSeconds(dateTicks: number[]): string[] {
  return dateTicks.map(tick => {
    const date = new Date(tick);
    return `${date.getSeconds()}.${date.getMilliseconds()} s`
  });
}

export function datesInMinutes(dateTicks: number[]): string[] {
  return dateTicks.map(tick => {
    const date = new Date(tick);
    return `${date.getMinutes()}:${date.getSeconds()} min`
  });
}

export function datesInHours(dateTicks: number[]): string[] {
  return dateTicks.map(tick => {
    const date = new Date(tick);
    return `${addInitZero(date.getHours())}:${addInitZero(date.getMinutes())}:${addInitZero(date.getSeconds())}`
  });
}

export function datesInDays(dateTicks: number[]): string[] {
  return dateTicks.map(tick => {
    const date = new Date(tick);
    return `${addInitZero(date.getDay() + 1)}/${addInitZero(date.getMonth() + 1)}/${date.getFullYear()} - ${addInitZero(date.getHours())}:${addInitZero(date.getMinutes())}:${addInitZero(date.getSeconds())}`
  })
}

export function formatDateTicks(dateTicks: number[]): string[] {
  const min = Math.min(...dateTicks);
  const interval = Math.max(...dateTicks) - min;
  if (interval <= 1000) return datesInMilliseconds(dateTicks);
  if (interval <= 60000) return datesInSeconds(dateTicks);
  if (interval <= 360000) return datesInMinutes(dateTicks);
  if (interval <= 8640000) return datesInHours(dateTicks);
  return datesInDays(dateTicks)
}

export function arrayDiff<T>(a: T[], b: T[]): T[] {
  if (b.length == 0) return a;
  return a.filter(value => !b.includes(value));
}

export function arrayIntersection<T>(a: T[], b: T[]): T[] {
  return a.filter(value => b.includes(value));
}

export function intersectArrays<T>(arrays: T[][]): T[] {
  if (arrays.length == 1) return arrays[0]
  if (arrays.length == 0) return []
  const arraysIntersection = [];
  const allValues = [].concat(...arrays);
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
  const buttonsContainer = document.querySelector(buttonContainerName) ?? document.getElementById(buttonContainerName);
  if (buttonsContainer) return [0.95 * window.innerWidth, 0.95 * window.innerHeight - buttonsContainer.scrollHeight]
  return [0.95 * window.innerWidth, 0.95 * window.innerHeight]
}

export function range(start: number, end: number, step: number = 1): number[] {
  let array = [];
  if (start < end) for (let i = start; i < end; i = i + step) array.push(i);
  if (start > end) for (let i = start; i > end; i = i + step) array.push(i);
  return array
}

export function mean(array: number[]): number {
  if (!array) return 0
  if (array.length == 0) return 0
  let sum = 0;
  array.forEach(value => sum += value);
  return sum / array.length
}

export function standardDeviation(array: number[]): [number, number] {
  if (!array) return [0, 0]
  if (array.length == 0) return [0, 0]
  const arrayMean = mean(array);
  let sum = 0;
  array.forEach(value => sum += (value - arrayMean)**2);
  return [Math.sqrt(sum / array.length), arrayMean]
}

export function scaleArray(array: number[]): number[] {
  if (!array) return array
  const [std, mean] = standardDeviation(array);
  return Array.from(array, x => (x - mean) / (std == 0 ? 1 : std))
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
  let min = Number.POSITIVE_INFINITY;
  let keyMin: string = null;
  map.forEach((value, key) => {
    if (value <= min) {
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
