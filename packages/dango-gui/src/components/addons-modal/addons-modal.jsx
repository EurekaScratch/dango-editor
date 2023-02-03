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
                                    return (
                                        <div className={styles.item} key={index}>
                                            <div className={styles.indicator}>
                                                <img
                                                    src={indicatorIcon}
                                                    className={classNames(
                                                        styles.image,
                                                        this.state.showMenu ? styles.imageRotate : null
                                                    )}
                                                />
                                            </div>
                                            <div className={styles.info}>
                                                <p>{manifest.name}</p>
                                                <p className={styles.description}>{manifest.description}</p>
                                            </div>
                                            <Elastic />
                                            <Switch value={this.props.data.addonsEnabled[addonId]} />
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
