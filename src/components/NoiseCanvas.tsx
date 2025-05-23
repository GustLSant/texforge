import React from "react";
import { OverlayTexturesContext, OverlayTexturesContextType } from "../contexts/OverlayTexturesContext";
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { RgbColorPicker, RgbColor } from "react-colorful";
import { TranspGradientType } from "../types";
import alea from 'alea';
import * as htmlToImage from 'html-to-image';
import TransparencyGradientSettings from "./NoiseSettingsComponents/TransparencyGradientSettings";
import { TbReload } from "react-icons/tb";
import { IoDice } from "react-icons/io5";
import './NoiseCanvas.css'


let flag_isExportingTexture:boolean = false;
let flag_isAddingTextureToContext:boolean = false;
let oldZoom:number = 1.0;


export default function NoiseCanvas():React.ReactElement{
  const [textureWidth, setTextureWidth] = React.useState<number>(64);
  const [textureHeight, setTextureHeight] = React.useState<number>(64);
  const [zoom, setZoom] = React.useState<number>(1.0);
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
  const [transpGradients, setTranspGradients] = React.useState<TranspGradientType>({tb: 0.0, bt: 0.0, rl: 0.0, lr: 0.0, rad: 0.0})
  
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

    canvas.width = textureWidth;
    canvas.height = textureHeight;

    for(let x=0; x<textureWidth; x++){
      for(let y=0; y<textureHeight; y++){
        let noiseValue = noiseGen(
          x * scaleMultiplier / scale[0],
          y * scaleMultiplier / scale[1]
        );
        noiseValue = (noiseValue+1) / 2; // Normaliza de -1..1 para 0..1

        // pixelização nas transições reduzindo os níveis de cinza
        const stepWidth = 1 / (grayLevels - 1); // se levels=16, entao terao 1/16 cores diferentes
        noiseValue = Math.round(noiseValue / stepWidth) * stepWidth; // primeiro divide para saber em qual 'nivel' está, depois multiplica para ficar nos níveis especificados
                
        // aplicacao do efeito de transparencia do gradiente
        let gradTranspMultiplierFactor: number = getTranspGradientMultiplierFactor(x, y)

        let contrastedNoiseValue = 0.5 + (noiseValue - 0.5) * contrastFactor;
        contrastedNoiseValue = Math.max(0, Math.min(1, contrastedNoiseValue)); // clamp entre 0 e 1

        const adjustedOpacity = Math.pow(1 - contrastedNoiseValue, opacityThresholdFactor);
        ctx.fillStyle = `rgba(${noiseColor.r}, ${noiseColor.g}, ${noiseColor.b}, ${adjustedOpacity * gradTranspMultiplierFactor})`;

        ctx.fillRect(x, y, 1, 1);
      }
    }

    function getTranspGradientMultiplierFactor(_x: number, _y: number): number{
      let minAlphaValue: number = 1.0;

      if(transpGradients.tb !== 0.0){
        const gradTranspThreshold: number = transpGradients.tb;
        const tbValue = Math.min(_y / (textureWidth * gradTranspThreshold), 1.0);
        minAlphaValue = Math.min(minAlphaValue, tbValue);
      }
      if(transpGradients.bt !== 0.0){
        const gradTranspThreshold: number = transpGradients.bt;
        const tbValue = Math.min((textureHeight - _y)/(textureWidth * gradTranspThreshold), 1.0);
        minAlphaValue = Math.min(minAlphaValue, tbValue);
      }
      if(transpGradients.rl !== 0.0){
        const gradTranspThreshold: number = transpGradients.rl;
        const tbValue = Math.min(_x / (textureWidth * gradTranspThreshold), 1.0);
        minAlphaValue = Math.min(minAlphaValue, tbValue);
      }
      if(transpGradients.lr !== 0.0){
        const gradTranspThreshold: number = transpGradients.lr;
        const tbValue = Math.min((textureWidth - _x)/(textureWidth * gradTranspThreshold), 1.0);
        minAlphaValue = Math.min(minAlphaValue, tbValue);
      }
      if(transpGradients.rad !== 0.0){
        const centerX = textureWidth / 2;
        const centerY = textureHeight / 2;
        const dx = _x - centerX;
        const dy = _y - centerY;
        const pixelDistanceToCenter = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        const intensity = transpGradients.rad;

        // Calcula alpha base do gradiente radial invertido
        const normalized = Math.min(pixelDistanceToCenter / maxDistance, 1.0);
        const radial = 1.0 - normalized;

        // Interpola entre imagem original (alpha 1.0) e gradiente radial
        const radialAlpha = (1.0 - intensity) * 1.0 + intensity * radial;

        minAlphaValue = Math.min(minAlphaValue, radialAlpha);
      }

      return minAlphaValue;
    }

  }, [textureWidth, textureHeight, noiseColor, totalOpacity, brightOpacity, darkOpacity, grayLevels, scaleMultiplier, opacityThresholdFactor, contrastFactor, scale, seed, transpGradients]);


  // exportacao do noise
  React.useEffect(()=>{
    if(flag_isExportingTexture){
      exportTexture(true)
      flag_isExportingTexture = false
    }
    if(flag_isAddingTextureToContext){
      addTextureToCanvas(true)
      flag_isAddingTextureToContext = false
    }
  }, [zoom])


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
    if(zoom !== 1.0){
      flag_isExportingTexture = true;
      oldZoom = zoom;
      setZoom(1.0);
    }
    else{
      exportTexture();
    }
  }

  function exportTexture(_hasChangedZoom:boolean=false):void{
    if(!canvasRef.current) { console.error('Error: canvas is not valid.'); return; }
    
    htmlToImage
    .toPng(canvasRef.current)
    .then((dataUrl) => {
      var link = document.createElement('a');
      link.download = 'generated-texture.png';
      link.href = dataUrl;
      link.click();
      if(_hasChangedZoom){ setZoom(oldZoom); }
    })
    .catch((err) => {
      console.error('Error on exporting texture: ', err);
    });

    return
  }


  function handleClickAddToCanvasButton():void{
    if(zoom !== 1.0){
      flag_isAddingTextureToContext = true;
      oldZoom = zoom;
      setZoom(1.0);
    }
    else{
      addTextureToCanvas();
    }
  }

  function addTextureToCanvas(_hasChangedZoom:boolean=false):void{
    if(!canvasRef.current) { console.error('Error: canvas is not valid.'); return; }
    
    htmlToImage.toPng(canvasRef.current)
    .then((dataUrl) => {
      overlayTexturesContext?.addTexture(dataUrl, textureWidth, textureHeight);
      if(_hasChangedZoom){ setZoom(oldZoom); }
    })
    .catch((err) => {
      console.error('Error generating texture for overlay texture: ', err);
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
        <div className="h-full overflow-y-scroll flex flex-col gap-5">
        
          <section className="settings-section">
            <h2>Size</h2>
        
            <div className="settings-section__container-controls">
              <div className="setting-control-container" id="texture-width">
                <div className="setting-label-container"><p>Texture Width:</p>  <p>{textureWidth}px</p></div>
                <input type="range" min={2} max={128} step={2} value={textureWidth} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setTextureWidth(Number(e.target.value))}} />
              </div>
        
              <div className="setting-control-container" id='texture-height'>
                <div className="setting-label-container"><p>Texture Height:</p>  <p>{textureHeight}px</p></div>
                <input type="range" min={2} max={128} step={2} value={textureHeight} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setTextureHeight(Number(e.target.value))}} />
              </div>
              <div className="setting-control-container" id="zoom">
                <div className="setting-label-container"><p>Zoom:</p>  <p>{zoom}x</p></div>
                <input type="range" min={1} max={10} step={1} value={zoom} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setZoom(Number(e.target.value))}} />
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
                <input type="range" min={1.0} max={10.0} step={0.1} value={opacityThresholdFactor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setOpacityThresholdFactor(Number(e.target.value))}} />
              </div>

              <div className="setting-control-container" id="contrast-factor">
                <div className="setting-label-container">
                  <p>Contrast Factor:</p>
                  <div className="flex gap-1 items-center"><p>{contrastFactor}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('contrastFactor')}} /></div>
                </div>
                <input type="range" min={0.1} max={8.0} step={0.1} value={contrastFactor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setContrastFactor(Number(e.target.value))}} />
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

          <TransparencyGradientSettings transpGradients={transpGradients} setTranspGradients={setTranspGradients} />
        </div>
      </div>


    <div className="main-section">
      <div className="noise-container h-full">
        <div className="noise-container__header sticky top-0 z-10 bg-neutral-800">
          <h2 className="text-xl">Result:</h2>
          <div className="flex flex-row gap-2 items-center">
            <button onClick={handleClickAddToCanvasButton} className="button-01 self-center">Add to Canvas</button>
            <button onClick={handleClickExportButton} className="button-01 self-center">Export Texture</button>
          </div>
        </div>
        <canvas ref={canvasRef} className="noise-canvas" style={{ opacity: `${totalOpacity}%`, zoom: zoom, imageRendering: "pixelated" }} />
      </div>
    </div>

    </div>
  )
}
