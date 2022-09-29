// import { Position } from "@models/workflow"



// export class Coordinates {
//   x: number
//   y: number

//   constructor(x = 0, y = 0) {
//     this.x = x
//     this.y = y
//   }

//   *[Symbol.iterator]() {
//     let positionAsArray = [this.x, this.y]
//     for (let item of positionAsArray) yield item
//   }

//   toPosition(scale: number, originCoordinates: Coordinates) {
//     return new Position((this.x - originCoordinates.x) / scale, (this.y - originCoordinates.y) / scale)
//   }

//   copy() {
//     return new Coordinates(this.x, this.y)
//   }
// }