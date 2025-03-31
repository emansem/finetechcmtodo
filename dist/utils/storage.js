export const StorageKeys = {
    TODOS: 'todos',
    USER: 'user',
    THEME: 'theme',
    AUTH: 'auth',
};
export function getItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    catch (error) {
        console.error(`Error getting item ${key} from localStorage:`, error);
        return null;
    }
}
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error(`Error setting item ${key} in localStorage:`, error);
    }
}
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
    }
    catch (error) {
        console.error(`Error removing item ${key} from localStorage:`, error);
    }
}
//# sourceMappingURL=storage.js.map