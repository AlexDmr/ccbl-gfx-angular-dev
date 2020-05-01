import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { People, SceneLocation } from '../data/Scene';
import {BehaviorSubject, Observable} from 'rxjs';
import { DndDropEvent } from 'ngx-drag-drop';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { DeviceLamp } from '../device-lamp/device-lamp.component';
import {ProgVersionner} from '../../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import {SceneService} from '../scene.service';
import {map} from 'rxjs/operators';

export type PossibleLocations = 'AliceHome' | 'BobHome' | 'elsewhere';

@Component({
  selector: 'app-scene-avatar',
  templateUrl: './scene-avatar.component.html',
  styleUrls: ['./scene-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SceneService]
})
export class SceneAvatarComponent implements OnInit, AfterViewInit {
  SLAliceHome: PossibleLocations = 'AliceHome';
  SLBobHome:   PossibleLocations = 'BobHome'  ;
  SLelsewhere: PossibleLocations = 'elsewhere';
  @Input() width = 640;
  @Input() height = 480;
  BobHome = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  AliceHome = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  elsewhere = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  BobHomePeoples:   Observable<People<PossibleLocations>[]>;
  AliceHomePeoples: Observable<People<PossibleLocations>[]>
  elsewhereHomePeoples: Observable<People<PossibleLocations>[]>;
  allowDndList: string[] = ['People'];
  Avatar = new BehaviorSubject<DeviceLamp>({
    name: 'Avatar',
    color: 'red'
  });
  progV    = new ProgVersionner( this.initialRootProg    );
  subProgV = new ProgVersionner( this.initialSubProgUser );

  constructor(private sim: SceneService) {
    sim.init([ {
        imgURL: `assets/Alice.png`,
        name: 'Alice',
        phoning: true,
        location: 'AliceHome',
        metadata: {}
      }, {
        imgURL: `assets/Bob.png`,
        name: 'Bob',
        phoning: true,
        location: 'BobHome',
        metadata: {}
      }
    ], [

    ], () => ({
      inputs: {
        Alice: sim.getPeopleObs('Alice'),
        Bob: sim.getPeopleObs('Bob'  )
      },
      outputs: {
        Avatar: color => this.Avatar.next( {
          ...this.Avatar.getValue(),
          color
        } )
      }
    }));

    // Create observables related to display
    this.BobHomePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'BobHome') )
    );
    this.AliceHomePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'AliceHome') )
    );
    this.elsewhereHomePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'elsewhere') )
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  start() {
    const P = this.sim.start( this.progV.getCurrent());
    this.progV.updateWith( P.toHumanReadableProgram() );
    const SP = P.getProgramInstance( 'subProgUser' );
    this.subProgV.updateWith( SP.toHumanReadableProgram() );
  }

  reset() {
    this.subProgV.updateWith( this.initialSubProgUser );
    this.progV   .updateWith( this.initialRootProg    );
  }

  drop(evt: DndDropEvent, location: PossibleLocations) {
    const people: People<any> = evt.data;
    this.sim.updatePeople(people.name, {location});
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
            {name: 'Bob'  , type: 'People'},
            {name: 'Alice', type: 'People'}
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
        {channel: 'AliceAtHome'   , affectation: {value: `Alice.location == "AliceHome"`}},
        {channel: 'BobAtHome'     , affectation: {value: `  Bob.location == "BobHome"  `}},
        {channel: 'AliceAtBobHome', affectation: {value: `Alice.location == "BobHome"  `}},
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
