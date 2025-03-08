import TextureCanvas from './components/TextureCanvas.tsx'
import NoiseCanvas from './components/NoiseCanvas.tsx'
import './App.css'


function App() {

  return (
    <div className='app'>
      <TextureCanvas />
      <NoiseCanvas />
      {/* <div className='main-section'>Seção config e preview3D</div> */}
    </div>
  )
}

export default App
