import { useMemo, useRef, useState } from 'react';
import ContextMenu from 'ja-contextmenu';
import type { MenuOption } from 'ja-contextmenu/lib/types/MenuOption';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../src/StkTable/index';

import 'ja-contextmenu/styles/dark.css';

type Data = {
    id: number;
    name: string;
    age: number;
    department: string;
};

export default function ContextMenuDemo() {
    const stkTableRef = useRef<StkTableRef<Data>>(null);

    const columns: StkTableColumn<Data>[] = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', width: 120 },
        { title: 'Age', dataIndex: 'age', width: 80 },
        { title: 'Department', dataIndex: 'department', width: 120 },
    ];

    const [dataSource, setDataSource] = useState<Data[]>([
        { id: 1, name: 'Zhang San', age: 18, department: 'Technical Department' },
        { id: 2, name: 'Li Si', age: 20, department: 'Marketing Department' },
        { id: 3, name: 'Wang Wu', age: 22, department: 'Technical Department' },
        { id: 4, name: 'Zhao Liu', age: 24, department: 'Finance Department' },
        { id: 5, name: 'Qian Qi', age: 26, department: 'Technical Department' },
    ]);

    const menu = useMemo(() => {
        const contextMenu = new ContextMenu({
            theme: () => (document.documentElement.classList.contains('dark') ? 'dark' : ('' as any)),
        });
        const menuOption: MenuOption<any> = {
            items: [
                {
                    label: 'View Details',
                    onclick: (e: Event, payload: Data) => {
                        alert(`View details of ${payload.name}`);
                    },
                },
                {
                    label: (payload: Data) => `Delete ${payload.name}`,
                    onclick: (e: Event, payload: Data) => {
                        if (confirm(`Are you sure to delete the record of ${payload.name}?`)) {
                            setDataSource(prev => prev.filter(item => item.id !== payload.id));
                        }
                    },
                },
            ],
        };
        return contextMenu.create(menuOption);
    }, []);

    function onRowMenu(event: React.MouseEvent, row: Data) {
        stkTableRef.current?.setCurrentRow(row);
        menu.show(event.nativeEvent, row);
    }

    return (
        <StkTable
            ref={stkTableRef}
            style={{ height: 200 }}
            rowKey="id"
            columns={columns}
            dataSource={dataSource}
            onRowMenu={onRowMenu}
        ></StkTable>
    );
}
