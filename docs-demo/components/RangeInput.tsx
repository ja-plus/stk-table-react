import React from 'react';

export const RangeInput: React.FC<{
    label: string;
    suffix?: string;
    value?: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}> = ({ label, suffix, value, onChange, ...rest }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>
        <span>{label}</span>
        <input type="range" value={value} onChange={e => onChange?.(Number(e.target.value))} {...rest} />
        <span>{value} {suffix}</span>
    </div>
);

export default RangeInput;
