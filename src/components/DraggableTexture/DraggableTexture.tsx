import React from "react";


let offsetX = 0;
let offsetY = 0;
let isDragging = false;


export default function DraggableTexture(){
    const divRef = React.useRef<HTMLDivElement | null>(null);


    function handleMouseDown(e:React.MouseEvent<HTMLDivElement>){
        if(!divRef.current) return;
        isDragging = true;
        offsetX = e.clientX - divRef.current.offsetLeft;
        offsetY = e.clientY - divRef.current.offsetTop;
        document.body.style.userSelect = "none"; // desativa seleção de texto enquanto arrasta o mouse
    };

    function handleMouseMove(e:MouseEvent){
        if (!isDragging || !divRef.current) return;
        divRef.current.style.left = `${e.clientX - offsetX}px`;
        divRef.current.style.top = `${e.clientY - offsetY}px`;
    };

    function handleMouseUp(){
        isDragging = false;
        document.body.style.userSelect = ""; // reativa seleção
    }


    React.useEffect(()=>{
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, [])


    return(
        <div ref={divRef} style={{left: "100px", top: "100px"}} className="draggable-texture w-20 h-20 bg-red-500 absolute hover:cursor-pointer" onMouseDown={handleMouseDown}>

        </div>
    )
}