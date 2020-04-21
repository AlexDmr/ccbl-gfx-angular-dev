import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { SCENE, defaultScene, createScene } from '../data/Scene';
import { Observable, interval, of, Subject } from 'rxjs';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('svgRoot') svgRoot: ElementRef<HTMLElement>;
  @Input() scene: SCENE = defaultScene;
  @Input() width = 640;
  @Input() height = 480;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const subj = new Subject<string>();
    const inputs = new Map<string, Observable<any>>();
    inputs.set('H', interval(20));
    inputs.set('color', subj);
    const outputs = createScene(this.svgRoot.nativeElement, this.scene, inputs);
    outputs.get('bt').subscribe( () => subj.next('yellow') );
  }

  get transfoRoot(): string {
    return `translate(0, ${this.height}) scale(1, -1)`;
  }

}
