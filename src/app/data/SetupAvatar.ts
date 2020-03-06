import {AvatarProgram} from './Avatar';
import {Setup} from './setup';

export const setupAvatar: Setup<string, boolean> = {
  initialRootProgram: AvatarProgram,
  sensors: [
    { name: 'MartinAtHome',
      type: 'boolean',
      label: `Martin is at home`,
      userCanControl: true,
      varType: 'emitter'
    },
    { name: 'AliceAtHome',
      type: 'boolean',
      label: `Alice is at home`,
      userCanControl: true,
      varType: 'emitter'
    },
    { name: 'AliceAtMartinHome',
      type: 'boolean',
      label: `Alice is at Martin's home`,
      userCanControl: true,
      varType: 'emitter'
    },
    { name: `AliceAvailable`,
      type: `boolean`,
      label: `Alice's availability`,
      userCanControl: true,
      varType: 'emitter'
    },
    { name: `lampAvatar`,
      type: `color`,
      label: `Avatar lamp`,
      userCanControl: false,
      varType: 'channel'
    }
  ],
  goal: `Exercice 4 from EICS 2017 paper`,
  trace: {
    label: 'test1',
    events: [
        // Init
        {timestamp: '2019-05-23T19:32:00', sensorId: 'MartinAtHome', sensorValue: true},
        {timestamp: '2019-05-23T19:32:00', sensorId: 'AliceAtHome', sensorValue: false},
        {timestamp: '2019-05-23T19:32:00', sensorId: 'AliceAMartinHome', sensorValue: false},
        {timestamp: '2019-05-23T19:32:00', sensorId: 'AliceAvailable', sensorValue: false},
        // Alice arrive chez elle
        {timestamp: '2019-05-23T22:12:00', sensorId: 'AliceAtHome', sensorValue: true},
        // Dispo à 7h d matin puis part au travail
        {timestamp: '2019-05-24T07:00:00', sensorId: 'AliceAvailable', sensorValue: true},
        {timestamp: '2019-05-24T08:10:00', sensorId: 'AliceAtHome', sensorValue: false},
        {timestamp: '2019-05-24T08:10:00', sensorId: 'AliceAvailable', sensorValue: false},
        // Juste un autre jour, Alice dispo, elle rentre chez elle et repart le lendemain
        {timestamp: '2019-05-24T18:10:00', sensorId: 'AliceAvailable', sensorValue: true},
        {timestamp: '2019-05-24T20:30:00', sensorId: 'AliceAtHome', sensorValue: true},
        {timestamp: '2019-05-26T08:10:00', sensorId: 'AliceAtHome', sensorValue: false},
        {timestamp: '2019-05-26T08:10:00', sensorId: 'AliceAvailable', sensorValue: false},
        // Rentre chez elle, dispo, part au travail
        {timestamp: '2019-05-25T17:42:00', sensorId: 'AliceAtHome', sensorValue: true},
        {timestamp: '2019-05-25T18:30:00', sensorId: 'AliceAvailable', sensorValue: true},
        {timestamp: '2019-05-26T08:10:00', sensorId: 'AliceAtHome', sensorValue: false},
        {timestamp: '2019-05-26T08:10:00', sensorId: 'AliceAvailable', sensorValue: false},
        // Fin
        {timestamp: '2019-05-27T12:00:00', sensorId: 'MartinAtHome', sensorValue: true},
        {timestamp: '2019-05-27T12:00:00', sensorId: 'AliceAtHome', sensorValue: true},
        {timestamp: '2019-05-27T12:00:00', sensorId: 'AliceAMartinHome', sensorValue: false},
        {timestamp: '2019-05-27T12:00:00', sensorId: 'AliceAvailable', sensorValue: true},

      ]
  }
};
/*
2019-05-26T16:19:00;PresenceMarc;1;   // Arrive chez Marc
2019-05-26T20:15:00;PresenceMarc;0;   // Repart
2019-05-26T20:40:00;PresenceAlice;1;  // Arrive chez elle

2019-05-27T07:00:00;Available;1;      // Dispo à 7h
2019-05-27T08:07:00;Available;0;      // Plus dispo à 8h07 (douche)
2019-05-27T10:00:00;Available;1;      // Dispo à 10h
*/
