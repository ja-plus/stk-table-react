import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

const dataSource = new Array(50).fill(0).map((it, i) => {
    return {
        id: i,
        lv2_1: 'lv2.1',
        lv2_2: 'lv2.2',
        age: i,
        email: i + '@email.com',
    };
});

export default function MultiHeaderFixed() {
    const { t } = useI18n();

    const columns: StkTableColumn<any>[] = [
        {
            dataIndex: 'Basic',
            title: t('basic'),
            fixed: 'left',
            children: [
                { dataIndex: 'id', title: t('id'), width: 100, fixed: 'left' },
                {
                    dataIndex: 'lv2',
                    title: t('lv2'),
                    fixed: 'left',
                    width: 100,
                    children: [
                        { dataIndex: 'lv2_1', title: t('lv2_1'), width: 100, fixed: 'left' },
                        { dataIndex: 'lv2_2', title: t('lv2_2'), width: 100, fixed: 'left' },
                    ],
                },
            ],
        },
        {
            dataIndex: 'age',
            title: t('age'),
            width: '50px',
            children: [
                { dataIndex: 'id3', title: t('id'), width: 50 },
                {
                    dataIndex: 'lv5',
                    title: t('lv2'),
                    width: 100,
                },
            ],
        },
        { dataIndex: 'email', title: t('email'), width: '130px' },
        {
            dataIndex: 'other',
            title: t('other'),
            children: new Array(2).fill(0).map((it, i) => {
                return {
                    dataIndex: 'other' + i,
                    title: t('other') + ' ' + i,
                    width: 100,
                };
            }),
        },
        {
            dataIndex: 'right',
            title: t('right'),
            fixed: 'right',
            children: [
                { dataIndex: 'right-1', title: t('right1'), width: 50, fixed: 'right' },
                { dataIndex: 'right-2', title: t('right2'), width: 100, fixed: 'right' },
            ],
        },
    ];

    return <StkTable style={{ height: '200px' }} rowKey="id" fixedColShadow virtual columns={columns} dataSource={dataSource} />;
}
