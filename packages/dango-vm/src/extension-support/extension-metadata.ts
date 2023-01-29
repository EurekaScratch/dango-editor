import ArgumentType from './argument-type';
import BlockType from './block-type';
import ReporterScope from './reporter-scope';
import TargetType from './target-type';
import Runtime, {MenuItems} from '../engine/runtime';

/**
 * Technically this can be a translatable object, but in reality it will probably just be
 * a string here.
 */
type FormattableString = string;

/**
 * Standard Scratch extension class.
 * Based on LLK's example https://github.com/LLK/scratch-vm/blob/develop/docs/extensions.md
 */
export interface StandardScratchExtensionClass {
    new?: (runtime: Runtime) => void;
    getInfo: () => ExtensionMetadata;
}
  
 /**
  * All the metadata needed to register an extension.
  */
 export interface ExtensionMetadata {
    /**
     * a unique alphanumeric identifier for this extension. No special characters allowed.
     */
    id: string;
    /**
     * the human-readable name of this extension.
     * Defaults to ID if not specified.
     */
    name?: string;
    showStatusButton?: boolean;
    /**
     * URI for an image to be placed on each block in this extension.
     * Should be a data: URI
     */
    blockIconURI?: string;
    /**
     * URI for an image to be placed on this extension's category menu item.
     * Should be a data: URI
     */
    menuIconURI?: string;
    /**
     * link to documentation content for this extension
     */
    docsURI?: string;
    /**
     * Should be a hex color code.
     */
    color1?: string;
    /**
     * Should be a hex color code.
     */
    color2?: string;
    /**
     * Should be a hex color code.
     */
    color3?: string;
    /**
     * the blocks provided by this extension, plus separators
     */
    blocks: (ExtensionBlockMetadata | string)[];
    /**
     * map of menu name to metadata for each of this extension's menus.
     */
    menus?: Record<string, ExtensionMenu>;
    /**
     * @deprecated only preserved, no practical use
     */
    customFieldTypes?: Record<string, CustomFieldType>;
    /**
     * translation maps
     * @deprecated only exists in documentation, not implemented
     */
    translation_map?: Record<string, Record<string, string>>;
}

export interface ExtensionMenu {
    acceptReporters?: boolean;
    items: MenuItems;
}

/**
 * @deprecated only preserved, no practical use
 */
export interface CustomFieldType {
    extendedName: string;
    implementation: unknown;
}

 /**
  * All the metadata needed to register an extension block.
  */
export interface ExtensionBlockMetadata {
    /**
     * a unique alphanumeric identifier for this block. No special characters allowed.
     */
    opcode: string;
    /**
     * the type of block (command, reporter, etc.) being described.
     */
    blockType: BlockType;
    /**
     * the text on the block, with [PLACEHOLDERS] for arguments.
     */
    text: FormattableString;
    /**
     * URI for an image to be placed on each block in this extension.
     * Should be a data: URI
     * Defaults to ExtensionMetadata's blockIconURI
     */
    blockIconURI?: string;
    /**
     * the name of the function implementing this block. Can be shared by other blocks/opcodes.
     */
    func?: string;
    /**
     * map of argument placeholder to metadata about each arg.
     */
    arguments?: Record<string, ExtensionArgumentMetadata | undefined>;
    /**
     * true if this block should not appear in the block palette.
     */
    hideFromPalette?: boolean;
    /**
     * true if the block ends a stack - no blocks can be connected after it.
     */
    isTerminal?: boolean;
    /**
     * @deprecated use isTerminal instead
     */
    terminal?: boolean;
    /**
     * true if this block is a reporter but should not allow a monitor.
     */
    disableMonitor?: boolean;
    /**
     * if this block is a reporter, this is the scope/context for its value.
     */
    reporterScope?: ReporterScope;
    /**
     * sets whether a hat block is edge-activated.
     */
    isEdgeActivated?: boolean;
    /**
     * sets whether a hat/event block should restart existing threads.
     */
    shouldRestartExistingThreads?: boolean;
    /**
     * for flow control blocks, the number of branches/substacks for this block.
     */
    branchCount?: number;
    /**
     * @deprecated only exists in documentation, not implemented
     */
    blockAllThreads?: boolean;
    /**
     * @deprecated it exists in the source code, but not in the official documentation.
     */
    isDynamic?: boolean;
    /**
     * list of target types for which this block should appear.
     */
    filter?: TargetType[]
  }

export interface ExtensionArgumentMetadata {
    /**
     * the type of the argument (number, string, etc.)
     */
     type: ArgumentType;
     /**
      * the default value of this argument
      */
     defaultValue?: unknown;
     /**
      * the name of the menu to use for this argument, if any.
      */
     menu?: string;
     /**
      * Only available when type is INLINE_IMAGE
      */
     dataURI?: string;
     /**
      * Only available when type is INLINE_IMAGE
      * Whether the image should be flipped horizontally when the editor has a right to left language selected as its locale. By default, the image is not flipped.
      */
     flipRTL?: boolean;
     /**
      * Only available when type is INLINE_IMAGE
      */
     alt?: string;
 }

export {
    ArgumentType,
    BlockType,
    ReporterScope,
    TargetType,
    MenuItems
};
/**
 * @typedef {ExtensionDynamicMenu|ExtensionMenuItems} ExtensionMenuMetadata
 * All the metadata needed to register an extension drop-down menu.
 */

/**
 * @typedef {string} ExtensionDynamicMenu
 * The string name of a function which returns menu items.
 * @see {ExtensionMenuItems} - the type of data expected to be returned by the specified function.
 */

/**
 * @typedef {Array.<ExtensionMenuItemSimple|ExtensionMenuItemComplex>} ExtensionMenuItems
 * Items in an extension menu.
 */

/**
 * @typedef {string} ExtensionMenuItemSimple
 * A menu item for which the label and value are identical strings.
 */

/**
 * @typedef {object} ExtensionMenuItemComplex
 * A menu item for which the label and value can differ.
 * @property {*} value - the value of the block argument when this menu item is selected.
 * @property {string} text - the human-readable label of this menu item in the menu.
 */
