import React from 'react';
import PropTypes from 'prop-types';
import styles from './color-picker.css';

interface ColorPickerProps {
    disabled?: boolean;
    value: string;
    onChange: (color: string) => void;
}

const ColorPicker = (props: ColorPickerProps) => {
    return (
        <input
            type="color"
            value={props.value}
            className={styles.picker}
            disabled={props.disabled}
            onChange={(e) => {
                props.onChange(e.target.value);
            }}
        />
    );
};

ColorPicker.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default ColorPicker;
