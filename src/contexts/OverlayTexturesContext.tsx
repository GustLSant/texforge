import { PropsWithChildren, useState } from "react";
import { createContext } from "react";
import { OverlayTextureType, Position2D } from "../types";


export type OverlayTexturesContextType = {
    overlayTextures: OverlayTextureType[],
    addTexture: (textureData: string) => void,
    removeTexture: (textureId: number) => void,
    updateTexturePosition: (id: number, newPos: Position2D) => void
};

export const OverlayTexturesContext = createContext<OverlayTexturesContextType | undefined>(undefined);


export default function OverlayTexturesProvider({ children }:PropsWithChildren){
    const [overlayTextures, setOverlayTextures] = useState<OverlayTextureType[]>([
        {
            id: 0,
            imageData: "",
            position: {x: 0, y: 0},
            opacity: 100,
            zoom: 1,
            handlePosChangeFunc: updateTexturePosition,
        },
        {
            id: 1,
            imageData: "",
            position: {x: 0, y: 200},
            opacity: 100,
            zoom: 1,
            handlePosChangeFunc: updateTexturePosition,
        },
    ]);


    function updateTexturePosition(_id:number, _newPos: Position2D){
        const newOverlayTextures:OverlayTextureType[] = [...overlayTextures];
        
        for(let i=0; i<newOverlayTextures.length; i++){
            if(newOverlayTextures[i].id === _id){
                newOverlayTextures[i].position.x = _newPos.x;
                newOverlayTextures[i].position.y = _newPos.y;
                break;
            }
        }
        
        setOverlayTextures(newOverlayTextures);
    }


    function getNextAvailableId(): number{
        let availableId: number = -9999

        overlayTextures.forEach((item)=>{
            if(item.id >= availableId){ availableId = item.id + 1; }
        })

        return availableId
    }


    function addTexture(textureData: string): void{
        const newTextures = [...overlayTextures];
        
        newTextures.push({
            id: getNextAvailableId(),
            imageData: textureData,
            position: {x: Math.random()*20, y: Math.random()*20},
            opacity: 100,
            zoom: 1,
            handlePosChangeFunc: updateTexturePosition,
        });
        
        setOverlayTextures(newTextures);
    }

    function removeTexture(textureId: number): void{
        const newTextures: OverlayTextureType[] = [];

        overlayTextures.forEach((item)=>{
            if(item.id !== textureId){ newTextures.push(item); }
        })

        setOverlayTextures(newTextures);
    }


    return(
        <OverlayTexturesContext.Provider value={{ overlayTextures, addTexture, removeTexture, updateTexturePosition }}>
            {children}
        </OverlayTexturesContext.Provider>
    )
}




