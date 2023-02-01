export interface ThemePrototype {
    [propName: string]: string | number;
}

const defaultSelector = ':root';

export function applyTheme (theme: ThemePrototype, selector?: string) {
    const root = document.querySelector(selector ?? defaultSelector) as (HTMLElement | null);
    if (root === null) {
        console.error(`Theme: selector ${selector ?? defaultSelector} matches null`);
        return;
    }
    for (const propName in theme) {
        const kebabCase =  propName.replace(/[A-Z]/g, (item: string) => {
            return '-'+item.toLowerCase();
        }).trim();
        const value = theme[propName];
        root.style.setProperty(`--${kebabCase}`, String(value));
    }
}

export function getProperty (propName: string,  selector?: string) {
    const root = document.querySelector(selector ?? defaultSelector);
    if (root === null) {
        console.error(`Theme: selector ${selector ?? defaultSelector} matches null`);
        return;
    }
    const computedStyle = getComputedStyle(root);
    const kebabCase =  propName.replace(/[A-Z]/g, (item: string) => {
        return '-'+item.toLowerCase();
    }).trim();
    return computedStyle.getPropertyValue(`--${kebabCase}`);
}
