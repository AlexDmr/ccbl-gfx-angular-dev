export type openHabItemEventType    = 'ItemCommandEvent'
                                    | 'ItemStateEvent'
                                    | 'ItemStateChangedEvent'
                                    | 'ItemAddedEvent'
                                    | 'ItemRemovedEvent'
                                    | 'ItemUpdatedEvent'
                                    | 'GroupItemStateChangedEvent'
                                    | 'ItemStatePredictedEvent';

export interface eventPayload {
    type : string;
    value : string;
    oldType : string;
    oldValue : string;
}

export interface openHabEventRAW {
    topic : string;
    payload : string;
    type : openHabItemEventType;
}

export interface PayloadCSS {
    type: 'Percent' | 'OnOff' | 'Number' | 'String';
    value: string,
}

export type openHabItemEvent = {
    id: string;
    topic: string;
} & ( { type: 'ItemStatePredictedEvent' | 'predictedValue' | 'ItemCommandEvent' | 'ItemStateEvent' | 'ItemStateChangedEvent' | 'GroupItemStateChangedEvent';
        payload: PayloadCSS
      }
);

const reItem = new RegExp("^openhab/items/(.*)/.*$"); // .compile();
export function toItemEvent({topic, payload, type}: openHabEventRAW): openHabItemEvent | undefined {
    const L = reItem.exec(topic);
    if (L) {
        // console.log("L:", L);
        let [, id] = L;
        id = id.split("/")[0];
        let PAYLOAD;
        try {
            PAYLOAD = JSON.parse(payload);
        } catch (err) {
            console.error(payload, ":", err);
            PAYLOAD = {}
        }
        switch (type) {

            case 'ItemStateEvent':
            case 'ItemStateChangedEvent':
            case "GroupItemStateChangedEvent":
                return {id: id!, topic, type, payload: PAYLOAD};
            case 'ItemUpdatedEvent':
                /* Color -> Switch
                msg {"topic":"openhab/items/LampeRGB/updated","payload":"[{\"type\":\"Switch\",\"name\":\"LampeRGB\",\"label\":\"LampeRGB\",\"category\":\"\",\"tags\":[],\"groupNames\":[]},{\"type\":\"Color\",\"name\":\"LampeRGB\",\"label\":\"LampeRGB\",\"category\":\"\",\"tags\":[],\"groupNames\":[]}]","type":"ItemUpdatedEvent"}
                */
            break;
            case 'ItemAddedEvent':
                // msg {"topic":"openhab/items/S/added","payload":"{\"type\":\"String\",\"name\":\"S\",\"label\":\"S\",\"category\":\"\",\"tags\":[],\"groupNames\":[]}","type":"ItemAddedEvent"}
            break;
            case 'ItemRemovedEvent':
                // msg {"topic":"openhab/items/S/removed","payload":"{\"type\":\"String\",\"name\":\"S\",\"label\":\"S\",\"category\":\"\",\"tags\":[],\"groupNames\":[]}","type":"ItemRemovedEvent"}
            break;
            case 'ItemCommandEvent':
              // On laisse couler...
            break;
            case "ItemStatePredictedEvent":
              // On laisse couler...
              break;
            default:
                console.error('Unknown event type', {topic, payload, type});
        }
        // const
    }
    return undefined;
}
