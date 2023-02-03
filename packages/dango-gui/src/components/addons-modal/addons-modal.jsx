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
import Spinner from '../spinner/spinner.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import styles from './addons-modal.css';
import indicatorIcon from './chevron-down.svg';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    title: {
        defaultMessage: 'Addons',
        description: 'Addons Modal Title',
        id: 'gui.addonsModal.title'
    }
});

const Elastic = () => <div className={styles.elastic} />;

class AddonsModal extends React.Component {
    constructor (props) {
        super(props);
        this.state={};
        bindAll(this, ['bufferOperation']);
    }
    bufferOperation (addonId, value) {
        this.setState(Object.assign({}, this.state, {
            [addonId]: value
        }));
    }
    render () {
        return (
            <Modal
                className={styles.modalContent}
                contentLabel={this.props.intl.formatMessage(messages.title)}
                onRequestClose={this.props.onRequestClose}
                id="addonsModal"
            >
                <Box className={classNames(styles.body)}>
                    <Box
                        className={classNames(styles.content)}
                        justifyContent="space-between"
                        scrollbar
                    >
                        {this.props.loading ? (
                            <div className={styles.spinnerWrapper}>
                                <Spinner
                                    large
                                    level="primary"
                                />
                            </div>
                        ) : (
                            <>
                                {this.props.data.manifests.map(({addonId, manifest}, index) => {
                                    // Hide scratch-www related addons.
                                    if (!manifest.tags.includes('editor')) return;
                                    let author = [];
                                    let settings = [];
                                    if (manifest.credits) {
                                        for (const credit of manifest.credits) {
                                            author.push(credit.name);
                                        }
                                        author = author.join(', ');
                                    }
                                    if (manifest.settings) {
                                        for (const setting of manifest.settings) {
                                            switch (setting.type) {
                                            case 'boolean':
                                                settings.push((
                                                    <div className={styles.settingItem}>
                                                        <p>{setting.name}</p>
                                                        <Elastic />
                                                        <Switch />
                                                    </div>
                                                ));
                                                break;
                                            case 'integer':
                                                settings.push((
                                                    <div className={styles.settingItem}>
                                                        <p>{setting.name}</p>
                                                        <Elastic />
                                                        <BufferedInput
                                                            small
                                                            tabIndex="0"
                                                            type="number"
                                                            min={setting.min}
                                                            max={setting.max}
                                                            placeholder={setting.default}
                                                        />
                                                    </div>
                                                ));
                                                break;
                                            case 'select': {
                                                const processedValue = [];
                                                for (const item of setting.potentialValues) {
                                                    processedValue.push({
                                                        id: item.id,
                                                        text: item.name
                                                    });
                                                }
                                                settings.push((
                                                    <div className={styles.settingItem}>
                                                        <p>{setting.name}</p>
                                                        <Elastic />
                                                        <Select options={processedValue} />
                                                    </div>
                                                ));
                                                break;
                                            }
                                            case 'color':
                                                settings.push((
                                                    <div className={styles.settingItem}>
                                                        <p>{setting.name}</p>
                                                        <Elastic />
                                                        <ColorPicker />
                                                    </div>
                                                ));
                                                break;
                                            default:
                                                console.warn(`unknown settings type ${setting.type} in ${addonId}`);
                                            }
                                        }
                                    }
                                    return (
                                        <div
                                            key={index}
                                            className={classNames(styles.item, {
                                                [styles.expanded]: this.state[addonId] && !this.state[addonId].isCollapsed
                                            })}
                                            onClick={() => {
                                                this.bufferOperation(addonId, {
                                                    isCollapsed: this.state[addonId] ? !this.state[addonId].isCollapsed : false
                                                });
                                            }}
                                        >
                                            <div className={styles.abstract}>
                                                <div className={styles.indicator}>
                                                    <img
                                                        src={indicatorIcon}
                                                        className={classNames(
                                                            styles.image,
                                                            (this.state[addonId] && this.state[addonId].isCollapsed) ? null : styles.imageRotate
                                                        )}
                                                    />
                                                </div>
                                                <div className={styles.info}>
                                                    <p>{manifest.name}</p>
                                                    <p className={classNames(styles.description, {
                                                        [styles.omit]: !this.state[addonId] || this.state[addonId].isCollapsed
                                                    })}>{manifest.description}</p>
                                                </div>
                                                <Elastic />
                                                <Switch value={this.props.data.addonsEnabled[addonId]} />
                                            </div>
                                            {this.state[addonId] && !this.state[addonId].isCollapsed && (
                                                <div className={styles.setting}>
                                                    {typeof author === 'string' && <p className={styles.author}>Author: {author}</p>}
                                                    {settings.length !== 0 && settings}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </Box>
                </Box>
            </Modal>
        );
    }
}

AddonsModal.propTypes = {
    loading: PropTypes.bool,
    intl: PropTypes.object.isRequired
};

export default injectIntl(AddonsModal);
