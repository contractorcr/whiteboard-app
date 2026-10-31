import { createContext } from "react";

let Toolboxcontext=createContext({
     strokeColor: " ",
     setstrokeColor: () =>{ },
     fillColor:" ",
     setfillColor: ()=>{ },
     size:0,
     setSize: () =>{ }
})

export default Toolboxcontext