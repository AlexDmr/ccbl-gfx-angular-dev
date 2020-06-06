import { Component, OnInit } from '@angular/core';
import {DndDropEvent} from "ngx-drag-drop";
import {People, SceneLocation} from "../data/Scene";
import {SceneService} from "../scene.service";
import {BehaviorSubject, Observable} from "rxjs";

export type PossibleLocations = 'Home' | 'elsewhere'|'BathRoom'|
  'Outside'|'ParentalRoom'|'FirstRoom'|'SecondRoom'|'ToiletRoom'|'LivingRoom'|'Kitchen'|'Hallway';

@Component({
  selector: 'app-scene-house',
  templateUrl: './scene-house.component.html',
  styleUrls: ['./scene-house.component.scss']
})
export class SceneHomeComponent implements OnInit {
  houseURL       = '/assets/home-detail.png';
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


    constructor(private sim: SceneService) { }

  ngOnInit(): void {
  }
  drop(evt: DndDropEvent, location: PossibleLocations) {
    const people: People<any> = evt.data;
    this.sim.updatePeople(people.name, {location});
  }
}
