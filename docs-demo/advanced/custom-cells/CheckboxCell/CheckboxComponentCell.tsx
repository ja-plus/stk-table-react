import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { StkTable } from '../../../StkTable';
import { createCheckboxCell } from '../../../../src/StkTable/index';

type StyledCheckboxProps = {
    checked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
};

/**
 * 创建一个自定义样式的 checkbox 组件（模拟不同 UI 库的 checkbox）
 * React 版 createCheckboxCell 会向自定义组件透传 checked / indeterminate / onChange
 */
function createStyledCheckbox(accent: string) {
    return function StyledCheckbox(props: StyledCheckboxProps) {
        return (
            <label className="stk-demo-checkbox" style={{ '--accent': accent } as CSSProperties}>
                <input
                    type="checkbox"
                    checked={!!props.checked}
                    ref={el => {
                        if (el) el.indeterminate = !!props.indeterminate;
                    }}
                    onChange={e => props.onChange?.(e.target.checked)}
                />
                <span className="stk-demo-checkbox__box" />
            </label>
        );
    };
}

const BlueCheckbox = createStyledCheckbox('#1890ff');
const GreenCheckbox = createStyledCheckbox('#52c41a');
const OrangeCheckbox = createStyledCheckbox('#fa8c16');
const PurpleCheckbox = createStyledCheckbox('#722ed1');

export default function CheckboxComponentCellDemo() {
    const [dataSource, setDataSource] = useState<Record<string, any>[]>([
        { id: 1, name: 'Alice', age: 25, address: 'Haidian District, Beijing', _isChecked: true },
        { id: 2, name: 'Bob', age: 28, address: 'Pudong New Area, Shanghai', _isChecked: true },
        { id: 3, name: 'Charlie', age: 32, address: 'Tianhe District, Guangzhou' },
        { id: 4, name: 'David', age: 29, address: 'Nanshan District, Shenzhen' },
        { id: 5, name: 'Eve', age: 27, address: 'Xihu District, Hangzhou' },
        ...Array.from({ length: 15 }, (_, i) => ({
            id: i + 6,
            name: `User ${i + 6}`,
            age: 25 + i,
            address: `Address ${i + 6}`,
        })),
    ]);

    const refresh = () => setDataSource(prev => [...prev]);

    // 蓝色主题 checkbox 列
    const { CheckboxCell: BlueCell, CheckboxAllCell: BlueAllCell } = useMemo(
        () =>
            createCheckboxCell({
                field: '_isChecked',
                checkboxComponent: BlueCheckbox,
                onChange: (checked: boolean, row: any) => {
                    console.log('blue 行选中变更:', checked, row.name);
                    refresh();
                },
                onSelectAll: (checked: boolean) => {
                    console.log('blue 全选变更:', checked);
                    refresh();
                },
            }),
        [],
    );
    // 绿色主题 Checkbox 列
    const { CheckboxCell: GreenCell, CheckboxAllCell: GreenAllCell } = useMemo(
        () =>
            createCheckboxCell({
                field: '_isChecked',
                checkboxComponent: GreenCheckbox,
                onChange: (checked: boolean, row: any) => {
                    console.log('green 行选中变更:', checked, row.name);
                    refresh();
                },
                onSelectAll: (checked: boolean) => {
                    console.log('green 全选变更:', checked);
                    refresh();
                },
            }),
        [],
    );
    // 橙色主题 Checkbox 列
    const { CheckboxCell: OrangeCell, CheckboxAllCell: OrangeAllCell } = useMemo(
        () =>
            createCheckboxCell({
                field: '_isChecked',
                checkboxComponent: OrangeCheckbox,
                onChange: (checked: boolean, row: any) => {
                    console.log('orange 行选中变更:', checked, row.name);
                    refresh();
                },
                onSelectAll: (checked: boolean) => {
                    console.log('orange 全选变更:', checked);
                    refresh();
                },
            }),
        [],
    );
    // 紫色主题 Checkbox 列
    const { CheckboxCell: PurpleCell, CheckboxAllCell: PurpleAllCell } = useMemo(
        () =>
            createCheckboxCell({
                field: '_isChecked',
                checkboxComponent: PurpleCheckbox,
                onChange: (checked: boolean, row: any) => {
                    console.log('purple 行选中变更:', checked, row.name);
                    refresh();
                },
                onSelectAll: (checked: boolean) => {
                    console.log('purple 全选变更:', checked);
                    refresh();
                },
            }),
        [],
    );

    const columns: any[] = useMemo(
        () => [
            {
                key: 'blue',
                title: 'Blue',
                children: [
                    {
                        dataIndex: 'chkBlue',
                        customCell: BlueCell,
                        customHeaderCell: BlueAllCell,
                    },
                ],
            },
            {
                key: 'green',
                title: 'Green',
                children: [
                    {
                        dataIndex: 'chkGreen',
                        customCell: GreenCell,
                        customHeaderCell: GreenAllCell,
                    },
                ],
            },
            {
                key: 'orange',
                title: 'Orange',
                children: [
                    {
                        dataIndex: 'chkOrange',
                        customCell: OrangeCell,
                        customHeaderCell: OrangeAllCell,
                    },
                ],
            },
            {
                key: 'purple',
                title: 'Purple',
                children: [
                    {
                        dataIndex: 'chkPurple',
                        customCell: PurpleCell,
                        customHeaderCell: PurpleAllCell,
                    },
                ],
            },
        ],
        [BlueCell, BlueAllCell, GreenCell, GreenAllCell, OrangeCell, OrangeAllCell, PurpleCell, PurpleAllCell],
    );

    return (
        <div className="checkbox-component-cell-demo">
            <StkTable
                style={{ maxHeight: 400 }}
                rowKey="id"
                virtual
                bordered
                columns={columns}
                dataSource={dataSource}
            />
            <style>{`
.checkbox-component-cell-demo .stk-demo-checkbox {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}
.checkbox-component-cell-demo .stk-demo-checkbox input {
    display: none;
}
.checkbox-component-cell-demo .stk-demo-checkbox__box {
    width: 16px;
    height: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 3px;
    position: relative;
    box-sizing: border-box;
    transition: all 0.2s;
}
.checkbox-component-cell-demo .stk-demo-checkbox input:checked + .stk-demo-checkbox__box {
    background-color: var(--accent);
    border-color: var(--accent);
}
.checkbox-component-cell-demo .stk-demo-checkbox input:checked + .stk-demo-checkbox__box::after {
    content: '';
    position: absolute;
    left: 4.5px;
    top: 1.5px;
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
.checkbox-component-cell-demo .stk-demo-checkbox input:indeterminate + .stk-demo-checkbox__box {
    background-color: var(--accent);
    border-color: var(--accent);
}
.checkbox-component-cell-demo .stk-demo-checkbox input:indeterminate + .stk-demo-checkbox__box::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 6.5px;
    width: 8px;
    height: 2px;
    background: #fff;
}
`}</style>
        </div>
    );
}
