import { string_to_hex } from "./color_conversion";
import { equals } from "./utils";

/**
 * A generic toolbox class that contains numerous geometrical static functions.
 * The functions often require a context, which is got from a canvas element.
 */
export class Shape {

    /**
     * Draws lines that join each point of the list parameter
     * @param list A list of points: [[x1, y1], [x2, y2],..., [xn, yn]]
     */
    public static drawLine(context, list) {
      context.moveTo(list[0][0], list[0][1]);
      for (var i=1; i<list.length; i++) {
        context.lineTo(list[i][0], list[i][1]);
      }
    }

    /**
     * Draws a crux
     * @param cx center x coordinate of the crux
     * @param cy center y coordinate of the crux
     * @param length half the lengh of the crux
     */
    public static crux(context:any, cx:number, cy:number, length:number) {
      this.drawLine(context, [[cx, cy], [cx - length, cy]]);
      this.drawLine(context, [[cx, cy], [cx + length, cy]]);
      this.drawLine(context, [[cx, cy], [cx, cy - length]]);
      this.drawLine(context, [[cx, cy], [cx, cy + length]]);
    }


    /**
     *
     * @param x x coordinate of the top-left corner
     * @param y y coordinate od the top_left corner
     * @param w width
     * @param h height
     * @param radius radius of the corners
     * @param context canvas' context element
     * @param opacity between 0 and 1
     * @param dashline a pattern list [a_0,..., a_n] where a_i represents the number of filled pixels is i%2 == 0
     and the number of empty pixels if i%2 != 0. [] for no dashline.
     */
    public static roundRect(x, y, w, h, radius, context, color_fill='No', color_stroke=string_to_hex('black'), line_width=1, opacity=1, dashline=[]) {
      var r = x + w;
      var b = y + h;
      context.setLineDash(dashline);
      context.fillStyle = color_fill;
      context.strokeStyle = color_stroke;
      context.lineWidth = line_width;
      context.globalAlpha = opacity;

      context.moveTo(x+radius, y);
      context.lineTo(r-radius, y);
      context.quadraticCurveTo(r, y, r, y+radius);
      context.lineTo(r, y+h-radius);
      context.quadraticCurveTo(r, b, r-radius, b);
      context.lineTo(x+radius, b);
      context.quadraticCurveTo(x, b, x, b-radius);
      context.lineTo(x, y+radius);
      context.quadraticCurveTo(x, y, x+radius, y);

      if (color_fill != 'No') { context.fill(); }
      if (color_stroke != 'No') { context.stroke(); }
      context.globalAlpha = 1;
      context.setLineDash([]);
    }


    /**
     * @returns true if (x, y) is in the rectangle, false otherwise
     * @param x the point's x coordinate
     * @param y the point's y coordinate
     * @param rect_x the rectangle's top_left x coordinate
     * @param rect_y the rectangle's top-left y coordinate
     * @param rect_w the rectangle's width
     * @param rect_h the rectangle's height
     */
    public static isInRect(x, y, rect_x, rect_y, rect_w, rect_h) {
      if (rect_w>=0 && rect_h>=0) {
        return ((x>=rect_x) && (x<= rect_x + rect_w) && (y>=rect_y) && (y<=rect_y + rect_h));
      } else if (rect_w<0 && rect_h>0) {
        return ((x >= rect_x + rect_w) && (x <= rect_x) && (y >= rect_y) && (y <= rect_y + rect_h));
      } else if (rect_w>0 && rect_h<0) {
        return ((x>=rect_x) && (x<=rect_x + rect_w) && (y>=rect_y + rect_h) && (y<=rect_y));
      } else {
        return ((x>=rect_x + rect_w) && (x<=rect_x) && (y>=rect_y + rect_h) && (y<=rect_y));
      }
    }

    public static createButton(x, y, w, h, context, text, police) {
      context.beginPath();
      context.fillStyle = 'white';
      context.lineWidth = "3";
      context.rect(x,y,w,h);
      context.stroke();
      context.fill();
      context.closePath();
      context.beginPath();
      context.fillStyle = "black"
      context.textAlign = "center";
      context.textBaseline = 'middle';
      context.font = police;
      context.fillText(text, x+w/2, y+h/2);
      context.fill();
      context.closePath();
    }

    public static createGraphButton(x, y, w, h, context, text, police, color_fill, strikeout) {
      context.beginPath();
      context.fillStyle = color_fill;
      context.rect(x,y,w,h);
      context.fill();
      context.closePath();
      context.beginPath();
      context.fillStyle = 'grey';
      context.textAlign = 'start';
      context.textBaseline = 'middle';
      context.font = police;
      context.fillText(text, x+w + 5, y+h/1.8);
      context.fill();
      if (strikeout === true) {
        var text_w = context.measureText(text).width;
        context.lineWidth = 1.5;
        context.strokeStyle = 'grey';
        Shape.drawLine(context, [[x+w + 5, y+h/1.8], [x+w+5+text_w, y+h/2]]);
        context.stroke();
      }
      context.closePath();
    }

    /**
     * Draws a rectangle on canvas.
     * @param x the rectangle's top-left x coordinate
     * @param y the rectangle's top-left y coordinate
     * @param w the rectangle's width
     * @param h the rectangle's height
     * @param context canvas' context
     * @param color_fill the rectangle's fill color. Can be set to 'No' if the rectangle
     doesn't have to be filled.
     * @param color_stroke its stroke color. It can be set to 'No' if a contour isn't needed.
     * @param line_width its contour's line width.
     * @param opacity The opacity inside (from 0 to 1).
     * @param dashline contour's dashline ([] for no dashline). A pattern list [a_0,..., a_n] where a_i represents the number of filled pixels is i%2 == 0
     and the number of empty pixels if i%2 != 0.
     */
    public static rect(x, y, w, h, context, color_fill='No', color_stroke=string_to_hex('black'), line_width=1, opacity=1, dashline=[]) {
      context.beginPath();
      context.setLineDash(dashline);
      context.fillStyle = color_fill;
      context.strokeStyle = color_stroke;
      context.lineWidth = line_width;
      context.globalAlpha = opacity;
      context.rect(x,y,w,h);
      if (color_fill != 'No') { context.fill(); }
      if (color_stroke != 'No') { context.stroke(); }
      context.closePath();
      context.globalAlpha = 1;
      context.setLineDash([]);
    }

    /**
     *
     * @param x The point's x coordinate
     * @param y The point's y coordinate
     * @param cx The circle's center x-coordinate
     * @param cy Thre circle's center y-coordinate
     * @param r The circle's radius
     */
    public static isInCircle(x, y, cx, cy, r) {
      var delta_x2 = Math.pow(x - cx, 2);
      var delta_y2 = Math.pow(y - cy, 2);
      var distance = Math.sqrt(delta_x2 + delta_y2);
      return distance <= r;
    }
}

export class MyObject {

  /**
   * Returns the input dictionary without keys that are in input.
   */
  public static removeEntries(keys:string[], dict_) {
    var entries = Object.entries(dict_);
    var i=0;
    while (i<entries.length) {
      if (List.is_include(entries[i][0], keys)) {
        entries = List.remove_at_index(i, entries);
      } else {
        i++;
      }
    }
    return Object.fromEntries(entries);
  }

  /**
   * A shallow copy.
   */
  public static copy(obj) {
    return Object.assign({}, obj);
  }

  /**
   * A function that clones without references. It handles circular references.
   */
  public static deepClone(obj, hash = new WeakMap()) {
    // Do not try to clone primitives or functions
    if (Object(obj) !== obj || obj instanceof Function) return obj;
    if (hash.has(obj)) return hash.get(obj); // Cyclic reference
    try { // Try to run constructor (without arguments, as we don't know them)
        var result = new obj.constructor();
    } catch(e) { // Constructor failed, create object without running the constructor
        result = Object.create(Object.getPrototypeOf(obj));
    }
    // Optional: support for some standard constructors (extend as desired)
    if (obj instanceof Map)
        Array.from(obj, ([key, val]) => result.set(this.deepClone(key, hash),
        this.deepClone(val, hash)) );
    else if (obj instanceof Set)
        Array.from(obj, (key) => result.add(this.deepClone(key, hash)) );
    // Register in hash
    hash.set(obj, result);
    // Clone and assign enumerable own properties recursively
    return Object.assign(result, ...Object.keys(obj).map (
        key => ({ [key]: this.deepClone(obj[key], hash) }) ));
  }

  public static add_properties(obj:Object, ...entries:[string, any][]): Object {
    var obj_entries = Object.entries(obj);
    for (let entry of entries) {
      obj_entries.push(entry);
    }
    return Object.fromEntries(obj_entries);
  }

}


/**
 * A toolbox with useful functions that manipulate arrays.
 */
 export class List {
  // public static sort_without_duplicates(list:number[]) {
  //   if (list.length == 0) return list;
  //   var sort = new Sort();
  //   var sorted = sort.MergeSort(list);
  //   var no_duplicates = [list[0]];
  //   var current_elt = sorted[0];
  //   for (let val of sorted) {
  //     if (val>current_elt) {
  //       current_elt = val;
  //       no_duplicates.push(val);
  //     }
  //   }
  //   return no_duplicates
  // }

/**
 *
 * @returns a sub-array from i to j-1 included. Ex : subarray([0,1,2,3], 1, 3) = [1,2]
 */
  public static subarray(list, i, j) {
    return list.slice(i, j)
  }


  /**
   * @returns the input list without its duplicates.
   */
  public static remove_duplicates(list:any[]) {
    var seen = {};
    var out = [];
    var len = list.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
      var item = list[i];
      if(seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
      }
    }
    return out;
  }

  /**
   * @returns true if the list contains a undefined element, false otherwise.
   */
  public static contains_undefined(list:any[]):boolean {
    for (var i=0; i<list.length; i++) {
      if (typeof list[i] === "undefined") {
        return true;
      }
    }
    return false;
  }


  public static copy(list:any[]): any[] {
    var new_list = [];
    for (var i=0; i<list.length; i++) {
      new_list.push(list[i]);
    }
    return new_list;
    // return Array.from(list);
  }


  /**
   * @returns a the input list without the first element equal to val.
   */
  public static remove_first_selection(val:any, list:any[]): any[] { //remove the first occurrence of val in list
    var temp = [];
    var bool = true;
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if ((val != d) && bool) {
        temp.push(d);
        bool = false;
      }
    }
    return temp;
  }


  /**
   * Compares two lists by comparing their elements using ===
   */
  public static equals(list1, list2) {
    // if (list1.length != list2.length) { return false; }
    // for (let i=0; i<list1.length; i++) {
    //   if (list1[i] !== list2[i]) {
    //     return false;
    //   }
    // }
    // return true;
    return list1.toString() === list2.toString();
  }

  /**
   * @returns The input list without all instances of val.
   */
  public static remove_element(val:any, list:any[]): any[] { //remove every element=val from list
    return list.filter(elt => elt !== val);
  }

  /**
   * @returns true or false whether val is inside list or not. It uses a generic equals function
   */
  public static is_include(val:any, list:any[]): boolean {
    return list.findIndex(elt => equals(elt, val)) !== -1;
  }

  /**
   * @returns true or false whether a list is inside an array of list. It uses a generic equals function.
   */
  public static is_list_include(list:any[], listArray:any[][]) { //check if a list is inside a list of lists
    for (let i=0; i<listArray.length; i++) {
        if (this.equals(listArray[i], list)) {
            return true;
        }
    }
    return false;
  }

  /**
   * Provided that obj_list is a list of objects (ie. dictionary is TS), it returns true if a element
   of obj_list has an attribute 'name' equal to the input name, and false otherwise.
   */
  public static is_name_include(name:string, obj_list:any[]): boolean {
    for (let i=0; i<obj_list.length; i++) {
      if (name === obj_list[i].name) {
        return true;
      }
    }
    return false;
  }


  /**
   * @returns [min, max] of the input list
   * @param list a list of real numbers
   */
  public static getExtremum(list:number[]): [number, number] { //Get the extremas of the list
    var min = list[0];
    var max = list[0];
    for (let i=0; i<list.length; i++) {
      if (list[i]>max) {
        max = list[i];
      }
      if (list[i]<min) {
        min = list[i];
      }
    }
    return [min, max];
  }


  /**
   * @returns a list where value is inserted at index inside list
   */
  public static insert(value:any, index:number, list:any[]): void {
    list.splice(index, 0, value);
  }


  /**
   * @returns the index of val in list
   */
  public static get_index_of_element(val:any, list:any[]):number {
    var elt_index = list.findIndex(obj => Object.is(obj, val));
    if (elt_index !== -1) {
      return elt_index;
    }
    throw new Error('cannot get index of element')
  }

  /**
   * @returns The input list after removing its element at index i
   */
  public static remove_at_index(i:number, list:any[]):any[] {
    return list.slice(0, i).concat(list.slice(i + 1, list.length));
  }

  public static remove_at_indices(start_index:number, end_index:number, list:any[]):any[] {
    if (start_index > end_index) throw new Error('remove_indices(): start_index must be <= end_index');
    if (start_index<0 || end_index>=list.length) throw new Error('remove_indices(): index out of range');
    for (let i=0; i<=end_index-start_index; i++) {
      list = this.remove_at_index(start_index, list);
    }
    return list;
  }

  /**
   * @returns the input list after removing its element at index old_index and
   * inserting it at new_index
   */
  public static move_elements(old_index:number, new_index:number, list:any[]):any[] {
    var elt = list[old_index];
    if (old_index<new_index) {
      list.splice(new_index+1, 0, elt);
      list = this.remove_at_index(old_index, list);
    } else {
      list.splice(new_index, 0, elt);
      list = this.remove_at_index(old_index + 1, list);
    }
    return list;
  }


  /**
   * Exchanges list's elements at index1 and index2.
   */
  public static switchElements(list:any[], index1:number, index2:number): void {
    [list[index1], list[index2]] = [list[index2], list[index1]];
  }


  public static reverse(list:any[]): any[] {
    return Array.from(list).reverse();
  }

  /**
   * Checks whether list is a list of empty list, ie [[], [],..., []]
   */
  public static isListOfEmptyList(list:any[]): boolean {
    for (let i=0; i<list.length; i++) {
      if (list[i].length !== 0) {
        return false;
      }
    }
    return true;
  }



  /**
   * @returns A list that contains all elements that are inside both list1 and list2
   */
  public static listIntersection(list1:any[], list2:any[]): any[] {
    // var intersection = [];
    // for (let i=0; i<list1.length; i++) {
    //   if (this.is_include(list1[i], list2)) {
    //     intersection.push(list1[i]);
    //   }
    // }
    // return intersection;
    return list1.filter(value => list2.includes(value));
  }

  /**
   * @returns A list that contains all elements that are inside both list1 and list2. If one list is empty, then it returns the other list.
   */
  public static listIntersectionExceptEmpty(list1:any[], list2:any[]) {
    if (list1.length === 0) return list2;
    if (list2.length === 0) return list1;
    return list1.filter(value => list2.includes(value));
  }


  /**
   * @returns a list that contains list's elements at index <list_index[i].
   ex: getListEltFromIndex([1,2], ['a', 'b', 'c', 'd']) = ['b', 'c']
   */
  public static getListEltFromIndex(list_index:number[], list:any[]): any[] {
    var new_list = [];
    for (let i=0; i<list_index.length; i++) {
      new_list.push(list[list_index[i]]);
    }
    return new_list;
  }


  /**
   * @returns the union of list1 and list2, ie a list that contains elements that are
   inside list1 or list2
   */
  public static union(list1:any[], list2:any[]): any[] {
    var union_list = this.copy(list1);
    for (let i=0; i<list2.length; i++) {
      if (!this.is_include(list2[i], union_list)) {
        union_list.push(list2[i]);
      }
    }
    return union_list;
  }


  /**
   * @param to_remove a list that contains elements to be removed from list
   */
  public static remove_selection(to_remove:any[], list:any[]): any[] {
    var new_list = Array.from(list);
    for (let val of to_remove) {
      new_list = List.remove_element(val, new_list);
    }
    return new_list;
  }
} //end class List


/**
 * A toolbox class that contains useful functions that don't exist in typescript API.
 */
 export class MyMath {

  /**
   * ex: round(1.12345, 2) = 1.12
   */
  public static round(x:number, n:number) {
    return Math.round(x*Math.pow(10,n)) / Math.pow(10,n);
  }
}
