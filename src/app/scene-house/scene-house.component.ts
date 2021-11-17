import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {DndDropEvent} from "ngx-drag-drop";
import {People, SceneLocation} from "../data/Scene";
import {SceneService} from "../scene.service";
import {BehaviorSubject, combineLatest, Observable, timer} from "rxjs";
import {distinctUntilChanged, map} from "rxjs/operators";
import {DeviceLamp} from "../device-lamp/device-lamp.component";
import {HumanReadableProgram} from "ccbl-js/lib/ProgramObjectInterface";
import {ProgVersionner} from "../../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service";

export type PossibleLocations = 'BathRoom'|
  'Outside'|'ParentalRoom'|'ParentalRoomBed'|'FirstRoom'|'FirstRoomBed'|'SecondRoom'|'SecondRoomBed'|'ToiletRoom'|'LivingRoom'|'LivingRoomSofa'|'Kitchen'|'Hallway1'|'Hallway2'  ;
export type statemachinecoffee = 'ON'|'OFF'|'PREPARING'|'READY';
export type Weather = 'claire' | 'Nuageux' | 'Pluie' | 'Tempete';

@Component({
  selector: 'app-scene-house',
  templateUrl: './scene-house.component.html',
  styleUrls: ['./scene-house.component.scss']
})
export class SceneHomeComponent implements OnInit {
  weathers: Weather[] = [
    'claire', 'Nuageux', 'Pluie', 'Tempete'
  ]

  houseURL          = '/assets/Appart Test.svg';
  BathRoomLamp      = '/assets/lamp off.png';
  ParentalRoomLamp  = '/assets/lamp on.png';
  FirstRoomLamp     = '/assets/lamp on.png';
  SecondRoomLamp    = '/assets/lamp on.png';
  ToiletRoomLamp    = '/assets/lamp on.png';
  LivingRoomLamp    = '/assets/lamp on.png';
  KitchenLamp       = '/assets/lamp on.png';
  Hallway1Lamp       = '/assets/lamp on.png';
  Hallway2Lamp      = '/assets/lamp on.png';
  coffeemachine     = '/assets/cafe pret.gif';
  Oven              = '/assets/four off.png';
  imgWeather        = '/assets/clean.gif';
  imgDayNight: string = '';


  allowDndList: string[] = ['People'];
  SLBathRoom: PossibleLocations = 'BathRoom';
  SLOutside: PossibleLocations = 'Outside';
  SLParentalRoom: PossibleLocations = 'ParentalRoom';
  SLParentalRoomBed: PossibleLocations = 'ParentalRoomBed';
  SLFirstRoom: PossibleLocations = 'FirstRoom';
  SLFirstRoomBed: PossibleLocations = 'FirstRoomBed';
  SLSecondRoom: PossibleLocations = 'SecondRoom';
  SLSecondRoomBed: PossibleLocations = 'SecondRoomBed';
  SLToiletRoom: PossibleLocations = 'ToiletRoom';
  SLLivingRoom: PossibleLocations = 'LivingRoom';
  SLLivingRoomSofa: PossibleLocations = 'LivingRoomSofa';
  SLKitchen: PossibleLocations = 'Kitchen';
  SLHallway1: PossibleLocations = 'Hallway1';
  SLHallway2: PossibleLocations = 'Hallway2';

  BathRoomPeoples!:   Observable<People<PossibleLocations>[]>;
  ParentalRoomPeoples!:   Observable<People<PossibleLocations>[]>;
  ParentalRoomBedPeoples!:   Observable<People<PossibleLocations>[]>;
  FirstRoomPeoples!:   Observable<People<PossibleLocations>[]>;
  FirstRoomBedPeoples!:   Observable<People<PossibleLocations>[]>;
  SecondRoomPeoples!:   Observable<People<PossibleLocations>[]>;
  SecondRoomBedPeoples!:   Observable<People<PossibleLocations>[]>;
  ToiletRoomPeoples!:   Observable<People<PossibleLocations>[]>;
  LivingRoomPeoples!:   Observable<People<PossibleLocations>[]>;
  LivingRoomSofaPeoples!:   Observable<People<PossibleLocations>[]>;
  KitchenPeoples!:   Observable<People<PossibleLocations>[]>;
  Hallway1Peoples!: Observable<People<PossibleLocations>[]>;
  Hallway2Peoples!: Observable<People<PossibleLocations>[]>;
  elsewhereHomePeoples!: Observable<People<PossibleLocations>[]>;

  //lamp
  BathRoomLampState      = new BehaviorSubject<boolean>( false );
  ParentalRoomLampState  = new BehaviorSubject<boolean>( false );
  FirstRoomLampState     = new BehaviorSubject<boolean>( false );
  SecondRoomLampState    = new BehaviorSubject<boolean>( false );
  ToiletRoomLampState    = new BehaviorSubject<boolean>( false );
  LivingRoomLampState    = new BehaviorSubject<boolean>( false );
  KitchenLampState       = new BehaviorSubject<boolean>( false );
  Hallway1LampState       = new BehaviorSubject<boolean>( false );
  Hallway2LampState       = new BehaviorSubject<boolean>( false );
  CoffeeMachineState     = new BehaviorSubject<statemachinecoffee>( 'OFF' );
  OvenState              = new BehaviorSubject<boolean>( false );

  SwitchFirstRoom      = new BehaviorSubject<boolean>( false );
  SwitchSecondRoom      = new BehaviorSubject<boolean>( false );
  SwitchParentalRoom      = new BehaviorSubject<boolean>( false );
  SwitchHallway1      = new BehaviorSubject<boolean>( false );
  SwitchHallway2     = new BehaviorSubject<boolean>( false );
  SwitchKitchen      = new BehaviorSubject<boolean>( false );
  SwitchLivingRoom      = new BehaviorSubject<boolean>( false );
  SwitchBathroom      = new BehaviorSubject<boolean>( false );
  SwitchToilet      = new BehaviorSubject<boolean>( false );

  openWindows = new BehaviorSubject<boolean>( true );

  thermometerURL = '/assets/thermometer.svg';
  outsideTempSubj = new BehaviorSubject<number>(10);



  //Date
  DayTimeSubj = new BehaviorSubject<Date>(new Date()); // Cette variable doit permettre de régler l'heure (pas de synchro automatique avec l'horloge système)
  itIsDay = this.DayTimeSubj.pipe(
    map( date =>  date.getHours() < 20 && date.getHours() > 6 ),
    distinctUntilChanged());
  weather=new BehaviorSubject<Weather>( 'Tempete' );
      //tv
  @ViewChild('TV', { static: true }) tv!: ElementRef;
  @ViewChild('clock', { static: true }) clock!: ElementRef;
  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll() {
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
  ParentalRoomBed = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  FirstRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  FirstRoomBed = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  SecondRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  SecondRoomBed = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  ToiletRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  LivingRoom = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  LivingRoomSofa = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  Kitchen = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  Hallway1 = new BehaviorSubject<SceneLocation>( {
    metadata: {}
  } );
  Hallway2 = new BehaviorSubject<SceneLocation>( {
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
          Alice: sim.getPeopleObs('Alice')!,
          Bob: sim.getPeopleObs('Bob'  )!,
          Louis: sim.getPeopleObs('Louis'  )!,
          itIsDay: this.itIsDay,
          SwitchFirstRoom:  this.SwitchFirstRoom,
          SwitchSecondRoom:  this.SwitchSecondRoom,
          SwitchParentalRoom:  this.SwitchParentalRoom,
          SwitchHallway1:  this.SwitchHallway1,
          SwitchHallway2:  this.SwitchHallway2,
          SwitchKitchen:  this.SwitchKitchen,
          SwitchLivingRoom:  this.SwitchLivingRoom,
          SwitchBathroom:  this.SwitchBathroom,
          SwitchToilet:  this.SwitchToilet,
          CoffeeMachineState: this.CoffeeMachineState,
          weather:this.weather,
          outsideTempSubj:this.outsideTempSubj,
          someOneInBathRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'BathRoom') )),
          someOneInParentalRoom: combineLatest(this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'ParentalRoom') )),
            this.sim.peoplesObs.pipe(
              map( peoples => !!peoples.find( people => people.location === 'ParentalRoomBed') ))).pipe(map( (b1) => (b1[0] || b1[1]))),
          someOneInParentalRoomBed: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'ParentalRoomBed') )),
          someOneInFirstRoom: combineLatest(this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'FirstRoom') )),
            this.sim.peoplesObs.pipe(
              map( peoples => !!peoples.find( people => people.location === 'FirstRoomBed') ))).pipe(map( (b1) => (b1[0] || b1[1]))),
          someOneInFirstRoomBed: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'FirstRoomBed') )),
          someOneInSecondRoom: combineLatest(this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'SecondRoom') )),
            this.sim.peoplesObs.pipe(
              map( peoples => !!peoples.find( people => people.location === 'SecondRoomBed') ))).pipe(map( (b1) => (b1[0] || b1[1]))),
          someOneInSecondRoomBed: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'SecondRoomBed') )),
          someOneInToiletRoom: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'ToiletRoom') )),
          someOneInLivingRoom: combineLatest(this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'LivingRoom') )),
            this.sim.peoplesObs.pipe(
              map( peoples => !!peoples.find( people => people.location === 'LivingRoomSofa') ))).pipe(map( (b1) => (b1[0] || b1[1]))),
          someOneInLivingRoomSofa: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'LivingRoomSofa') )),
          someOneInKitchen: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'Kitchen') )),
          someOneInHallway1: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'Hallway1') )),
          someOneInHallway2: this.sim.peoplesObs.pipe(
            map( peoples => !!peoples.find( people => people.location === 'Hallway2') )),
        },
        outputs: {
          BathRoomLampState: onoff=>this.BathRoomLampState.next(onoff),
          ParentalRoomLampState: onoff=>this.ParentalRoomLampState.next(onoff),
          FirstRoomLampState: onoff=>this.FirstRoomLampState.next(onoff),
          SecondRoomLampState: onoff=>this.SecondRoomLampState.next(onoff),
          ToiletRoomLampState: onoff=>this.ToiletRoomLampState.next(onoff),
          LivingRoomLampState: onoff=>this.LivingRoomLampState.next(onoff),
          KitchenLampState: onoff=>this.KitchenLampState.next(onoff),
          Hallway1LampState: onoff=>this.Hallway1LampState.next(onoff),
          Hallway2LampState: onoff=>this.Hallway2LampState.next(onoff),
          OvenState:onoff=>this.OvenState.next(onoff),
          TvPlay: onoff=>this.TvPlay.next(onoff),
          TvVolume: vol=>this.TvVolume.next(vol),
          TvSource: source=>this.TvSource.next(source),
          openWindows: open => this.openWindows.next(open),

        }
      }));


      this.BathRoomLampState.subscribe(value =>this.BathRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.ParentalRoomLampState.subscribe(value =>this.ParentalRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.FirstRoomLampState.subscribe(value =>this.FirstRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.SecondRoomLampState.subscribe(value =>this.SecondRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.ToiletRoomLampState.subscribe(value =>this.ToiletRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.LivingRoomLampState.subscribe(value =>this.LivingRoomLamp=value?"/assets/lamp on.png":"/assets/lamp off.png"),
      this.KitchenLampState.subscribe(value =>
      {
        this.KitchenLamp = value ? "/assets/lamp on.png" : "/assets/lamp off.png";
        if(this.CoffeeMachineState.getValue()==='OFF' &&value)
          this.CoffeeMachineState.next('ON');
      }),
      this.Hallway1LampState.subscribe(value =>this.Hallway1Lamp=value?"/assets/lamp on.png":"/assets/lamp off.png")
      this.Hallway2LampState.subscribe(value =>this.Hallway2Lamp=value?"/assets/lamp on.png":"/assets/lamp off.png")

    this.itIsDay.subscribe(Day=>
      {
        if(Day) {
          this.imgDayNight = "/assets/day.png";
        }
        else {
          this.imgDayNight = "/assets/moon.svg";
        }
      })
      this.weather.subscribe( Weather=>
        {
          if(Weather==='claire')
            this.imgWeather='/assets/clean.gif';
          else if(Weather==='Nuageux')
            this.imgWeather='/assets/Cloud.gif';
          else if(Weather==='Pluie')
            this.imgWeather='/assets/rain.gif';
          else
            this.imgWeather='/assets/Storm.gif';
        }

      )
    this.CoffeeMachineState.subscribe(State=>{
      if(State==='OFF'){
        this.coffeemachine='/assets/machine a cafe off.png';
      }
      if(State==='ON'){
        this.coffeemachine='/assets/machine a cafe on.png';
        setTimeout(()=>this.CoffeeMachineState.next('PREPARING'),2000);
      }
      if(State==='PREPARING'){
        this.coffeemachine='/assets/preparation-cafe.gif';
        setTimeout(()=>this.CoffeeMachineState.next('READY'),6000);
      }
      if(State==='READY'){
        this.coffeemachine='/assets/cafe pret.gif';
        setTimeout(()=>this.CoffeeMachineState.next('OFF'),15000);
      }
      }

    );
    this.OvenState.subscribe( value => this.Oven=value?'/assets/four on.png':'/assets/four off.png' );

    }

  progV    = new ProgVersionner( this.initialRootProg    );
  subProgV = new ProgVersionner( this.initialSubProgUser );
  someOneInBathRoom!: Observable<boolean>;

  ngOnInit(): void {// Create observables related to display

    this.BathRoomPeoples =  this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'BathRoom') )
    );
    this.ParentalRoomPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'ParentalRoom') )
    );
    this.ParentalRoomBedPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'ParentalRoomBed') )
    );
    this.FirstRoomPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'FirstRoom') )
    );
    this.FirstRoomBedPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'FirstRoomBed') )
    );
    this.SecondRoomPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'SecondRoom') )
    );
    this.SecondRoomBedPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'SecondRoomBed') )
    );
    this.ToiletRoomPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'ToiletRoom') )
    );
    this.LivingRoomPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'LivingRoom') )
    );
    this.LivingRoomSofaPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'LivingRoomSofa') )
    );
    this.KitchenPeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'Kitchen') )
    );
    this.Hallway1Peoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'Hallway1') )
    );
    this.Hallway2Peoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'Hallway2') )
    );
    this.elsewhereHomePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === 'Outside') )
    );
    this.someOneInBathRoom = this.BathRoomPeoples.pipe( map(L => L.length > 0) );
    timer(0,1000).subscribe(()=> {
      this.DayTimeSubj.getValue().setSeconds(this.DayTimeSubj.getValue().getSeconds()+1);
      this.DayTimeSubj.next(  this.DayTimeSubj.getValue());
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
            {name: 'someOneInParentalRoomBed', type: 'boolean'} ,
            {name: 'someOneInFirstRoom', type: 'boolean'} ,
            {name: 'someOneInFirstRoomBed', type: 'boolean'} ,
            {name: 'someOneInSecondRoom', type: 'boolean'} ,
            {name: 'someOneInSecondRoomBed', type: 'boolean'} ,
            {name: 'someOneInToiletRoom', type: 'boolean'} ,
            {name: 'someOneInLivingRoom', type: 'boolean'} ,
            {name: 'someOneInLivingRoomSofa', type: 'boolean'} ,
            {name: 'someOneInKitchen', type: 'boolean'} ,
            {name: 'someOneInHallway1', type: 'boolean'} ,
            {name: 'someOneInHallway2', type: 'boolean'} ,
            {name: 'SwitchKitchen',type:'boolean'},
            {name:'weather',type:'string'},
            {name:'CoffeeMachineState',type:'string'},
            {name: 'outsideTempSubj', type: 'Number'},


          ],
          channels: [
            {name:'BathRoomLampState', type:'LAMPE'},
            {name:'ParentalRoomLampState', type:'LAMPE'},
            {name:'FirstRoomLampState', type:'LAMPE'},
            {name:'SecondRoomLampState', type:'LAMPE'},
            {name:'ToiletRoomLampState', type:'LAMPE'},
            {name:'LivingRoomLampState', type:'LAMPE'},
            {name:'KitchenLampState', type:'LAMPE'},
            {name:'Hallway1LampState', type:'LAMPE'},
            {name:'Hallway2LampState', type:'LAMPE'},
            {name: 'TvPlay', type: 'boolean'} ,
            {name: 'TvVolume', type: 'Number'} ,
            {name: 'TvSource', type: 'string'} ,
            {name: 'OvenState',type:'boolean'},
            {name: 'openWindows', type: 'boolean'},

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
        {channel:'Hallway1LampState', affectation: {value: 'false'}},
        {channel:'Hallway2LampState', affectation: {value: 'false'}},
        {channel:'OvenState', affectation: {value: 'false'}},
        {channel:'TvPlay', affectation: {value: 'false'}},
        {channel:'TvVolume', affectation: {value: '1'}},
        {channel:'TvSource', affectation: {value: '"assets/oceans.mp4"'}},
        {channel: 'openWindows', affectation: {value: 'false' }}


      ],
      subPrograms: {
        ProgUser: this.initialSubProgUser
      },
      allen: {
        During: [
          {
            as: 'User Prog',
            mapInputs: {
              BathRoomLampState:'BathRoomLampState',
              ParentalRoomLampState: 'ParentalRoomLampState',
              FirstRoomLampState:'FirstRoomLampState',
              SecondRoomLampState: 'SecondRoomLampState',
              ToiletRoomLampState:'ToiletRoomLampState',
              LivingRoomLampState:'LivingRoomLampState',
              KitchenLampState:'KitchenLampState',
              Hallway1LampState:'Hallway1LampState',
              Hallway2LampState:'Hallway2LampState',
              OvenState:'OvenState',
              TvPlay: 'TvPlay',
              TvVolume: 'TvVolume',
              TvSource: 'TvSource',
              openWindows:'openWindows',
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
            {name: 'someOneInParentalRoomBed', type: 'boolean'} ,
            {name: 'someOneInFirstRoom', type: 'boolean'} ,
            {name: 'someOneInFirstRoomBed', type: 'boolean'} ,
            {name: 'someOneInSecondRoom', type: 'boolean'} ,
            {name: 'someOneInSecondRoomBed', type: 'boolean'} ,
            {name: 'someOneInToiletRoom', type: 'boolean'} ,
            {name: 'someOneInLivingRoom', type: 'boolean'} ,
            {name: 'someOneInLivingRoomSofa', type: 'boolean'} ,
            {name: 'someOneInKitchen', type: 'boolean'} ,
            {name: 'someOneInHallway1', type: 'boolean'} ,
            {name: 'someOneInHallway2', type: 'boolean'} ,
            {name: 'SwitchKitchen',type:'boolean'},
            {name:'weather',type:'string'},
            {name:'CoffeeMachineState',type:'string'},
            {name: 'outsideTempSubj', type: 'Number'},
          ],
          channels: [
            {name:'BathRoomLampState', type:'LAMPE'},
            {name:'ParentalRoomLampState', type:'LAMPE'},
            {name:'FirstRoomLampState', type:'LAMPE'},
            {name:'SecondRoomLampState', type:'LAMPE'},
            {name:'ToiletRoomLampState', type:'LAMPE'},
            {name:'LivingRoomLampState', type:'LAMPE'},
            {name:'KitchenLampState', type:'LAMPE'},
            {name:'Hallway1LampState', type:'LAMPE'},
            {name:'Hallway2LampState', type:'LAMPE'},
            {name: 'TvPlay', type: 'boolean'} ,
            {name: 'TvVolume', type: 'Number'} ,
            {name: 'TvSource', type: 'string'} ,
            {name: 'OvenState',type:'boolean'},
            {name: 'openWindows', type: 'boolean'},

          ],

        }
      },actions: [{channel: 'openWindows', affectation: {value: 'true' }} ]
      ,
      subPrograms: {
        subProgUser: this.SubProgUser
      },
      allen: {
        During: [
          {
            contextName:'someOne In Kitchen',
            state:'someOneInKitchen',
            type: 'STATE',
            actions:[
              {channel:'OvenState', affectation: {value: 'true'}},
            ]

          },
          {
            contextName:'coffee ready',
            state:'CoffeeMachineState=="READY"',
            type: 'STATE',
            actions:[
              {channel:'Hallway1LampState', affectation: {value: 'true'}},
              {channel:'Hallway2LampState', affectation: {value: 'true'}},
              {channel:'KitchenLampState', affectation: {value: 'true'}},
              {channel:'ParentalRoomLampState', affectation: {value: 'true'}},
            ]

          },
          {
            contextName:'storm or rain',
            state:'weather=="Pluie" or weather=="Tempete"',
            type: 'STATE',
            actions:[
              {channel:'openWindows', affectation: {value: 'false'}},
            ]

          },
          {
            contextName:'switch kitchen ok',
            state:'SwitchKitchen',
            type: 'STATE',
            actions:[
              {channel:'KitchenLampState', affectation: {value: 'true'}},
            ]

          },
          {
            contextName:'its night',
            state:'not itIsDay',
            type: 'STATE',
            actions: [{channel: 'TvPlay', affectation: {value: 'true'}},
              {channel:'openWindows', affectation: {value: 'false'}},
              {channel: 'TvVolume', affectation: {value: '0.2'}},
              {channel: 'TvSource', affectation: {value: '"assets/movie.mp4"'}}],
            allen:{
              During: [


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
                  as: 'isinHallway1',
                  mapInputs: {

                    InRoom: 'someOneInHallway1',
                    lamp: 'Hallway1LampState'

                  },
                  programId: 'subProgUser',

                },
                {
                  as: 'isinHallway2',
                  mapInputs: {

                    InRoom: 'someOneInHallway2',
                    lamp: 'Hallway2LampState'

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
            type: 'STATE',
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
    const SP = P.getProgramInstance( 'User Prog' )!;
    this.subProgV.updateWith( SP.toHumanReadableProgram() );
  }
  changeDate(d:string){
    var tokens = d.split(':');
    this.DayTimeSubj.next(new Date(this.DayTimeSubj.getValue().setHours(Number(tokens[0]),Number(tokens[1]),tokens[2]?Number(tokens[2]):this.DayTimeSubj.getValue().getSeconds())));
  }
  changeSwitchVal(e: any, v: BehaviorSubject<any>){
    v.next(e);
  }
  changeWeatherVal(v: Weather){
    this.weather.next(v);
  }
}
