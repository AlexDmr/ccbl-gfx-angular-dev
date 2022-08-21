import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, OperatorFunction, Subject, Subscription} from 'rxjs';
import { openHabEventRAW, toItemEvent } from './openHabEvent';
import { Item } from './openHabItem';

export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) => {
    return new Observable(observer => {
      const next = (value: T) => zone.run(() => observer.next(value));
      const error = (e: any) => zone.run(() => observer.error(e));
      const complete = () => zone.run(() => observer.complete());
      return source.subscribe({next, error, complete});
    });
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenhabService {
  // private bsItems = new BehaviorSubject<Item[]>( [] );
  private bsUpdatedItem = new Subject<Item>();

  readonly mapObsItem = new Map<string, {value: Item, obs: Observable<Item>, next: (item: Item) => void} >();
  readonly bsItems = new BehaviorSubject<Item[]>([]);
  readonly obsItems: Observable<Item[]> = this.bsItems.asObservable();
  readonly obsUpdatedItem: Observable<Item>;
  private subscriptionItems?: Subscription;

  private url = "http://localhost:8080";
  private token = "oh.ccbl.RZA8Kuukq8Axfs2fcRckLqUyNY0olsX4WvbPkleMJtE9xiOgsY7VuXc4IYhS8G1M4vlLHSqPnBOgIKz5hPGg";
  private sse?: EventSource;

  constructor(private zone: NgZone) {
    // this.obsItems       = this.bsItems      .pipe( runInZone(zone) );
    this.obsUpdatedItem = this.bsUpdatedItem.pipe( runInZone(zone) )
  }

  getObsItem(id: string): Observable<Item> | undefined {
    return this.mapObsItem.get(id)?.obs;
  }

  async initConnection(url: string, token?: string): Promise<void> {
    console.log( "Connecting openHab at", url);
    this.url = url;
    this.token = token ?? this.token;

    // Get items
    const allItems: Item[] = JSON.parse( await (await fetch(`${this.url}/rest/items`)).text() );
    this.mapObsItem.clear();
    for (const item of allItems) {
      const bs = new BehaviorSubject<Item>(item);
      this.mapObsItem.set( item.name, {
        obs: bs.asObservable(),
        next: item => bs.next(item),
        get value() {return bs.value}
      } )
    }
    const L: Observable<Item>[] = [...this.mapObsItem.values()].map( ({obs}) => obs );
    this.zone.run( () => {
      this.subscriptionItems?.unsubscribe();
      this.subscriptionItems = combineLatest( L ).subscribe( this.bsItems );
    });

    // Establish SSE connection
    this.sse?.close();
    this.sse = new EventSource( `${this.url}/rest/events` );
    this.sse.onerror = err => {console.error("SSE:", err)}
    this.sse.onopen  = evt => console.log("SSE onopen", evt)
    this.sse.onmessage = evt => {
      // console.log(evt);
      this.evtMessageHandeling( JSON.parse(evt.data) );
    }

  }

  async setItem(id: string, state: string): Promise<void> {
    console.log("setting", id, "to", state);
    await fetch(`${this.url}/rest/items/${id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    // Authorization: `Bearer ${this.token}`
                },
                body: state
            }
        );
  }

  private evtMessageHandeling(msg: openHabEventRAW) {
    /*console.log("msg", typeof msg, ":", msg);
    console.log("  - topic", msg.topic);
    console.log("  - payload", typeof msg.payload, msg.payload);
    console.log("  - type", msg.type);*/
    const evt = toItemEvent(msg);
    // console.log(evt);
    if (evt) {
      switch (evt.type) {
        case 'ItemCommandEvent':
        case 'ItemStateEvent':
        case 'ItemStateChangedEvent':
        case 'GroupItemStateChangedEvent':
          // const items = this.bsItems.value;
          let newItem: Item | undefined;
          let localItemData = this.mapObsItem.get( evt.id );
          if (localItemData) {
            const newItem = {
              ...localItemData.value,
              state: evt.payload.value
            };
            localItemData.next( newItem );
            this.bsUpdatedItem.next(newItem);
          }
          break;
        case "ItemStatePredictedEvent":
        case "predictedValue": // "ItemStatePredictedEvent"
          // On en fait quoi ?
          break;
        default:
          console.error("Unknown openHab event", evt);
      }
    }
  }
}
