
function getStorage() {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        return browser.storage.local;
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Chrome compatibility
        return chrome.storage.local;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    const seenPercentage = document.getElementById('seenPercentage');
    const percentageValue = document.getElementById('percentageValue');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    const storage = getStorage();
    // Load saved value
    if (storage) {
        if (storage.get.length === 1) {
            // Chrome style (callback)
            storage.get('excludeVideosWithSeenPercentegeAboveOrEqualTo', result => {
                const value = result.excludeVideosWithSeenPercentegeAboveOrEqualTo ?? 50;
                seenPercentage.value = value;
                percentageValue.textContent = value;
            });
        } else {
            // Firefox style (Promise)
            storage.get('excludeVideosWithSeenPercentegeAboveOrEqualTo').then(result => {
                const value = result.excludeVideosWithSeenPercentegeAboveOrEqualTo ?? 50;
                seenPercentage.value = value;
                percentageValue.textContent = value;
            });
        }
    } else {
        seenPercentage.value = 50;
        percentageValue.textContent = 50;
    }

    seenPercentage.addEventListener('input', () => {
        percentageValue.textContent = seenPercentage.value;
    });

    saveBtn.addEventListener('click', () => {
        const value = parseInt(seenPercentage.value, 10);
        if (storage) {
            if (storage.set.length === 2) {
                // Chrome style (callback)
                storage.set({ excludeVideosWithSeenPercentegeAboveOrEqualTo: value }, () => {
                    status.textContent = 'Saved!';
                    setTimeout(() => status.textContent = '', 1500);
                });
            } else {
                // Firefox style (Promise)
                storage.set({ excludeVideosWithSeenPercentegeAboveOrEqualTo: value }).then(() => {
                    status.textContent = 'Saved!';
                    setTimeout(() => status.textContent = '', 1500);
                });
            }
        } else {
            status.textContent = 'Error: No storage API available.';
        }
    });
});
