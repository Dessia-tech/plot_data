// import { PiePart } from "./primitives";
// import { Coordinates } from "./coordinates";
// import { PlotData } from "./plot-data";
// import { PlotPieChart } from "./subplots";

// interface VertexDirections {
//   nodeIndex: number,
//   up: boolean
//   down: boolean
//   left: boolean
//   right: boolean
// }

// export class MouseHandler {
//   mouseDown: Coordinates = null
//   mouseMove: Coordinates = null
//   mouseUp: Coordinates = null

//   originBeforeTranslation: Coordinates = null
//   isPerformingTranslation: boolean = false
//   mouseIsDown: boolean = false

//   vertex_infos: VertexDirections = null

//   clickedNodeIndex: number = null
//   nodeIndex: number = null

//   clickedPart: PiePart = null
//   rightClickedPart: PiePart = null
//   part: PiePart = null


//   constructor() { }

//   performMouseDown() {
//     this.mouseDown = this.mouseMove
//     this.mouseIsDown = true
//     this.mouseUp = null
//     this.clickedNodeIndex = this.nodeIndex
//     this.clickedPart = this.part
//   }

//   performMouseUp() {
//     this.mouseDown = null
//     this.mouseIsDown = false
//     this.clickedNodeIndex = null
//     this.clickedPart = null
//     this.rightClickedPart = null
//     this.originBeforeTranslation = null
//     this.isPerformingTranslation = false
//   }


//   initializeMouseOver(plotData: PlotData, hidden_context: CanvasRenderingContext2D, scale: number, origin: Coordinates) {
//     this.nodeIndex = this.getNodeIndexByMouseCoordinates(plotData, scale, origin)
//     this.part = null

//     workflow.nodes.forEach((node: Node, nodeIndex: number) => {
//       // Node handling
//       node.isMouseOver = (nodeIndex == this.nodeIndex)
//       node.setIsMouseOverRemoveCross(scale, origin, this.mouseMove)
//       node.setIsMouseOverEditButton(scale, origin, this.mouseMove)

//       if (node.isMouseOver)
//         this.node = node

//       // Ports handling :
//       node.ports.forEach((port: Port) => {
//         port.isMouseOver = port.isMouseInPortShape(scale, origin, this.mouseMove)
//         if (port.isMouseOver)
//           this.port = port
//       })
//     })

//     // Pipes handling :
//     workflow.pipes.forEach((pipe) => {
//       pipe.isMouseOver = false
//       pipe.isMouseOverRemoveButton = false
//     })
//     this.pipe = this.getPipeUnderMouse(workflow, hidden_context)
//     if (this.pipe){
//       this.pipe.isMouseOver = true
//       this.pipe.setIsMouseOnRemoveCircle(scale, origin, this.mouseMove)
//     }
//   }

//   getPipeUnderMouse(workflow: Workflow, hidden_context: CanvasRenderingContext2D): Pipe {
//     var col = hidden_context.getImageData(this.mouseMove.x, this.mouseMove.y, 1, 1).data;
//     var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
//     return workflow.color_to_pipe[colKey]
//   }

//   /** @returns:  Index of last node in workflow.display_order on mouse position, null if mouse in void */
//   getNodeIndexByMouseCoordinates(workflow: Workflow, scale: number, origin: Coordinates): number { //TODO : Should be a mouseHandler method ?
//     for (let i = workflow.display_order.length - 1; i >= 0; i--) {
//       const nodeIndex = workflow.display_order[i]
//       let node = workflow.nodes[nodeIndex]
//       if (node.isMouseInNodeShape(scale, origin, this.mouseMove))
//         return nodeIndex
//     }
//     return null
//   }

// }