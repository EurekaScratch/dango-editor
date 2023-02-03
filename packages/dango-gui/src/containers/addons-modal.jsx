import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {defineMessages, injectIntl} from 'react-intl';

import AddonsComponent from '../components/addons-modal/addons-modal.jsx';

class AddonsModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            data: null
        };
        bindAll(this, ['handleChangeState']);
    }
    async componentDidMount () {
        try {
            const addonsInfo = await scratchAddons.methods.getSettingsInfo();
            console.log(addonsInfo);
            this.setState({
                loading: false,
                data: addonsInfo
            });
        } catch (e) {
            
        }
    }
    async handleChangeState (id, value) {
        if (value.hasOwnProperty('enabled')) {
            await scratchAddons.methods.changeEnabledState(id, value);
            delete value.enabled;
        }
        if (Object.keys(value).length < 1) return;
        const newSettings = Object.assign({},
            scratchAddons.globalState.addonSettings[id],
            value);
        await scratchAddons.methods.changeAddonSettings(id, newSettings);
    }
    render () {
        return (
            <AddonsComponent
                loading={this.state.loading}
                data={this.state.data}
                onChangeState={this.handleChangeState}
                {...this.props}
            />
        );
    }
}

export default injectIntl(AddonsModal);
