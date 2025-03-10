import React from "react";

type PropsDraggableTexture = {
    zoom:number
}


let offsetX = 0;
let offsetY = 0;
let isDragging = false;


export default function DraggableTexture({zoom}:PropsDraggableTexture){
    const divRef = React.useRef<HTMLDivElement | null>(null);


    function handleMouseDown(e:React.MouseEvent<HTMLDivElement>){
        if(!divRef.current) return;
        isDragging = true;
        offsetX = (e.clientX)/zoom - divRef.current.offsetLeft;
        offsetY = (e.clientY)/zoom - divRef.current.offsetTop;

        document.body.style.userSelect = "none"; // desativa seleção de texto enquanto arrasta o mouse
    };

    function handleMouseMove(e:React.MouseEvent<HTMLDivElement>){
        if (!isDragging || !divRef.current) return;
        divRef.current.style.left = `${(e.clientX)/zoom - offsetX}px`;
        divRef.current.style.top = `${(e.clientY)/zoom - offsetY}px`;
    };

    function handleMouseUp(){
        isDragging = false;
        document.body.style.userSelect = ""; // reativa seleção
    }


    return(
        <div ref={divRef} style={{left: "100px", top: "100px", zoom: zoom}} className="draggable-texture w-20 h-20 bg-red-500 absolute hover:cursor-move" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>

        </div>
    )
}