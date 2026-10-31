import React, { useContext, useEffect, useRef, useState } from 'react'
import boardcontext from './boardcontext'
import Toolboxcontext from './Toolboxcontext';
import { isPointCloseToLine, isPointCloseToEllipse, distanceBetweenPoints } from '../constants/math';
import { ELEMENT_ERASE_THRESHOLD } from '../constants/constants';
import { getStrokePoints } from 'perfect-freehand';
import { getStroke } from 'perfect-freehand';
import { getStrokeOutlinePoints } from 'perfect-freehand';

// Single reusable offscreen canvas used only for measuring text width/height.
// Created once at module scope so the eraser's mousemove loop doesn't allocate
// a new canvas on every pointer event.
const measureCanvas = document.createElement("canvas");
const measureCtx = measureCanvas.getContext("2d");

const getTextBoundingBox = (element) => {
     measureCtx.font = `${element.text_size}px ${element.text_font}`;
     const metrics = measureCtx.measureText(element.text_value);

     const width = metrics.width;
     // fillText draws from the baseline, so the box extends above element.y
     // by the ascent and below it by the descent (g, p, y descenders).
     const ascent = metrics.actualBoundingBoxAscent ?? element.text_size * 0.8;
     const descent = metrics.actualBoundingBoxDescent ?? element.text_size * 0.2;

     return {
          x1: element.x,
          y1: element.y - ascent,
          x2: element.x + width,
          y2: element.y + descent
     };
};

function Boardcontextprovider({ children,initialElements = [],socket = null, canvasId = null }) {
     let { strokeColor, setstrokeColor } = useContext(Toolboxcontext)
     let [activeItem, setactiveItem] = useState("LINE")
     let [isDraw, setisDraw] = useState(false);
     let [start, setStart] = useState(null);
     let [current, setCurrent] = useState(null);
     const { size, setSize } = useContext(Toolboxcontext)
     
     let [index, setIndex] = useState(0);
     let [hasMoved, sethasMoved] = useState(false)
     let [pathpoints, setpathpoints] = useState([])
     let { fillColor, setfillColor } = useContext(Toolboxcontext)
     let [textpoint, settextpoint] = useState(null);
     let [isText, setisText] = useState(false)
     let [text, setText] = useState("")
     const { textSize, setTextSize } = useContext(Toolboxcontext)
     let [Elements, setElements] = useState(initialElements)
     let [history, setHistory] = useState([initialElements]);
          // The last drawing we sent to, or received from, the server
      const lastRef = useRef(JSON.stringify(initialElements));

     // My change -> send it to the server
     useEffect(() => {
          if (!socket || !canvasId) return;

          const json = JSON.stringify(Elements);
          if (json === lastRef.current) return;   // nothing new to send
          lastRef.current = json;

          socket.emit('update-elements', { canvasId, elements: Elements }, (res) => {
               if (!res?.ok) console.error('update-elements failed:', res?.error);
          });
     }, [Elements, socket, canvasId]);

     // Someone else's change -> show it on my board
     useEffect(() => {
          if (!socket) return;

          const onUpdated = (elements) => {
               lastRef.current = JSON.stringify(elements);   // so it isn't sent back
               setElements(elements);
               setHistory([elements]);
               setIndex(0);
          };

          socket.on('elements-updated', onUpdated);
          return () => socket.off('elements-updated', onUpdated);
     }, [socket]);
     let HandleUndo = () => {
          if (index === 0) return
          setIndex(index - 1)
          setElements(history[index - 1])

     }
     let HandleRedo = () => {
          if (index === history.length - 1) return
          setIndex(index + 1)
          setElements(history[index + 1])
     }


     // Builds the TEXT element from whatever is currently in the input box.
     const makeTextElement = () => ({
          type: "TEXT",
          x: textpoint.x,
          y: textpoint.y,
          text_value: text,
          stroke: strokeColor,
          text_size: Number(textSize),
          text_font: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive"
     });

     // Pushes a new board state AND its history snapshot together, so
     // history[index] always matches Elements.
     const commit = (newElements) => {
          setElements(newElements);
          setHistory(prev => [
               ...prev.slice(0, index + 1),
               newElements
          ]);
          setIndex(index + 1);
     };

     let handleToolItemClick = (tool) => {
          // Track the post-commit values locally — the `index` and `history`
          // from this render are stale the moment we save pending text, and
          // undo/redo below has to work off the updated ones.
          let nextElements = Elements;
          let nextHistory = history;
          let nextIndex = index;

          // If currently typing text, save it before changing tools
          if (isText && text.trim() !== "" && textpoint) {
               nextElements = [...Elements, makeTextElement()];
               nextHistory = [...history.slice(0, index + 1), nextElements];
               nextIndex = index + 1;

               setElements(nextElements);
               setHistory(nextHistory);
               setIndex(nextIndex);
          }

          // Remove the text input
          setisText(false);
          setText("");
          settextpoint(null);

          if (tool === "UNDO") {
               if (nextIndex === 0) return;
               setElements(nextHistory[nextIndex - 1]);
               setIndex(nextIndex - 1);
               return;
          }

          if (tool === "REDO") {
               if (nextIndex === nextHistory.length - 1) return;
               setElements(nextHistory[nextIndex + 1]);
               setIndex(nextIndex + 1);
               return;
          }
          if (tool === "DOWNLOAD") {
     const source = document.getElementById("canvas");

     // The canvas is transparent, so paint a white background first
     const out = document.createElement("canvas");
     out.width = source.width;
     out.height = source.height;
     const ctx = out.getContext("2d");
     ctx.fillStyle = "#ffffff";
     ctx.fillRect(0, 0, out.width, out.height);
     ctx.drawImage(source, 0, 0);

     const link = document.createElement("a");
     link.href = out.toDataURL("image/png");
     link.download = "whiteboard.png";
     link.click();
     return;
}

          setactiveItem(tool);
     }
     const getSvgPathFromStroke = (stroke) => {
          if (!stroke.length) return "";

          const d = stroke.reduce(
               (acc, [x0, y0], i, arr) => {
                    const [x1, y1] = arr[(i + 1) % arr.length];
                    acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
                    return acc;
               },
               ["M", ...stroke[0], "Q"]
          );

          d.push("Z");
          return d.join(" ");
     }
     let isPointNearElement = (element, pointX, pointY) => {
          switch (element.type) {
               case "LINE":
                    return isPointCloseToLine(element.x1, element.y1, element.x2, element.y2, pointX, pointY)
               case "ARROW":
                    return isPointCloseToLine(element.x1, element.y1, element.x2, element.y2, pointX, pointY)
               case "RECTANGLE":
                    return (
                         isPointCloseToLine(element.x1, element.y1, element.x2, element.y1, pointX, pointY) ||
                         isPointCloseToLine(element.x1, element.y1, element.x1, element.y2, pointX, pointY) ||
                         isPointCloseToLine(element.x1, element.y2, element.x2, element.y2, pointX, pointY) ||
                         isPointCloseToLine(element.x2, element.y1, element.x2, element.y2, pointX, pointY)
                    )
               case "CIRCLE":
                    return isPointCloseToEllipse(
                         element.x1,
                         element.y1,
                         element.x2,
                         element.y2,
                         pointX,
                         pointY)
               case "BRUSH":
                    const points = element.path_points;

                    for (let i = 0; i < points.length - 1; i++) {
                         const [x1, y1] = points[i];
                         const [x2, y2] = points[i + 1];

                         if (
                              isPointCloseToLine(
                                   x1,
                                   y1,
                                   x2,
                                   y2,
                                   pointX,
                                   pointY
                              )
                         ) {
                              return true;
                         }
                    }

                    return false;
               case "TEXT": {
                    const box = getTextBoundingBox(element);
                    return (
                         pointX >= box.x1 - ELEMENT_ERASE_THRESHOLD &&
                         pointX <= box.x2 + ELEMENT_ERASE_THRESHOLD &&
                         pointY >= box.y1 - ELEMENT_ERASE_THRESHOLD &&
                         pointY <= box.y2 + ELEMENT_ERASE_THRESHOLD
                    );
               }
          }

     }


     let HandleMouseDown = (e) => {
          if (activeItem === "TEXT") {
               return;
          }

          setStart({
               x: e.clientX,
               y: e.clientY
          })
          if (activeItem === 'BRUSH') {
               setpathpoints(prev => [
                    ...prev, [
                         e.clientX,
                         e.clientY,
                         e.pressure

                    ]
               ])
          }
          if (activeItem === "ERASER") {
               setElements(prev => prev.filter((element) => {
                    return !isPointNearElement(element, e.clientX, e.clientY)
               }))
          }
          setisDraw(true)
          sethasMoved(false)

     }
     let HandleMouseMove = (e) => {
          if (!isDraw) return;
          setCurrent({
               x: e.clientX,
               y: e.clientY
          })
          if (activeItem === 'BRUSH') {
               setpathpoints(prev => [
                    ...prev, [
                         e.clientX,
                         e.clientY,
                         e.pressure
                    ]
               ])
          }
          if (activeItem === "ERASER") {
               setElements(prev => prev.filter((element) => {
                    return !isPointNearElement(element, e.clientX, e.clientY)
               }))
          }

          sethasMoved(true)

     }


     let HandleMouseUp = (e) => {
          // Eraser is handled BEFORE the !hasMoved bail-out: text is usually
          // erased with a single click, which never sets hasMoved, so the
          // history push would otherwise be skipped and undo would break.
          if (activeItem === "ERASER") {
               // Only snapshot if something was actually removed. filter()
               // returns a fresh array every time, so a reference check would
               // push an identical snapshot on every eraser click.
               if (Elements.length !== (history[index]?.length ?? 0)) {
                    setHistory(prev => [
                         ...prev.slice(0, index + 1),
                         Elements
                    ]);

                    setIndex(index + 1);
               }

               setisDraw(false);
               setCurrent(null);
               sethasMoved(false);
               setStart(null);
               setpathpoints([]);

               return;
          }

          if (!hasMoved) {
               setisDraw(false);
               setpathpoints([]);
               return;
          }

          const end = {
               x: e.clientX,
               y: e.clientY
          };

          let newElement = null;

          if (activeItem === "LINE") {
               newElement = {
                    type: "LINE",
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y,
                    stroke: strokeColor,
                    stroke_size: size
               };
          }

          if (activeItem === "RECTANGLE") {
               newElement = {
                    type: "RECTANGLE",
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y,
                    stroke: strokeColor,
                    fill_color: fillColor,
                    stroke_size: size
               };
          }

          if (activeItem === "CIRCLE") {
               newElement = {
                    type: "CIRCLE",
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y,
                    stroke: strokeColor,
                    fill_color: fillColor,
                    stroke_size: size
               };
          }

          if (activeItem === "ARROW") {
               newElement = {
                    type: "ARROW",
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y,
                    stroke: strokeColor,
                    stroke_size: size
               };
          }

          if (activeItem === "BRUSH") {
               newElement = {
                    type: "BRUSH",
                    path_points: pathpoints,
                    stroke: strokeColor,
                    stroke_size: size
               };
          }
           if (!newElement) {
    setisDraw(false);
    setCurrent(null);
    sethasMoved(false);
    setStart(null);
    setpathpoints([]);
    return;
}

          // Create the new board state, update the board, and push the
          // history snapshot (drops any redo states past the current index)
          commit([...Elements, newElement]);

          setisDraw(false);
          setCurrent(null);
          sethasMoved(false);
          setStart(null);
          setpathpoints([]);
     };
     let HandleMouseClick = (e) => {
          if (activeItem !== "TEXT") return;

          // Save the currently typed text before moving the input.
          // commit() records the history snapshot too, so text is undoable.
          if (isText && text.trim() !== "" && textpoint) {
               commit([...Elements, makeTextElement()]);
          }

          // Move/create the input at the new click position
          settextpoint({
               x: e.clientX,
               y: e.clientY
          });

          // Start with an empty input
          setText("");
          setisText(true);
     }

     const boardcontextvalue = {
          activeItem,
          handleToolItemClick,
          HandleMouseDown,
          HandleMouseUp,
          HandleMouseMove,
          HandleMouseClick,
          isDraw, start, current, Elements, pathpoints,
          setpathpoints, isText, setisText,
          text, setText, textpoint, settextpoint, setElements

     }


     return (
          <boardcontext.Provider value={
               boardcontextvalue
          }>
               {children}
          </boardcontext.Provider>
     )
}


export default Boardcontextprovider
