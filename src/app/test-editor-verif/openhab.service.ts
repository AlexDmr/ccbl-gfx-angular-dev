import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable, OperatorFunction, Subject} from 'rxjs';
import { openHabEventRAW, toItemEvent } from './openHabEvent';
import { Item } from './openHabItem';

export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) => {
    return new Observable(observer => {
      const onNext = (value: T) => zone.run(() => observer.next(value));
      const onError = (e: any) => zone.run(() => observer.error(e));
      const onComplete = () => zone.run(() => observer.complete());
      return source.subscribe(onNext, onError, onComplete);
    });
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenhabService {
  private bsItems = new BehaviorSubject<Item[]>( [] );
  private bsUpdatedItem = new Subject<Item>();

  readonly obsItems: Observable<Item[]>;
  readonly obsUpdatedItem: Observable<Item>;

  private url = "http://localhost:8080";
  private token = "oh.ccbl.RZA8Kuukq8Axfs2fcRckLqUyNY0olsX4WvbPkleMJtE9xiOgsY7VuXc4IYhS8G1M4vlLHSqPnBOgIKz5hPGg";
  private sse?: EventSource;

  constructor(private zone: NgZone) {
    this.obsItems       = this.bsItems      .pipe( runInZone(zone) );
    this.obsUpdatedItem = this.bsUpdatedItem.pipe( runInZone(zone) )
  }

  async initConnection(url: string, token?: string): Promise<void> {
    console.log( "Connecting openHab at", url);
    this.url = url;
    this.token = token ?? this.token;

    // Get items
    const MyItems: Item[] = JSON.parse( await (await fetch(`${this.url}/rest/items`)).text() );
    this.bsItems.next(MyItems);

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
          const items = this.bsItems.value;
          let newItem: Item | undefined;
          this.bsItems.next(
            items.map(item => item.name !== evt.id ? item : newItem = {
              ...item,
              state: evt.payload.value
            })
          );
          if (newItem) {
            this.bsUpdatedItem.next(newItem);
          }
          break;
        default:
          console.error("Unknown openHab event", evt);
      }
    }
  }
}
