import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import ClipCCExtension from 'clipcc-extension';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {addLocales, updateLocale} from '../reducers/locales';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';
import extensionTags from '../lib/libraries/dango-extension-tags';

import JSZip from 'jszip';
import vm from 'vm';

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
                    let info, instance;
                    try {
                        const zipData = await JSZip.loadAsync(file);
                        // Load info
                        if ('info.json' in zipData.files) {
                            const content = await zipData.files['info.json'].async('text');
                            info = JSON.parse(content);
                            if (ClipCCExtension.extensionManager.exist(info.id)) {
                                break;
                            }
                        } else {
                            throw new Error('Cannot find \'main.js\' in ccx extension');
                        }
                        if ('main.js' in zipData.files) {
                            // global exposure, at least for now :(
                            if (!window.ClipCCExtension) {
                                const apiInstance = {
                                    gui: {},
                                    vm: this.props.vm.ccExtensionAPI,
                                    blocks: {}
                                };
                                ClipCCExtension.api.registExtensionAPI(apiInstance);
                                window.ClipCCExtension = ClipCCExtension;
                            }
                            const script = new vm.Script(await zipData.files['main.js'].async('text'));
                            const ExtensionPrototype = script.runInThisContext();
                            instance = new ExtensionPrototype();
                        }
                        
                        // Load locale
                        const locale = {};
                        for (const fileName in zipData.files) {
                            const result = fileName.match(/^locales\/([A-Za-z0-9_-]+).json$/);
                            if (result) {
                                locale[result[1]] = JSON.parse(await zipData.files[fileName].async('text'));
                            }
                        }
                        if (info.default_language && locale.hasOwnProperty(info.default_language)) {
                            // default language param
                            locale.default = locale[info.default_language];
                        } else {
                            locale.default = locale.en;
                        }
                        this.props.addLocales(locale);
                        this.props.updateLocale();
                        ClipCCExtension.extensionManager.addInstance(info.id, info, instance);
                            ClipCCExtension.extensionManager.loadExtensionsWithMode(
                            [info],
                            extension => this.props.vm.extensionManager.loadExtensionURL(extension)
                        );
            return;
                    } catch (e) {
                        console.error(e);
                    }
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
                tags={extensionTags}
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
    addLocales: PropTypes.func.isRequired,
    updateLocale: PropTypes.func.isRequired,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

const mapDispatchToProps = dispatch => ({
    addLocales: (locales) => dispatch(addLocales(locales)),
    updateLocale: () => dispatch(updateLocale())
});

export default injectIntl(connect(
    undefined,
    mapDispatchToProps
)(ExtensionLibrary));
