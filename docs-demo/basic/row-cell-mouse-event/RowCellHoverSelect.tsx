import { useRef, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

const dataSource = [
    { name: `Jack`, age: 18, address: `Beijing Forbidden City `, gender: 'male' },
    { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
    { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
    { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
    { name: `Disabled`, age: 0, address: `Unknown`, gender: 'male' },
];

export default function RowCellHoverSelect() {
    const { t } = useI18n();
    const stkTableRef = useRef<StkTableRef<any>>(null);

    const [stripe, setStripe] = useState(true);
    const [rowActiveEnabled, setRowActiveEnabled] = useState(true);
    const [rowActiveRevokable, setRowActiveRevokable] = useState(true);
    const [cellActive, setCellActive] = useState(true);
    const [rowHover, setRowHover] = useState(true);
    const [cellHover, setCellHover] = useState(true);
    const [selectedCellRevokable, setSelectedCellRevokable] = useState(true);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    const rowActive = {
        enabled: rowActiveEnabled,
        disabled: (row: any) => row.name === 'Disabled',
        revokable: rowActiveRevokable,
    };

    function setCurrentRow(rowKeyOrRow: string | undefined | any) {
        stkTableRef.current?.setCurrentRow(rowKeyOrRow);
    }

    function setSelectedCell(row: any, col: StkTableColumn<any>) {
        stkTableRef.current?.setSelectedCell(row, col);
    }

    return (
        <div>
            <CheckItem checked={stripe} onChange={setStripe} text={'stripe' + '(' + t('zebraStripes') + ')'} />
            <br />
            <CheckItem checked={rowActiveEnabled} onChange={setRowActiveEnabled} text={'rowActive' + '(' + t('rowSelectedState') + ')'} />
            <CheckItem checked={cellActive} onChange={setCellActive} text={'cellActive' + '(' + t('cellSelectedState') + ')'} />
            <br />
            <CheckItem checked={rowHover} onChange={setRowHover} text={'rowHover' + '(' + t('rowHoverState') + ')'} />
            <CheckItem checked={cellHover} onChange={setCellHover} text={'cellHover' + '(' + t('cellHoverState') + ')'} />
            <br />
            <CheckItem
                checked={rowActiveRevokable}
                onChange={setRowActiveRevokable}
                text={'rowActive.revokable(' + t('rowSelectedStateCancellable') + ')'}
            />
            <br />
            <CheckItem
                checked={selectedCellRevokable}
                onChange={setSelectedCellRevokable}
                text={'selectedCellRevokable' + '(' + t('cellSelectedStateCancellable') + ')'}
            />
            <hr />
            <button className="btn" onClick={() => setCurrentRow('Jack')}>
                setCurrentRow('Jack')
            </button>
            <button className="btn" onClick={() => setSelectedCell(dataSource[0], columns[1])}>
                setSelectedCell('Jack-age')
            </button>
            <button className="btn" onClick={() => setCurrentRow('Disabled')}>
                setCurrentRow('Disabled')
            </button>

            <StkTable
                ref={stkTableRef}
                rowKey="name"
                stripe={stripe}
                rowActive={rowActive}
                cellActive={cellActive}
                rowHover={rowHover}
                cellHover={cellHover}
                selectedCellRevokable={selectedCellRevokable}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
    );
}
