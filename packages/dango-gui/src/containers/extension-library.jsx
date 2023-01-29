import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    },
    extensionUrl: {
        defaultMessage: 'Enter the URL of the extension',
        description: 'Prompt for unoffical extension url',
        id: 'gui.extensionLibrary.extensionUrl'
    }
});

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            uploading: false
        };
        bindAll(this, [
            'handleItemSelect',
            'handleUpload',
            'loadAsDataUrl'
        ]);
    }
    handleItemSelect (item) {
        const id = item.extensionId;
        let url = item.extensionURL ? item.extensionURL : id;
        if (!item.disabled && !id) {
            // eslint-disable-next-line no-alert
            url = prompt(this.props.intl.formatMessage(messages.extensionUrl));
        }
        if (id && !item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(url)) {
                this.props.onCategorySelected(id);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url).then(() => {
                    this.props.onCategorySelected(id);
                });
            }
        }
    }
    loadAsDataUrl (file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(file, 'utf8');
            reader.onload = () => {
                resolve(reader.result);
            };
        });
    }
    handleUpload () {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', '.js,.ccx');
        input.setAttribute('multiple', true);
        input.onchange = async (event) => {
            const files = event.target.files;
            this.setState({isUploading: true});
            for (const file of files) {
                const fileName = file.name;
                const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
                switch (fileExt) {
                case 'js': {
                    // Load as dataURI
                    try {
                        const result = await this.loadAsDataUrl(file);
                        try {
                            await this.props.vm.extensionManager.loadExtensionURL(result);
                            if (this.props.visible) this.props.onRequestClose();
                        } catch (e) {
                            console.error(e);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    break;
                }
                case 'ccx': {
                    // todo
                    break;
                }
                default: {
                    alert('Unsupported extension format: ' + fileName);
                }
                }
            }
            this.setState({isUploading: false});
        };
        input.click();
    }
    render () {
        const extensionLibraryThumbnailData = extensionLibraryContent.map(extension => ({
            rawURL: extension.iconURL || extensionIcon,
            ...extension
        }));
        return (
            <LibraryComponent
                data={extensionLibraryThumbnailData}
                filterable
                showUploadButton
                id="extensionLibrary"
                isUploading={this.state.isUploading}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onUpload={this.handleUpload}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);
