import { ScratchTheme } from '../css/scratch';
import { ThemePrototype } from '../lib/theme';

const UPDATE = 'scratch-gui/theme/UPDATE';
const RESET_DEFAULT = 'scratch-gui/theme/RESET_DEFAULT';

const initialState = Object.assign(
    {},
    ScratchTheme,
    JSON.parse(localStorage.getItem('theme') as string)
);

const reducer = function (state: Partial<ThemePrototype>, action: any) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case UPDATE:
        localStorage.setItem('theme', JSON.stringify(action.value));
        return Object.assign({}, ScratchTheme, action.value);
    case RESET_DEFAULT:
        localStorage.setItem('theme', JSON.stringify(ScratchTheme));
        return Object.assign({}, ScratchTheme);
    default:
        return state;
    }
};

const updateTheme = (value: Partial<ThemePrototype>) => ({
    type: UPDATE,
    value
});

const resetThemeToDefault = () => ({
    type: RESET_DEFAULT
});

export {
    reducer as default,
    initialState as settingsInitialState,
    updateTheme,
    resetThemeToDefault
};
