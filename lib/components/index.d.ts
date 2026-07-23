import { default as React } from 'react';

export declare const SortIcon: React.FC<{
    className?: string;
}>;
export declare const TriangleIcon: React.FC<{
    onClick?: (e: React.MouseEvent) => void;
}>;
export declare const DragHandle: React.FC<{
    onDragStart?: (e: React.DragEvent) => void;
}>;
export declare const TreeNodeCell: React.FC<{
    col: any;
    row: any;
    onTriangleClick?: (e: React.MouseEvent) => void;
}>;
