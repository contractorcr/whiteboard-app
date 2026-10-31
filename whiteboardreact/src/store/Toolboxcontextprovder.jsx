import { COLORS } from "../constants/constants";
import Toolboxcontext from "./Toolboxcontext";
import React, { useState } from 'react'

function Toolboxcontextprovider({children}) {
   const [strokeColor,setstrokeColor]=useState(COLORS.BLACK)
   const [fillColor,setfillColor]=useState(COLORS.WHITE)
   const [size,setSize]=useState(1)
   const [textSize, setTextSize] = useState(30);
   const [eraser,seteraser]=useState(false )
    const toolbox={
         strokeColor,setstrokeColor,fillColor,setfillColor,size,setSize,textSize,setTextSize
    };
         
    
  return (
    <Toolboxcontext.Provider value={toolbox}>
         {children}
    </Toolboxcontext.Provider>
  )
}

export default Toolboxcontextprovider