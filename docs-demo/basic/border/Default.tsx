import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n/index';

const articleStyle: React.CSSProperties = {
    border: '1px solid var(--vp-c-border)',
    borderRadius: 5,
    padding: 8,
    marginBottom: 8,
};

export default function BorderDefault() {
    const { t } = useI18n();
    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];
    const dataSource = new Array(3).fill(0).map((_, index) => ({
        name: `Jack ${index}`,
        age: 18 + index,
        address: `Beijing Forbidden City ${index}`,
        gender: index % 2 === 0 ? 'male' : 'female',
    }));

    const borders: (true | false | 'h' | 'v' | 'body-v' | 'body-h')[] = [true, false, 'h', 'v', 'body-v', 'body-h'];

    return (
        <div>
            {borders.map(b => (
                <article key={String(b)} style={articleStyle}>
                    <header>bordered={String(b)}</header>
                    <StkTable bordered={b} columns={columns} dataSource={dataSource} />
                </article>
            ))}
        </div>
    );
}
