import { useState } from 'react';
import { StkTable } from '../../StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

type Row = { id: number; name: string; age: number; city: string };

const cols = [
    { title: 'ID', dataIndex: 'id', fixed: 'left', width: 50 },
    { title: 'Name', dataIndex: 'name', width: 120 },
    { title: 'Age', dataIndex: 'age', width: 80 },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'City', dataIndex: 'city1', width: 120 },
    { title: 'City', dataIndex: 'city2', width: 120 },
    { title: 'City', dataIndex: 'city3', width: 120 },
    { title: 'City', dataIndex: 'city4', width: 120 },
];

const rows = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User${i + 1}`,
    age: 20 + (i % 30),
    city: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'][i % 4],
}));

function formatCell(row: Row, col: any, raw: any) {
    return raw === null ? '' : String(raw);
}

function formatCurrentRange(ranges: any) {
    if (!ranges || !ranges.length) return '[]';
    const rangesStr = ranges
        .map((r: any) => {
            const idx = r?.index || {};
            const keys = Object.keys(idx);
            if (!keys.length) return '    {\n        "index":{}\n    }';
            const props = keys.map(k => `        "${k}":${JSON.stringify(idx[k])}`);
            props[props.length - 1] += '}';
            return ['    {', '        "index":{', props.join(',\n'), '    }'].join('\n');
        })
        .join(',\n');
    return `[\n${rangesStr}\n]`;
}

export default function AreaSelection() {
    const { t } = useI18n();

    const [keyboard, setKeyboard] = useState(true);
    const [ctrlEnabled, setCtrlEnabled] = useState(true);
    const [shiftEnabled, setShiftEnabled] = useState(true);
    const [highlightCell, setHighlightCell] = useState(true);
    const [highlightRow, setHighlightRow] = useState(false);
    const [currentRange, setCurrentRange] = useState<any>(null);

    return (
        <div style={{ padding: '16px' }}>
            <CheckItem checked={keyboard} onChange={setKeyboard} text={t('keyboardSelect')} />
            <CheckItem checked={ctrlEnabled} onChange={setCtrlEnabled} text={t('ctrlMultiSelect')} />
            <CheckItem checked={shiftEnabled} onChange={setShiftEnabled} text={t('shiftExpandSelect')} />
            <CheckItem checked={highlightCell} onChange={setHighlightCell} text={t('cellHighlight')} />
            <CheckItem checked={highlightRow} onChange={setHighlightRow} text={t('rowHighlight')} />
            <StkTable
                style={{ height: '400px' }}
                rowKey="id"
                stripe
                virtual
                rowActive={false}
                dataSource={rows}
                columns={cols}
                areaSelection={{
                    enabled: true,
                    formatCellForClipboard: formatCell,
                    keyboard,
                    ctrl: ctrlEnabled,
                    shift: shiftEnabled,
                    highlight: {
                        cell: highlightCell,
                        row: highlightRow,
                    },
                }}
                onAreaSelectionChange={setCurrentRange}
            />
            <div style={{ marginTop: '12px' }}>
                <style>{`pre { padding: 8px; }`}</style>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{formatCurrentRange(currentRange)}</pre>
            </div>
        </div>
    );
}
