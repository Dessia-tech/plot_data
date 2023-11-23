// REQUIRED IN WORKFLOW BUILDER APP
// MUST BE REMOVED BY WRITING USED METHODS IN WORKFLOW BUILDER (CAUSE UNUSED IN PLOT_DATA)

import { equals } from "./functions";

export class List {
  public static subarray(list, i, j) { return list.slice(i, j) }

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
  }

  public static remove_first_selection(val:any, list:any[]): any[] {
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

  public static equals(list1, list2) {
    return list1.toString() === list2.toString();
  }

  public static remove_element(val:any, list:any[]): any[] {
    return list.filter(elt => elt !== val);
  }

  public static is_include(val:any, list:any[]): boolean {
    return list.findIndex(elt => equals(elt, val)) !== -1;
  }

  public static is_list_include(list:any[], listArray:any[][]) {
    for (let i=0; i<listArray.length; i++) {
        if (this.equals(listArray[i], list)) {
            return true;
        }
    }
    return false;
  }

  public static is_name_include(name:string, obj_list:any[]): boolean {
    for (let i=0; i<obj_list.length; i++) {
      if (name === obj_list[i].name) {
        return true;
      }
    }
    return false;
  }

  public static getExtremum(list: number[]): [number, number] {
    var min = list[0];
    var max = list[0];
    for (let i=0; i<list.length; i++) {
      if (list[i] >= max) {max = list[i]};
      if (list[i] <= min) {min = list[i]};
    }
    return [min, max];
  }

  public static insert(value:any, index:number, list:any[]): void {
    list.splice(index, 0, value);
  }

  public static get_index_of_element(val:any, list:any[]):number {
    var elt_index = list.findIndex(obj => Object.is(obj, val));
    if (elt_index !== -1) {
      return elt_index;
    }
    throw new Error('cannot get index of element')
  }

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

  public static switchElements(list:any[], index1:number, index2:number): void {
    [list[index1], list[index2]] = [list[index2], list[index1]];
  }


  public static reverse(list:any[]): any[] { return Array.from(list).reverse() }

  public static isListOfEmptyList(list:any[]): boolean {
    for (let i=0; i<list.length; i++) {
      if (list[i].length !== 0) {
        return false;
      }
    }
    return true;
  }

  public static listIntersection(list1:any[], list2:any[]): any[] {
    return list1.filter(value => list2.includes(value));
  }

  public static listIntersectionExceptEmpty(list1:any[], list2:any[]) {
    if (list1.length === 0) return list2;
    if (list2.length === 0) return list1;
    return list1.filter(value => list2.includes(value));
  }

  public static getListEltFromIndex(list_index:number[], list:any[]): any[] {
    var new_list = [];
    for (let i=0; i<list_index.length; i++) {
      new_list.push(list[list_index[i]]);
    }
    return new_list;
  }

  public static union(list1:any[], list2:any[]): any[] {
    var union_list = this.copy(list1);
    for (let i=0; i<list2.length; i++) {
      if (!this.is_include(list2[i], union_list)) {
        union_list.push(list2[i]);
      }
    }
    return union_list;
  }

  public static remove_selection(to_remove:any[], list:any[]): any[] {
    var new_list = Array.from(list);
    for (let val of to_remove) {
      new_list = List.remove_element(val, new_list);
    }
    return new_list;
  }
}
