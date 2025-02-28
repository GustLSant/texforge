import React from "react";
import Noise from "noisejs";
import { RgbColorPicker, RgbColor } from "react-colorful";
import * as htmlToImage from 'html-to-image';
import { TbReload } from "react-icons/tb";
import { IoDice } from "react-icons/io5";
import './NoiseCanvas.css'


export default function NoiseCanvas():React.ReactElement{
  const [imageSize, setImageSize] = React.useState<number>(64)
  const [viewScale, setViewScale] = React.useState<number>(1.0)
  const [noiseColor, setNoiseColor] = React.useState<RgbColor>({r: 10, g: 5, b: 0});
  const [totalOpacity, setTotalOpacity] = React.useState<number>(100)
  const [brightOpacity, setBrightOpacity] = React.useState<number>(100)
  const [darkOpacity, setDarkOpacity] = React.useState<number>(100)
  const [grayLevels, setGrayLevels] = React.useState<number>(9)
  const [stepsPerPixel, setStepsPerPixel] = React.useState<number>(6)
  const [opacityThresholdFactor, setOpacityThresholdFactor] = React.useState<number>(1.0);
  const [scale, setScale] = React.useState<[number, number]>([40.0, 40.0])
  const [seed, setSeed] = React.useState<number>(1)
  
  const [canShowColorPicker, setCanShowColorPicker] = React.useState<boolean>(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const noiseGen:Noise = React.useMemo<Noise>( ()=>{return new Noise(seed)}, [seed] ); // Criar gerador de noise


  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx:CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageSize;
    canvas.height = imageSize;

    for(let x=0; x<imageSize; x++){
      for(let y=0; y<imageSize; y++){
        let noiseValue = noiseGen.perlin2(
          x * stepsPerPixel / scale[0],
          y * stepsPerPixel / scale[1]
        );
        noiseValue = (noiseValue+1) / 2; // Normaliza de -1..1 para 0..1

        // pixelização nas transições reduzindo os níveis de cinza
        const stepSize = 1 / (grayLevels - 1); // se levels=16, entao terao 1/16 cores diferentes
        noiseValue = Math.round(noiseValue / stepSize) * stepSize; // primeiro divide para saber em qual 'nivel' está, depois multiplica para ficar nos níveis especificados
        
        // const color = Math.floor(noiseValue * 255); // Converte de 0..1 para 1..255
        // ctx.fillStyle = `rgba(${color}, ${color}, ${color}, ${linearInterpolation(noiseValue, brightOpacity, darkOpacity)/100})`;
        
        const adjustedOpacity = Math.pow(1 - noiseValue, opacityThresholdFactor);
        ctx.fillStyle = `rgba(${noiseColor.r}, ${noiseColor.g}, ${noiseColor.b}, ${adjustedOpacity})`;

        ctx.fillRect(x, y, 1, 1);
      }
    }

  }, [imageSize, viewScale, noiseColor, totalOpacity, brightOpacity, darkOpacity, grayLevels, stepsPerPixel, opacityThresholdFactor, scale, seed]);



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
      case 'stepsPerPixel':
        setStepsPerPixel(6)
        break;
      case 'opacityThresholdFactor':
        setOpacityThresholdFactor(1.0)
        break;
      case 'scale-X':
        setScale([40.0, scale[1]])
        break;
      case 'scale-Y':
        setScale([scale[0], 40.0])
        break;
      default:
        break;
    }
  }


  function handleClickExportButton():void{
    if(!canvasRef.current) return
    
    htmlToImage
    .toPng(canvasRef.current)
    .then((dataUrl) => {
      var link = document.createElement('a');
      link.download = 'generated-texture.png';
      link.href = dataUrl;
      link.click();
      document.removeChild(link)
    })
    .catch((err) => {
      console.error('oops, something went wrong!', err);
    });

    return
  }


  function handleChangeInputSeed(e:React.ChangeEvent<HTMLInputElement>):void{
    const numberInput = Number(e.target.value);
    if(isNaN(numberInput)) return;
    else if(numberInput > 65535) return; // a lib so consegue lidar com valores entre 1 e 65536
    else if(numberInput === 0) setSeed(1);
    else setSeed(numberInput);
  }


  return(
    <div className="noise-canvas-component">
      
      <div className="max-h-[80%] overflow-y-scroll flex flex-col">
        
        <section className="settings-section">
          <h2>Size</h2>
          
          <div className="settings-section__container-controls">
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Image size:</p>  <p>{imageSize}px</p></div>
              <input type="range" min={8} max={256} step={2} value={imageSize} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setImageSize(Number(e.target.value))}} />
            </div>
            
            <div className="setting-control-container">
              <div className="setting-label-container"><p>View Scale:</p>  <p>{viewScale}x</p></div>
              <input type="range" min={1} max={10} step={1} value={viewScale} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setViewScale(Number(e.target.value))}} />
            </div>
          </div>

        </section>

        <section className="settings-section">
          <h2>Color</h2>

          <div className="settings-section__container-controls">
            <div className="setting-control-container">
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

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Total Opacity:</p>
                <div className="flex gap-1 items-center"><p>{totalOpacity}%</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('totalOpacity')}} /></div>
              </div>
              <input type="range" min={0} max={100} step={1} value={totalOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setTotalOpacity(Number(e.target.value))}} />
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Bright Opacity:</p>
                <div className="flex gap-1 items-center"><p>{brightOpacity}%</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('brightOpacity')}} /></div>
              </div>
              <input type="range" min={0} max={100} step={1} value={brightOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setBrightOpacity(Number(e.target.value))}} />
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Dark Opacity:</p>
                <div className="flex gap-1 items-center"><p>{darkOpacity}%</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('darkOpacity')}} /></div>
              </div>
              <input type="range" min={0} max={100} step={1} value={darkOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setDarkOpacity(Number(e.target.value))}} />
            </div>
          </div>
        </section>
        
        <section className="settings-section">
          <h2>Generation Settings:</h2>

          <div className="settings-section__container-controls">
            <div className="setting-label-container">
              <p>Noise Seed:</p>
              <div className="flex gap-1 items-center">
                <input type="text" className="input-number" value={seed} onChange={handleChangeInputSeed} />
                <IoDice className="svg-button" onClick={()=>{setSeed(Math.floor(Math.random()*5000))}} />
              </div>
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Gray Levels:</p>
                <div className="flex gap-1 items-center"><p>{grayLevels}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('grayLevels')}} /></div>
              </div>
              <input type="range" min={2} max={24} step={1} value={grayLevels} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setGrayLevels(Number(e.target.value))}} />
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Steps per pixel:</p>
                <div className="flex gap-1 items-center"><p>{stepsPerPixel}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('stepsPerPixel')}} /></div>
              </div>
              <input type="range" min={1} max={16} step={1} value={stepsPerPixel} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setStepsPerPixel(Number(e.target.value))}} />
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Opacity Threshold:</p>  
                <div className="flex gap-1 items-center"><p>{opacityThresholdFactor}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('opacityThresholdFactor')}} /></div>
              </div>
              <input type="range" min={0} max={10} step={0.1} value={opacityThresholdFactor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setOpacityThresholdFactor(Number(e.target.value))}} />
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Noise X Scale::</p>  
                <div className="flex gap-1 items-center"><p>{scale[0]-40}</p> <TbReload className="text-xl" onClick={()=>{handleClickResetButton('scale-X')}} /></div>
              </div>
              <input type="range" min={1} max={80} step={1} value={scale[0]} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScale([Number(e.target.value), scale[1]])}} />
            </div>

            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Noise Y Scale::</p>
                <div className="flex gap-1 items-center"><p>{scale[1]-40}</p> <TbReload className="text-xl" onClick={()=>{handleClickResetButton('scale-Y')}} /></div>
              </div>
              <input type="range" min={1} max={80} step={1} value={scale[1]} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScale([scale[0], Number(e.target.value)])}} />
            </div>
          </div>
        </section>

      </div>


      <div className="noise-container">
        <div className="noise-container__header">
          <h2 className="text-xl">Result:</h2>
          <button onClick={handleClickExportButton} className="button-01 rounded-sm p-1 px-4 self-center hover:cursor-pointer">Export Image</button>
        </div>

        <canvas ref={canvasRef} className="noise-canvas" style={{ opacity: `${totalOpacity}%`, transform: `scale(${viewScale})`, margin: `${(viewScale-1) *(imageSize/2)}px`, imageRendering: "pixelated" }} />
      </div>
    </div>
  )
}
