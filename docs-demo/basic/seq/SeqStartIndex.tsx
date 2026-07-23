import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n/index';

export default function SeqStartIndex() {
    const { t } = useI18n();
    const columns: StkTableColumn<any>[] = [
        { type: 'seq', width: 50, dataIndex: '', title: t('seq') },
        { title: t('name'), dataIndex: 'name', sorter: true },
        { title: t('age'), dataIndex: 'age', sorter: true },
        { title: t('address'), dataIndex: 'address', sorter: true },
        { title: t('gender'), dataIndex: 'gender', sorter: true },
    ];
    const dataSource = new Array(100).fill(0).map((_, index) => ({
        name: `Jack ${index}`,
        age: 18 + index,
        address: `Beijing Forbidden City ${index}`,
        gender: index % 2 === 0 ? 'male' : 'female',
    }));
    return <StkTable style={{ height: 200 }} seqConfig={{ startIndex: 10 }} columns={columns} virtual dataSource={dataSource} />;
}
