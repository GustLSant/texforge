import React, { ReactElement, useRef } from "react";


export default function TextureCanvas():ReactElement{
    const [file, setFile] = React.useState<File>();
    const [imageData, setImageData] = React.useState<string | undefined>();
    const fileInputRef = useRef<HTMLInputElement>(null);


    function handleChangeFileInput(event: React.ChangeEvent<HTMLInputElement>):void{
        if(event.target.files){
            const file:File = event.target.files[0];
            if(file.type.startsWith("image/")){
                setFile(file);

                const reader = new FileReader();
                reader.onload = () => {
                    setImageData(reader.result as string); // Converte para base64 e exibe
                };
                reader.readAsDataURL(file);
            }
        }
    }


    return(
        <div className="texture-canvas main-section">
            <div className="flex flex-row justify-between items-center">
                <p>Name:</p>
                <div>
                    {file?.name}
                    <button className="button-01" onClick={()=>{fileInputRef.current?.click()}}>Upload Texture</button>
                </div>
            </div>
            <input ref={fileInputRef} type="file" onChange={handleChangeFileInput} accept="image/*" className="absolute top-[-50px] left-[-50px] opacity-0" />
            {
                imageData && 
                <img src={imageData} alt="" />
            }
        </div>
    )
}