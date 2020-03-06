import {HumanReadableProgram, HumanReadableStateContext} from 'ccbl-js/lib/ProgramObjectInterface';

export const pgMusicTel: HumanReadableProgram = {
  dependencies: {
    import: {
      emitters: [
        {name: 'atHome', type: 'boolean'},
        {name: 'speakingAtPhone', type: 'boolean'}
      ],
      channels: [
        {name: 'music', type: 'MUSIC'}
      ]
    }
  },
  actions: [
    {channel: 'music', affectation: {value: `"off"`}}
  ],
  allen: {
    During: [
      {
        contextName: 'Someone is at home',
        state: 'atHome',
        actions: [
          {channel: 'music', affectation: {value: `"normal"`}}
        ],
        allen: {
          StartWith: [
            {
              contextName: 'Someone just entered while speaking at phone',
              state: 'speakingAtPhone',
              actions: [
                {channel: 'music', affectation: {value: `"off"`}}
              ]
            } as HumanReadableStateContext
          ],
          During: [
            {
              contextName: 'Someone is speaking at phone',
              state: 'speakingAtPhone',
              actions: [
                {channel: 'music', affectation: {value: `"low"`}}
              ]
            } as HumanReadableStateContext
          ]
        }
      }  as HumanReadableStateContext
    ]
  }
};
