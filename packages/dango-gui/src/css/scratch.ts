import { ThemePrototype, applyTheme } from '../lib/theme';

export const ScratchTheme: ThemePrototype = {
    // Color
    uiPrimary: 'hsla(215, 100%, 95%, 1)', /* #E5F0FF */
    uiSecondary: 'hsla(215, 75%, 95%, 1)', /* #E9F1FC */
    uiTertiary: 'hsla(215, 50%, 90%, 1)', /* #D9E3F2 */

    uiModalOverlay: 'hsla(215, 100%, 65%, 0.9)', /* 90% transparent version of motion-primary */

    uiWhite: 'hsla(0, 100%, 100%, 1)', /* #FFFFFF */
    uiWhiteDim: 'hsla(0, 100%, 100%, 0.75)', /* 25% transparent version of ui-white */
    uiWhiteTransparent: 'hsla(0, 100%, 100%, 0.25)', /* 25% transparent version of ui-white */
    uiTransparent: 'hsla(0, 100%, 100%, 0)', /* 25% transparent version of ui-white */

    uiBlackTransparent: 'hsla(0, 0%, 0%, 0.15)', /* 15% transparent version of black */

    textPrimary: 'hsla(225, 15%, 40%, 1)', /* #575E75 */
    textPrimaryTransparent: 'hsla(225, 15%, 40%, 0.75)',

    motionPrimary: 'hsla(215, 100%, 65%, 1)', /* #4C97FF */
    motionTertiary: 'hsla(215, 60%, 50%, 1)', /* #3373CC */
    motionTransparent: 'hsla(215, 100%, 65%, 0.35)', /* 35% transparent version of motion-primary */
    motionLightTransparent: 'hsla(215, 100%, 65%, 0.15)', /* 15% transparent version of motion-primary */

    redPrimary: 'hsla(20, 100%, 55%, 1)', /* #FF661A */
    redTertiary: 'hsla(20, 100%, 45%, 1)', /* #E64D00 */

    soundPrimary: 'hsla(300, 53%, 60%, 1)', /* #CF63CF */
    soundTertiary: 'hsla(300, 48%, 50%, 1)', /* #BD42BD */

    controlPrimary: 'hsla(38, 100%, 55%, 1)', /* #FFAB19 */

    dataPrimary: 'hsla(30, 100%, 55%, 1)', /* #FF8C1A */

    penPrimary: 'hsla(163, 85%, 40%, 1)', /* #0FBD8C */
    penTransparent: 'hsla(163, 85%, 40%, 0.25)', /* #0FBD8C */

    errorPrimary: 'hsla(30, 100%, 55%, 1)', /* #FF8C1A */
    errorLight: 'hsla(30, 100%, 70%, 1)', /* #FFB366 */
    errorTransparent: 'hsla(30, 100%, 55%, 0.25)', /* #FF8C1A */

    extensionsPrimary: 'hsla(163, 85%, 40%, 1)', /* #0FBD8C */
    extensionsTertiary: 'hsla(163, 85%, 30%, 1)', /* #0B8E69 */
    extensionsTransparent: 'hsla(163, 85%, 40%, 0.35)', /* 35% transparent version of extensions-primary */
    extensionsLight: 'hsla(163, 57%, 85%, 1)', /* opaque version of extensions-transparent, on white bg */

    dropHighlight: 'hsla(215, 100%, 77%, 1)', /* lighter than motion-primary */
    
    outline: 'hsla(0, 0%, 0%, 0.15)'
};

export const ScratchDarkTheme = Object.assign({}, ScratchTheme, {
    uiPrimary: 'rgb(37, 41, 50)',
    uiTertiary: 'rgb(34, 39, 46)',
    uiModalOverlay: 'hsla(0, 0%, 1%, 0.5)',
    textPrimary: 'rgb(211, 215, 220)',
    textPrimaryTransparent: 'hsla(0, 100%, 100%, 0.75)',
    motionPrimary: 'rgb(45, 51, 59)',
    dropHighlight: 'rgb(46, 52, 64)',
    uiWhite: 'hsl(214, 13%, 20%)',
    outline: 'hsla(100, 100%, 100%, 0.15)'
});
