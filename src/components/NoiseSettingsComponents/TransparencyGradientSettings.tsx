import React from "react";
import { TranspGradientType } from "../../types";
import { TbReload } from "react-icons/tb";


type TranspGradientSettingsProps = {
  transpGradients: TranspGradientType,
  setTranspGradients: React.Dispatch<React.SetStateAction<TranspGradientType>>,
}


export default function TransparencyGradientSettings(props: TranspGradientSettingsProps){

  function handleChangeTranspGradients(_side: 'tb'|'bt'|'rl'|'lr', _newValue: number): void{
    if(_side === 'tb'){
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.tb = _newValue
      props.setTranspGradients(newTranspGradients)
    }
    else if(_side === 'bt'){
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.bt = _newValue
      props.setTranspGradients(newTranspGradients)
    }
    else if(_side === 'rl'){
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.rl = _newValue
      props.setTranspGradients(newTranspGradients)
    }
    else{
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.lr = _newValue
      props.setTranspGradients(newTranspGradients)
    }
  }


  function handleClickResetButton(_side: 'tb'|'bt'|'rl'|'lr'){
    if(_side === 'tb'){
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.tb = 0.0
      props.setTranspGradients(newTranspGradients)
    }
    else if(_side === 'bt'){
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.bt = 0.0
      props.setTranspGradients(newTranspGradients)
    }
    else if(_side === 'rl'){
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.rl = 0.0
      props.setTranspGradients(newTranspGradients)
    }
    else{
      const newTranspGradients: TranspGradientType = {...props.transpGradients}
      newTranspGradients.lr = 0.0
      props.setTranspGradients(newTranspGradients)
    }
  }


  return(
    <section className="settings-section">
        <h2>Transparency Gradient Settings</h2>
        
        <div className="settings-section__container-controls">
          <div className="setting-control-container" id="gray-levels">
            <div className="setting-label-container">
              <p>Top to Bottom:</p>
              <div className="flex gap-1 items-center"><p>{props.transpGradients.tb}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('tb')}} /></div>
            </div>
            <input type="range" min={0.0} max={1.0} step={0.01} value={props.transpGradients.tb} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{handleChangeTranspGradients('tb', Number(e.target.value))}} />
          </div>

          <div className="setting-control-container" id="gray-levels">
            <div className="setting-label-container">
              <p>Bottom to Top:</p>
              <div className="flex gap-1 items-center"><p>{props.transpGradients.bt}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('bt')}} /></div>
            </div>
            <input type="range" min={0.0} max={1.0} step={0.01} value={props.transpGradients.bt} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{handleChangeTranspGradients('bt', Number(e.target.value))}} />
          </div>

          <div className="setting-control-container" id="gray-levels">
            <div className="setting-label-container">
              <p>Right to Left:</p>
              <div className="flex gap-1 items-center"><p>{props.transpGradients.rl}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('rl')}} /></div>
            </div>
            <input type="range" min={0.0} max={1.0} step={0.01} value={props.transpGradients.rl} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{handleChangeTranspGradients('rl', Number(e.target.value))}} />
          </div>

          <div className="setting-control-container" id="gray-levels">
            <div className="setting-label-container">
              <p>Left to Right:</p>
              <div className="flex gap-1 items-center"><p>{props.transpGradients.lr}</p><TbReload className="text-xl" onClick={()=>{handleClickResetButton('lr')}} /></div>
            </div>
            <input type="range" min={0.0} max={1.0} step={0.01} value={props.transpGradients.lr} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{handleChangeTranspGradients('lr', Number(e.target.value))}} />
          </div>
        </div>
    </section>
  )
}