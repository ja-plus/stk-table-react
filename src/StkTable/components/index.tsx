import React from 'react';

export const SortIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 16 16">
        <polygon className="arrow-up" fill="#757699" points="8 2 4.8 6 11.2 6"></polygon>
        <polygon className="arrow-down" transform="translate(8, 12) rotate(-180) translate(-8, -12) " points="8 10 4.8 14 11.2 14"></polygon>
    </svg>
);

export const TriangleIcon: React.FC<{ onClick?: (e: React.MouseEvent) => void }> = ({ onClick }) => (
    <div
        className="stk-fold-icon"
        onClick={e => {
            e.stopPropagation();
            onClick?.(e);
        }}
    ></div>
);

export const DragHandle: React.FC<{ onDragStart?: (e: React.DragEvent) => void }> = ({ onDragStart }) => (
    <span className="drag-row-handle" draggable="true" onDragStart={onDragStart}>
        <svg viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor">
            <path d="M640 853.3a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m-256 0a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m256-256a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m-256 0a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m256-256a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3zM384 341.3a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z"></path>
        </svg>
    </span>
);

export const TreeNodeCell: React.FC<{
    col: any;
    row: any;
    onTriangleClick?: (e: React.MouseEvent) => void;
}> = ({ col, row, onTriangleClick }) => (
    <div title={row[col.dataIndex] || ''} style={row.__T_LV__ ? { paddingLeft: `${row.__T_LV__ * 16}px` } : undefined}>
        {row.children !== void 0 && <TriangleIcon onClick={onTriangleClick} />}
        <span style={!row.children ? { paddingLeft: '16px' } : undefined}>{row[col.dataIndex] ?? ''}</span>
    </div>
);
