import React from 'react';

export const CheckItem: React.FC<{
    text?: string;
    checked?: boolean;
    onChange?: (value: boolean) => void;
}> = ({ text = '--', checked, onChange }) => (
    <label>
        <input type="checkbox" checked={!!checked} onChange={e => onChange?.(e.target.checked)} />
        <span>{text}</span>
    </label>
);

export default CheckItem;
