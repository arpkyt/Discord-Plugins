/**
 * @name PhantomMute
 * @author AR PK YT | Tech Titan
 * @version 2.0.0
 * @description Creates a stealth mute button that mimics Discord's original, without affecting actual functionality.
 */

module.exports = class PhantomMute {
    constructor() {
        this._regex = /"self_deaf"\s*:\s*true/; // Improved regex
        this._decoder = new TextDecoder();
        this._observer = null;
    }

    start() {
        this._interceptSocket();
        this._observeUI();
    }

    stop() {
        if (WebSocket.prototype._originalSend) {
            WebSocket.prototype.send = WebSocket.prototype._originalSend;
        }
        this._removeClone();
        if (this._observer) this._observer.disconnect();
    }

    _interceptSocket() {
        const decoder = this._decoder;
        const regex = this._regex;

        if (!WebSocket.prototype._originalSend) {
            WebSocket.prototype._originalSend = WebSocket.prototype.send;
        }

        WebSocket.prototype.send = function (data) {
            if (data instanceof ArrayBuffer) {
                try {
                    const decoded = decoder.decode(data);
                    if (regex.test(decoded)) {
                        window._phantomMuteSend = () => this._originalSend(data);
                        PhantomMute._insertClone();
                    }
                } catch (e) {}
            }
            this._originalSend(data);
        };
    }

    _observeUI() {
        this._observer = new MutationObserver(() => PhantomMute._insertClone());
        this._observer.observe(document.body, { childList: true, subtree: true });
    }

    static _insertClone() {
        const originalBtn = document.querySelector("button[aria-label='Deafen']");
        if (!originalBtn || document.querySelector("#phantomMuteBtn")) return;

        const clone = originalBtn.cloneNode(true);
        clone.id = "phantomMuteBtn";
        clone.title = "Fake Mute (Phantom)";
        clone.style.filter = "brightness(0.9) hue-rotate(10deg)";
        clone.style.opacity = "0.95";
        clone.onclick = () => window._phantomMuteSend?.();

        originalBtn.parentElement.appendChild(clone);
    }

    _removeClone() {
        const clone = document.querySelector("#phantomMuteBtn");
        if (clone) clone.remove();
    }
};
