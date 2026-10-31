
import React, { useContext, useState } from 'react'
import classes from './toolbar.module.css'
import cx from "classnames";
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
  FaCircle,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";
import boardcontext from '../store/boardcontext';


function Toolbar() {
      const {activeItem,handleToolItemClick} =useContext(boardcontext);
  return (
    <div className={classes.container}>
      <div className={cx(classes.toolItem,{[classes.active]:activeItem==="BRUSH"})} onClick={()=> { handleToolItemClick("BRUSH")}}>
           <FaPaintBrush/>
         </div>
         <div className={cx(classes.toolItem,{[classes.active]:activeItem==="LINE"})} onClick={() => handleToolItemClick("LINE")}>
            <FaSlash/>
         </div>
          <div className={cx(classes.toolItem,{[classes.active]:activeItem==="RECTANGLE"})} onClick={() => handleToolItemClick("RECTANGLE")}>
            <LuRectangleHorizontal/>
          </div>
        <div className={cx(classes.toolItem,{[classes.active]:activeItem==="CIRCLE"})} onClick={()=> { handleToolItemClick("CIRCLE")}}>
          <FaRegCircle/>
            
        </div>
         <div className={cx(classes.toolItem,{[classes.active]:activeItem==="ARROW"})} onClick={()=> { handleToolItemClick("ARROW")}}>
           <FaArrowRight/>
         </div>
           <div className={cx(classes.toolItem,{[classes.active]:activeItem==="ERASER"})} onClick={()=> { handleToolItemClick("ERASER")}}>
           <FaEraser/>
           </div>
           <div className={cx(classes.toolItem,{[classes.active]:activeItem==="TEXT"})} onClick={()=> { handleToolItemClick("TEXT")}}>
           <FaFont/>
         </div>
         <div className={cx(classes.toolItem,{[classes.active]:activeItem==="UNDO"})} onClick={()=> { handleToolItemClick("UNDO")}}>
           <FaUndoAlt/>
         </div>
         <div className={cx(classes.toolItem,{[classes.active]:activeItem==="REDO"})} onClick={()=> { handleToolItemClick("REDO")}}>
           <FaRedoAlt/>
         </div>
          <div className={cx(classes.toolItem,{[classes.active]:activeItem==="DOWNLOAD"})} onClick={()=> { handleToolItemClick("DOWNLOAD")}}>
           <FaDownload/>
         </div>


         
          
    </div>
  )
}

export default Toolbar