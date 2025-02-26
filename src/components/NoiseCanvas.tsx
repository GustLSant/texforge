import React from "react";
import { Noise } from "noisejs";
import * as htmlToImage from 'html-to-image';
import { TbReload } from "react-icons/tb";
import './NoiseCanvas.css'


function linearInterpolation(value:number, higherMultiplier:number, lowerMultiplier:number):number{
  return ( value*higherMultiplier + (1-value)*lowerMultiplier )
}


export default function NoiseCanvas():React.ReactElement{
  const [imageSize, setImageSize] = React.useState<number>(64)
  const [viewScale, setViewScale] = React.useState<number>(2.0)
  const [totalOpacity, setTotalOpacity] = React.useState<number>(100)
  const [brightOpacity, setBrightOpacity] = React.useState<number>(100)
  const [darkOpacity, setDarkOpacity] = React.useState<number>(100)
  const [grayLevels, setGrayLevels] = React.useState<number>(4)
  const [stepsPerPixel, setStepsPerPixel] = React.useState<number>(2)
  const [scale, setScale] = React.useState<[number, number]>([40.0, 40.0])
  const [seed, setSeed] = React.useState<number>(1)
  
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

        const color = Math.floor(noiseValue * 255); // Converte de 0..1 para 1..255

        ctx.fillStyle = `rgba(${color}, ${color}, ${color}, ${linearInterpolation(noiseValue, brightOpacity, darkOpacity)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

  }, [imageSize, viewScale, totalOpacity, brightOpacity, darkOpacity, grayLevels, stepsPerPixel, scale, seed]);


  function handleClickExportButton():void{
    if(!canvasRef.current) return
    
    htmlToImage
    .toPng(canvasRef.current)
    .then((dataUrl) => {
      var link = document.createElement('a');
      link.download = 'my-image-name.png';
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
    <div className="noise-canvas">
      
      <div className="max-h-[30vh] overflow-y-scroll flex flex-col">
        
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
          <h2>Opacity</h2>

          <div className="settings-section__container-controls">
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Total Opacity:</p>  <p>{totalOpacity}%</p></div>
              <input type="range" min={0} max={100} step={1} value={totalOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setTotalOpacity(Number(e.target.value))}} />
            </div>
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Bright Opacity:</p>  <p>{brightOpacity}%</p></div>
              <input type="range" min={0} max={100} step={1} value={brightOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setBrightOpacity(Number(e.target.value))}} />
            </div>
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Dark Opacity:</p>  <p>{darkOpacity}%</p></div>
              <input type="range" min={0} max={100} step={1} value={darkOpacity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setDarkOpacity(Number(e.target.value))}} />
            </div>
          </div>
        </section>
        
        <section className="settings-section">
          <h2>Generation Settings:</h2>

          <div className="settings-section__container-controls">
            <div className="setting-control-container">
              <div className="setting-label-container">
                <p>Noise Seed:</p>
                <div className="flex gap-1 items-center">
                  <input type="text" className="input-number" value={seed} onChange={handleChangeInputSeed} />
                  <TbReload className="text-xl hover:cursor-pointer select-none" onClick={()=>{setSeed(Math.floor(Math.random()*5000))}} />
                </div>
              </div>
            </div>
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Gray Levels:</p>  <p>{grayLevels}</p></div>
              <input type="range" min={2} max={24} step={1} value={grayLevels} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setGrayLevels(Number(e.target.value))}} />
            </div>
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Steps per pixel:</p>  <p>{stepsPerPixel}</p></div>
              <input type="range" min={1} max={16} step={1} value={stepsPerPixel} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setStepsPerPixel(Number(e.target.value))}} />
            </div>
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Noise X Scale::</p>  <p>{scale[0]-40}</p></div>
              <input type="range" min={1} max={80} step={1} value={scale[0]} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScale([Number(e.target.value), scale[1]])}} />
            </div>
            <div className="setting-control-container">
              <div className="setting-label-container"><p>Noise Y Scale::</p>  <p>{scale[1]-40}</p></div>
              <input type="range" min={1} max={80} step={1} value={scale[1]} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setScale([scale[0], Number(e.target.value)])}} />
            </div>
          </div>
        </section>

      </div>

      <button onClick={handleClickExportButton}>Export Image</button>

      <div>
        {/* <canvas ref={canvasRef} style={{ opacity: `${totalOpacity}%`, transform: `scale(${viewScale})`, imageRendering: "pixelated" }} /> */}
      </div>
    </div>
  )
}
