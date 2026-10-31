import React, { useContext } from 'react'
import classes from './toolbox.module.css'
import { COLORS } from '../constants/constants.js'
import cx from 'classnames'
import Toolboxcontext from '../store/Toolboxcontext.js'
import boardcontext from '../store/boardcontext.js'
import { FILL_ITEMS } from '../constants/constants.js'
import { STROKE_ITEMS } from '../constants/constants.js'
function Toolbox() {
    let { strokeColor, setstrokeColor } = useContext(Toolboxcontext)
    let { fillColor, setfillColor } = useContext(Toolboxcontext)
    const { activeItem, handleToolItemClick } = useContext(boardcontext);
    const { size, setSize } = useContext(Toolboxcontext)
    const { textSize, setTextSize } = useContext(Toolboxcontext)

    return (
        <>
            {STROKE_ITEMS.includes(activeItem) && (<div className={classes.container}>
                <div className={classes.selectOptionContainer}>
                    <div className={classes.toolBoxLabel}>STROKE COLOR</div>
                    <div className={classes.colorsContainer}>
                        <div>
                            <input
                                className={classes.colorPicker}
                                type="color"
                                value={strokeColor}
                                onChange={(e) => setstrokeColor(e.target.value)}
                            ></input>
                        </div>
                        {Object.keys(COLORS).map((k) => {
                            return (
                                <div className={
                                    cx(classes.colorBox,
                                        { [classes.activeColorBox]: strokeColor === COLORS[k] })}
                                    style={{ backgroundColor: COLORS[k] }} onClick={() => setstrokeColor(COLORS[k])}> </div>

                            );
                        })

                        }

                    </div>
                </div>



                {FILL_ITEMS.includes(activeItem) && (<div className={classes.selectOptionContainer}>
                    <div className={classes.toolBoxLabel}>FILL COLOR</div>
                    <div className={classes.colorsContainer}>
                        <div>
                            <input
                                className={classes.colorPicker}
                                type="color"
                                value={fillColor}
                                onChange={(e) => setfillColor(e.target.value)}
                            ></input>
                        </div>
                        {Object.keys(COLORS).map((k) => {
                            return (
                                <div className={
                                    cx(classes.colorBox,
                                        { [classes.activeColorBox]: fillColor === COLORS[k] })}
                                    style={{ backgroundColor: COLORS[k] }} onClick={() => setfillColor(COLORS[k])}> </div>

                            );
                        })}
                    </div>

                </div>)}
                {STROKE_ITEMS.includes(activeItem) && (<div className={classes.selectOptionContainer}>
                    <div className={classes.toolBoxLabel}>SIZE</div>
                    <input type='range'
                        min={1}
                        max={10}
                        value={size}
                        onChange={(e) => { setSize(e.target.value) }}
                    />
 
                </div>)} 



            </div>)}
            {activeItem === "TEXT" && (
                <div className={classes.container}>

                    {/* TEXT COLOR */}
                    <div className={classes.selectOptionContainer}>
                        <div className={classes.toolBoxLabel}>TEXT COLOR</div>

                        <div className={classes.colorsContainer}>
                            {Object.keys(COLORS).map((k) => {
                                return (
                                    <div
                                        key={k}
                                        className={cx(
                                            classes.colorBox,
                                            {
                                                [classes.activeColorBox]:
                                                    strokeColor === COLORS[k]
                                            }
                                        )}
                                        style={{
                                            backgroundColor: COLORS[k]
                                        }}
                                        onClick={() => setstrokeColor(COLORS[k])}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* TEXT SIZE */}
                    <div className={classes.selectOptionContainer}>
                        <div className={classes.toolBoxLabel}>TEXT SIZE</div>

                        <input
                            type="range"
                            min={20}
                            max={60}
                            value={textSize}
                            onChange={(e) => setTextSize(Number(e.target.value))}
                        />
                    </div>

                </div>
            )}
        </>





    )
}

export default Toolbox