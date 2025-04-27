import React from "react";
import { OverlayTexturesContext, OverlayTexturesContextType } from "../contexts/OverlayTexturesContext";
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { RgbColorPicker, RgbColor } from "react-colorful";
import alea from 'alea';
import * as htmlToImage from 'html-to-image';
import { TbReload } from "react-icons/tb";
import { IoDice } from "react-icons/io5";
import './NoiseCanvas.css'


let flag_isExportingImage:boolean = false;
let oldViewScale:number = 1.0;


export default function NoiseCanvas():React.ReactElement{
  const [imageWidth, setImageWidth] = React.useState<number>(64);
  const [imageHeight, setImageHeight] = React.useState<number>(64);
  const [viewScale, setViewScale] = React.useState<number>(1.0);
  const [noiseColor, setNoiseColor] = React.useState<RgbColor>({r: 10, g: 5, b: 0});
  const [totalOpacity, setTotalOpacity] = React.useState<number>(100);
  const [brightOpacity, setBrightOpacity] = React.useState<number>(100);
  const [darkOpacity, setDarkOpacity] = React.useState<number>(100);
  const [grayLevels, setGrayLevels] = React.useState<number>(9);
  const [scaleMultiplier, setScaleMultiplier] = React.useState<number>(0.05);
  const [contrastFactor, setContrastFactor] = React.useState<number>(1.0);
  const [opacityThresholdFactor, setOpacityThresholdFactor] = React.useState<number>(1.0);
  const [scale, setScale] = React.useState<[number, number]>([1.0, 1.0]);
  const [seed, setSeed] = React.useState<number>(1);
  
  const noiseGen:NoiseFunction2D = React.useMemo( ()=>{return createNoise2D(alea(seed))}, [seed] )
  const [canShowColorPicker, setCanShowColorPicker] = React.useState<boolean>(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const overlayTexturesContext: OverlayTexturesContextType | undefined = React.useContext(OverlayTexturesContext)


  // geracao do noise
  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx:CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageWidth;
    canvas.height = imageHeight;

    for(let x=0; x<imageWidth; x++){
      for(let y=0; y<imageHeight; y++){
        let noiseValue = noiseGen(
          x * scaleMultiplier / scale[0],
          y * scaleMultiplier / scale[1]
        );
        noiseValue = (noiseValue+1) / 2; // Normaliza de -1..1 para 0..1

        // pixelização nas transições reduzindo os níveis de cinza
        const stepWidth = 1 / (grayLevels - 1); // se levels=16, entao terao 1/16 cores diferentes
        noiseValue = Math.round(noiseValue / stepWidth) * stepWidth; // primeiro divide para saber em qual 'nivel' está, depois multiplica para ficar nos níveis especificados
        
        // const color = Math.floor(noiseValue * 255); // Converte de 0..1 para 1..255
        // ctx.fillStyle = `rgba(${color}, ${color}, ${color}, ${linearInterpolation(noiseValue, brightOpacity, darkOpacity)/100})`;
        
        const contrastedNoiseValue = 0.5 + (noiseValue - 0.5) * contrastFactor;
        const adjustedOpacity = Math.pow(1 - contrastedNoiseValue, opacityThresholdFactor);
        ctx.fillStyle = `rgba(${noiseColor.r}, ${noiseColor.g}, ${noiseColor.b}, ${adjustedOpacity})`;

        ctx.fillRect(x, y, 1, 1);
      }
    }

  }, [imageWidth, imageHeight, noiseColor, totalOpacity, brightOpacity, darkOpacity, grayLevels, scaleMultiplier, opacityThresholdFactor, contrastFactor, scale, seed]);


  // exportacao do noise
  React.useEffect(()=>{
    if(flag_isExportingImage){
      exportImage(true)
      flag_isExportingImage = false
    }
  }, [viewScale])


  function handleClickResetButton(_element:string):void{
    switch(_element){
      case 'color':
        setNoiseColor({r: 10, g: 5, b: 0});
        break;
      case 'totalOpacity':
        setTotalOpacity(100)
        break;
      case 'brightOpacity':
        setBrightOpacity(100)
        break;
      case 'darkOpacity':
        setDarkOpacity(100)
        break;
      case 'grayLevels':
        setGrayLevels(9)
        break;
      case 'scaleMultiplier':
        setScaleMultiplier(0.05)
        break;
      case 'opacityThresholdFactor':
        setOpacityThresholdFactor(1.0)
        break;
      case 'contrastFactor':
        setContrastFactor(1.0);
        break;
      case 'scale-X':
        setScale([1.0, scale[1]])
        break;
      case 'scale-Y':
        setScale([scale[0], 1.0])
        break;
      default:
        break;
    }
  }


  function handleClickExportButton():void{
    if(viewScale !== 1.0){
      flag_isExportingImage = true;
      oldViewScale = viewScale;
      setViewScale(1.0);
    }
    else{
      exportImage();
    }
  }


  function exportImage(_hasChangedViewScale:boolean=false):void{
    if(!canvasRef.current) { console.error('Error: canvas is not valid.'); return; }
    
    htmlToImage
    .toPng(canvasRef.current)
    .then((dataUrl) => {
      var link = document.createElement('a');
      link.download = 'generated-texture.png';
      link.href = dataUrl;
      link.click();
      if(_hasChangedViewScale){ setViewScale(oldViewScale); }
    })
    .catch((err) => {
      console.error('Error on exporting image: ', err);
    });

    return
  }


  function handleClickAddToCanvasButton():void{
    if(!canvasRef.current){ return };

    htmlToImage.toPng(canvasRef.current)
    .then((dataUrl) => {
      overlayTexturesContext?.addTexture(dataUrl);
    })
    .catch((err) => {
      console.error('Error generating image for overlay texture: ', err);
    });
  }


  function handleChangeInputSeed(e:React.ChangeEvent<HTMLInputElement>):void{
    const numberInput = Number(e.target.value);
    if(isNaN(numberInput)) return;
    else if(numberInput > 65535) return;
    else if(numberInput === 0) setSeed(1);
    else setSeed(numberInput);
  }


  return(
    <div className="noise-canvas-component">
      
      <div className="main-section">
        <div className="h-full overflow-y-scroll flex flex-col gap-3">
        
          <section className="settings-section">
            <h2>Width</h2>
        
            <div className="settings-section__container-controls">
              <div className="setting-control-container" id="image-width">
                <div className="setting-label-container"><p>Image Width:</p>  <p>{imageWidth}px</p></div>
                <input type="range" min={2} max={128} step={2} value={imageWidth} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setImageWidth(Number(e.target.value))}} />
              </div>
        
              <div className="setting-control-container" id='image-height'>
                <div className="setting-label-container"><p>Image Height:</p>  <p>{imageHeight}px</p></div>
                <input type="range" min={2} max={128} step={2} value={imageHeight} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setImageHeight(Number(e.target.value))}} />
              </div>
              <div className="setting-control-container" id="view-scale">
                <div className="setting-label-container"><p>View Scale:</p>  <p>{viewScale}x</p></div>
                <input type="range" min={1} max={10} step={1} value={viewScale} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setViewScale(Number(e.target.value))}} />
              </div>
            </div>
          </section>
          <section className="settings-section">
            <h2>Color</h2>
            <div className="settings-section__container-controls">
              <div className="setting-control-container" id="noise-color">
                <div className="setting-label-container">
                  <p>Noise Color:</p>
                  <div className="flex gap-1 items-center">
                    {`R: ${noiseColor.r} , G: ${noiseColor.g} , B: ${noiseColor.b}`}
                    <div className="noise-color-preview hover:cursor-pointer" onClick={()=>{setCanShowColorPicker((old)=>{return !old})}} style={{backgroundColor: `rgb(${noiseColor.r}, ${noiseColor.g}, ${noiseColor.b})`}}></div>
                    <TbReload className="text-xl" onClick={()=>{handleClickResetButton('color')}} />
                  </div>
                </div>
                {canShowColorPicker && <RgbColorPicker color={noiseColor} onChange={(newColor:RgbColor)=>{setNoiseColor(newColor)}} className="self-end pt-1" />}
              </div>
              <div className="setting-control-container" id="total-opacity">
                <div className="setting-label-container">
                  <p>Total Opacity:</p>
                  <div className="flex gap-1 items-center"><p>{totalOpacity}%</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('totalOpacity')}} /></div>
                </div>
                <input type="range" min={0} max={100} step={1} value={totalOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setTotalOpacity(Number(e.target.value))}} />
              </div>
              <div className="setting-control-container" id="noise-threshold">
                <div className="setting-label-container">
                  <p>Opacity Threshold:</p>
                  <div className="flex gap-1 items-center"><p>{opacityThresholdFactor}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('opacityThresholdFactor')}} /></div>
                </div>
                <input type="range" min={1} max={7} step={0.1} value={opacityThresholdFactor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setOpacityThresholdFactor(Number(e.target.value))}} />
              </div>
              <div className="setting-control-container" id="contrast-factor">
                <div className="setting-label-container">
                  <p>Contrast Factor:</p>
                  <div className="flex gap-1 items-center"><p>{contrastFactor}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('contrastFactor')}} /></div>
                </div>
                <input type="range" min={0.1} max={2} step={0.1} value={contrastFactor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setContrastFactor(Number(e.target.value))}} />
              </div>
            </div>
          </section>
        
          <section className="settings-section">
            <h2>Generation Settings</h2>
            <div className="settings-section__container-controls">
              <div className="setting-label-container" id="noise-seed">
                <p>Noise Seed:</p>
                <div className="flex gap-1 items-center">
                  <input type="text" className="input-number" value={seed} onChange={handleChangeInputSeed} />
                  <IoDice className="svg-button" onClick={()=>{setSeed(Math.floor(Math.random()*5000))}} />
                </div>
              </div>
              <div className="setting-control-container" id="gray-levels">
                <div className="setting-label-container">
                  <p>Gray Levels:</p>
                  <div className="flex gap-1 items-center"><p>{grayLevels}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('grayLevels')}} /></div>
                </div>
                <input type="range" min={2} max={24} step={1} value={grayLevels} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setGrayLevels(Number(e.target.value))}} />
              </div>
              <div className="setting-control-container" id="scale-multiplier">
                <div className="setting-label-container">
                  <p>Scale Multiplier:</p>
                  <div className="flex gap-1 items-center"><p>{(scaleMultiplier+0.95).toFixed(3)}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('scaleMultiplier')}} /></div>
                </div>
                <input type="range" min={0.01} max={0.15} step={0.005} value={scaleMultiplier} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScaleMultiplier(Number(e.target.value))}} />
              </div>
              <div className="setting-control-container" id="scale-x">
                <div className="setting-label-container">
                  <p>Noise X Scale::</p>
                  <div className="flex gap-1 items-center"><p>{scale[0]}</p> <TbReload className="text-xl" onClick={()=>{handleClickResetButton('scale-X')}} /></div>
                </div>
                <input type="range" min={0.2} max={10} step={0.2} value={scale[0]} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScale([Number(e.target.value), scale[1]])}} />
              </div>
              <div className="setting-control-container" id="scale-y">
                <div className="setting-label-container">
                  <p>Noise Y Scale::</p>
                  <div className="flex gap-1 items-center"><p>{scale[1]}</p> <TbReload className="text-xl" onClick={()=>{handleClickResetButton('scale-Y')}} /></div>
                </div>
                <input type="range" min={0.2} max={10} step={0.2} value={scale[1]} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScale([scale[0], Number(e.target.value)])}} />
              </div>
            </div>
          </section>
        </div>
      </div>


    <div className="main-section">
      <div className="noise-container h-full">
        <div className="noise-container__header sticky top-0 z-10 bg-neutral-800">
          <h2 className="text-xl">Result:</h2>
          <div className="flex flex-row gap-2 items-center">
            <button onClick={handleClickAddToCanvasButton} className="button-01 self-center">Add to Canvas</button>
            <button onClick={handleClickExportButton} className="button-01 self-center">Export Image</button>
          </div>
        </div>
        <canvas ref={canvasRef} className="noise-canvas" style={{ opacity: `${totalOpacity}%`, zoom: viewScale, imageRendering: "pixelated" }} />
      </div>
    </div>

    </div>
  )
}
