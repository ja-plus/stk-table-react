import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable/index';
import { useI18n } from '../../hooks/useI18n/index';

export default function CustomBottom() {
    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    const [dataSource, setDataSource] = useState<any[]>([]);

    function addData() {
        setDataSource(prev => [
            ...prev,
            ...new Array(5).fill(0).map(
                (_, i) =>
                    ({
                        name: `Edward King ${i}`,
                        age: 32,
                        address: `London, Park Lane no. ${i}`,
                        gender: 'male',
                    }) as any,
            ),
        ]);
    }
    function clearData() {
        setDataSource([]);
    }

    return (
        <>
            <button className="btn" onClick={addData}>
                {t('addFiveData')}
            </button>
            <button className="btn" onClick={clearData}>
                {t('clearData')}
            </button>
            <StkTable
                style={{ height: 200 }}
                columns={columns}
                dataSource={dataSource}
                renderCustomBottom={() => (
                    <div className="custom-bottom">
                        <span>{t('customBottom')}</span>
                    </div>
                )}
            ></StkTable>
            <style>{`
                .custom-bottom { text-align: center; padding: 40px 0; }
            `}</style>
        </>
    );
}
