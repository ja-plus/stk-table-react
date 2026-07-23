/**
 * 判断当前语言是否为中文。
 * 直接读取 documentElement.lang，可在模块顶层安全调用（非 hook）。
 */
export function getIsZH() {
    return (document.documentElement.lang || 'en') === 'zh';
}
