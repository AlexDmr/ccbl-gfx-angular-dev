import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, timer} from 'rxjs';
import { SceneLocation, People } from '../data/Scene';
import { DeviceLamp } from '../device-lamp/device-lamp.component';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { SceneService } from '../scene.service';
import { map } from 'rxjs/operators';
import { DndDropEvent } from 'ngx-drag-drop';

export type PossibleLocations = 'Home' | 'elsewhere';

@Component({
  selector: 'app-scene-heating',
  templateUrl: './scene-heating.component.html',
  styleUrls: ['./scene-heating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SceneService]
})
export class SceneHeatingComponent implements OnInit {
  locHome: PossibleLocations = 'Home';
  locOutside: PossibleLocations = 'elsewhere';
  houseURL       = '/assets/House.svg';
  thermometerURL = '/assets/thermometer.svg';
  heatingURL     = '/assets/Heating.png';
  Home = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  Outside = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  InsidePeoples:  Observable<People<PossibleLocations>[]>;
  OutsidePeoples: Observable<People<PossibleLocations>[]>;
  Peoples: Observable<People<PossibleLocations>[]>;
  allowDndList: string[] = ['People'];

  Avatar = new BehaviorSubject<DeviceLamp>({
    name: 'Avatar',
    color: 'grey'
  });

  // Windows
  openWindows = new BehaviorSubject<boolean>( true );

  // Heating
  Heating = new BehaviorSubject<boolean>( false );

  // Thermometers
  insideTempSubj  = new BehaviorSubject<number>(20);
  outsideTempSubj = new BehaviorSubject<number>(10);

  // Time
  DayTimeSubj = new BehaviorSubject<Date>(new Date());
  DayNight = new BehaviorSubject<boolean>( false );

  // CCBL programs
  progV    = new ProgVersionner( this.initialRootProg    );
  subProgV = new ProgVersionner( this.initialSubProgUser );

  constructor(private sim: SceneService) {
    sim.init([ {
        imgURL: `assets/Eve.png`,
        name: 'Eve',
        phoning: true,
        location: 'Home',
        metadata: {}
      }
    ], [], () => ({
      inputs: { // Angular -> CCBL
        Eve: sim.getPeopleObs('Eve'),
        tempOutside: this.outsideTempSubj
      },
      outputs: { // CCBL -> Angular
        Avatar: color => this.Avatar.next( {
          ...this.Avatar.getValue(),
          color
        } ),
        openWindows: open => this.openWindows.next(open),
        Heating: onOff => this.Heating.next(onOff),
        tempInside: t => this.insideTempSubj.next(t)
      }
    }));
    //update date every 1 second
    timer(0,1000).subscribe(()=> this.DayTimeSubj.next(new Date()));
    this.DayTimeSubj.subscribe( date =>{
      if( date.getHours()<18 && date.getHours()>7)//test if day
      {
        this.DayNight.next(true);
      }
      else
      {
        this.DayNight.next(false);
      }
    })
    this.DayNight.subscribe(Day=>
      {
        this.openWindows.next(Day);
      }

    )
    this.InsidePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === this.locHome) )
    );
    this.OutsidePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === this.locOutside) )
    );
 }

  ngOnInit(): void {
  }

  private get initialSubProgUser(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          emitters: [
            {name: 'tempInside', type: 'number'},
            {name: 'temp_min'  , type: 'number'},
            {name: 'temp_max'  , type: 'number'},
          ],
          channels: [
            {name: 'Heating'   , type: 'boolean'}
          ]
        }
      },
      actions: [
        {channel: 'Heating'    , affectation: {value: `false`  }}
      ],
      allen: {
        During: [
          {
            contextName: 'Chauffe Marcel !',
            state: '',
            eventStart:  {eventSource: '', eventExpression: 'tempInside < temp_min'},
            eventFinish: {eventSource: '', eventExpression: 'tempInside > temp_max'},
            actions: [
              {channel: 'Heating'    , affectation: {value: `true`  }},
            ]
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
            {name: 'Eve', type: 'People'},
            {name: 'tempOutside', type: 'number' },
          ],
          channels: [
            {name: 'Avatar', type: 'COLOR'},
            {name: 'openWindows', type: 'boolean'},
            {name: 'Heating', type: 'boolean'},
            {name: 'tempInside' , type: 'number' },
          ]
        }
      },
      localChannels: [
        {name: 'deltaTime', type: 'number'},
        {name: 'deltaTemp', type: 'number'}
      ],
      actions: [
        {channel: 'openWindows', affectation: {value: (this.DayNight.getValue()?'true':'false')  }},
        {channel: 'Heating'    , affectation: {value: `false`  }},
        {channel: 'Avatar'     , affectation: {value: `"black"`}},
        {channel: 'tempInside' , affectation: {value: `20`}},
        {channel: 'deltaTime', affectation: {value: '100'}},
        {channel: 'deltaTemp', affectation: {value: 'sign(tempOutside - tempInside)'}}
      ],
      subPrograms: {
        subProgUser: this.initialSubProgUser
      },
      allen: {
        During: [
          {
            contextName: 'Fenêtres fermé => faut voir',
            state: 'not openWindows',
            actions: [
              {channel: 'deltaTime', affectation: {value: '1000'}}
            ],
            allen: {
              During: [
                {
                  contextName: 'chauffage',
                  state: 'Heating',
                  actions: [
                    {channel: 'deltaTemp', affectation: {value: '1'}}
                  ]
                }
              ]
            }
          },
          {
            contextName: 'change température',
            state: 'deltaTemp != 0',
            allen: {
              During: [
                {
                  contextName: 'Ajustement de temperature',
                  state: 'true; false; deltaTime; waitEnd',
                  actionsOnEnd: [
                    {channel: 'tempInside', affectation: 'tempInside + deltaTemp'}
                  ],
                  allen: {
                    Meet: {
                      contextsSequence: [],
                      loop: 0
                    }
                  }
                }
              ]
            }
          },
          {
            as: 'subProgUser',
            mapInputs: {
              temp_min: '18',
              temp_max: '22'
            },
            programId: 'subProgUser'
          }
        ]
      }
    };
  }

  drop(evt: DndDropEvent, location: PossibleLocations) {
    const people: People<any> = evt.data;
    this.sim.updatePeople(people.name, {location});
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
}
