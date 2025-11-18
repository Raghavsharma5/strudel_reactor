export const saveSettings = (settings) => {
    const settingsJSON = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `strudel-settings-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

export const loadSettings = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                resolve(settings);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};