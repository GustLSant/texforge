import React, { CSSProperties } from "react";
import { OverlayTexturesContext, OverlayTexturesContextType } from "../contexts/OverlayTexturesContext";
import { OverlayTextureType, Position2D } from "../types";
import { BiSolidTrash } from "react-icons/bi";

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

type OverlayTextureProps = OverlayTextureType & {zoom: number}


export default function OverlayTextureComponent(props:OverlayTextureProps){
    const overlayTexturesContext: OverlayTexturesContextType | undefined = React.useContext(OverlayTexturesContext);
    const [isPopUpOpen, setIsPopUpOpen] = React.useState<boolean>(false);
    const [popUpPosition, setPopUpPosition] = React.useState<Position2D>({x: 0, y: 0});
    const popUpRef = React.useRef<HTMLDivElement | null>(null);
    
    const divRef = React.useRef<HTMLDivElement | null>(null);
    let divStyle: CSSProperties = {
        // backgroundColor: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
        left:      props.position.x + 'px',
        top:       props.position.y + 'px',
        opacity:   props.opacity + '%',
        imageRendering: 'pixelated',
        minWidth:  props.width + 'px',
        minHeight: props.height + 'px,'
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


    function handleRightClick(event: React.MouseEvent<HTMLImageElement, MouseEvent>){
        event.preventDefault();
        setIsPopUpOpen(true);
        setPopUpPosition({x: event.clientX, y: event.clientY});
    };


    function handleClickOutside(event: MouseEvent){
        if(popUpRef.current && !popUpRef.current.contains(event.target as Node)){
            setIsPopUpOpen(false);
        }
    };
    
    // Controla a visibilidade do PopUp
    React.useEffect(() => {
        if(isPopUpOpen){ document.addEventListener('mousedown', handleClickOutside); }
        else{ document.removeEventListener('mousedown', handleClickOutside); }
    
        // Cleanup no componente
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopUpOpen]);


    function handleChangeOpacitySlider(_newValue: number){
        overlayTexturesContext?.updateTextureOpacity(props.id, _newValue)
    }


    function handleClickDeleteTexture(){
        overlayTexturesContext?.removeTexture(props.id)
    }
    

    return(
        // <div ref={divRef} style={{backgroundColor: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,  left: `${props.position.x}px`, top: `${props.position.y}px`, opacity: `${props.opacity}%`, zoom: props.zoom}} className="draggable-texture w-20 h-20 absolute hover:cursor-move" onMouseDown={handleMouseDown} >
        <>
            <div ref={divRef} style={divStyle} className={`absolute hover:cursor-move ${(isPopUpOpen) ? 'outline-1 outline-orange-600' : ''}`} onMouseDown={handleMouseDown} onContextMenu={handleRightClick} >
                <img src={props.imageData} className="pointer-events-none" />
            </div>

            {
                isPopUpOpen &&
                <div ref={popUpRef} className="fixed bg-neutral-700 p-2 rounded-sm shadow-01 z-20" style={{top: popUpPosition.y, left: popUpPosition.x, zoom: 1.0/props.zoom}}>
                    <div className="flex gap-2 flex-col">
                        <div>
                            <p>Opacity: </p>
                            <div className="flex items-center gap-2">
                                <input type="range" min={0} max={100} step={1} value={props.opacity} onChange={(e)=>{handleChangeOpacitySlider(Number(e.target.value))}} name="opacity" />
                                <p>{props.opacity}%</p>
                            </div>
                        </div>
                        
                        <div className="h-[1px] self-stretch opacity-15 bg-orange-600"></div>

                        <div className="flex items-center gap-2 hover:cursor-pointer hover:underline" onClick={handleClickDeleteTexture}>
                            <BiSolidTrash />
                            <p onClick={()=>{setIsPopUpOpen(false)}}>Delete Texture</p>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}