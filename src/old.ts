// REQUIRED IN WORKFLOW BUILDER APP
// MUST BE REMOVED BY WRITING USED METHODS IN WORKFLOW BUILDER (CAUSE UNUSED IN PLOT_DATA)

import { equals } from "./functions";

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
    public static subarray(list, i, j) { return list.slice(i, j) }
  
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
    public static getExtremum(list: number[]): [number, number] { //Get the extremas of the list
      var min = list[0];
      var max = list[0];
      for (let i=0; i<list.length; i++) {
        if (list[i] >= max) {max = list[i]};
        if (list[i] <= min) {min = list[i]};
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
  