import {HumanReadableProgram, HumanReadableStateContext} from 'ccbl-js/lib/ProgramObjectInterface';

export const Domicube: HumanReadableProgram = {
  dependencies: {
    import: {
      emitters: [
        {name: 'gyro', type: '{alpha, beta, gamma}'},
        {name: 'acc', type: '{x, y, z}'}
      ],
      channels: [
        {name: 'lampAvatar', type: 'COLOR'},
      ],
      events: [
        {name: 'btToggleAvatarOnOff', type: 'string'}
      ]
    },
    export: {
      emitters: [
        {name: 'face', type: 'CubeFace'},
        {name: 'rotation', type: 'ClockWiseOrNot'},
        {name: 'movingFast', type: 'boolean'},
        {name: 'falling', type: 'boolean'}
      ],
      events: [
        {name: 'taptap', type: 'string'}
      ]
    }
  },
  localChannels: [
    {name: 'G', type: 'number'},
    {name: 'gyroThreshold', type: 'number'},
    {name: 'R', type: 'number'},
    {name: 'accNorm', type: 'number'}
  ],
  actions: [
    {channel: 'G', affectation: {value: `9.81`}},
    {channel: 'gyroThreshold', affectation: {value: `0`}},
    {channel: 'R', affectation: {value: `0`}},
    {channel: 'rotation', affectation: {value: `"none"`}},
    {channel: 'movingFast', affectation: {value: `true`}},
    {channel: 'face', affectation: {value: `"unknown"`}},
    {channel: 'falling', affectation: {value: `false`}},
    {channel: 'accNorm', affectation: {value: `sqrt(acc.x^2 + acc.y^2 + acc.z^2)`}}
  ],
  allen: {
    During: [{
      contextName: 'falling',
      state: 'abs(accNorm) < 0.05 * G',
      actions: [{channel: 'falling', affectation: {value: 'true'}}]
    } as HumanReadableStateContext, {
      contextName: 'immobile',
      state: 'abs(accNorm - G) < 0.1*G ',
      actions: [{channel: 'movingFast', affectation: {value: 'false'}}],
      allen: {
        During: [{
          contextName: 'Face_1',
          state: 'acc.x > 0 and abs(acc.x - G) < 0.1*G',
          actions: [ {channel: 'face', affectation: {value: '1'}}
            , {channel: 'R', affectation: {value: 'gyro.alpha'}} ]
        }, {
          contextName: 'Face_6',
          state: 'acc.x < 0 and abs(G - acc.x) < 0.1*G',
          actions: [ {channel: 'face', affectation: {value: '6'}}
            , {channel: 'R', affectation: {value: '-gyro.alpha'}} ]
        }, {
          contextName: 'Face_2',
          state: 'acc.y > 0 and abs(acc.y - G) < 0.1*G',
          actions: [ {channel: 'face', affectation: {value: '2'}}
            , {channel: 'R', affectation: {value: 'gyro.beta'}} ]
        }, {
          contextName: 'Face_5',
          state: 'acc.y < 0 and abs(G - acc.y) < 0.1*G',
          actions: [ {channel: 'face', affectation: {value: '5'}}
            , {channel: 'R', affectation: {value: '-gyro.beta'}} ]
        }, {
          contextName: 'Face_3',
          state: 'acc.z > 0 and abs(acc.z - G) < 0.1*G',
          actions: [ {channel: 'face', affectation: {value: '3'}}
            , {channel: 'R', affectation: {value: 'gyro.gamma'}} ]
        }, {
          contextName: 'Face_4',
          state: 'acc.z < 0 and abs(G - acc.z) < 0.1*G',
          actions: [ {channel: 'face', affectation: {value: '4'}}
            , {channel: 'R', affectation: {value: '-gyro.gamma'}} ]
        }]
      }
    } as HumanReadableStateContext, {
      contextName: 'turningClockWise',
      state: 'R > gyroThreshold',
      actions: [
        {channel: 'rotation', affectation: {value: `"clockwise"`}}
      ]
    } as HumanReadableStateContext, {
      contextName: 'turningAntiClockWise',
      state: '-R > gyroThreshold',
      actions: [
        {channel: 'rotation', affectation: {value: `"anticlockwise"`}}
      ]
    } as HumanReadableStateContext]
  }
};
