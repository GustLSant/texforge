import React from "react";
import { Noise } from "noisejs";


interface NoiseCanvasProps {
  size: number; // Tamanho total do canvas (padrão 256)
  chunkSize: number; // Tamanho dos blocos (quanto maior, mais pixelizado)
  scale: number; // Escala do Perlin Noise (define a suavidade)
  levels: number; // Define quantos tons de cinza existem (2 = preto e branco, 4 = pixelado, etc.)
}

const defaultProps:NoiseCanvasProps = {
  size: 256,
  chunkSize: 16,
  scale: 80,
  levels: 256,
}


export default function NoiseCanvasReact(props:NoiseCanvasProps = defaultProps):React.ReactElement{
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = React.useState<number>(0)
  const noiseGen:Noise = React.useMemo<Noise>( ()=>{return new Noise(seed)}, [seed] ); // Criar gerador de noise


  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx:CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = props.size;
    canvas.height = props.size;

    for (let x=0; x<props.size; x+=props.chunkSize) {
      for (let y=0; y<props.size; y+=props.chunkSize) {
        let value = noiseGen.perlin2(x / props.scale, y / props.scale); // Gera Perlin Noise
        value = (value + 1) / 2; // Normaliza de -1..1 para 0..1

        // 🔹 Aplica "pixelização" nas transições reduzindo os níveis de cinza
        const step = 1 / (props.levels - 1);
        value = Math.round(value / step) * step;

        const color = Math.floor(value * 255); // Converte para escala de cinza

        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.fillRect(x, y, props.chunkSize, props.chunkSize);
      }
    }
  }, [props.size, props.chunkSize, props.scale, props.levels]);

  return <canvas ref={canvasRef} style={{ width: "100%", imageRendering: "pixelated" }} />;
}
