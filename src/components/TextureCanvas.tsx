import React, { ReactElement, useRef } from "react";
import DraggableTexture from "./DraggableTexture/DraggableTexture";
import "./TextureCanvas.css"


export default function TextureCanvas():ReactElement{
    const [file, setFile] = React.useState<File>();
    const [imageData, setImageData] = React.useState<string | undefined>();
    const [imageSize, setImageSize] = React.useState<[number, number]>([0, 0]);
    const [imageZoom, setImageZoom] = React.useState<number>(1.0);
    const fileInputRef = useRef<HTMLInputElement>(null);


    function handleChangeFileInput(event: React.ChangeEvent<HTMLInputElement>):void{
        if(event.target.files){
            const file:File = event.target.files[0];
            if(file.type.startsWith("image/")){
                setFile(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    const image = new Image();
                    image.src = e.target?.result as string;
                    image.onload = () => {
                        setImageSize([image.width, image.height])
                    };

                    setImageData(reader.result as string); // Converte para base64 e exibe
                };
                reader.readAsDataURL(file);
            }
        }
    }


    return(
        <div className="texture-canvas main-section">
            <div className="flex flex-row justify-between items-center gap-2">
                <p>Texture Name:</p>
                <div className="flex flex-row gap-2 items-center">
                    <p className="break-all">{file?.name}</p>
                    <button className="button-01" onClick={()=>{fileInputRef.current?.click()}}>Upload Texture</button>
                </div>
            </div>
            
            <input ref={fileInputRef} type="file" onChange={handleChangeFileInput} accept="image/*" className="absolute top-[-50px] left-[-50px] opacity-0" />
            
            <div className="bg-neutral-900 rounded-md p-1 overflow-auto relative" style={{height: '100%', boxShadow: '2px 2px 4px 4px rgba(0,0,0, 0.25) inset'}}>
                {
                    imageData &&
                    <img src={imageData} style={{width: `${imageSize[0]}px`, height: `${imageSize[1]}px`, maxWidth: 'none', maxHeight: 'none', zoom: `${imageZoom}`, imageRendering: "pixelated"}} alt="" />
                }
                <DraggableTexture zoom={imageZoom} />
            </div>

            <div className="flex items-center gap-2">
                <p>Zoom:</p>
                <div className="flex  grow items-center gap-2">
                    <input type="range" min={1.0} max={10.0} step={0.1} value={imageZoom} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setImageZoom(Number(e.target.value))}}/>
                    <p className="min-w-[30px] text-right">{imageZoom.toFixed(1)}</p>
                </div>
            </div>
        </div>
    )
}