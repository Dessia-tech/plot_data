// Generated by CodiumAI
import * as func from  "../../instrumented/functions";

describe('functions.equals', function() {

  // Returns true when comparing two equal values.
  it('should return true when comparing two equal values', function() {
    expect(func.equals(1, 1), "number").to.be.true;
    expect(func.equals('hello', 'hello'), "string").to.be.true;
    expect(func.equals(true, true), "boolean").to.be.true;
    expect(func.equals(null, null), "null").to.be.true;
    expect(func.equals(undefined, undefined), "undefined").to.be.true;
  });

  // Returns false when comparing two different values.
  it('should return false when comparing two different values', function() {
    expect(func.equals(1, 2), "number").to.be.false;
    expect(func.equals('hello', 'world'), "string").to.be.false;
    expect(func.equals(true, false), "boolean").to.be.false;
    expect(func.equals(null, undefined), "null").to.be.false;
    expect(func.equals({}, []), "object array").to.be.false;
  });

  // Returns true when comparing two empty arrays.
  it('should return true when comparing two empty arrays', function() {
    expect(func.equals([], []), "empty arrays").to.be.true;
  });

  // Returns false when comparing an array with a non-array value.
  it('should return false when comparing an array with a non-array value', function() {
    expect(func.equals([], 1)).to.be.false;
    expect(func.equals([], 'hello')).to.be.false;
    expect(func.equals([], true)).to.be.false;
    expect(func.equals([], null)).to.be.false;
    expect(func.equals([], undefined)).to.be.false;
  });

  // Returns false when comparing an object with a non-object value.
  it('should return false when comparing an object with a non-object value', function() {
    expect(func.equals({}, 1)).to.be.false;
    expect(func.equals({}, 'hello')).to.be.false;
    expect(func.equals({}, true)).to.be.false;
    expect(func.equals({}, null)).to.be.false;
    expect(func.equals({}, undefined)).to.be.false;
  });

  // Returns false when comparing a regular expression with a non-regular expression value.
  it('should return false when comparing a regular expression with a non-regular expression value', function() {
    expect(func.equals(/abc/, 1)).to.be.false;
    expect(func.equals(/abc/, 'hello')).to.be.false;
    expect(func.equals(/abc/, true)).to.be.false;
    expect(func.equals(/abc/, null)).to.be.false;
    expect(func.equals(/abc/, undefined)).to.be.false;
  });

  // Returns true when comparing two empty objects.
  it('should return true when comparing two empty objects', function() {
    expect(func.equals({}, {})).to.be.true;
  });

  // Returns true when comparing two arrays with the same values in different order.
  it('should return true when comparing two arrays with the same values in different order', function() {
    expect(func.equals([1, 2, 3], [3, 2, 1])).to.be.true;
    expect(func.equals(['a', 'b', 'c'], ['c', 'b', 'a'])).to.be.true;
    expect(func.equals([true, false], [false, true])).to.be.true;
    expect(func.equals([null, undefined], [undefined, null])).to.be.true;
  });

  // Returns true when comparing two regular expressions with the same source and flags.
  it('should return true when comparing two regular expressions with the same source and flags', function() {
    const regex1 = /abc/gi;
    const regex2 = /abc/gi;
    expect(func.equals(regex1, regex2)).to.be.true;
  });

  // Returns true when comparing two NaN values.
  it('should return true when comparing two NaN values', function() {
    expect(func.equals(NaN, NaN)).to.be.true;
  });

  // Returns true when comparing two objects with the same properties and values.
  it('should return true when comparing two objects with the same properties and values', function() {
    expect(func.equals({a: 1, b: 2}, {a: 1, b: 2})).to.be.true;
    expect(func.equals({name: 'John', age: 30}, {name: 'John', age: 30})).to.be.true;
    expect(func.equals({x: true, y: false}, {x: true, y: false})).to.be.true;
    expect(func.equals({a: null, b: undefined}, {a: null, b: undefined})).to.be.true;
  });

  // Returns false when comparing a value with NaN.
  it('should return false when comparing a value with NaN', function() {
    expect(func.equals(NaN, 1)).to.be.false;
    expect(func.equals(NaN, 'hello')).to.be.false;
    expect(func.equals(NaN, true)).to.be.false;
    expect(func.equals(NaN, null)).to.be.false;
    expect(func.equals(NaN, undefined)).to.be.false;
  });

  // Returns false when comparing a value with undefined.
  it('should return false when comparing a value with undefined', function() {
    expect(func.equals(undefined, 1)).to.be.false;
    expect(func.equals(undefined, 'hello')).to.be.false;
    expect(func.equals(undefined, true)).to.be.false;
    expect(func.equals(undefined, null)).to.be.false;
    expect(func.equals(undefined, {})).to.be.false;
    expect(func.equals(undefined, [])).to.be.false;
    expect(func.equals(undefined, /regex/)).to.be.false;
    expect(func.equals(undefined, NaN)).to.be.false;
  });

  // Returns false when comparing a value with null.
  it('should return false when comparing a value with null', function() {
    expect(func.equals(null, 1)).to.be.false;
    expect(func.equals(null, 'hello')).to.be.false;
    expect(func.equals(null, true)).to.be.false;
    expect(func.equals(null, undefined)).to.be.false;
  });

  // Returns false when comparing two objects with different properties.
  it('should return false when comparing two objects with different properties', function() {
    var obj1 = {a: 1, b: 2};
    var obj2 = {a: 1, b: 3};
    expect(func.equals(obj1, obj2)).to.be.false;
  });

  // Returns false when comparing two arrays with different values.
  it('should return false when comparing two arrays with different values', function() {
    expect(func.equals([1, 2, 3], [1, 2, 4])).to.be.false;
    expect(func.equals([1, 2], [1, 2, 4])).to.be.false;
    expect(func.equals(['a', 'b', 'c'], ['a', 'b', 'd'])).to.be.false;
    expect(func.equals([true, false], [true, true])).to.be.false;
    expect(func.equals([null, undefined], [null, null])).to.be.false;
    expect(func.equals([1, 'hello'], [1, 'world'])).to.be.false;
  });

  // Returns false when comparing two regular expressions with different source or flags.
  it('should return false when comparing two regular expressions with different source or flags', function() {
    const regex1 = /abc/;
    const regex2 = /def/;
    expect(func.equals(regex1, regex2)).to.be.false;
  });
});

// Generated by CodiumAI

describe("functions.uniqueValues", function() {
  it('should return an array with only unique values', function() {
    const input = [1, 2, 3, 4, 4, 5, 5];
    const expectedOutput = [1, 2, 3, 4, 5];
    const result = func.uniqueValues(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return an empty array when input array is empty', function() {
    const input = [];
    const expectedOutput = [];
    const result = func.uniqueValues(input);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.arrayDiff", function() {
  it('should return an array with values that are in array \'a\' but not in array \'b\'', function() {
    const a = [1, 2, 3, 4, 5];
    const b = [3, 4, 5, 6, 7];
    const expectedOutput = [1, 2];
    const result = func.arrayDiff(a, b);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return an empty array when both input arrays are empty', function() {
    const a = [];
    const b = [];
    const expectedOutput = [];
    const result = func.arrayDiff(a, b);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.arrayIntersection", function() {
  it('should return an array with values that are present in both arrays \'a\' and \'b\'', function() {
    const a = [1, 2, 3, 4, 5];
    const b = [3, 4, 5, 6, 7];
    const expectedOutput = [3, 4, 5];
    const result = func.arrayIntersection(a, b);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return an empty array when either input array is empty', function() {
    const a = [1, 2, 3, 4, 5];
    const b = [];
    const expectedOutput = [];
    const result = func.arrayIntersection(a, b);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.intersectArrays", function() {
  it('should return an array with the values that are present in all the input arrays', function() {
    const input = [[1, 2, 3], [2, 3, 4], [3, 4, 5]];
    const expectedOutput = [3];
    const result = func.intersectArrays(input);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.mean", function() {
  it('should return the mean value of the input array', function() {
    const input = [1, 2, 3, 4, 5];
    const expectedOutput = 3;
    const result = func.mean(input);
    expect(result).to.equal(expectedOutput);
  });

  it('should return 0 when the input array is empty', function() {
    const input = [];
    const result = func.mean(input);
    expect(result).to.equal(0);
  });

  it('should return 0 when the input array is null / undefined', function() {
    const input: number[] = null;
    const result = func.mean(input);
    expect(result).to.equal(0);
  });
});

describe("functions.computeCanvasSize", function() {
  it('should return the width and height of the canvas', function() {
    const buttonContainerName = 'buttonContainer';
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = buttonContainerName;
    buttonsContainer.style.height = '100px';
    document.body.appendChild(buttonsContainer);

    const expectedWidth = 0.95 * window.innerWidth;
    const expectedHeight = 0.95 * window.innerHeight - buttonsContainer.scrollHeight;

    const result = func.computeCanvasSize(buttonContainerName);

    expect(result).to.deep.equal([expectedWidth, expectedHeight]);

    document.body.removeChild(buttonsContainer);
  });

  it('should handle invalid button container names', function() {
    const buttonContainerName = 'invalidContainer';
    const expectedOutput = [0.95 * window.innerWidth, 0.95 * window.innerHeight];
    const result = func.computeCanvasSize(buttonContainerName);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.standardDeviation", function() {
  it('should return an array with the standard deviation and mean value', function() {
    const input = [1, 2, 3, 4, 5];
    const expectedOutput = [1.4142135623730951, 3];
    const result = func.standardDeviation(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return the standard deviation and mean of an empty array', function() {
    const input = [];
    const result = func.standardDeviation(input);
    expect(result).to.deep.equal([0, 0]);
  });

  it('should return [0, 0] when the input array is null / undefined', function() {
    const input: number[] = null;
    const result = func.standardDeviation(input);
    expect(result).to.deep.equal([0, 0]);
  });
});

describe("functions.range", function() {
  it("should return an array with the range of numbers from 'start' to 'end', incremented by 'step'", function() {
    const start = 1;
    const end = 10;
    const step = 2;
    const expectedOutput = [1, 3, 5, 7, 9];
    const result = func.range(start, end, step);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return an array with the expected range of values when given a start, end, and negative step', function() {
    const start = 10;
    const end = 0;
    const step = -2;
    const expectedOutput = [10, 8, 6, 4, 2];
    const result = func.range(start, end, step);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.scaleArray", function() {
  it('should scale the values of the input array by the standard deviation and mean value', function() {
    const input = [1, 2, 3, 4, 5];
    const expectedOutput = [-1.414213562373095, -0.7071067811865475, 0, 0.7071067811865475, 1.414213562373095];
    const result = func.scaleArray(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return the same array when given an array with a single value', function() {
    const input = [1];
    const expectedOutput = [0];
    const result = func.scaleArray(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return the same array when given an array with no value', function() {
    const input = [];
    const expectedOutput = [];
    const result = func.scaleArray(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return the array when given an array is null / undefined', function() {
    const input: number[] = null;
    const result = func.scaleArray(input);
    expect(result).to.deep.equal(input);
  });
});

describe("functions.normalizeArray", function() {
  it('should return an array with normalized values', function() {
    const input = [1, 2, 3, 4, 5];
    const expectedOutput = [0.2, 0.4, 0.6, 0.8, 1];
    const result = func.normalizeArray(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return an [1] array when given an singleton', function() {
    const input = [12];
    const expectedOutput = [1];
    const result = func.normalizeArray(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should return an empty array when given an empty array', function() {
    const input = [];
    const expectedOutput = [];
    const result = func.normalizeArray(input);
    expect(result).to.deep.equal(expectedOutput);
  });
});

describe("functions.argMin", function() {
  it('should correctly return the index of the minimum value in an array of positive numbers', function() {
    const array = [5, 2, 8, 1, 9];
    const result = func.argMin(array);
    expect(result).to.deep.equal([1, 3]);
  });

  it('should correctly handle an empty array when computing the argMin', function() {
    const array = [];
    const result = func.argMin(array);
    expect(result).to.deep.equal([Number.POSITIVE_INFINITY, -1]);
  });

  it('should correctly return the index of the minimum value in an array of negative numbers', function() {
    const array = [-5, -2, -8, -1, -9];
    const result = func.argMin(array);
    expect(result).to.deep.equal([-9, 4]);
  });

  it('should correctly return the index of the minimum value in an array with a single value', function() {
    const array = [5];
    const result = func.argMin(array);
    expect(result).to.deep.equal([5, 0]);
  });
});

describe("functions.argMax", function() {
  it('should correctly return the index of the maximum value in an array of positive numbers', function() {
    const array = [5, 2, 8, 1, 9];
    const result = func.argMax(array);
    expect(result).to.deep.equal([9, 4]);
  });

  it('should correctly handle an empty array when computing the argMax', function() {
    const array = [];
    const result = func.argMax(array);
    expect(result).to.deep.equal([Number.NEGATIVE_INFINITY, -1]);
  });

  it('should correctly return the index of the maximum value in an array of negative numbers', function() {
    const array = [-5, -2, -8, -1, -9];
    const result = func.argMax(array);
    expect(result).to.deep.equal([-1, 3]);
  });

  it('should correctly return the index of the maximum value in an array with a single value', function() {
    const array = [5];
    const result = func.argMax(array);
    expect(result).to.deep.equal([5, 0]);
  });
});

describe("functions.mapMin", function() {
  it('should correctly return the key-value pair of the minimum value in a map numbers', function() {
    const map = new Map();
    map.set('a', 5);
    map.set('b', -2);
    map.set('c', 8);
    map.set('d', -1);
    map.set('e', 9);
    const result = func.mapMin(map);
    expect(result).to.deep.equal(['b', -2]);
  });  

  it('should correctly handle an empty map when computing the mapMin', function() {
    const map = new Map();
    const result = func.mapMin(map);
    expect(result).to.deep.equal([null, Number.POSITIVE_INFINITY]);
  });
});


describe("functions.mapMax", function() {
  it('should correctly return the key-value pair of the maximum value in a map of numbers', function() {
    const map = new Map();
    map.set('a', 5);
    map.set('b', -2);
    map.set('c', 8);
    map.set('d', -1);
    map.set('e', 9);
    const result = func.mapMax(map);
    expect(result).to.deep.equal(['e', 9]);
  });

  it('should correctly handle an empty map when computing the mapMax', function() {
    const map = new Map();
    const result = func.mapMax(map);
    expect(result).to.deep.equal([null, Number.NEGATIVE_INFINITY]);
  });
});

describe("functions.sum", function () {
  it('should correctly return the sum of an array of numbers', function() {
    const array = [-10, 22, -7, 1, 2, 3, 4, 5];
    const result = func.sum(array);
    expect(result).to.equal(20);
  });

  it('should correctly handle an empty array when computing the sum', function() {
    const array = [];
    const result = func.sum(array);
    expect(result).to.equal(0);
  });  
});
