import { useVitepressData } from '../useVitepress';
import { en } from './en';
import { zh } from './zh';
import { ja } from './ja';
import { ko } from './ko';

interface LanguagePack {
    [key: string]: string;
}

interface I18nConfig {
    [locale: string]: LanguagePack;
}

export function useI18n(localeConfig: I18nConfig = { en, zh, ja, ko }) {
    const { lang, isDark } = useVitepressData();

    const t = (key: string, defaultValue: string = key): string => {
        const currentLang = lang;
        return localeConfig[currentLang]?.[key] || localeConfig.en?.[key] || defaultValue;
    };

    const getCurrentLang = (): string => {
        return lang;
    };

    const isZH = lang === 'zh';
    const isEN = lang === 'en';
    const isKO = lang === 'ko';

    return {
        t,
        getCurrentLang,
        isZH,
        isEN,
        isKO,
        isDark,
    };
}
