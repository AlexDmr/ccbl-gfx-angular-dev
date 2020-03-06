import {HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';

export const pgChildBob: HumanReadableProgram = {

};

export const pgChildBobette = {

};

export const pgChildParent = {

};

export const allInOne: HumanReadableProgram = {
  dependencies: {
    import: {
      emitters: [
        {name: 'Ein', type: 'number'},
      ],
      channels: [
        {name: 'Cin', type: 'number'},
      ],
      events: [
        {name: 'EVTin', type: 'number'}
      ]
    },
    export: {
      emitters: [
        {name: 'Eout', type: 'string'}
      ],
      channels: [
        {name: 'Cout', type: 'string'}
      ],
      events: [
        {name: 'EVTout', type: 'string'}
      ]
    }
  },
  localChannels: [
    {name: 'C', type: 'number'}
  ],
  actions: [
    {channel: 'C', affectation: {value: `0`}},
    {channel: 'Eout', affectation: {value: `0`}},
    {channel: 'Cout', affectation: {value: `0`}},
  ],
  allen: {
  }
};
