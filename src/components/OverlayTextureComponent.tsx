import React, { CSSProperties } from "react";
import { OverlayTexturesContext, OverlayTexturesContextType } from "../contexts/OverlayTexturesContext";
import { OverlayTextureType } from "../types";

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

type OverlayTextureProps = OverlayTextureType & {zoom: number}


export default function OverlayTextureComponent(props:OverlayTextureProps){
    const overlayTexturesContext: OverlayTexturesContextType | undefined = React.useContext(OverlayTexturesContext)
    const divRef = React.useRef<HTMLDivElement | null>(null);
    let divStyle: CSSProperties = {
        // backgroundColor: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
        opacity: `${props.opacity}%`,
        imageRendering: 'pixelated',
    }
    
    function handleMouseDown(e:React.MouseEvent<HTMLDivElement>){
        if(!divRef.current) return;
        isDragging = true;
        offsetX = (e.clientX)/props.zoom - divRef.current.offsetLeft;
        offsetY = (e.clientY)/props.zoom - divRef.current.offsetTop;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = "none"; // desativa seleção de texto enquanto arrasta o mouse
    };

    
    function handleMouseMove(e:MouseEvent){
        if (!isDragging || !divRef.current) return;

        overlayTexturesContext?.updateTexturePosition(
            props.id,
            {
                x: (e.clientX)/props.zoom - offsetX,
                y: (e.clientY)/props.zoom - offsetY
            }
        )
    };


    function handleMouseUp(){
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = ""; // reativa seleção
    }


    return(
        // <div ref={divRef} style={{backgroundColor: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,  left: `${props.position.x}px`, top: `${props.position.y}px`, opacity: `${props.opacity}%`, zoom: props.zoom}} className="draggable-texture w-20 h-20 absolute hover:cursor-move" onMouseDown={handleMouseDown} >
        <div ref={divRef} style={divStyle} className="absolute hover:cursor-move" onMouseDown={handleMouseDown} >
            <img src={props.imageData} className="pointer-events-none" />
        </div>
    )
}