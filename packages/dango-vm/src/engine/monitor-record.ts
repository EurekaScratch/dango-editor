import immutable from 'immutable';
const {Record} = immutable;
const MonitorRecord = Record({
    id: null,
    /** Present only if the monitor is sprite-specific, such as x position */
    spriteName: null,
    /** Present only if the monitor is sprite-specific, such as x position */
    targetId: null,
    opcode: null,
    value: null,
    params: null,
    mode: 'default',
    sliderMin: 0,
    sliderMax: 100,
    isDiscrete: true,
    x: null,
    y: null,
    width: 0,
    height: 0,
    visible: true
});
export default MonitorRecord;
