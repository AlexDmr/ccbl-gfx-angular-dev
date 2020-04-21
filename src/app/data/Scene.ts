import { Observable, fromEvent } from 'rxjs';

export const defaultScene: SCENE = {
  data: `
    <circle id="C" cx="50" cy="50" r="50" stroke="black" fill="green"/>
  `,
  inputs: [
    {name: 'H'    , selector: '#C', attribute: 'cy'},
    {name: 'color', selector: '#C', attribute: 'fill'}
  ],
  outputs: [
    {name: 'bt', selector: '#C', event: 'click'}
  ]
};

export interface SCENE {
  data: string;
  inputs: SceneInput[];
  outputs: SceneOutput[];
}

export interface SceneInput {
  name: string;
  selector: string;
  attribute: string;
}

export interface SceneOutput {
  name: string;
  selector: string;
  event: string;
}

export function createScene(
  root: HTMLElement,
  scene: SCENE,
  inputs: Map<string, Observable<any>>
  ): Map<string, Observable<any>> {
  root.innerHTML = scene.data;
  inputs.forEach( (obs, name) => {
    const sceneInput: SceneInput = scene.inputs.find( I => I.name === name );
    const node = root.querySelector( sceneInput.selector );
    if (node) {
      obs.subscribe( v => node.setAttribute(sceneInput.attribute, v) );
    }
  });

  const outputs = new Map<string, Observable<any>>();
  scene.outputs.forEach( output => {
    const n = root.querySelector( output.selector );
    if (n) {
      outputs.set(output.name, fromEvent(n, output.event));
    }
  });
  return outputs;
}
