import { FilterOption } from './types';

export type DropdownApi = {
    readonly visible: boolean;
    show: (pos: {
        x: number;
        y: number;
        height?: number;
    }, options: FilterOption[], onConfirm: (values: any[]) => void) => void;
    hide: () => void;
    setTheme: (t: 'light' | 'dark') => void;
};
export declare function getDropdownIns(): Promise<DropdownApi>;
