import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { People, SceneLocation } from '../data/Scene';
import {BehaviorSubject, combineLatest, merge, Observable} from 'rxjs';
import { DndDropEvent } from 'ngx-drag-drop';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { DeviceLamp } from '../device-lamp/device-lamp.component';
import {ProgVersionner} from '../../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import {SceneService, StartEnvConfig} from '../scene.service';
import {delay, map, tap} from 'rxjs/operators';
import {CB_CCBLEmitter} from 'ccbl-js/lib/Emitter';

export type PossibleLocations = 'AliceHome' | 'BobHome' | 'elsewhere';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SceneService]
})
export class SceneComponent implements OnInit, AfterViewInit {
  SLAliceHome: PossibleLocations = 'AliceHome';
  SLBobHome:   PossibleLocations = 'BobHome'  ;
  SLelsewhere: PossibleLocations = 'elsewhere';
  @ViewChild('svgRoot') svgRoot: ElementRef<HTMLElement>;
  @Input() width = 640;
  @Input() height = 480;
  Bob = new BehaviorSubject<People<PossibleLocations>>({
    imgURL: `assets/Bob.png`,
    name: 'Bob',
    phoning: false,
    location: 'BobHome',
    metadata: {}
  });
  Alice = new BehaviorSubject<People<PossibleLocations>>({
    imgURL: `assets/Alice.png`,
    name: 'Alice',
    phoning: false,
    location: 'AliceHome',
    metadata: {}
  });
  BobHome = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  AliceHome = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  elsewhere = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  peoples: Observable<People<any>[]> = combineLatest([this.Alice, this.Bob]);
  BobHomePeoples = this.peoples.pipe(
    map( peoples => peoples.filter( people => people.location === 'BobHome') )
  );
  AliceHomePeoples = this.peoples.pipe(
    map( peoples => peoples.filter( people => people.location === 'AliceHome') )
  );
  elsewhereHomePeoples = this.peoples.pipe(
    map( peoples => peoples.filter( people => people.location === 'elsewhere') )
  );
  allowDndList: string[] = [
    'People'
  ];
  Avatar = new BehaviorSubject<DeviceLamp>({
    name: 'Avatar',
    color: 'red'
  });
  progV    = new ProgVersionner( this.initialRootProg    );
  subProgV = new ProgVersionner( this.initialSubProgUser );
  simConf: StartEnvConfig;

  constructor(private sim: SceneService) {
    const updateClock = () => this.sim.clock.goto( Date.now() );
    this.simConf = {
      inputs: {
        AliceLocation: this.Alice.pipe( tap(updateClock), map(A => A.location)),
        BobLocation:   this.Bob  .pipe( tap(updateClock), map(B => B.location))
      },
      outputs: {
        Avatar: color => this.Avatar.next( {
          ...this.Avatar.getValue(),
          color
        } )
      }
    };
    merge(this.Alice, this.Bob).pipe(delay(10)).subscribe(
      () => this.sim.ccblProg?.UpdateChannelsActions()
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  start() {
    const P = this.sim.start( this.progV.getCurrent(), this.simConf);
    this.progV.updateWith( P.toHumanReadableProgram() );
    const SP = P.getProgramInstance( 'subProgUser' );
    this.subProgV.updateWith( SP.toHumanReadableProgram() );
  }

  reset() {
    this.subProgV.updateWith( this.initialSubProgUser );
    this.progV   .updateWith( this.initialRootProg    );
  }

  drop(evt: DndDropEvent, loc: PossibleLocations) {
    const people: People<any> = evt.data;
    const U = [this.Bob, this.Alice].find( S => S.getValue().name === people.name );
    U.next({
      ...U.getValue(),
      location: loc
    });
  }

  private get initialSubProgUser(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          emitters: [
            {name: 'AliceAtHome'   , type: 'boolean'},
            {name: 'AliceAtBobHome', type: 'boolean'},
            {name: 'BobAtHome'     , type: 'boolean'},
          ],
          channels: [
            {name: 'Avatar', type: 'COLOR'}
          ]
        }
      },
      allen: {
        During: [
          {
            contextName: 'Bob is at home',
            state: 'BobAtHome',
            allen: {
              During: [
                {
                  contextName: 'Alice at her home',
                  state: 'AliceAtHome',
                  actions: [{channel: 'Avatar', affectation: {value: '"orange"'}}],
                },
                {
                  contextName: 'Alice at Bob home',
                  state: 'AliceAtBobHome',
                  actions: [{channel: 'Avatar', affectation: {value: '"lightgreen"'}}],
                }
              ]
            }
          }
        ]
      }
    };
  }

  private get initialRootProg(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          events: [],
          emitters: [
            {name: 'BobLocation'  , type: 'string'},
            {name: 'AliceLocation', type: 'string'}
          ],
          channels: [
            {name: 'Avatar', type: 'COLOR'}
          ]
        }
      },
      localChannels: [
        {name: 'AliceAtHome'   , type: 'boolean'},
        {name: 'AliceAtBobHome', type: 'boolean'},
        {name: 'BobAtHome'     , type: 'boolean'},
      ],
      actions: [
        {channel: 'AliceAtHome'   , affectation: {value: `AliceLocation == "AliceHome"`}},
        {channel: 'BobAtHome'     , affectation: {value: `  BobLocation == "BobHome"  `}},
        {channel: 'AliceAtBobHome', affectation: {value: `AliceLocation == "BobHome"  `}},
        {channel: 'Avatar'        , affectation: {value: `"black"`                     }}
      ],
      subPrograms: {
        subProgUser: this.initialSubProgUser
      },
      allen: {
        During: [
          {
            as: 'subProgUser',
            mapInputs: {},
            programId: 'subProgUser'
          }
        ]
      }
    };
  }
}
