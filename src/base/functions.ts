import { string_to_hex_dict } from "./constants";

export function string_to_hex(str:string): string {
    if (!Object.keys(string_to_hex_dict).includes(str)) {throw new Error('string_to_hex -> Invalid color : ' + str + ' not in list');}
    return string_to_hex_dict[str];
  }