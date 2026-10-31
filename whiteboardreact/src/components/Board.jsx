import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react'
import rough from 'roughjs';
import boardcontext from '../store/boardcontext';
import Toolboxcontext from '../store/Toolboxcontext';
import { getStrokePoints } from 'perfect-freehand';
import { getStroke } from 'perfect-freehand';

const TEXT_FONT = "'Marker Felt', 'Comic Sans MS', cursive";

function Board() {
  const { HandleMouseDown, Elements, setElements, HandleMouseUp, HandleMouseMove, HandleMouseClick, isDraw, start, current, activeItem, isText, setisText, text, setText, textpoint, settextpoint } = useContext(boardcontext);
  let { strokeColor, setstrokeColor } = useContext(Toolboxcontext);
  let { fillColor, setfillColor } = useContext(Toolboxcontext);
    const {textSize,setTextSize} =useContext(Toolboxcontext)
  const { size, setSize } = useContext(Toolboxcontext);
  const { pathpoints, setpathpoints } = useContext(boardcontext)
  const canvasref = useRef();
  const previewcanvasref = useRef();
  const getArrowHeadsCoordinates = (x1, y1, x2, y2, arrowLength) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);

    const x3 = x2 - arrowLength * Math.cos(angle - Math.PI / 6);
    const y3 = y2 - arrowLength * Math.sin(angle - Math.PI / 6);

    const x4 = x2 - arrowLength * Math.cos(angle + Math.PI / 6);
    const y4 = y2 - arrowLength * Math.sin(angle + Math.PI / 6);

    return {
      x3,
      y3,
      x4,
      y4,
    };
  };
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
  useLayoutEffect((element) => {
    const canvas = canvasref.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");
    let roughCanvas = rough.canvas(canvas);
    let generator = roughCanvas.generator;
    context.clearRect(0, 0, canvas.width, canvas.height);

    Elements.forEach(element => {
      if (element.type === "LINE") {
        let line = generator.line(element.x1, element.y1, element.x2, element.y2, {
          stroke: element.stroke,
          strokeWidth: element.stroke_size
        })
        roughCanvas.draw(line);
      }
      if (element.type === "RECTANGLE") {
        let rec = generator.rectangle(
          Math.min(element.x1, element.x2),
          Math.min(element.y1, element.y2),
          Math.abs(element.x2 - element.x1),
          Math.abs(element.y2 - element.y1),
          {
            stroke: element.stroke,
            fill: element.fill_color,
            strokeWidth: element.stroke_size

          }
        )
        roughCanvas.draw(rec);
      }
      if (element.type === "CIRCLE") {

        let circle = generator.ellipse((element.x1 + element.x2) / 2
          , (element.y1 + element.y2) / 2,
          Math.abs(element.x2 - element.x1),
          Math.abs(element.y2 - element.y1),
          {
            stroke: element.stroke,
            fill: element.fill_color,
            strokeWidth: element.stroke_size
          }
        )
        roughCanvas.draw(circle);
      }
      if (element.type === "ARROW") {
        const arrow = generator.linearPath([[element.x1, element.y1], [element.x2, element.y2]], {
          stroke: element.stroke,
          strokeWidth: element.stroke_size
        });
        let obj = getArrowHeadsCoordinates(element.x1, element.y1, element.x2, element.y2, 10)
        const arrowhead1 = generator.linearPath([[element.x2, element.y2], [obj.x3, obj.y3]], {
          stroke: element.stroke,
          strokeWidth: element.stroke_size
        });
        const arrowhead2 = generator.linearPath([[element.x2, element.y2], [obj.x4, obj.y4]], {
          stroke: element.stroke,
          strokeWidth: element.stroke_size
        })
        roughCanvas.draw(arrow)
        roughCanvas.draw(arrowhead1)
        roughCanvas.draw(arrowhead2)
      }
      if (element.type === "BRUSH") {
        let outlinepoints = element.path_points;
        let path = getSvgPathFromStroke(getStroke(outlinepoints));
        const svgpath = new Path2D(path);
        context.fillStyle = element.stroke;
        context.fill(svgpath);
      }
      if (element.type === "TEXT") {
       context.font = `${element.text_size}px ${element.text_font}`;
    context.fillStyle = element.stroke;
    context.fillText(
        element.text_value,
        element.x,
        element.y
    );
      }
    })
  }, [Elements])
  useLayoutEffect(() => {
    const canvas = previewcanvasref.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");
    let roughCanvas = rough.canvas(canvas);
    let generator = roughCanvas.generator;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (isDraw && start && current && activeItem === "LINE") {
      const preview = generator.line(
        start.x,
        start.y,
        current.x,
        current.y, {
        stroke: strokeColor,
        strokeWidth: size

      }
      );

      roughCanvas.draw(preview);
    }
    if (isDraw && start && current && activeItem === "RECTANGLE") {
      const preview = generator.rectangle(
        Math.min(start.x, current.x),
        Math.min(start.y, current.y),
        Math.abs(current.x - start.x),
        Math.abs(current.y - start.y), {
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth: size
      }
      );
      roughCanvas.draw(preview);
    }
    if (isDraw && start && current && activeItem === "CIRCLE") {

      const preview = generator.ellipse((current.x + start.x) / 2
        , (current.y + start.y) / 2,
        Math.abs(current.x - start.x),
        Math.abs(current.y - start.y), {
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth: size
      }
      )

      roughCanvas.draw(preview);

    }
    if (isDraw && start && current && activeItem === "ARROW") {
      const arrow = generator.linearPath([[start.x, start.y], [current.x, current.y]], {
        stroke: strokeColor,
        strokeWidth: size
      });
      let obj = getArrowHeadsCoordinates(start.x, start.y, current.x, current.y, 10)
      const arrowhead1 = generator.linearPath([[current.x, current.y], [obj.x3, obj.y3]], {
        stroke: strokeColor,
        strokeWidth: size
      });
      const arrowhead2 = generator.linearPath([[current.x, current.y], [obj.x4, obj.y4]], {
        stroke: strokeColor,
        strokeWidth: size
      })
      roughCanvas.draw(arrow)
      roughCanvas.draw(arrowhead1)
      roughCanvas.draw(arrowhead2)


    }
    if (isDraw && activeItem === "BRUSH" && pathpoints.length > 0) {
      let outlinepoints = pathpoints;
      let path = getSvgPathFromStroke(getStroke(outlinepoints));
      const svgpath = new Path2D(path);
      context.fillStyle = strokeColor;
      context.fill(svgpath);
    }

  }, [isDraw, start, current, activeItem, strokeColor, fillColor, size, pathpoints])




  return (
    <div >
      <canvas ref={canvasref} style={{
        position: "absolute",
        top: 0,
        left: 0,
      }} id='canvas' />
      <canvas ref={previewcanvasref} onMouseDown={HandleMouseDown}
        onClick={HandleMouseClick}
        onMouseMove={HandleMouseMove}
        onMouseUp={HandleMouseUp} style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}

      />
      {isText && textpoint && (
    <input
        type="text"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
            position: "absolute",
            left: textpoint.x,
            top: textpoint.y,
            zIndex: 10,

            fontSize: `${textSize}px`,
            fontFamily: TEXT_FONT,
            color: strokeColor,

            border: "1px solid orange",
            outline: "none"
        }}
    />
)}

      


    </div>
  )
}

export default Board