import React, { ReactElement, useRef } from "react";


export default function TextureCanvas():ReactElement{
    const [file, setFile] = React.useState<File>();
    const [imageData, setImageData] = React.useState<string | undefined>();
    const imageDivRef = useRef(null);


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
            <p>Name: {file?.name}</p>
            <input type="file" onChange={handleChangeFileInput} accept="image/*" />
            {
                imageData && 
                <img src={imageData} alt="" />
            }
        </div>
    )
}