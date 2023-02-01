import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import {defineMessages, injectIntl} from 'react-intl';
import VM from 'scratch-vm';

import SettingsComponent from '../components/settings-modal/settings-modal.jsx';

import {updateSetting} from '../reducers/settings';;

class SettingsModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeSettingsItem',
            'handleChangeFramerate',
            'handleChangeCompiler',
            'handleChangeHQPen',
            'handleChangeSaveSettings',
            'handleChangeWarpTimer',
            'handleChangeInterpolation',
            'handleChangeInfiniteCloning',
            'handleChangeRemoveFencing',
            'handleChangeMiscLimits'
        ]);
    }

    handleChangeSettingsItem (id, value) {
        this.props.updateSettings(id, value);
    }

    handleChangeCompiler (option) {
        this.props.vm.setCompilerOptions({
            enabled: option
        });
    }
    
    handleChangeWarpTimer (option) {
        this.props.vm.setCompilerOptions({
            warpTimer: option
        });
    }

    handleChangeHQPen (option) {
        this.props.vm.renderer.setUseHighQualityRender(option);
    }
    
    handleChangeSaveSettings (option) {
        // todo
    }

    handleChangeFramerate (framerate) {
        this.props.updateSettings('framerate', framerate);
        this.props.vm.setFramerate(framerate);
    }
    
    handleChangeInterpolation (option) {
        this.props.vm.setInterpolation(option);
    }
    
    handleChangeInfiniteCloning (option) {
        this.props.vm.setRuntimeOptions({
            maxClones: option ? Infinity : 300
        });
    }
    
    handleChangeRemoveFencing (option) {
        this.props.vm.setRuntimeOptions({
            fencing: option
        });
    }
    
    handleChangeMiscLimits (option) {
        this.props.vm.setRuntimeOptions({
            miscLimits: option
        });
    }

    render () {
        return (
            <SettingsComponent
                onChangeSettingsItem={this.handleChangeSettingsItem}
                onChangeFramerate={this.handleChangeFramerate}
                onChangeCompiler={this.handleChangeCompiler}
                onChangeHQPen={this.handleChangeHQPen}
                onChangeSaveSettings={this.handleChangeSaveSettings}
                onChangeWarpTimer={this.handleChangeWarpTimer}
                onChangeInterpolation={this.handleChangeInterpolation}
                onChangeInfiniteCloning={this.handleChangeInfiniteCloning}
                onChangeRemoveFencing={this.handleChangeRemoveFencing}
                onChangeMiscLimits={this.handleChangeMiscLimits}
                {...this.props}
            />
        );
    }
}

SettingsModal.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
    extensionSettings: PropTypes.object,
    settings: PropTypes.object.isRequired,
    framerate: PropTypes.number.isRequired,
    compiler: PropTypes.bool.isRequired,
    hqpen: PropTypes.bool.isRequired,
    infiniteCloning: PropTypes.bool.isRequired,
    removeFencing: PropTypes.bool.isRequired,
    miscLimits: PropTypes.bool.isRequired,
    hideNonOriginalBlocks: PropTypes.bool.isRequired,
    colorPalette: PropTypes.string.isRequired,
    themeColor: PropTypes.string.isRequired,
    darkMode: PropTypes.string.isRequired,
    saveSettings: PropTypes.bool.isRequired,
    saveExtension: PropTypes.bool.isRequired,
    updateSettings: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    extensionSettings: state.scratchGui.extensionSettings,
    settings: state.scratchGui.settings,
    framerate: state.scratchGui.settings.framerate,
    compiler: state.scratchGui.settings.compiler,
    hqpen: state.scratchGui.settings.hqpen,
    infiniteCloning: state.scratchGui.settings.infiniteCloning,
    removeFencing: state.scratchGui.settings.removeFencing,
    miscLimits: state.scratchGui.settings.miscLimits,
    hideNonOriginalBlocks: state.scratchGui.settings.hideNonOriginalBlocks,
    saveSettings: state.scratchGui.settings.saveSettings,
    saveExtension: state.scratchGui.settings.saveExtension,
    colorPalette: state.scratchGui.settings.colorPalette,
    themeColor: state.scratchGui.settings.themeColor,
    darkMode: state.scratchGui.settings.darkMode
});

const mapDispatchToProps = dispatch => ({
    updateSettings: (name, value) => dispatch(updateSetting(name, value))
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsModal));
