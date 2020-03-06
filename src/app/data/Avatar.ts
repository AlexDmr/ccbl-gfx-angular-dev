import {HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';

export const AvatarProgram: HumanReadableProgram = {
  dependencies: {
    import: {
      channels: [
        {name: 'lampAvatar', type: 'color'}
      ],
      emitters: [
        {name: 'MartinAtHome', type: 'boolean'},
        {name: 'AliceAtHome', type: 'boolean'},
        {name: 'AliceAtMartinHome', type: 'boolean'},
        {name: 'AliceAvailable', type: 'boolean'},
      ]
    }
  },
  localChannels: [
  ],
  actions: [
    {channel: 'lampAvatar', affectation: {value: `"off"`}}
  ],
  allen: {
    During: [
      {
        contextName: 'MartinAtHome',
        state: 'MartinAtHome',
        allen: {
          During: [
            {
              contextName: 'AliceAtHome',
              state: 'AliceAtHome',
              actions: [
                {channel: 'lampAvatar', affectation: {value: `"orange"`}}
              ],
              allen: {
                During: [
                  {
                    contextName: 'AliceAvailable',
                    state: 'AliceAvailable',
                    actions: [
                      {channel: 'lampAvatar', affectation: {value: `"green"`}}
                    ]
                  }
                ]
              }
            },
            {
              contextName: 'AliceAtMartinHome',
              state: 'AliceAtMartinHome',
              actions: [
                {channel: 'lampAvatar', affectation: {value: `"white"`}}
              ]
            }
          ]
        }
      }
    ]
  }
};
