/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

goog.provide('Blockly.Blocks.data');
goog.provide('Blockly.Constants.Data');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['data_blockvariable'] = {
  /**
   * Block to create a variable in block.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_BLOCKVARIABLE,
      "message1": "%1", // Statement
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "category": Blockly.Categories.data,
      "extensions": ["colours_data", "shape_statement"]
    });
    this.argumentIds_ = [];
    this.plusminus_ = new Blockly.FieldPlusMinus(
        this.handlePlus_.bind(this),
        this.handleMinus_.bind(this),
        true,
        false
    );
    this.insertValueInput(0, 'DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
    return container;
  },
  domToMutation: function(xmlElement) {
    var argumentIds = xmlElement.getAttribute('argumentids');
    // don't update if args are not changed
    if (JSON.stringify(this.argumentIds_) === argumentIds) {
      return;
    }
    this.argumentIds_ = JSON.parse(argumentIds);
    if (this.argumentIds_.length >= 1) {
      this.plusminus_.setEnableMinus(true);
    } else {
      this.plusminus_.setEnableMinus(false);
    }
    this.updateDisplay_();
  },
  customContextMenu: function(menuOptions, originalBlock) {
    if (originalBlock) {
      var index = this.findBlockIndex_(originalBlock);
      menuOptions.push({
        enabled: true,
        text: Blockly.Msg.INSERT_INPUT,
        callback: this.insertInputWithIndex_.bind(this, index, null)
      });
      menuOptions.push({
        enabled: this.argumentIds_.length >= 2,
        text: Blockly.Msg.DELETE_INPUT,
        callback: this.removeInputWithIndex_.bind(this, index, null)
      });
    }
  },
  findBlockIndex_: function(block) {
    for (var i = 0; i < this.childBlocks_.length; ++i) {
      if (this.childBlocks_[i] === block) {
        return i + 1;
      }
    }
    return 0;
  },
  handlePlus_: function() {
    this.insertInputWithIndex_(this.argumentIds_.length + 1);
  },
  handleMinus_: function() {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },
  insertInputWithIndex_: function(index, name) {
    Blockly.Events.setGroup(true);
    var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
    if (this.argumentIds_.length === 2) {
      this.plusminus_.setEnableMinus(true);
    }

    if (!name) name = Blockly.utils.genUid();
    this.argumentIds_.splice(index - 1, 0, name);
    var input = this.insertValueInput(index, name);
    Blockly.Events.disable();
    var newBlock = this.workspace.newBlock('argument_reporter_string_number');
    newBlock.setFieldValue('var' + index, 'VALUE');
    const colorArray = [
      Blockly.Colours.data.primary,
      Blockly.Colours.data.secondary,
      Blockly.Colours.data.tertiary
    ];
    newBlock.updateColor(colorArray);
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
    Blockly.Events.enable();
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
    }
    newBlock.outputConnection.connect(input.connection);

    var newMutation = Blockly.Xml.domToText(this.mutationToDom());
    Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    Blockly.Events.setGroup(false);
  },
  removeInputWithIndex_: function(index) {
    // not allowed to remove input when there are less than 2 inputs
    if (this.argumentIds_.length <= 1) return;
    Blockly.Events.setGroup(true);
    var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
    if (this.argumentIds_.length === 2) {
      this.plusminus_.setEnableMinus(false);
    }
    this.removeInput(this.argumentIds_[index - 1]);
    this.argumentIds_.splice(index - 1, 1);
    var newMutation = Blockly.Xml.domToText(this.mutationToDom());
    Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    Blockly.Events.setGroup(false);
  },
  updateDisplay_: function() {
    var wasRendered = this.rendered;
    this.rendered = false;

    // disconnect old blocks, except the first one and the last one
    var connectionMap = {};
    for (var i = 1; i < this.inputList.length - 1; ++i) {
      var input = this.inputList[i];
      if (input.connection) {
        var target = input.connection.targetBlock();
        var saveInfo = {
          shadow: input.connection.getShadowDom(),
          block: target
        };
        connectionMap[input.name] = saveInfo;
        input.connection.setShadowDom(null);
        if (target) {
          input.connection.disconnect();
        }
      }
    }

    // remove all inputs, except the first one and the last one
    for (var i = 1; i < this.inputList.length - 1; ++i) {
      this.inputList[i].dispose();
    }
    this.inputList.splice(1, this.inputList.length - 2);

    // create inputs
    for (var i = 0; i < this.argumentIds_.length; ++i) {
      var id = this.argumentIds_[i];
      var input = this.insertValueInput(i + 1, id);

      // populate args
      var oldBlock = null;
      var oldShadow = null;
      if (connectionMap && (id in connectionMap)) {
        var saveInfo = connectionMap[id];
        oldBlock = saveInfo['block'];
        oldShadow = saveInfo['shadow'];
      }

      if (oldBlock) {
        // reattach the old block and shadow dom
        connectionMap[input.name] = null;
        oldBlock.outputConnection.connect(input.connection);
        if (!oldShadow) {
          // create shadow dom
          oldShadow = goog.dom.createDom('shadow');
          oldShadow.setAttribute('type', 'argument_reporter_string_number');
          var mutationDom = goog.dom.createDom('mutation', null, '');
          mutationDom.setAttribute('colours', '[&quot;#FF8C1A&quot;,&quot;#FF8000&quot;,&quot;#DB6E00&quot;]');
          oldShadow.appendChild(mutationDom);
          var fieldDom = goog.dom.createDom('field', null, '');
          fieldDom.setAttribute('name', 'VALUE');
          oldShadow.appendChild(fieldDom);
        }
        input.connection.setShadowDom(oldShadow);
      } else {
        // attach shadow
        Blockly.Events.disable();
        var newBlock = this.workspace.newBlock('argument_reporter_string_number');
        // todo read by argumentdefault?
        newBlock.setFieldValue('var' + i, 'VALUE');
        newBlock.setShadow(true);
        const colorArray = [
          Blockly.Colours.data.primary,
          Blockly.Colours.data.secondary,
          Blockly.Colours.data.tertiary
        ];
        newBlock.updateColor(colorArray);
        if (!this.isInsertionMarker()) {
          newBlock.initSvg();
          newBlock.render(false);
        }
        Blockly.Events.enable();
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
        }
        newBlock.outputConnection.connect(input.connection);
      }
    }

    // delete unused shadow
    for (var id in connectionMap) {
      var saveInfo = connectionMap[id];
      if (saveInfo) {
        var block = saveInfo['block'];
        if (block && block.isShadow()) {
          block.dispose();
          connectionMap[id] = null;
        }
      }
    }

    this.rendered = wasRendered;
    if (wasRendered && !this.isInsertionMarker()) {
      this.initSvg();
      this.render();
    }
  }
};

Blockly.Blocks['data_variable'] = {
  /**
   * Block of Variables
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "lastDummyAlign0": "CENTRE",
      "args0": [
        {
          "type": "field_variable_getter",
          "text": "",
          "name": "VARIABLE",
          "variableType": ""
        }
      ],
      "category": Blockly.Categories.data,
      "checkboxInFlyout": true,
      "extensions": ["contextMenu_getVariableBlock", "colours_data", "output_string"]
    });
  }
};

Blockly.Blocks['data_setvariableto'] = {
  /**
   * Block to set variable to a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_SETVARIABLETO,
      "args0": [
        {
          "type": "field_variable",
          "name": "VARIABLE"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "category": Blockly.Categories.data,
      "extensions": ["colours_data", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_changevariableby'] = {
  /**
   * Block to change variable by a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_CHANGEVARIABLEBY,
      "args0": [
        {
          "type": "field_variable",
          "name": "VARIABLE"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "category": Blockly.Categories.data,
      "extensions": ["colours_data", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_showvariable'] = {
  /**
   * Block to show a variable
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_SHOWVARIABLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VARIABLE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.data,
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary
    });
  }
};

Blockly.Blocks['data_hidevariable'] = {
  /**
   * Block to hide a variable
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_HIDEVARIABLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VARIABLE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.data,
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary
    });
  }
};

Blockly.Blocks['data_listcontents'] = {
  /**
   * List reporter.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable_getter",
          "text": "",
          "name": "LIST",
          "variableType": Blockly.LIST_VARIABLE_TYPE
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["contextMenu_getListBlock", "colours_data_lists", "output_string"],
      "checkboxInFlyout": true
    });
  }
};

Blockly.Blocks['data_listindexall'] = {
  /**
   * List index menu, with all option.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_numberdropdown",
          "name": "INDEX",
          "value": "1",
          "min": 1,
          "precision": 1,
          "options": [
            ["1", "1"],
            [Blockly.Msg.DATA_INDEX_LAST, "last"],
            [Blockly.Msg.DATA_INDEX_ALL, "all"]
          ]
        }
      ],
      "category": Blockly.Categories.data,
      "extensions": ["colours_textfield", "output_string"]
    });
  }
};

Blockly.Blocks['data_listindexrandom'] = {
  /**
   * List index menu, with random option.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_numberdropdown",
          "name": "INDEX",
          "value": "1",
          "min": 1,
          "precision": 1,
          "options": [
            ["1", "1"],
            [Blockly.Msg.DATA_INDEX_LAST, "last"],
            [Blockly.Msg.DATA_INDEX_RANDOM, "random"]
          ]
        }
      ],
      "category": Blockly.Categories.data,
      "extensions": ["colours_textfield", "output_string"]
    });
  }
};

Blockly.Blocks['data_addtolist'] = {
  /**
   * Block to add item to list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_ADDTOLIST,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_deleteoflist'] = {
  /**
   * Block to delete item from list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_DELETEOFLIST,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_deletealloflist'] = {
  /**
   * Block to delete all items from list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_DELETEALLOFLIST,
      "args0": [
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_insertatlist'] = {
  /**
   * Block to insert item to list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_INSERTATLIST,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_replaceitemoflist'] = {
  /**
   * Block to insert item to list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_REPLACEITEMOFLIST,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        },
        {
          "type": "input_value",
          "name": "ITEM"
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_itemoflist'] = {
  /**
   * Block for reporting item of list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_ITEMOFLIST,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "output": null,
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists"],
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['data_itemnumoflist'] = {
  /**
   * Block for reporting the item # of a string in a list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_ITEMNUMOFLIST,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "output": null,
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists"],
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['data_lengthoflist'] = {
  /**
   * Block for reporting length of list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_LENGTHOFLIST,
      "args0": [
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "output_number"]
    });
  }
};

Blockly.Blocks['data_listcontainsitem'] = {
  /**
   * Block to report whether list contains item.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_LISTCONTAINSITEM,
      "args0": [
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        },
        {
          "type": "input_value",
          "name": "ITEM"
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "output_boolean"]
    });
  }
};

Blockly.Blocks['data_showlist'] = {
  /**
   * Block to show a list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_SHOWLIST,
      "args0": [
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

Blockly.Blocks['data_hidelist'] = {
  /**
   * Block to hide a list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DATA_HIDELIST,
      "args0": [
        {
          "type": "field_variable",
          "name": "LIST",
          "variableTypes": [Blockly.LIST_VARIABLE_TYPE]
        }
      ],
      "category": Blockly.Categories.dataLists,
      "extensions": ["colours_data_lists", "shape_statement"]
    });
  }
};

/**
 * Mixin to add a context menu for a data_variable block.  It adds one item for
 * each variable defined on the workspace.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Data.CUSTOM_CONTEXT_MENU_GET_VARIABLE_MIXIN = {
  /**
   * Add context menu option to change the selected variable.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var fieldName = 'VARIABLE';
    if (this.isCollapsed()) {
      return;
    }
    var currentVarName = this.getField(fieldName).text_;
    if (!this.isInFlyout) {
      var variablesList = this.workspace.getVariablesOfType('');
      variablesList.sort(function(a, b) {
        return Blockly.scratchBlocksUtils.compareStrings(a.name, b.name);
      });
      for (var i = 0; i < variablesList.length; i++) {
        var varName = variablesList[i].name;
        if (varName == currentVarName) continue;

        var option = {enabled: true};
        option.text = varName;

        option.callback =
            Blockly.Constants.Data.VARIABLE_OPTION_CALLBACK_FACTORY(this,
                variablesList[i].getId(), fieldName);
        options.push(option);
      }
    } else {
      var renameOption = {
        text: Blockly.Msg.RENAME_VARIABLE,
        enabled: true,
        callback: Blockly.Constants.Data.RENAME_OPTION_CALLBACK_FACTORY(this,
            fieldName)
      };
      var deleteOption = {
        text: Blockly.Msg.DELETE_VARIABLE.replace('%1', currentVarName),
        enabled: true,
        callback: Blockly.Constants.Data.DELETE_OPTION_CALLBACK_FACTORY(this,
            fieldName)
      };
      options.push(renameOption);
      options.push(deleteOption);
    }
  }
};

Blockly.Extensions.registerMixin('contextMenu_getVariableBlock',
    Blockly.Constants.Data.CUSTOM_CONTEXT_MENU_GET_VARIABLE_MIXIN);

/**
 * Mixin to add a context menu for a data_listcontents block.  It adds one item for
 * each list defined on the workspace.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Data.CUSTOM_CONTEXT_MENU_GET_LIST_MIXIN = {
  /**
   * Add context menu option to change the selected list.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var fieldName = 'LIST';
    if (this.isCollapsed()) {
      return;
    }
    var currentVarName = this.getField(fieldName).text_;
    if (!this.isInFlyout) {
      var variablesList = this.workspace.getVariablesOfType('list');
      variablesList.sort(function(a, b) {
        return Blockly.scratchBlocksUtils.compareStrings(a.name, b.name);
      });
      for (var i = 0; i < variablesList.length; i++) {
        var varName = variablesList[i].name;
        if (varName == currentVarName) continue;

        var option = {enabled: true};
        option.text = varName;

        option.callback =
            Blockly.Constants.Data.VARIABLE_OPTION_CALLBACK_FACTORY(this,
                variablesList[i].getId(), fieldName);
        options.push(option);
      }
    } else {
      var renameOption = {
        text: Blockly.Msg.RENAME_LIST,
        enabled: true,
        callback: Blockly.Constants.Data.RENAME_OPTION_CALLBACK_FACTORY(this,
            fieldName)
      };
      var deleteOption = {
        text: Blockly.Msg.DELETE_LIST.replace('%1', currentVarName),
        enabled: true,
        callback: Blockly.Constants.Data.DELETE_OPTION_CALLBACK_FACTORY(this,
            fieldName)
      };
      options.push(renameOption);
      options.push(deleteOption);
    }
  }
};
Blockly.Extensions.registerMixin('contextMenu_getListBlock',
    Blockly.Constants.Data.CUSTOM_CONTEXT_MENU_GET_LIST_MIXIN);

/**
 * Callback factory for dropdown menu options associated with a variable getter
 * block.  Each variable on the workspace gets its own item in the dropdown
 * menu, and clicking on that item changes the text of the field on the source
 * block.
 * @param {!Blockly.Block} block The block to update.
 * @param {string} id The id of the variable to set on this block.
 * @param {string} fieldName The name of the field to update on the block.
 * @return {!function()} A function that updates the block with the new name.
 */
Blockly.Constants.Data.VARIABLE_OPTION_CALLBACK_FACTORY = function(block,
    id, fieldName) {
  return function() {
    var variableField = block.getField(fieldName);
    if (!variableField) {
      console.log("Tried to get a variable field on the wrong type of block.");
    }
    variableField.setValue(id);
  };
};

/**
 * Callback for rename variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to rename.
 * @param {string} fieldName The name of the field to inspect on the block.
 * @return {!function()} A function that renames the variable.
 */
Blockly.Constants.Data.RENAME_OPTION_CALLBACK_FACTORY = function(block,
    fieldName) {
  return function() {
    var workspace = block.workspace;
    var variable = block.getField(fieldName).getVariable();
    Blockly.Variables.renameVariable(workspace, variable);
  };
};

/**
 * Callback for delete variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to delete.
 * @param {string} fieldName The name of the field to inspect on the block.
 * @return {!function()} A function that deletes the variable.
 */
Blockly.Constants.Data.DELETE_OPTION_CALLBACK_FACTORY = function(block,
    fieldName) {
  return function() {
    var workspace = block.workspace;
    var variable = block.getField(fieldName).getVariable();
    workspace.deleteVariableById(variable.getId());
  };
};
