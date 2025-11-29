const DEBUG = true;
let excludeVideosWithSeenPercentegeAboveOrEqualTo = 50;

function log(...args) {
    console.log("[YT Cleaner]", ...args);
}

function debug(...args) {
    if (DEBUG) console.log("[YT Cleaner]", ...args);
}

function shouldRemoveRichItem(item) {
    const video = item.querySelector("yt-thumbnail-bottom-overlay-view-model");
    const titleTag = item.querySelector("h3");
    const title = titleTag ? titleTag.textContent.trim() : "(no h3)";
    if (video) {
        const progressBarTag = video.querySelector(".ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment");
        if (progressBarTag && progressBarTag.hasAttribute("style")) {
            const progressBarStyle = progressBarTag.getAttribute("style");
            const match = progressBarStyle.match(/width:\s*(\d+)%/);
            if (match) {
                const seenPercent = parseInt(match[1], 10);
                if (seenPercent >= excludeVideosWithSeenPercentegeAboveOrEqualTo) {
                    log(`Removing video with seen percentage ${seenPercent}%: "${title}"`);
                    return true;
                }

                log(`Keeping video with seen percentage ${seenPercent}%: "${title}"`);
            }
        } else {
            log(`Removing already seen video: "${title}"`);
            return true;
        }
    }
    return false;
}

function removeRichItemsWithBottomOverlay() {
    const richItems = document.querySelectorAll("ytd-rich-item-renderer");

    debug(`Scanning ${richItems.length} rich items...`);

    richItems.forEach(item => {
        if (shouldRemoveRichItem(item)) {
            debug("❌ Removing rich item:", item);
            item.remove();
        }
    });
}

log(`YouTube Cleaner loaded, removing videos with seen percentage >= ${excludeVideosWithSeenPercentegeAboveOrEqualTo}`);
debug("Waiting 1s before initial scan...");
setTimeout(() => {
    debug("Running initial scan...");
    removeRichItemsWithBottomOverlay();
}, 1000);

const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            if (node.matches?.("ytd-rich-item-renderer")) {
                if (shouldRemoveRichItem(node)) {
                    debug("❌ Removing new rich item:", node);
                    node.remove();
                }
            }

            if (node.querySelector?.("ytd-rich-item-renderer")) {
                debug("Subtree contains rich items, rescanning...");
                removeRichItemsWithBottomOverlay();
            }
        }
    }
});

debug("Starting mutation observer...");
observer.observe(document.body, {
    childList: true,
    subtree: true
});
