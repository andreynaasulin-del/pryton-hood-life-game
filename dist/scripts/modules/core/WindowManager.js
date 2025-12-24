/**
 * WINDOW MANAGER - v4.0 (TACTICAL UI)
 * Dynamic window, modal and notification management.
 */
export class WindowManager {
    constructor() {
        this.activeModals = [];
    }

    showModal(title, content, actions = []) {
        const modalId = `modal-${Date.now()}`;

        // Create overlay and modal structure v4.0
        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.className = 'modal-overlay active';

        overlay.innerHTML = `
            <div class="ds-panel-glass modal-v4">
                <div class="modal-header-v4">
                    <i data-lucide="info"></i>
                    <h2>${title.toUpperCase()}</h2>
                </div>
                <div class="modal-body-v4">${content}</div>
                <div class="modal-footer-v4" id="footer-${modalId}"></div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.activeModals.push(modalId);

        // Bind actions to v4.0 footer
        const footer = overlay.querySelector(`#footer-${modalId}`);
        if (footer) {
            // If no actions provided, add a default Close button
            const finalActions = actions.length > 0 ? actions : [{ text: 'ЗАКРЫТЬ', action: () => this.hideModal(modalId), type: 'secondary' }];

            finalActions.forEach(a => {
                const btn = document.createElement('button');
                btn.className = `modal-btn ${a.type || 'primary'} ${a.class || ''}`;
                btn.textContent = a.text;
                btn.onclick = () => {
                    if (a.action) a.action();
                    if (!a.preventClose) this.hideModal(modalId);
                };
                footer.appendChild(btn);
            });
        }

        if (window.lucide) window.lucide.createIcons();
        return modalId;
    }

    hideModal(modalId) {
        const id = modalId || (this.activeModals.length > 0 ? this.activeModals.pop() : null);
        if (!id) return;

        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active');
            setTimeout(() => el.remove(), 300);
        }

        // Static overlay fallback
        const staticOverlay = document.getElementById('modalOverlay');
        if (staticOverlay && !modalId) {
            staticOverlay.classList.remove('active');
        }
    }

    showNotification(text, type = 'info') {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const el = document.createElement('div');
        el.className = `notif-v4 ${type}`;

        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'alert-triangle';
        if (type === 'warning') icon = 'alert-circle';

        el.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${text}</span>
        `;

        container.appendChild(el);
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(50px)';
            setTimeout(() => el.remove(), 400);
        }, 4000);
    }
}

export const windowManager = new WindowManager();
window.windowManager = windowManager;
export default windowManager;
