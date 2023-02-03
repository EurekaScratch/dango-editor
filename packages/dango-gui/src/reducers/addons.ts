const UPDATE = 'scratch-gui/addons/UPDATE';

const initialState = false;

const reducer = function (state: boolean, action: any) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case UPDATE:
        return action.value;
    default:
        return state;
    }
};

const updateAddonStatus = (value: boolean) => ({
    type: UPDATE,
    value
});

export {
    reducer as default,
    initialState as addonsInitialState,
    updateAddonStatus
};
