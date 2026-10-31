import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Board from './components/Board'
import Toolbar from './toolbar/Toolbar'
import Boardcontextprovider from './store/boardcontextprovider'
import Toolboxcontextprovider from './store/Toolboxcontextprovder'
import Toolbox from './toolbox/Toolbox'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Canvas from './pages/Canvas'
function App(){
     return (
          <BrowserRouter>
          <Routes>
             <Route path="/" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
               <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/canvas/:id" element={<Canvas/>}/>
          </Routes>
          </BrowserRouter>
     )
}


export default App
