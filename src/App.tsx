import React from 'react'
import './App.css'
import NoiseCanvas from './components/NoiseCanvas'



function App() {

  const [smoothnessTransition, setSmoothnessTransition] = React.useState<number>(1.0)

  return (
    <>
      <input type="range" style={{width:'100%'}} min={2} max={32} step={0.5} name="" id="" value={smoothnessTransition} onChange={(e:any)=>{setSmoothnessTransition(e.target.value)}} />

      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        <div>
          <h2>Transição Normal</h2>
          <NoiseCanvas size={256} chunkSize={16} scale={80} levels={smoothnessTransition} />
        </div>
        <div>
          <h2>Transição Pixelizada (4 Níveis)</h2>
          <NoiseCanvas size={256} chunkSize={16} scale={80} levels={smoothnessTransition} />
        </div>
        <div>
          <h2>Preto e Branco Somente (2 Níveis)</h2>
          <NoiseCanvas size={256} chunkSize={16} scale={80} levels={smoothnessTransition} />
        </div>
      </div>
    </>
  )
}

export default App
