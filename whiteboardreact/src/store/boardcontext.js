import { createContext } from "react";

let boardcontext=createContext({
     activeItem:" " ,
     elements : [],
       handleToolItemClick: () =>{ },
     HandleMouseDown: () =>{},
      HandleMouseUp: () => {},
      HandleMouseMove:() => {},
      pathpoints: [],
      setpathpoints: () => { },
     HandleMouseClick: () => {  }
})

export default boardcontext