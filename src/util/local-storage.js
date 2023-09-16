// Kalo pake SSR -> NextJs
export const getStorageData = (keyName) => {
    if (typeof window !== 'undefined') {
        const savedItem = localStorage.getItem(keyName);
        const parsedItem = JSON.parse(savedItem);
        return parsedItem;
    }
};

export const saveStorageData = (keyName, value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(keyName, JSON.stringify(value));
    }
};

export const deleteStorageData = (keyName) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(keyName);
    }
};

export const updateStorageData = (keyName, updateVal) => {
    if (typeof window !== 'undefined') {
        const getItem = localStorage.getItem(keyName);
        if (!getItem) throw new Error('Item not found!');
        localStorage.setItem(keyName, JSON.stringify(updateVal));
    }
};
