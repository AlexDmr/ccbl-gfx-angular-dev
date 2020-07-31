import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';

export const P1: HumanReadableProgram = {
  dependencies: {
    import: {
      channels: [
        {name: 'A', type: 'number'},
        {name: 'B', type: 'number'},
        {name: 'C', type: 'number'}
      ],
      emitters: [
        {name: 'E', type: 'number'}
      ]
    }
  },
  actions: [
    {channel: 'A', affectation: {value: '0'}},
    {channel: 'B', affectation: {value: '0'}},
    {channel: 'C', affectation: {value: '0'}},
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
        ],
        allen: {
          During: [
            {
              contextName: 'beta.1',
              id: 'beta.1',
              state: 'A + B > 2',
              actions: [
                {channel: 'C', affectation: {value: '2'}}
              ]
            }
          ]
        }
      },
      {
        contextName: 'gamma',
        id: 'gamma',
        state: 'E > 1',
        actions: [
          {channel: 'A', affectation: {value: '3'}}
        ]
      },
      {
        contextName: 'delta',
        id: 'delta',
        state: 'E > 0',
        actions: [
          {channel: 'A', affectation: {value: '1'}}
        ]
      }
    ]
  }
}
