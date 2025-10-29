async function ensureOffscreenDocument() {
  const hasDoc = await chrome.offscreen.hasDocument?.();
  if (!hasDoc) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Lecture du son de capture"
    });
  }
}

async function playShutterSound() {
  try {
    await ensureOffscreenDocument();
    await chrome.runtime.sendMessage({ type: "PLAY_SHUTTER" });
  } catch (e) {
    console.warn("Erreur lecture son :", e);
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.tabs.update(tab.id, { active: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content/clean.js"]
    });
    await new Promise(r => setTimeout(r, 300));

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const filename = `cleanshot-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.png`;

    await chrome.downloads.download({ url: dataUrl, filename });

    // 🔊 joue le son après la capture
    await playShutterSound();

  } catch (err) {
    console.error("Clean Screenshot error:", err);
  }
});