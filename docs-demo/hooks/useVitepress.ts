import { useEffect, useState } from 'react';

/**
 * React 版 vitepress 主题数据获取。
 *
 * vitepress-demo-plugin 通过独立的 React root 渲染 demo，
 * 与 vitepress（Vue）的 provide/inject 上下文隔离，
 * 因此无法使用 vitepress 的 useData()。
 * 这里改为直接读取 documentElement 上的 class / lang，
 * 并通过 MutationObserver 保持响应式。
 */
export function useVitepressData() {
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    const [lang, setLang] = useState(() => document.documentElement.lang || 'en');

    useEffect(() => {
        const update = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
            setLang(document.documentElement.lang || 'en');
        };
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'lang'],
        });
        return () => observer.disconnect();
    }, []);

    return { isDark, lang };
}
