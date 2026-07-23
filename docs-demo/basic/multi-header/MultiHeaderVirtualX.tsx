import { useMemo, useState } from 'react';
import { StkTable } from '../../StkTable';
import CheckItem from '../../components/CheckItem';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n/index';

const dataSource = new Array(50).fill(0).map((it, i) => {
    return {
        id: i,
        lv2_1: 'lv2.1',
        lv2_2: 'lv2.2',
        age: i,
        email: i + '@email.com',
    };
});

export default function MultiHeaderVirtualX() {
    const { t } = useI18n();
    const [virtual, setVirtual] = useState(true);
    const [virtualX, setVirtualX] = useState(true);
    const [fixedLeft, setFixedLeft] = useState(true);
    const [fixedRight, setFixedRight] = useState(true);

    const columns = useMemo<StkTableColumn<any>[]>(() => {
        return [
            {
                dataIndex: 'Basic',
                title: t('basic'),
                fixed: fixedLeft ? 'left' : null,
                children: [
                    {
                        dataIndex: 'id',
                        title: t('id'),
                        width: 100,
                        fixed: fixedLeft ? 'left' : null,
                    },
                    {
                        dataIndex: 'lv2',
                        title: t('lv2'),
                        width: 100,
                        fixed: fixedLeft ? 'left' : null,
                        children: [
                            {
                                dataIndex: 'lv2_1',
                                title: t('lv2_1'),
                                width: 100,
                                fixed: fixedLeft ? 'left' : null,
                            },
                            {
                                dataIndex: 'lv2_2',
                                title: t('lv2_2'),
                                width: 100,
                                fixed: fixedLeft ? 'left' : null,
                            },
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
                children: new Array(10).fill(0).map((it, i) => {
                    return {
                        dataIndex: 'other' + i,
                        title: t('other') + ' ' + i,
                        width: 100,
                    };
                }),
            },
            ...new Array(5).fill(0).map((it, i) => {
                return {
                    dataIndex: 'lv1' + i,
                    title: t('lv1') + ' ' + i,
                    width: 100,
                };
            }),
            {
                dataIndex: 'right',
                title: t('right'),
                fixed: fixedRight ? 'right' : null,
                children: [
                    {
                        dataIndex: 'right-1',
                        title: t('right1'),
                        width: 50,
                        fixed: fixedRight ? 'right' : null,
                    },
                    {
                        dataIndex: 'right-2',
                        title: t('right2'),
                        width: 100,
                        fixed: fixedRight ? 'right' : null,
                    },
                ],
            },
        ];
    }, [t, fixedLeft, fixedRight]);

    return (
        <div>
            <CheckItem checked={virtual} onChange={setVirtual} text="virtual" />
            <CheckItem checked={virtualX} onChange={setVirtualX} text="virtual-x(^1.0.0)" />
            <CheckItem checked={fixedLeft} onChange={setFixedLeft} text="fixed-left(Basic)" />
            <CheckItem checked={fixedRight} onChange={setFixedRight} text="fixed-right(right)" />
            <StkTable
                style={{ height: '200px' }}
                rowKey="id"
                fixedColShadow
                virtual={virtual}
                virtualX={virtualX}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
    );
}
