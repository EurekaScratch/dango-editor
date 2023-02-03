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
    render () {
        return (
            <AddonsComponent
                loading={this.state.loading}
                data={this.state.data}
                {...this.props}
            />
        );
    }
}

AddonsModal.propTypes = {
    
};

export default injectIntl(AddonsModal);
