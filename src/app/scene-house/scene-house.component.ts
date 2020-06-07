import { Component, OnInit } from '@angular/core';
import {DndDropEvent} from "ngx-drag-drop";
import {People, SceneLocation} from "../data/Scene";
import {SceneService} from "../scene.service";
import {BehaviorSubject, Observable, timer} from "rxjs";
import {distinctUntilChanged, map} from "rxjs/operators";
import {DeviceLamp} from "../device-lamp/device-lamp.component";
import {HumanReadableProgram} from "ccbl-js/lib/ProgramObjectInterface";
import {ProgVersionner} from "../../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service";

export type PossibleLocations = 'BathRoom'|
  'Outside'|'ParentalRoom'|'FirstRoom'|'SecondRoom'|'ToiletRoom'|'LivingRoom'|'Kitchen'|'Hallway'  ;

@Component({
  selector: 'app-scene-house',
  templateUrl: './scene-house.component.html',
  styleUrls: ['./scene-house.component.scss']
})
export class SceneHomeComponent implements OnInit {
  houseURL          = '/assets/home-detail.png';
  BathRoomLamp      = '/assets/lamp off.png';
  ParentalRoomLamp  = '/assets/lamp on.png';
  FirstRoomLamp     = '/assets/lamp on.png';
  SecondRoomLamp    = '/assets/lamp on.png';
  ToiletRoomLamp    = '/assets/lamp on.png';
  LivingRoomLamp    = '/assets/lamp on.png';
  KitchenLamp       = '/assets/lamp on.png';
  HallwayLamp       = '/assets/lamp on.png';
  imgDayNight: String;

  allowDndList: string[] = ['People'];
  SLBathRoom: PossibleLocations = 'BathRoom';
  SLOutside: PossibleLocations = 'Outside';
  SLParentalRoom: PossibleLocations = 'ParentalRoom';
  SLFirstRoom: PossibleLocations = 'FirstRoom';
  SLSecondRoom: PossibleLocations = 'SecondRoom';
  SLToiletRoom: PossibleLocations = 'ToiletRoom';
  SLLivingRoom: PossibleLocations = 'LivingRoom';
  SLKitchen: PossibleLocations = 'Kitchen';
  SLHallway: PossibleLocations = 'Hallway';

  BathRoomPeoples:   Observable<People<PossibleLocations>[]>;
  ParentalRoomPeoples:   Observable<People<PossibleLocations>[]>;
  FirstRoomPeoples:   Observable<People<PossibleLocations>[]>;
  SecondRoomPeoples:   Observable<People<PossibleLocations>[]>;
  ToiletRoomPeoples:   Observable<People<PossibleLocations>[]>;
  LivingRoomPeoples:   Observable<People<PossibleLocations>[]>;
  KitchenPeoples:   Observable<People<PossibleLocations>[]>;
  HallwayPeoples: Observable<People<PossibleLocations>[]>;
  elsewhereHomePeoples: Observable<People<PossibleLocations>[]>;

  //lamp
  BathRoomLampState      = new BehaviorSubject<boolean>( false );
  ParentalRoomLampState  = new BehaviorSubject<boolean>( false );
  FirstRoomLampState     = new BehaviorSubject<boolean>( false );
  SecondRoomLampState    = new BehaviorSubject<boolean>( false );
  ToiletRoomLampState    = new BehaviorSubject<boolean>( false );
  LivingRoomLampState    = new BehaviorSubject<boolean>( false );
  KitchenLampState       = new BehaviorSubject<boolean>( false );
  HallwayLampState       = new BehaviorSubject<boolean>( false );

  //Date
  DayTimeSubj = new BehaviorSubject<Date>(new Date()); // Cette variable doit permettre de régler l'heure (pas de synchro automatique avec l'horloge système)
  itIsDay = this.DayTimeSubj.pipe(
    map( date =>  date.getHours() < 20 && date.getHours() > 6 ),
    distinctUntilChanged());


  BathRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  ParentalRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  FirstRoom = new BehaviorSubject<SceneLocation>( {
      metadata: {}
    } );
  SecondRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  ToiletRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  LivingRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  Kitchen = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  Hallway = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  elsewhere = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );

  Avatar = new BehaviorSubject<DeviceLamp>({
    name: 'Avatar',
    color: 'red'
  });

    constructor(private sim: SceneService) {
      sim.init([ {
        imgURL: `assets/Alice.png`,
        name: 'Alice',
        phoning: false,
        location: 'BathRoom',
        metadata: {}
      }, {
        imgURL: `assets/Bob.png`,
        name: 'Bob',
        phoning: false,
        location: 'ParentalRoom',
        metadata: {}
      }
      ], [

      ], () => ({
        inputs: {
          Alice: sim.getPeopleObs('Alice'),
          Bob: sim.getPeopleObs('Bob'  ),
          itIsDay: this.itIsDay,


        },
        outputs: {
          BathRoomLampState: onoff=>this.BathRoomLampState.next(onoff),
          ParentalRoomLampState: onoff=>this.ParentalRoomLampState.next(onoff),
          FirstRoomLampState: onoff=>this.FirstRoomLampState.next(onoff),
          SecondRoomLampState: onoff=>this.SecondRoomLampState.next(onoff),
          ToiletRoomLampState: onoff=>this.ToiletRoomLampState.next(onoff),
          LivingRoomLampState: onoff=>this.LivingRoomLampState.next(onoff),
          KitchenLampState: onoff=>this.KitchenLampState.next(onoff),
          HallwayLampState: onoff=>this.HallwayLampState.next(onoff),
        }
      }));

      // Create observables related to display
      this.BathRoomPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'BathRoom') )
      );
      this.ParentalRoomPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'ParentalRoom') )
      );
      this.FirstRoomPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'FirstRoom') )
      );
      this.SecondRoomPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'SecondRoom') )
      );
      this.ToiletRoomPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'ToiletRoom') )
      );
      this.LivingRoomPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'LivingRoom') )
      );
      this.KitchenPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'Kitchen') )
      );
      this.HallwayPeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'Hallway') )
      );
      this.elsewhereHomePeoples = this.sim.peoplesObs.pipe(
        map( peoples => peoples.filter( people => people.location === 'Outside') )
      );
      this.BathRoomLampState.subscribe(value =>this.BathRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.ParentalRoomLampState.subscribe(value =>this.ParentalRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.FirstRoomLampState.subscribe(value =>this.FirstRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.SecondRoomLampState.subscribe(value =>this.SecondRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.ToiletRoomLampState.subscribe(value =>this.ToiletRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.LivingRoomLampState.subscribe(value =>this.LivingRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.KitchenLampState.subscribe(value =>this.KitchenLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
        this.HallwayLampState.subscribe(value =>this.HallwayLamp=value?"/assets/lamp on.png":"/assets/lamp off.png")
      this.itIsDay.subscribe(Day=>
      {
        if(Day)
          this.imgDayNight="/assets/day.png";
        else
          this.imgDayNight="/assets/night.png";
      })
    }

  progV    = new ProgVersionner( this.initialRootProg    );
  subProgV = new ProgVersionner( this.initialSubProgUser );

  ngOnInit(): void {

    timer(0,1000).subscribe(()=> {
      this.DayTimeSubj.getValue().setSeconds(this.DayTimeSubj.getValue().getSeconds()+1)
      this.DayTimeSubj.next(  this.DayTimeSubj.getValue())
    });
  }


  private get initialRootProg(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          events: [],
          emitters: [
            {name: 'Alice', type: 'People'},
            {name: 'Bob', type: 'People'},
            {name: 'itIsDay', type: 'boolean'} ,

          ],
          channels: [
            {name:'BathRoomLampState', type:'LAMPE'},
            {name:'ParentalRoomLampState', type:'LAMPE'},
            {name:'FirstRoomLampState', type:'LAMPE'},
            {name:'SecondRoomLampState', type:'LAMPE'},
            {name:'ToiletRoomLampState', type:'LAMPE'},
            {name:'LivingRoomLampState', type:'LAMPE'},
            {name:'KitchenLampState', type:'LAMPE'},
            {name:'HallwayLampState', type:'LAMPE'},
          ]
        }
      },
      localChannels: [
        {name: 'inBathRoom'   , type: 'boolean'},
        {name: 'inParentalRoom'   , type: 'boolean'},
        {name: 'inFirstRoom'   , type: 'boolean'},
        {name: 'inSecondRoom'   , type: 'boolean'},
        {name: 'inToiletRoom'   , type: 'boolean'},
        {name: 'inLivingRoom'   , type: 'boolean'},
        {name: 'inKitchen'   , type: 'boolean'},
        {name: 'inHallway'   , type: 'boolean'},

      ],
      actions: [
        {channel: 'inBathRoom', affectation: {value: `Alice.location == "BathRoom"| Bob.location == "BathRoom"`}},
        {channel: 'inParentalRoom', affectation: {value: `Alice.location == "ParentalRoom"| Bob.location == "ParentalRoom"`}},
        {channel: 'inFirstRoom', affectation: {value: `Alice.location == "FirstRoom"| Bob.location == "FirstRoom"`}},
        {channel: 'inSecondRoom', affectation: {value: `Alice.location == "SecondRoom"| Bob.location == "SecondRoom"`}},
        {channel: 'inToiletRoom', affectation: {value: `Alice.location == "ToiletRoom"| Bob.location == "ToiletRoom"`}},
        {channel: 'inLivingRoom', affectation: {value: `Alice.location == "LivingRoom"| Bob.location == "LivingRoom"`}},
        {channel: 'inKitchen', affectation: {value: `Alice.location == "Kitchen"| Bob.location == "Kitchen"`}},
        {channel: 'inHallway', affectation: {value: `Alice.location == "Hallway"| Bob.location == "Hallway"`}},


        {channel: 'BathRoomLampState', affectation: {value: 'false'}},
        {channel:'ParentalRoomLampState',affectation: {value: 'false'}},
        {channel:'FirstRoomLampState', affectation: {value: 'false'}},
        {channel:'SecondRoomLampState', affectation: {value: 'false'}},
        {channel:'ToiletRoomLampState', affectation: {value: 'false'}},
        {channel:'LivingRoomLampState', affectation: {value: 'false'}},
        {channel:'KitchenLampState', affectation: {value: 'false'}},
        {channel:'HallwayLampState', affectation: {value: 'false'}},

      ],
      subPrograms: {
        subProgUser: this.initialSubProgUser
      },
      allen: {
        During: [
          {
            contextName:'its night',
            state:'not itIsDay',
            allen:{
              During: [
                {
                  as: 'isinBathRoom',
                  mapInputs: {

                    InRoom: 'inBathRoom',
                    lamp: 'BathRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinParentalRoom',
                  mapInputs: {

                    InRoom: 'inParentalRoom',
                    lamp: 'ParentalRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinFirstRoom',
                  mapInputs: {

                    InRoom: 'inFirstRoom',
                    lamp: 'FirstRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinSecondRoom',
                  mapInputs: {

                    InRoom: 'inSecondRoom',
                    lamp: 'SecondRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinToiletRoom',
                  mapInputs: {

                    InRoom: 'inToiletRoom',
                    lamp: 'ToiletRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinLivingRoom',
                  mapInputs: {

                    InRoom: 'inLivingRoom',
                    lamp: 'LivingRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinKitchen',
                  mapInputs: {

                    InRoom: 'inKitchen',
                    lamp: 'KitchenLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinHallway',
                  mapInputs: {

                    InRoom: 'inHallway',
                    lamp: 'HallwayLampState'

                  },
                  programId: 'subProgUser',

                }
              ]
            }
          }
        ]
      }
    };
  }
  private get initialSubProgUser(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          emitters: [
            {name: 'InRoom', type: 'boolean'},
          ],
          channels: [
            {name: 'lamp', type: 'LAMPE'}
          ]
        }
      },
      allen: {
        During: [
          {
            contextName: 'Some one In room',
            state: 'InRoom',
            actions: [{channel: 'lamp', affectation: {value: 'true'}}]
          }
        ]
      }
    };
  }
  private get SubProgUser(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          emitters: [
            {name: 'InRoom', type: 'boolean'},
          ],
          channels: [
            {name: 'lamp', type: 'LAMPE'}
          ]
        }
      },
      allen: {
        During: [
          {
            contextName: 'Some one In room',
            state: 'InRoom',
            actions: [{channel: 'lamp', affectation: {value: 'true'}}]
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
    const SP = P.getProgramInstance( 'isinBathRoom' );
    this.subProgV.updateWith( SP.toHumanReadableProgram() );
  }
  changeDate(d:string){
    var tokens = d.split(':');
    this.DayTimeSubj.next(new Date(this.DayTimeSubj.getValue().setHours(Number(tokens[0]),Number(tokens[1]),Number(tokens[2]))));
  }
}
