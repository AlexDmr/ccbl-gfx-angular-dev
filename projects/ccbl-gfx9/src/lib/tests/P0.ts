import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';

export const P0: HumanReadableProgram = {
  dependencies: {
    import: {
      emitters: [
        {name: 'E', type: 'number'}
      ]
    }
  },
  localChannels: [
    {name: 'A', type: 'number'},
    {name: 'B', type: 'number'}
  ],
  actions: [
    {channel: 'A', affectation: {value: '0'}},
    {channel: 'B', affectation: {value: '0'}},
  ],
  allen: {
    During: [
      {
        contextName: 'alpha',
        id: 'alpha',
        state: 'A > 0',
        actions: [
          {channel: 'B', affectation: {value: '1'}}
        ]
      },
      {
        contextName: 'beta',
        id: 'beta',
        state: 'B > 0',
        actions: [
          {channel: 'A', affectation: {value: '1'}}
        ]
      },
      {
        contextName: 'gamma',
        id: 'gamma',
        state: 'E > 0',
        actions: [
          {channel: 'A', affectation: {value: '2'}}
        ]
      }
    ]
  }
}
