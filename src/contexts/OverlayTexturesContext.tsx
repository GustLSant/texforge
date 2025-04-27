import { PropsWithChildren, useState } from "react";
import { createContext } from "react";
import { OverlayTextureType, Position2D } from "../types";


export type OverlayTexturesContextType = {
    overlayTextures: OverlayTextureType[],
    setOverlayTextures: React.Dispatch<React.SetStateAction<OverlayTextureType[]>>,
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
            handlePosChangeFunc: handleChangePosition,
        },
        {
            id: 1,
            imageData: "",
            position: {x: 0, y: 200},
            opacity: 100,
            zoom: 1,
            handlePosChangeFunc: handleChangePosition,
        },
    ]);


    function handleChangePosition(_id:number, _newPos: Position2D){
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


    return(
        <OverlayTexturesContext.Provider value={{ overlayTextures, setOverlayTextures }}>
            {children}
        </OverlayTexturesContext.Provider>
    )
}




