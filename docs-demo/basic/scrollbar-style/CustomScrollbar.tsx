import { StkTable } from '../../StkTable';
import { useI18n } from '../../hooks/useI18n';

const generateData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Name${i + 1}`,
        age: Math.floor(Math.random() * 50) + 18,
        email: `user${i + 1}@example.com`,
        address: `Address${Math.floor(Math.random() * 1000) + 1}`,
        phone: `138${Math.floor(Math.random() * 100000000) + 100000000}`,
        company: `Company${i + 1}`,
        department: `Department${i + 1}`,
        position: `Position${i + 1}`,
        salary: Math.floor(Math.random() * 100000) + 50000,
    }));
};

const dataSource = generateData(100);

export default function CustomScrollbar() {
    const { t } = useI18n();

    const columns = [
        { dataIndex: 'id', title: t('ID'), width: 80 },
        { dataIndex: 'name', title: t('Name'), width: 120 },
        { dataIndex: 'age', title: t('Age'), width: 80 },
        { dataIndex: 'email', title: t('Email'), width: 200 },
        { dataIndex: 'address', title: t('Address'), width: 250 },
        { dataIndex: 'phone', title: t('Phone'), width: 150 },
        { dataIndex: 'company', title: t('Company'), width: 200 },
        { dataIndex: 'department', title: t('Department'), width: 150 },
        { dataIndex: 'position', title: t('Position'), width: 150 },
        { dataIndex: 'salary', title: t('Salary'), width: 120 },
        { dataIndex: 'id', title: t('ID'), width: 80 },
        { dataIndex: 'name', title: t('Name'), width: 120 },
        { dataIndex: 'age', title: t('Age'), width: 80 },
        { dataIndex: 'email', title: t('Email'), width: 200 },
        { dataIndex: 'address', title: t('Address'), width: 250 },
        { dataIndex: 'phone', title: t('Phone'), width: 150 },
    ];

    return (
        <div className="demo-container">
            <style>{`
                .demo-container { display: flex; flex-direction: column; gap: 20px; }
                .demo-item { padding: 20px; border-radius: 8px; }
                .demo-item h4 { margin: 0 0 10px 0; font-size: 16px; }
            `}</style>
            <div className="demo-item">
                <h4>scrollbar</h4>
                <StkTable style={{ height: '200px' }} virtual scrollbar columns={columns} dataSource={dataSource} />
            </div>
            <div className="demo-item">
                <h4>{`:scrollbar="{ width: 12, height: 12 }"`}</h4>
                <StkTable style={{ height: '200px' }} virtual scrollbar={{ width: 12, height: 12 }} columns={columns} dataSource={dataSource} />
            </div>
        </div>
    );
}
