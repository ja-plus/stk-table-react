/**
 * support vitepress env
 */
import { forwardRef } from 'react';
import { StkTable as StkTableBase } from '../src/StkTable';
import type { StkTableProps, StkTableRef } from '../src/StkTable';
import { useVitepressData } from './hooks/useVitepress';
import '../src/StkTable/style.less';

export const StkTable = forwardRef<StkTableRef<any>, StkTableProps<any>>((props, ref) => {
    const { isDark } = useVitepressData();
    const { className, ...rest } = props;
    return (
        <StkTableBase
            ref={ref}
            {...rest}
            theme={isDark ? 'dark' : 'light'}
            className={['vp-raw', className].filter(Boolean).join(' ')}
        />
    );
});

StkTable.displayName = 'StkTable';

export default StkTable;
