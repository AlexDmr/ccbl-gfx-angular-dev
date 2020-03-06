import {HumanReadableEventContext, HumanReadableProgram, HumanReadableStateContext} from 'ccbl-js/lib/ProgramObjectInterface';

export const pgLightInRoom: HumanReadableProgram = {
  dependencies: {
    import: {
      events: [
        {name: 'switch', type: 'boolean'}
      ],
      emitters: [
        {name: 'someoneIsPresent', type: 'boolean'},
        {name: 'night', type: 'boolean'},
        {name: 'intensityDuringNight', type: 'INTENSITY'}
      ],
      channels: [
        {name: 'lamp', type: 'INTENSITY'}
      ]
    }
  },
  localChannels: [
    {name: 'intensity', type: 'INTENSITY'}
  ],
  actions: [
    {channel: 'lamp', affectation: {value: `"off"`}},
    {channel: 'intensity', affectation: {value: `"high"`}}
  ],
  allen: {
    During: [
      {
        contextName: 'this is night',
        state: 'night',
        actions: [
          {channel: 'intensity', affectation: {value: 'intensityDuringNight'}}
        ]
      } as HumanReadableStateContext,
      {
        contextName: 'Someone is present',
        state: 'someoneIsPresent',
        actions: [
          {channel: 'lamp', affectation: {value: 'intensity'}}
        ],
        allen: {
          During: [
            {
              contextName: 'lamp is lighted on',
              state: `lamp != "off"`,
              allen: {
                During: [
                  {
                    contextName: 'Switch is triggered',
                    eventSource: 'switch',
                    actions: [
                      {channel: 'lamp', affectation: `"off"`}
                    ]
                  } as HumanReadableEventContext
                ]
              }
            } as HumanReadableStateContext,
            {
              contextName: 'lamp is lighted on',
              state: `lamp == "off"`,
              allen: {
                During: [
                  {
                    contextName: 'Switch is triggered',
                    eventSource: 'switch',
                    actions: [
                      {channel: 'lamp', affectation: `intensity`}
                    ]
                  } as HumanReadableEventContext
                ]
              }
            } as HumanReadableStateContext
          ]
        }
      } as HumanReadableStateContext
    ]
  }
};
