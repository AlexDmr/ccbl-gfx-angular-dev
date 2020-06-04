import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, timer} from 'rxjs';
import { SceneLocation, People } from '../data/Scene';
import { DeviceLamp } from '../device-lamp/device-lamp.component';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/public-api';
import {Affectation, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
import { SceneService } from '../scene.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { DndDropEvent } from 'ngx-drag-drop';
import {Time} from "@angular/common";

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
  DayTimeSubj = new BehaviorSubject<Date>(new Date()); // Cette variable doit permettre de régler l'heure (pas de synchro automatique avec l'horloge système)
  itIsDay = this.DayTimeSubj.pipe(
    map( date =>  date.getHours() < 20 && date.getHours() > 6 ),
    distinctUntilChanged()
    // Normalement il y a un système de dislogue textuel et vocal intégré dans LiveShare, vous avez la dernière version ?

    // Venez voir ici : https://rxjs-dev.firebaseapp.com/guide/operators
    // En particulier l'opérateur : distinctUntilChanged
    // Ah d'accord c'est pratique ca evite de faire les test soit meme


    // https://rxjs-dev.firebaseapp.com/api/operators/distinctUntilChanged
  ); // Cette variable est dérivée de la précédente


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
      inputs: { // Angular -> CCBL XXX C'est ici qu'on peut passer en entrée des variables à CCBL
        Eve: sim.getPeopleObs('Eve'),
        tempOutside: this.outsideTempSubj,
        itIsDay: this.itIsDay,
        // XXX ah d'accord je comprend mieux le systeme maintenant
        // Ce système est provisoire, il faudra que je mette ça au propre...
      },
      outputs: { // CCBL -> Angular XXX Ici par contre c'est CCBL qui produit des valeurs et on les récupère
        Avatar: color => this.Avatar.next( {
          ...this.Avatar.getValue(),
          color
        } ),
        openWindows: open => this.openWindows.next(open),
        Heating: onOff => this.Heating.next(onOff),
        tempInside: t => this.insideTempSubj.next(t)
      }
    }));


    this.itIsDay.subscribe(Day=>
    {
      //this.openWindows.next(Day);
      if(Day)
        this.imgDayNight="/assets/day.png";
      else
        this.imgDayNight="/assets/night.png";


    })

    this.InsidePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === this.locHome) )
    );
    this.OutsidePeoples = this.sim.peoplesObs.pipe(
      map( peoples => peoples.filter( people => people.location === this.locOutside) )
    );

 }

  ngOnInit(): void {
    timer(0,1000).subscribe(()=> {
      this.DayTimeSubj.getValue().setSeconds(this.DayTimeSubj.getValue().getSeconds()+1)
      this.DayTimeSubj.next(  this.DayTimeSubj.getValue())
    });
  }

  private get initialSubProgUser(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          emitters: [
            {name: 'tempInside', type: 'number'},
            {name: 'tempOutside', type: 'number'},
            {name: 'itIsDay', type: 'boolean'} ,
            {name: 'Eve', type: 'People'} // C'est purement déclaratif

          ],
          channels: [
            {name: 'Heating'   , type: 'boolean'},
            {name: 'temp_min'  , type: 'number'},
            {name: 'temp_max'  , type: 'number'},
            {name: 'openWindows', type: 'boolean'},
            {name: 'Avatar', type: 'COLOR'},
          ]
        }
      },
      localChannels: [
        {name: 'EveAtHome'   , type: 'boolean'},
      ],
      actions: [
        {channel: 'EveAtHome'   , affectation: {value: `Eve.location == "Home"`}},
        {channel: 'Heating'    , affectation: {value: `false`  }},
        {channel: 'temp_min'    , affectation: {value: `15`  }},
        {channel: 'temp_max'    , affectation: {value: `18`  }},
        {channel: 'openWindows', affectation: {value: 'false' }} // XXX Ajout du pilotage des volets => On repasse sur Discord ?//daccord

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
          },{

            contextName: 'eve home !',
            state: 'EveAtHome',
            actions: [

            ],
            allen: {
              During: [

                {

                  contextName: 'jour levé !',
                  state: 'itIsDay',
                  actions: [
                    {channel: 'openWindows'    , affectation: {value: `true`  }},
                    {channel: 'temp_min'    , affectation: {value: `18`  }},
                    {channel: 'temp_max'    , affectation: {value: `22`  }},
                  ],
                },{

                  contextName: 'froid !',
                  state: 'tempOutside < 16',
                  actions: [
                    {channel: 'Avatar'    , affectation: {value: `"blue"`  }},
                  ]
                },
                {

                  contextName: 'bon !',
                  state: 'tempOutside > 15 & tempOutside<23',
                  actions: [
                    {channel: 'Avatar'    , affectation: {value: `"green"`  }},
                  ]
                },
                {

                  contextName: 'chaud !',
                  state: 'tempOutside > 22',
                  actions: [
                    {channel: 'Avatar'    , affectation: {value: `"red"`  }},
                  ]
                },
              ]

            }
          }
        ]
      }
    };
  }
//d'accord
  // OK faite ça après
  // Il reste juste un petit tour à faire côté CCBL pour ce soir je pense
  imgDayNight: String;

  private get initialRootProg(): HumanReadableProgram {
    return {
      dependencies: {
        import: {
          events: [],
          emitters: [
            {name: 'Eve', type: 'People'},
            {name: 'tempOutside', type: 'number' },
            {name: 'itIsDay', type: 'boolean'} // C'est purement déclaratif
                                              // Ca indique que le programme CCBL connaitra une variable ItIsDay
                                              // dont il ne pourra pas fixer la valeur, mais seulement la consulter
                                              // comme une variable en lecture seule
          ],
          channels: [                         // Ici par contre ce sont les variables que CCBL peut fixer et qui sont vues de l'extérieur
            {name: 'Avatar', type: 'COLOR'},
            {name: 'openWindows', type: 'boolean'},
            {name: 'Heating', type: 'boolean'},

            {name: 'tempInside' , type: 'number' },
          ]
        }
      },
      localChannels: [                      // Ici les variables locale, cachées de l'extérieur
        {name: 'deltaTime', type: 'number'},
        {name: 'deltaTemp', type: 'number'},
        {name: 'temp_min'  , type: 'number'},
        {name: 'temp_max'  , type: 'number'},
      ],
      actions: [
        {channel: 'openWindows', affectation: {value: 'true' }}, // XXX Ajout du pilotage des volets => On repasse sur Discord ?//daccord
        {channel: 'Heating'    , affectation: {value: `false`  }},      // d'accord je comprend
        {channel: 'Avatar'     , affectation: {value: `"black"`}},      // Oui normal ça n'est pas évident et pas standard, c'est un prototype de recherche
        {channel: 'tempInside' , affectation: {value: `20`}},           // Oui en fait le pilotage des volets doit être spécifié dans le sous programme
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

              openWindows: 'openWindows'
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
  changeDate(d:string){
    var tokens = d.split(':');
    this.DayTimeSubj.next(new Date(this.DayTimeSubj.getValue().setHours(Number(tokens[0]),Number(tokens[1]),Number(tokens[2]))));
  }
}
