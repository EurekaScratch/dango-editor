/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {defineMessages, injectIntl} from 'react-intl';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';

import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import Switch from '../switch/switch.jsx';
import Select from '../select/select.jsx';
import ColorPicker from '../color-picker/color-picker.tsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import styles from './settings-modal.css';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    title: {
        defaultMessage: 'Settings',
        description: 'Settings Modal Title',
        id: 'gui.settingsModal.title'
    },
    experimental: {
        defaultMessage: 'Experimental',
        description: 'Label of Experimental',
        id: 'gui.settingsModal.experimental'
    },
    features: {
        defaultMessage: 'Features',
        description: 'Label of Features',
        id: 'gui.settingsModal.features'
    },
    project: {
        defaultMessage: 'Project',
        description: 'Label of Project',
        id: 'gui.settingsModal.project'
    },
    framerate: {
        defaultMessage: 'FPS',
        description: 'Label of FPS',
        id: 'gui.settingsModal.fps.label'
    },
    interpolation: {
        defaultMessage: 'Interpolation',
        description: 'Label of Interpolation',
        id: 'gui.settingsModal.interpolation.label'
    },
    compiler: {
        defaultMessage: 'Compiler',
        description: 'Label of compiler',
        id: 'gui.settingsModal.compiler.label'
    },
    warpTimer: {
        defaultMessage: 'Warp Timer',
        description: 'Label of warp timer',
        id: 'gui.settingsModal.warpTimer.label'
    },
    hqpen: {
        defaultMessage: 'High-Quality Pen',
        description: 'Label of High-Quality Pen',
        id: 'gui.settingsModal.hqpen.label'
    },
    saveSettings: {
        defaultMessage: 'Save Settings to Project File',
        description: 'Label of Save Settings',
        id: 'gui.settingsModal.saveSettings.label'
    },
    saveExtension: {
        defaultMessage: 'Save Extension to Project File',
        description: 'Label of Save Extension',
        id: 'gui.settingsModal.saveExtension.label'
    },
    hideNonOriginalBlocks: {
        defaultMessage: 'Hide non-original Blocks',
        description: 'Label of Hide non-original Blocks',
        id: 'gui.settingsModal.hideNonoriginalBlocks.label'
    },
    limits: {
        defaultMessage: 'Limits',
        description: 'Label of Limits',
        id: 'gui.settingsModal.limits'
    },
    infiniteCloning: {
        defaultMessage: 'Infinite Clones',
        description: 'Label of Infinite Clones',
        id: 'gui.settingsModal.infiniteCloning'
    },
    removeFencing: {
        defaultMessage: 'Remove Fencing',
        description: 'Label of Remove Fencing',
        id: 'gui.settingsModal.removeFencing'
    },
    miscLimits: {
        defaultMessage: 'Remove Miscellaneous Limits',
        description: 'Label of misc limits',
        id: 'gui.settingsModal.miscLimits'
    },
    theme: {
        defaultMessage: 'Theme',
        description: 'Label of Theme',
        id: 'gui.settingsModal.theme'
    },
    colorPalette: {
        defaultMessage: 'Color Palette',
        description: 'Label of Color Palette',
        id: 'gui.settingsModal.colorPalette'
    },
    scratch: {
        defaultMessage: 'Scratch',
        description: 'Label of Scratch',
        id: 'gui.settingsModal.scratch'
    },
    material: {
        defaultMessage: 'Material You',
        description: 'Label of Material You',
        id: 'gui.settingsModal.material'
    },
    themeColor: {
        defaultMessage: 'Theme Color',
        description: 'Label of Theme Color',
        id: 'gui.settingsModal.themeColor'
    },
    darkMode: {
        defaultMessage: 'Dark Mode',
        description: 'Label of Dark Mode',
        id: 'gui.settingsModal.darkMode'
    },
    dark: {
        defaultMessage: 'Dark',
        description: 'Label of Dark',
        id: 'gui.settingsModal.dark'
    },
    light: {
        defaultMessage: 'Light',
        description: 'Label of Light',
        id: 'gui.settingsModal.light'
    },
    followSystem: {
        defaultMessage: 'Follow System',
        description: 'Label of Follow System',
        id: 'gui.settingsModal.followSystem'
    },
});

const ExperimentalTag = ({intl}) => {
    return (
        <div className={styles.tag}>
            {intl.formatMessage(messages.experimental)}
        </div>
    );
}

const Elastic = () => <div className={styles.elastic} />;

class SettingsModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeSettingsItem',
            'handleJumpToCategory',
            'renderExtensionSettings'
        ]);
        this.categoryRef = {
            features: (ref) => {
                this.categoryRef.features.current = ref
            },
            project: (ref) => {
                this.categoryRef.project.current = ref
            },
            limits: (ref) => {
                this.categoryRef.limits.current = ref
            },
            theme: (ref) => {
                this.categoryRef.theme.current = ref
            }
        };
    }

    handleChangeSettingsItem (id, callback) {
        return value => {
            this.props.onChangeSettingsItem(id, value);
            if (callback) callback(value);
        };
    }

    handleJumpToCategory (id) {
        return () => {
            this.categoryRef[id].current.scrollIntoView({
                behavior: 'smooth'
            });
        };
    }

    renderExtensionSettings () {
        const ids = Object.keys(this.props.extensionSettings);
        const content = [];
        for (const id of ids) {
            const settings = this.props.extensionSettings[id];
            if (!this.categoryRef.hasOwnProperty(id)) {
                this.categoryRef[id] = createRef();
            }
            const currentContent = [(<p
                key={id}
                className={classNames(styles.category)}
                ref={this.categoryRef[id]}
            >
                {this.props.intl.formatMessage({id: `${id}.name`})}
            </p>)];
            for (const item of settings) {
                let element = null;
                switch (item.type) {
                case 'boolean': {
                    element = (<Switch
                        key={item.id}
                        onChange={this.handleChangeSettingsItem(item.id)}
                        value={this.props.settings[item.id]}
                    />);
                    break;
                }
                case 'number': {
                    element = (<BufferedInput
                        key={item.id}
                        small
                        tabIndex="0"
                        type="number"
                        min={item.min}
                        max={item.max}
                        precision={item.precision}
                        placeholder="6"
                        value={this.props.settings[item.id]}
                        onSubmit={this.handleChangeSettingsItem(item.id)}
                        className={classNames(styles.input)}
                    />);
                    break;
                }
                case 'selector': {
                    const options = item.options.map(v => ({
                        id: v.id,
                        text: this.props.intl.formatMessage({id: v.message})
                    }));
                    element = (<Select
                        options={options}
                        onChange={this.handleChangeSettingsItem(item.id)}
                        value={this.props.settings[item.id]}
                    />);
                    break;
                }
                default: {
                    element = (<p>{'Error Type'}</p>);
                }
                }

                currentContent.push(<div
                    key={item.id}
                    className={classNames(styles.item)}
                >
                    <p className={classNames(styles.text)}>
                        {this.props.intl.formatMessage({id: item.message})}
                    </p>
                    <Elastic />
                    {element}
                </div>);
            }
            content.push(currentContent);
        }
        return content;
    }

    render () {
        const colorPaletteOptions = [{
            id: 'scratch',
            text: this.props.intl.formatMessage(messages.scratch)
        }, {
            id: 'material',
            text: this.props.intl.formatMessage(messages.material)
        }];
        const darkModeOptions = [{
            id: 'system',
            text: this.props.intl.formatMessage(messages.followSystem)
        }, {
            id: 'light',
            text: this.props.intl.formatMessage(messages.light)
        }, {
            id: 'dark',
            text: this.props.intl.formatMessage(messages.dark)
        }];
        return (
            <Modal
                className={styles.modalContent}
                contentLabel={this.props.intl.formatMessage(messages.title)}
                onRequestClose={this.props.onRequestClose}
                id="settingsModal"
            >
                <Box className={classNames(styles.body)}>
                    <Box
                        className={classNames(styles.menu)}
                        justifyContent="space-between"
                        scrollbar
                    >
                        <p onClick={this.handleJumpToCategory('features')}>{this.props.intl.formatMessage(messages.features)}</p>
                        <p onClick={this.handleJumpToCategory('limits')}>{this.props.intl.formatMessage(messages.limits)}</p>
                        <p onClick={this.handleJumpToCategory('project')}>{this.props.intl.formatMessage(messages.project)}</p>
                        <p onClick={this.handleJumpToCategory('theme')}>{this.props.intl.formatMessage(messages.theme)}</p>
                        {/*Object.keys(this.props.extensionSettings).map(id => (
                            <p
                                key={id}
                                onClick={this.handleJumpToCategory(id)}
                            >
                                {this.props.intl.formatMessage({id: `${id}.name`})}
                            </p>
                        ))*/}
                    </Box>
                    <Box
                        className={classNames(styles.content)}
                        justifyContent="space-between"
                        scrollbar
                    >
                        <p
                            className={classNames(styles.category)}
                            ref={this.categoryRef.features}
                        >
                            {this.props.intl.formatMessage(messages.features)}
                        </p>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.framerate)}
                            </p>
                            <Elastic />
                            <BufferedInput
                                small
                                tabIndex="0"
                                type="number"
                                min={10}
                                max={240}
                                precision={0}
                                placeholder="30"
                                value={this.props.framerate}
                                onSubmit={this.props.onChangeFramerate}
                                className={classNames(styles.input)}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.interpolation)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('interpolation', this.props.onChangeInterpolation)}
                                value={this.props.interpolation}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.compiler)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('compiler', this.props.onChangeCompiler)}
                                value={this.props.compiler}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.warpTimer)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('warpTimer', this.props.onChangeWarpTimer)}
                                value={this.props.warpTimer}
                                disabled={!this.props.compiler}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.hqpen)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('hqpen', this.props.onChangeHQPen)}
                                value={this.props.hqpen}
                            />
                        </div>
                        <p
                            className={classNames(styles.category)}
                            ref={this.categoryRef.limits}
                        >
                            {this.props.intl.formatMessage(messages.limits)}
                        </p>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.infiniteCloning)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('infiniteCloning', this.props.onChangeInfiniteCloning)}
                                value={this.props.infiniteCloning}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.removeFencing)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('removeFencing', this.props.onChangeRemoveFencing)}
                                value={this.props.removeFencing}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.miscLimits)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('miscLimits', this.props.onChangeMiscLimits)}
                                value={this.props.miscLimits}
                            />
                        </div>
                        <p
                            className={classNames(styles.category)}
                            ref={this.categoryRef.project}
                        >
                            {this.props.intl.formatMessage(messages.project)}
                        </p>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.saveSettings)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('saveSettings', this.props.onChangeSaveSettings)}
                                value={this.props.saveSettings}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.saveExtension)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('saveExtension')}
                                value={this.props.saveExtension}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.hideNonOriginalBlocks)}
                            </p>
                            <Elastic />
                            <Switch
                                onChange={this.handleChangeSettingsItem('hideNonOriginalBlocks')}
                                value={this.props.hideNonOriginalBlocks}
                            />
                        </div>
                        <p
                            className={classNames(styles.category)}
                            ref={this.categoryRef.theme}
                        >
                            {this.props.intl.formatMessage(messages.theme)}
                        </p>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.darkMode)}
                            </p>
                            <Elastic />
                            <Select
                                options={darkModeOptions}
                                onChange={this.handleChangeSettingsItem('darkMode')}
                                value={this.props.darkMode}
                                className={styles.selectBig}
                            />
                        </div>
                        <div className={classNames(styles.item)}>
                            <p className={classNames(styles.text)}>
                                {this.props.intl.formatMessage(messages.colorPalette)}
                            </p>
                            <Elastic />
                            <Select
                                options={colorPaletteOptions}
                                onChange={this.handleChangeSettingsItem('colorPalette')}
                                value={this.props.colorPalette}
                                className={styles.selectBig}
                            />
                        </div>
                        {this.props.colorPalette === 'material' && (
                            <div className={classNames(styles.item)}>
                                <p className={classNames(styles.text)}>
                                    {this.props.intl.formatMessage(messages.themeColor)}
                                </p>
                                <Elastic />
                                <ColorPicker
                                    value={this.props.themeColor}
                                    onChange={this.handleChangeSettingsItem('themeColor')}
                                />
                            </div>
                        )}
                        {/*this.renderExtensionSettings()*/}
                    </Box>
                </Box>
            </Modal>
        );
    }
}

SettingsModal.propTypes = {
    intl: PropTypes.object.isRequired,
    extensionSettings: PropTypes.object,
    settings: PropTypes.object.isRequired,
    framerate: PropTypes.number.isRequired,
    compiler: PropTypes.bool.isRequired,
    hqpen: PropTypes.bool.isRequired,
    infiniteCloning: PropTypes.bool.isRequired,
    removeFencing: PropTypes.bool.isRequired,
    miscLimits: PropTypes.bool.isRequired,
    hideNonOriginalBlocks: PropTypes.bool.isRequired,
    saveSettings: PropTypes.bool.isRequired,
    saveOptionalExtension: PropTypes.bool.isRequired,
    colorPalette: PropTypes.string.isRequired,
    themeColor: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onChangeSettingsItem: PropTypes.func.isRequired,
    onChangeFramerate: PropTypes.func.isRequired,
    onChangeCompiler: PropTypes.func.isRequired,
    onChangeHQPen: PropTypes.func.isRequired,
    onChangeSaveSettings: PropTypes.func.isRequired,
    onChangeWarpTimer: PropTypes.func.isRequired,
    onChangeInterpolation: PropTypes.func.isRequired,
    onChangeInfiniteCloning: PropTypes.func.isRequired,
    onChangeRemoveFencing: PropTypes.func.isRequired,
    onChangeMiscLimits: PropTypes.func.isRequired
};

export default injectIntl(SettingsModal);
