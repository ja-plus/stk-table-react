import React, { useMemo } from 'react';

export const RadioGroup = <T,>(props: {
    text: string;
    options: { label: string; value: T }[];
    name?: string;
    value?: T;
    onChange?: (value: T | undefined) => void;
}) => {
    const { text, options = [], value, onChange } = props;
    const name = useMemo(() => props.name || Math.random().toString(36).substring(7), [props.name]);
    return (
        <div className="radio-group">
            <span className="main-label" style={{ fontWeight: 'bold' }}>{text}:</span>
            {options.map((option, i) => (
                <label key={i}>
                    <input type="radio" name={name} value={String(option.value)} checked={value === option.value} onChange={() => onChange?.(option.value)} />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    );
};

export default RadioGroup;
