const {test} = require('tap');
const compress = require('../../src/serialization/tw-compress-sb3');

test('handles type INPUT_DIFF_BLOCK_SHADOW (3) compressed inputs', t => {
    const data = {
        targets: [
            {
                isStage: true,
                name: 'Stage',
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {
                    'CmRa^i]o}QL77;hk:54o': {
                        opcode: 'looks_switchbackdropto',
                        next: null,
                        parent: null,
                        inputs: {
                            BACKDROP: [
                                3,
                                'cq84G6uywD{m2R,E03Ci',
                                'E3/*4H*xk38{=*U;bVWm'
                            ]
                        },
                        fields: {},
                        shadow: false,
                        topLevel: true,
                        x: 409,
                        y: 300
                    },
                    'cq84G6uywD{m2R,E03Ci': {
                        opcode: 'operator_not',
                        next: null,
                        parent: 'CmRa^i]o}QL77;hk:54o',
                        inputs: {},
                        fields: {},
                        shadow: false,
                        topLevel: false
                    },
                    'E3/*4H*xk38{=*U;bVWm': {
                        opcode: 'looks_backdrops',
                        next: null,
                        parent: 'CmRa^i]o}QL77;hk:54o',
                        inputs: {},
                        fields: {
                            BACKDROP: [
                                'backdrop1',
                                null
                            ]
                        },
                        shadow: true,
                        topLevel: false
                    }
                },
                comments: {},
                currentCostume: 0,
                costumes: [],
                sounds: [],
                volume: 100,
                layerOrder: 0,
                tempo: 60,
                videoTransparency: 50,
                videoState: 'on',
                textToSpeechLanguage: null
            }
        ],
        monitors: [],
        extensions: [],
        meta: {
            semver: '3.0.0',
            vm: '0.2.0',
            agent: ''
        }
    };
    compress(data);

    const blocks = Object.entries(data.targets[0].blocks);
    t.equal(blocks.length, 3);

    const [parentId, parentBlock] = blocks.find(i => i[1].opcode === 'looks_switchbackdropto');
    const [inputId, inputBlock] = blocks.find(i => i[1].opcode === 'operator_not');
    const [shadowId, shadowBlock] = blocks.find(i => i[1].opcode === 'looks_backdrops');

    t.equal(parentBlock.inputs.BACKDROP.length, 3);
    t.equal(parentBlock.inputs.BACKDROP[0], 3);
    t.equal(parentBlock.inputs.BACKDROP[1], inputId);
    t.equal(parentBlock.inputs.BACKDROP[2], shadowId);

    t.equal(inputBlock.parent, parentId);
    t.equal(shadowBlock.parent, parentId);

    t.end();
});

test('all IDs unique', t => {
    const soup = 'abcdefghjijklmnopqstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    for (const [
        variableSoup,
        listSoup,
        broadcastSoup
    ] of [
        [soup, '', ''],
        ['', soup, ''],
        ['', '', soup],
    ]) {
        const data = {
            targets: [
                {
                    isStage: true,
                    name: 'Stage',
                    variables: Object.fromEntries(
                        variableSoup.split('').map((id) => [id, [id, 0]])
                    ),
                    lists: Object.fromEntries(
                        listSoup.split('').map((id) => [id, [id, []]])
                    ),
                    broadcasts: Object.fromEntries(
                        broadcastSoup.split('').map((id) => [id, id])
                    ),
                    blocks: {
                        'CmRa^i]o}QL77;hk:54o': {
                            opcode: 'looks_switchbackdropto',
                            next: null,
                            parent: null,
                            inputs: {
                                BACKDROP: [
                                    3,
                                    'cq84G6uywD{m2R,E03Ci',
                                    'E3/*4H*xk38{=*U;bVWm'
                                ]
                            },
                            fields: {},
                            shadow: false,
                            topLevel: true,
                            x: 409,
                            y: 300
                        },
                        'cq84G6uywD{m2R,E03Ci': {
                            opcode: 'operator_not',
                            next: null,
                            parent: 'CmRa^i]o}QL77;hk:54o',
                            inputs: {},
                            fields: {},
                            shadow: false,
                            topLevel: false
                        },
                        'E3/*4H*xk38{=*U;bVWm': {
                            opcode: 'looks_backdrops',
                            next: null,
                            parent: 'CmRa^i]o}QL77;hk:54o',
                            inputs: {},
                            fields: {
                                BACKDROP: [
                                    'backdrop1',
                                    null
                                ]
                            },
                            shadow: true,
                            topLevel: false
                        }
                    },
                    comments: {},
                    currentCostume: 0,
                    costumes: [],
                    sounds: [],
                    volume: 100,
                    layerOrder: 0,
                    tempo: 60,
                    videoTransparency: 50,
                    videoState: 'on',
                    textToSpeechLanguage: null
                }
            ],
            monitors: [],
            extensions: [],
            meta: {
                semver: '3.0.0',
                vm: '0.2.0',
                agent: ''
            }
        };
        compress(data);

        const variables = Object.keys(data.targets[0].variables);
        const lists = Object.keys(data.targets[0].lists);
        const broadcasts = Object.keys(data.targets[0].broadcasts);
        const blocks = Object.keys(data.targets[0].blocks);
        const all = [...variables, ...lists, ...broadcasts, ...blocks];
        t.equal(new Set(all).size, all.length);
    }

    t.end();
});
