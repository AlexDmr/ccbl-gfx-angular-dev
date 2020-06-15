import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
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
export type statemachinecoffee = 'on'|'off'|'preparing'|'ready';

@Component({
  selector: 'app-scene-house',
  templateUrl: './scene-house.component.html',
  styleUrls: ['./scene-house.component.scss']
})
export class SceneHomeComponent implements OnInit {


  houseURL          = '/assets/Appart Test.svg';
  BathRoomLamp      = '/assets/lamp off.png';
  ParentalRoomLamp  = '/assets/lamp on.png';
  FirstRoomLamp     = '/assets/lamp on.png';
  SecondRoomLamp    = '/assets/lamp on.png';
  ToiletRoomLamp    = '/assets/lamp on.png';
  LivingRoomLamp    = '/assets/lamp on.png';
  KitchenLamp       = '/assets/lamp on.png';
  HallwayLamp       = '/assets/lamp on.png';
  imgDayNight: String;
  coffeemachine     = '/assets/cafe pret.gif';
  Oven              = '/assets/four off.png';


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
  CoffeeMachineState     = new BehaviorSubject<statemachinecoffee>( 'off' );
  OvenState              = new BehaviorSubject<boolean>( false );

  //Date
  DayTimeSubj = new BehaviorSubject<Date>(new Date()); // Cette variable doit permettre de régler l'heure (pas de synchro automatique avec l'horloge système)
  itIsDay = this.DayTimeSubj.pipe(
    map( date =>  date.getHours() < 20 && date.getHours() > 6 ),
    distinctUntilChanged());

  //tv
  @ViewChild('TV', { static: true }) tv: ElementRef;
  @ViewChild('clock', { static: true }) clock: ElementRef;
  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    this.clock.nativeElement.blur();
  }
  TvPlay = new BehaviorSubject<boolean>(false);
  TvVolume=new BehaviorSubject<number>(1);
  TvSource=new BehaviorSubject<string>("assets/movie.mp4");


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
      },
        {
          imgURL: `assets/Louis.png`,
          name: 'Louis',
          phoning: false,
          location: 'FirstRoom',
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
          Louis: sim.getPeopleObs('Louis'  ),
          itIsDay: this.itIsDay,
          CoffeeMachineState: this.CoffeeMachineState,
          someOneInBathRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'BathRoom') )),
          someOneInParentalRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'ParentalRoom') )),
          someOneInFirstRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'FirstRoom') )),
          someOneInSecondRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'SecondRoom') )),
          someOneInToiletRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'ToiletRoom') )),
          someOneInLivingRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'LivingRoom') )),
          someOneInKitchen: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'Kitchen') )),
          someOneInHallway: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'Hallway') )),
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
          OvenState:onoff=>this.OvenState.next(onoff),
          TvPlay: onoff=>this.TvPlay.next(onoff),
          TvVolume: vol=>this.TvVolume.next(vol),
          TvSource: source=>this.TvSource.next(source),

        }
      }));


      this.BathRoomLampState.subscribe(value =>this.BathRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.ParentalRoomLampState.subscribe(value =>this.ParentalRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.FirstRoomLampState.subscribe(value =>this.FirstRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.SecondRoomLampState.subscribe(value =>this.SecondRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.ToiletRoomLampState.subscribe(value =>this.ToiletRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.LivingRoomLampState.subscribe(value =>this.LivingRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.KitchenLampState.subscribe(value => {
        this.KitchenLamp = value ? "/assets/lamp on.png" : "/assets/lamp off.png";
        if(this.CoffeeMachineState.getValue()==='off' &&value)
        this.CoffeeMachineState.next('on');
      }),
      this.HallwayLampState.subscribe(value =>this.HallwayLamp=value?"/assets/lamp on.png":"/assets/lamp off.png")
      this.itIsDay.subscribe(Day=>
      {
        if(Day) {
          this.imgDayNight = "/assets/day.png";
        }
        else {
          this.imgDayNight = "/assets/night.png";
        }
      })
    this.CoffeeMachineState.subscribe(State=>{
      if(State==='off'){
        this.coffeemachine='/assets/machine a cafe off.png';
      }
      if(State==='on'){
        this.coffeemachine='/assets/machine a cafe on.png';
        setTimeout(()=>this.CoffeeMachineState.next('preparing'),2000);
      }
      if(State==='preparing'){
        this.coffeemachine='/assets/preparation-cafe.gif';
        setTimeout(()=>this.CoffeeMachineState.next('ready'),6000);
      }
      if(State==='ready'){
        this.coffeemachine='/assets/cafe pret.gif';
        setTimeout(()=>this.CoffeeMachineState.next('off'),15000);
      }
      }

    );
    this.OvenState.subscribe( value => this.Oven=value?'/assets/four on.png':'/assets/four off.png' );

    }

  progV    = new ProgVersionner( this.initialRootProg    );
  subProgV = new ProgVersionner( this.initialSubProgUser );
  someOneInBathRoom: Observable<boolean>;

  ngOnInit(): void {// Create observables related to display

    this.BathRoomPeoples =  this.sim.peoplesObs.pipe(
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
    this.someOneInBathRoom = this.BathRoomPeoples.pipe( map(L => L.length > 0) );
    timer(0,1000).subscribe(()=> {
      this.DayTimeSubj.getValue().setSeconds(this.DayTimeSubj.getValue().getSeconds()+1)
      this.DayTimeSubj.next(  this.DayTimeSubj.getValue())
    });
  }

  ngAfterViewInit(): void {
    this.TvPlay.subscribe(play => {
      if (play)
        this.tv.nativeElement.play();
      else
        this.tv.nativeElement.pause();
    });
    this.TvVolume.subscribe( volume=>
      {
        this.tv.nativeElement.volume=volume;
      }

    )
    this.TvSource.subscribe(()=> {
      this.tv.nativeElement.load();

      this.tv.nativeElement.autoplay=this.TvPlay.getValue();
    }  );
  }
  private get initialRootProg(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          events: [],
          emitters: [
            {name: 'Alice', type: 'People'},
            {name: 'Louis', type: 'People'},
            {name: 'Bob', type: 'People'},
            {name: 'itIsDay', type: 'boolean'} ,
            {name: 'someOneInBathRoom', type: 'boolean'} ,
            {name: 'someOneInParentalRoom', type: 'boolean'} ,
            {name: 'someOneInFirstRoom', type: 'boolean'} ,
            {name: 'someOneInSecondRoom', type: 'boolean'} ,
            {name: 'someOneInToiletRoom', type: 'boolean'} ,
            {name: 'someOneInLivingRoom', type: 'boolean'} ,
            {name: 'someOneInKitchen', type: 'boolean'} ,
            {name: 'someOneInHallway', type: 'boolean'} ,

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
            {name: 'TvPlay', type: 'boolean'} ,
            {name: 'TvVolume', type: 'Number'} ,
            {name: 'TvSource', type: 'string'} ,
            {name: 'OvenState',type:'boolean'}

          ]
        }
      },
      localChannels: [
      ],
      actions: [
        {channel: 'BathRoomLampState', affectation: {value: 'false'}},
        {channel:'ParentalRoomLampState',affectation: {value: 'false'}},
        {channel:'FirstRoomLampState', affectation: {value: 'false'}},
        {channel:'SecondRoomLampState', affectation: {value: 'false'}},
        {channel:'ToiletRoomLampState', affectation: {value: 'false'}},
        {channel:'LivingRoomLampState', affectation: {value: 'false'}},
        {channel:'KitchenLampState', affectation: {value: 'false'}},
        {channel:'HallwayLampState', affectation: {value: 'false'}},
        {channel:'OvenState', affectation: {value: 'false'}},
        {channel:'TvPlay', affectation: {value: 'false'}},
        {channel:'TvVolume', affectation: {value: '1'}},
        {channel:'TvSource', affectation: {value: '"assets/oceans.mp4"'}},



      ],
      subPrograms: {
        ProgUser: this.initialSubProgUser
      },
      allen: {
        During: [
          {
            as: 'isinBathRoom',
            mapInputs: {
              BathRoomLampState:'BathRoomLampState',
              ParentalRoomLampState: 'ParentalRoomLampState',
              FirstRoomLampState:'FirstRoomLampState',
              SecondRoomLampState: 'SecondRoomLampState',
              ToiletRoomLampState:'ToiletRoomLampState',
              LivingRoomLampState:'LivingRoomLampState',
              KitchenLampState:'KitchenLampState',
              HallwayLampState:'HallwayLampState',
              OvenState:'OvenState',
              TvPlay: 'TvPlay',
              TvVolume: 'TvVolume',
              TvSource: 'TvSource',
            },
            programId: 'ProgUser',

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
            {name: 'Alice', type: 'People'},
            {name: 'Louis', type: 'People'},
            {name: 'Bob', type: 'People'},
            {name: 'itIsDay', type: 'boolean'} ,
            {name: 'someOneInBathRoom', type: 'boolean'} ,
            {name: 'someOneInParentalRoom', type: 'boolean'} ,
            {name: 'someOneInFirstRoom', type: 'boolean'} ,
            {name: 'someOneInSecondRoom', type: 'boolean'} ,
            {name: 'someOneInToiletRoom', type: 'boolean'} ,
            {name: 'someOneInLivingRoom', type: 'boolean'} ,
            {name: 'someOneInKitchen', type: 'boolean'} ,
            {name: 'someOneInHallway', type: 'boolean'} ,
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
            {name: 'TvPlay', type: 'boolean'} ,
            {name: 'TvVolume', type: 'Number'} ,
            {name: 'TvSource', type: 'string'} ,
            {name: 'OvenState',type:'boolean'}

          ],

        }
      }
      ,
      subPrograms: {
        subProgUser: this.SubProgUser
      },
      allen: {
        During: [
          {
            contextName:'its night',
            state:'not itIsDay',
            actions: [{channel: 'TvPlay', affectation: {value: 'true'}},
              {channel: 'TvVolume', affectation: {value: '0.2'}},
              {channel: 'TvSource', affectation: {value: '"assets/movie.mp4"'}}],
            allen:{
              During: [
                {
                  contextName:'someOneInKitchen',
                  state:'someOneInKitchen',
                  actions:[
                    {channel:'OvenState', affectation: {value: 'true'}},
                  ]

                },

                {
                  as: 'isinBathRoom',
                  mapInputs: {

                    InRoom: 'someOneInBathRoom',
                    lamp: 'BathRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinParentalRoom',
                  mapInputs: {

                    InRoom: 'someOneInParentalRoom',
                    lamp: 'ParentalRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinFirstRoom',
                  mapInputs: {

                    InRoom: 'someOneInFirstRoom',
                    lamp: 'FirstRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinSecondRoom',
                  mapInputs: {

                    InRoom: 'someOneInSecondRoom',
                    lamp: 'SecondRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinToiletRoom',
                  mapInputs: {

                    InRoom: 'someOneInToiletRoom',
                    lamp: 'ToiletRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinLivingRoom',
                  mapInputs: {

                    InRoom: 'someOneInLivingRoom',
                    lamp: 'LivingRoomLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinKitchen',
                  mapInputs: {

                    InRoom: 'someOneInKitchen',
                    lamp: 'KitchenLampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinHallway',
                  mapInputs: {

                    InRoom: 'someOneInHallway',
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
    this.DayTimeSubj.next(new Date(this.DayTimeSubj.getValue().setHours(Number(tokens[0]),Number(tokens[1]),tokens[2]?Number(tokens[2]):this.DayTimeSubj.getValue().getSeconds())));

  }
}
