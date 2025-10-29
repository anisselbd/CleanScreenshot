chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type === "PLAY_SHUTTER") {
    const audio = new Audio(chrome.runtime.getURL("sounds/camera.mp3"));
    audio.volume = 0.7;
    try {
      await audio.play();
    } catch (e) {
      console.warn("Audio error:", e);
    } finally {
      setTimeout(() => chrome.offscreen?.closeDocument?.(), 500);
    }
  }
});