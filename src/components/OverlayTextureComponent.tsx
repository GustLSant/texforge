import React from "react";
import { OverlayTextureType } from "../types";

let offsetX = 0;
let offsetY = 0;
let isDragging = false;


export default function OverlayTextureComponent(props:OverlayTextureType){
    const divRef = React.useRef<HTMLDivElement | null>(null);


    function handleMouseDown(e:React.MouseEvent<HTMLDivElement>){
        if(!divRef.current) return;
        isDragging = true;
        offsetX = (e.clientX)/props.zoom - divRef.current.offsetLeft;
        offsetY = (e.clientY)/props.zoom - divRef.current.offsetTop;

        document.body.style.userSelect = "none"; // desativa seleção de texto enquanto arrasta o mouse
    };

    function handleMouseMove(e:React.MouseEvent<HTMLDivElement>){
        if (!isDragging || !divRef.current) return;
        // divRef.current.style.left = `${(e.clientX)/props.zoom - offsetX}px`;
        // divRef.current.style.top = `${(e.clientY)/props.zoom - offsetY}px`;
        props.handlePosChangeFunc(
            props.id,
            {
                x: (e.clientX)/props.zoom - offsetX,
                y: (e.clientY)/props.zoom - offsetY
            }
        )
    };

    function handleMouseUp(){
        isDragging = false;
        document.body.style.userSelect = ""; // reativa seleção
    }


    return(
        <div ref={divRef} style={{backgroundColor: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,  left: `${props.position.x}px`, top: `${props.position.y}px`, opacity: `${props.opacity}%`, zoom: props.zoom}} className="draggable-texture w-20 h-20 absolute hover:cursor-move" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <img src={props.imageData} />
        </div>
    )
}