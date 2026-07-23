import '@testing-library/jest-dom';

// jsdom 不支持 matchMedia，组件内 isTouchPrimaryDevice 需要
if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

// jsdom 不支持 ResizeObserver，滚动条尺寸监听需要
if (typeof window !== 'undefined' && !(window as any).ResizeObserver) {
    (window as any).ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}
