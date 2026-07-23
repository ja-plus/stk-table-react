import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n/index';

export default function NoDataFull() {
    const { t } = useI18n();
    const [noDataFull, setNoDataFull] = useState(true);
    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];
    return (
        <div>
            <label>
                <input type="checkbox" checked={noDataFull} onChange={e => setNoDataFull(e.target.checked)} />
                <span>{t('noDataFull')}</span>
            </label>
            <StkTable style={{ height: 200 }} noDataFull={noDataFull} columns={columns} dataSource={[]} />
        </div>
    );
}
