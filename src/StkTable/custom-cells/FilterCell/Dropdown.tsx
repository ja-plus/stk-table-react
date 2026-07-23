import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../types';
import type { FilterOption } from './types';

export type DropdownApi = {
    readonly visible: boolean;
    show: (pos: { x: number; y: number; height?: number }, options: FilterOption[], onConfirm: (values: any[]) => void) => void;
    hide: () => void;
    setTheme: (t: 'light' | 'dark') => void;
};

const DROPDOWN_DEFAULT_WIDTH = 300; // 默认宽度（用于首次计算）
const DROPDOWN_DEFAULT_HEIGHT = 400; // 默认高度（用于首次计算）
const PADDING = 6; // 与屏幕边缘的安全距离

const Dropdown = forwardRef<DropdownApi>((_props, ref) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [options, setOptions] = useState<FilterOption[]>([]);
    const [checkedSet, setCheckedSet] = useState<Set<any>>(() => new Set());

    const dropdownEl = useRef<HTMLDivElement | null>(null);
    const onConfirmRef = useRef<(values: any[]) => void>(() => {});
    const pendingPosRef = useRef<{ x: number; y: number; height?: number } | null>(null);

    // 与 state 同步的 ref，供稳定回调读取
    const visibleRef = useRef(visible);
    visibleRef.current = visible;
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const checkedSetRef = useRef(checkedSet);
    checkedSetRef.current = checkedSet;

    function getDropdownSize(): [number, number] {
        if (!dropdownEl.current) {
            return [DROPDOWN_DEFAULT_WIDTH, DROPDOWN_DEFAULT_HEIGHT];
        }
        const rect = dropdownEl.current.getBoundingClientRect();
        return [rect.width || DROPDOWN_DEFAULT_WIDTH, rect.height || DROPDOWN_DEFAULT_HEIGHT];
    }

    function calculatePosition(docPos: { x: number; y: number; height?: number }) {
        // docPos 是相对于文档的坐标（已包含滚动偏移）
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;

        const [dropdownWidth, dropdownHeight] = getDropdownSize();

        let finalX = docPos.x;
        let finalY = docPos.y;

        // 检测是否超出右边界（相对于视口）
        const relativeX = docPos.x - scrollLeft;
        if (relativeX + dropdownWidth > viewportWidth - PADDING) {
            finalX = viewportWidth - dropdownWidth - PADDING + scrollLeft;
        }

        // 检测是否超出下边界（相对于视口）
        const relativeY = docPos.y - scrollTop;
        if (relativeY + dropdownHeight > viewportHeight - PADDING) {
            // 如果下方空间不足，尝试在上方显示
            const triggerHeight = docPos.height || 30;
            if (relativeY - triggerHeight >= dropdownHeight + PADDING) {
                // 上方空间足够，在触发元素上方显示
                finalY = docPos.y - triggerHeight - dropdownHeight - PADDING;
            } else {
                // 上方空间也不足，使用最大可用空间（从视口顶部开始）
                finalY = PADDING + scrollTop;
            }
        }

        // 确保不会超出左边界和上边界
        finalX = Math.max(PADDING + scrollLeft, finalX);
        finalY = Math.max(PADDING + scrollTop, finalY);

        return { x: finalX, y: finalY };
    }

    const hide = useCallback(() => {
        setVisible(false);
        setOptions([]);
        setCheckedSet(new Set());
    }, []);

    const show = useCallback((pos: { x: number; y: number; height?: number }, opt: FilterOption[], onConfirm: (values: any[]) => void) => {
        if (dropdownEl.current) {
            dropdownEl.current.style.visibility = 'hidden';
        }
        onConfirmRef.current = onConfirm;
        pendingPosRef.current = pos;
        setOptions(opt || []);
        setCheckedSet(new Set((opt || []).filter(o => o.selected).map(o => o.value)));
        setVisible(true);
    }, []);

    // 渲染后计算位置（此时才能拿到下拉框实际尺寸）
    useLayoutEffect(() => {
        if (visible && pendingPosRef.current) {
            setPosition(calculatePosition(pendingPosRef.current));
            pendingPosRef.current = null;
            if (dropdownEl.current) {
                dropdownEl.current.style.visibility = 'visible';
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, options]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!visibleRef.current || dropdownEl.current?.contains(e.target as Node)) return;
            hide();
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [hide]);

    function updateChecked(checked: boolean, row: FilterOption) {
        setCheckedSet(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(row.value);
            } else {
                next.delete(row.value);
            }
            return next;
        });
    }

    function confirm() {
        optionsRef.current.forEach(opt => (opt.selected = checkedSetRef.current.has(opt.value)));
        onConfirmRef.current(Array.from(checkedSetRef.current));
        hide();
    }

    function handleClear() {
        optionsRef.current.forEach(opt => (opt.selected = false));
        onConfirmRef.current([]);
        hide();
    }

    function handleRowClick(_e: any, row: FilterOption) {
        const selected = checkedSetRef.current.has(row.value);
        updateChecked(!selected, row);
    }

    const columns = useMemo<StkTableColumn<FilterOption>[]>(
        () => [
            {
                title: '',
                dataIndex: 'value',
                width: 30,
                className: 'stk-filter-dropdown-checkbox',
                customCell: (cellProps: any) => <input type="checkbox" checked={checkedSet.has(cellProps.row?.value)} readOnly />,
            },
            { title: '', dataIndex: 'label' },
        ],
        [checkedSet],
    );

    useImperativeHandle(
        ref,
        () => ({
            get visible() {
                return visibleRef.current;
            },
            show,
            hide,
            setTheme: (t: 'light' | 'dark') => setTheme(t),
        }),
        [show, hide],
    );

    return (
        <div
            ref={dropdownEl}
            className={`stk-filter-dropdown stk-filter-dropdown--${theme}`}
            style={{
                top: position.y + 'px',
                left: position.x + 'px',
                display: visible ? undefined : 'none',
            }}
            onClick={e => e.stopPropagation()}
        >
            <StkTable
                rowKey="value"
                headless
                virtual
                noDataFull
                theme={theme}
                rowActive={false}
                rowHeight={20}
                bordered={false}
                columns={columns}
                dataSource={options}
                onRowClick={handleRowClick}
            />
            <footer>
                <button onClick={handleClear}>↺</button>
                <button onClick={confirm}>✓</button>
            </footer>
        </div>
    );
});

Dropdown.displayName = 'StkFilterDropdown';

let dropdownApi: DropdownApi | null = null;

export function getDropdownIns(): Promise<DropdownApi> {
    if (!dropdownApi) {
        const div = document.createElement('div');
        div.classList.add('stk-filter-dropdown-wrapper');
        document.body.appendChild(div);

        const root = createRoot(div);
        const apiRef: { current: DropdownApi | null } = { current: null };
        root.render(
            <Dropdown
                ref={r => {
                    apiRef.current = r;
                }}
            />,
        );

        return new Promise<DropdownApi>(resolve => {
            const check = () => {
                if (apiRef.current) {
                    dropdownApi = apiRef.current;
                    resolve(apiRef.current);
                } else {
                    setTimeout(check, 0);
                }
            };
            check();
        });
    }
    return Promise.resolve(dropdownApi);
}
