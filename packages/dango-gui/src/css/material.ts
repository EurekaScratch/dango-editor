import { ThemePrototype } from '../lib/theme';
import { argbFromHex, themeFromSourceColor, applyTheme } from "@material/material-color-utilities";

export function generateThemeFromColor (color: string, darkMode?: boolean) : ThemePrototype {
    const { schemes } = themeFromSourceColor(argbFromHex(color.substring(1)));
    const palette = darkMode ? schemes.dark : schemes.light;
    
    return {
        uiPrimary: decimalToHex(palette.primaryContainer), /* #E5F0FF */
        uiSecondary: decimalToHex(palette.secondaryContainer), /* #E9F1FC */
        uiTertiary: decimalToHex(palette.tertiaryContainer), /* #D9E3F2 */

        uiModalOverlay: 'hsla(215, 100%, 65%, 0.9)', /* 90% transparent version of motion-primary */

        uiWhite: 'hsla(0, 100%, 100%, 1)', /* #FFFFFF */
        uiWhiteDim: 'hsla(0, 100%, 100%, 0.75)', /* 25% transparent version of ui-white */
        uiWhiteTransparent: 'hsla(0, 100%, 100%, 0.25)', /* 25% transparent version of ui-white */
        uiTransparent: 'hsla(0, 100%, 100%, 0)', /* 25% transparent version of ui-white */

        uiBlackTransparent: 'hsla(0, 0%, 0%, 0.15)', /* 15% transparent version of black */

        textPrimary: 'hsla(225, 15%, 40%, 1)', /* #575E75 */
        textPrimaryTransparent: 'hsla(225, 15%, 40%, 0.75)',

        motionPrimary: decimalToHex(palette.primary),
        motionTertiary: decimalToHex(palette.tertiary), /* #3373CC */
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
    };
}

/**
 * Convert a Scratch decimal color to a hex string, #RRGGBB.
 * @param {number} decimal RGB color as a decimal.
 * @return {string} RGB color as #RRGGBB hex string.
 */
function decimalToHex (decimal: number) {
    if (decimal < 0) {
        decimal += 0xFFFFFF + 1;
    }
    let hex = Number(decimal).toString(16);
    hex = `#${'000000'.substr(0, 6 - hex.length)}${hex}`;
    return hex;
}
