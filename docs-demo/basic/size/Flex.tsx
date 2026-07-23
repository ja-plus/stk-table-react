import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import RangeInput from '../../components/RangeInput';
import { useI18n } from '../../hooks/useI18n';
import { useVitepressData } from '../../hooks/useVitepress';

const dataSource = new Array(20).fill(0).map((_, index) => {
    return {
        name: `Jack ${index}`,
        age: 18 + index,
        address: `Beijing Forbidden City ${index}`,
        gender: index % 2 === 0 ? 'male' : 'female',
    };
});

export default function Flex() {
    const { isDark } = useVitepressData();
    const { t } = useI18n();

    const [height, setHeight] = useState(150);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    return (
        <div>
            <style>{`
                .flex-demo-article { display: flex; flex-direction: column; border: 1px solid var(--coot-demo-box-border); }
                .flex-demo-article header { min-height: 30px; background: var(--coot-demo-box-border); display: flex; align-items: center; padding: 0 12px; font-weight: bold; }
                .flex-demo-article .stk-table { flex: 1; height: 0; }
            `}</style>
            <RangeInput value={height} onChange={setHeight} min={100} max={800} label={t('height')} suffix="px" />
            <article className={'flex-demo-article' + (isDark ? ' dark' : '')} style={{ height: height + 'px' }}>
                <header>Flex Content</header>
                <StkTable columns={columns} dataSource={dataSource} />
            </article>
        </div>
    );
}
