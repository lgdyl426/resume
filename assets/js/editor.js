/* ========== Editor JavaScript - Content Editing ========== */

(function() {
    'use strict';

    const STORAGE_KEY = 'resume-editor-data';
    let isEditMode = false;
    let hasUnsavedChanges = false;
    let originalData = {};

    // ========== DOM Ready ==========
    document.addEventListener('DOMContentLoaded', function() {
        initEditButton();
        initToolbar();
        initKeyboardShortcuts();
        loadSavedData();
    });

    // ========== Edit Button ==========
    function initEditButton() {
        const editBtn = document.querySelector('.edit-btn');
        if (!editBtn) return;

        editBtn.addEventListener('click', toggleEditMode);
    }

    // ========== Toggle Edit Mode ==========
    function toggleEditMode() {
        isEditMode = !isEditMode;
        const body = document.body;
        const editBtn = document.querySelector('.edit-btn');
        const toolbar = document.querySelector('.editor-toolbar');
        const banner = document.querySelector('.edit-banner');

        if (isEditMode) {
            // Enter edit mode
            body.classList.add('edit-mode');
            editBtn.classList.add('active');
            editBtn.innerHTML = '✏️';
            editBtn.title = '退出编辑';
            toolbar.classList.add('visible');
            banner.classList.add('visible');
            
            // Make elements editable
            makeEditable();
            addSkillEditControls();
            
            // Save original state for reset
            saveOriginalState();
            
        } else {
            // Exit edit mode
            if (hasUnsavedChanges) {
                if (!confirm('有未保存的更改，确定要退出编辑模式吗？')) {
                    isEditMode = true;
                    return;
                }
            }
            
            body.classList.remove('edit-mode');
            editBtn.classList.remove('active');
            editBtn.innerHTML = '✎';
            editBtn.title = '编辑内容';
            toolbar.classList.remove('visible');
            banner.classList.remove('visible');
            
            // Remove contenteditable
            disableEditable();
            removeSkillEditControls();
            
            hasUnsavedChanges = false;
            editBtn.classList.remove('has-changes');
        }
    }

    // ========== Make Elements Editable ==========
    function makeEditable() {
        const editableElements = document.querySelectorAll('[data-editable]');
        editableElements.forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.addEventListener('input', handleContentChange);
            el.addEventListener('blur', handleContentBlur);
        });
    }

    function disableEditable() {
        const editableElements = document.querySelectorAll('[data-editable]');
        editableElements.forEach(el => {
            el.removeAttribute('contenteditable');
            el.removeEventListener('input', handleContentChange);
            el.removeEventListener('blur', handleContentBlur);
        });
    }

    function handleContentChange() {
        hasUnsavedChanges = true;
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) editBtn.classList.add('has-changes');
    }

    function handleContentBlur(e) {
        // Optional: validate or format on blur
    }

    // ========== Skill Edit Controls ==========
    function addSkillEditControls() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            if (item.querySelector('.skill-edit-controls')) return;
            
            const controls = document.createElement('div');
            controls.className = 'skill-edit-controls';
            controls.innerHTML = `
                <button class="skill-edit-btn skill-dec" title="减少">−</button>
                <input type="number" class="skill-edit-input" min="0" max="100" value="0">
                <button class="skill-edit-btn skill-inc" title="增加">+</button>
                <span style="color: var(--text-light); font-size: 0.85rem;">%</span>
            `;
            
            item.appendChild(controls);
            
            const progress = item.querySelector('.skill-progress');
            const percentEl = item.querySelector('.skill-percent');
            const input = controls.querySelector('.skill-edit-input');
            const incBtn = controls.querySelector('.skill-inc');
            const decBtn = controls.querySelector('.skill-dec');
            
            // Set initial value
            const currentPercent = parseInt(progress.dataset.percent, 10) || 0;
            input.value = currentPercent;
            
            incBtn.addEventListener('click', () => {
                let val = parseInt(input.value, 10);
                if (val < 100) {
                    val += 5;
                    updateSkill(item, val);
                }
            });
            
            decBtn.addEventListener('click', () => {
                let val = parseInt(input.value, 10);
                if (val > 0) {
                    val = Math.max(0, val - 5);
                    updateSkill(item, val);
                }
            });
            
            input.addEventListener('input', () => {
                let val = parseInt(input.value, 10);
                if (isNaN(val)) val = 0;
                val = Math.max(0, Math.min(100, val));
                updateSkill(item, val, false);
            });
            
            input.addEventListener('blur', () => {
                let val = parseInt(input.value, 10);
                if (isNaN(val)) val = 0;
                val = Math.max(0, Math.min(100, val));
                input.value = val;
                updateSkill(item, val);
            });
        });
    }

    function removeSkillEditControls() {
        const controls = document.querySelectorAll('.skill-edit-controls');
        controls.forEach(c => c.remove());
    }

    function updateSkill(item, value, animate = true) {
        const progress = item.querySelector('.skill-progress');
        const percentEl = item.querySelector('.skill-percent');
        const input = item.querySelector('.skill-edit-input');
        
        progress.dataset.percent = value;
        progress.style.width = value + '%';
        if (percentEl) percentEl.textContent = value + '%';
        if (input) input.value = value;
        
        // Mark skill item as editable
        if (!item.dataset.editable) {
            item.dataset.editable = `skill_${progress.parentElement.parentElement.className}_${Math.random().toString(36).substr(2, 5)}`;
        }
        
        hasUnsavedChanges = true;
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) editBtn.classList.add('has-changes');
    }

    // ========== Toolbar ==========
    function initToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.innerHTML = `
            <button class="editor-toolbar-btn primary" data-action="save">
                <span>💾</span><span>保存</span>
            </button>
            <button class="editor-toolbar-btn" data-action="reset">
                <span>↺</span><span>重置本页</span>
            </button>
            <div class="editor-toolbar-divider"></div>
            <button class="editor-toolbar-btn success" data-action="export">
                <span>📤</span><span>导出JSON</span>
            </button>
            <button class="editor-toolbar-btn" data-action="import">
                <span>📥</span><span>导入JSON</span>
            </button>
            <div class="editor-toolbar-divider"></div>
            <button class="editor-toolbar-btn danger" data-action="exit">
                <span>✕</span><span>退出</span>
            </button>
        `;
        document.body.appendChild(toolbar);
        
        // Add edit banner
        const banner = document.createElement('div');
        banner.className = 'edit-banner';
        banner.innerHTML = '✏️ 编辑模式已开启 - 点击文字直接修改，<kbd>Ctrl+S</kbd> 保存，<kbd>Esc</kbd> 退出';
        document.body.appendChild(banner);
        
        // Add toast
        const toast = document.createElement('div');
        toast.className = 'editor-toast';
        toast.innerHTML = `
            <div class="editor-toast-icon"></div>
            <div class="editor-toast-message"></div>
        `;
        document.body.appendChild(toast);
        
        // Toolbar button events
        toolbar.querySelectorAll('.editor-toolbar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                handleToolbarAction(action);
            });
        });
    }

    function handleToolbarAction(action) {
        switch(action) {
            case 'save':
                saveData();
                break;
            case 'reset':
                resetPage();
                break;
            case 'export':
                exportData();
                break;
            case 'import':
                showImportModal();
                break;
            case 'exit':
                toggleEditMode();
                break;
        }
    }

    // ========== Save Data ==========
    function saveData() {
        const data = collectAllData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        hasUnsavedChanges = false;
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) editBtn.classList.remove('has-changes');
        
        showToast('success', '保存成功！数据已存储到本地。');
    }

    function collectAllData() {
        const data = {};
        
        // Collect text content from editable elements
        const editableElements = document.querySelectorAll('[data-editable]');
        editableElements.forEach(el => {
            const key = el.dataset.editable;
            if (key) {
                data[key] = el.innerHTML;
            }
        });
        
        // Collect skill percentages
        const skillBars = document.querySelectorAll('.skill-progress[data-percent]');
        skillBars.forEach((bar, index) => {
            const skillItem = bar.closest('.skill-item');
            const skillName = skillItem?.querySelector('.skill-name')?.textContent?.trim();
            if (skillName) {
                data['skill_' + skillName] = bar.dataset.percent;
            }
        });
        
        return data;
    }

    // ========== Load Saved Data ==========
    function loadSavedData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            applyData(data);
        } catch(e) {
            console.error('Failed to load saved data:', e);
        }
    }

    function applyData(data) {
        // Apply text content
        Object.keys(data).forEach(key => {
            if (key.startsWith('skill_')) {
                // Skill data
                const skillName = key.replace('skill_', '');
                const skillItems = document.querySelectorAll('.skill-item');
                skillItems.forEach(item => {
                    const nameEl = item.querySelector('.skill-name');
                    if (nameEl && nameEl.textContent.trim() === skillName) {
                        const percent = parseInt(data[key], 10);
                        const progress = item.querySelector('.skill-progress');
                        const percentEl = item.querySelector('.skill-percent');
                        if (progress) {
                            progress.dataset.percent = percent;
                            // Don't animate on page load, set directly
                            progress.style.width = percent + '%';
                        }
                        if (percentEl) percentEl.textContent = percent + '%';
                    }
                });
            } else {
                // Text content
                const el = document.querySelector(`[data-editable="${key}"]`);
                if (el) {
                    el.innerHTML = data[key];
                }
            }
        });
    }

    // ========== Save Original State ==========
    function saveOriginalState() {
        originalData = collectAllData();
    }

    // ========== Reset Page ==========
    function resetPage() {
        if (!confirm('确定要重置本页内容吗？所有未保存的更改将丢失。')) return;
        
        applyData(originalData);
        
        hasUnsavedChanges = false;
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) editBtn.classList.remove('has-changes');
        
        showToast('info', '已重置为原始内容。');
    }

    // ========== Export Data ==========
    function exportData() {
        const data = collectAllData();
        const jsonStr = JSON.stringify(data, null, 2);
        
        // Show in modal for copy
        showExportModal(jsonStr);
    }

    // ========== Export Modal ==========
    function showExportModal(jsonStr) {
        const modal = createModal('导出数据');
        const body = modal.querySelector('.editor-modal-body');
        
        body.innerHTML = `
            <p>复制下方JSON数据以备份或在其他页面导入：</p>
            <textarea class="editor-modal-textarea" readonly>${escapeHtml(jsonStr)}</textarea>
        `;
        
        const footer = modal.querySelector('.editor-modal-footer');
        footer.innerHTML = `
            <button class="editor-modal-btn secondary" data-action="close">关闭</button>
            <button class="editor-modal-btn primary" data-action="copy">复制到剪贴板</button>
        `;
        
        footer.querySelector('[data-action="close"]').addEventListener('click', () => closeModal(modal));
        footer.querySelector('[data-action="copy"]').addEventListener('click', () => {
            const textarea = body.querySelector('textarea');
            textarea.select();
            document.execCommand('copy');
            showToast('success', '已复制到剪贴板！');
        });
        
        modal.querySelector('.editor-modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.editor-modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.editor-modal-overlay')) {
                closeModal(modal);
            }
        });
    }

    // ========== Import Modal ==========
    function showImportModal() {
        const modal = createModal('导入数据');
        const body = modal.querySelector('.editor-modal-body');
        
        body.innerHTML = `
            <p>粘贴JSON数据以恢复内容：</p>
            <textarea class="editor-modal-textarea" placeholder="在此粘贴JSON数据..."></textarea>
        `;
        
        const footer = modal.querySelector('.editor-modal-footer');
        footer.innerHTML = `
            <button class="editor-modal-btn secondary" data-action="close">取消</button>
            <button class="editor-modal-btn primary" data-action="import">导入</button>
        `;
        
        footer.querySelector('[data-action="close"]').addEventListener('click', () => closeModal(modal));
        footer.querySelector('[data-action="import"]').addEventListener('click', () => {
            const textarea = body.querySelector('textarea');
            const jsonStr = textarea.value.trim();
            
            if (!jsonStr) {
                showToast('error', '请输入JSON数据');
                return;
            }
            
            try {
                const data = JSON.parse(jsonStr);
                applyData(data);
                saveData();
                closeModal(modal);
                showToast('success', '数据导入成功！');
            } catch(e) {
                showToast('error', 'JSON格式错误，请检查数据');
            }
        });
        
        modal.querySelector('.editor-modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.editor-modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.editor-modal-overlay')) {
                closeModal(modal);
            }
        });
    }

    // ========== Modal Helper ==========
    function createModal(title) {
        const overlay = document.createElement('div');
        overlay.className = 'editor-modal-overlay visible';
        overlay.innerHTML = `
            <div class="editor-modal">
                <div class="editor-modal-header">
                    <h3>${title}</h3>
                    <button class="editor-modal-close">×</button>
                </div>
                <div class="editor-modal-body"></div>
                <div class="editor-modal-footer"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    function closeModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // ========== Toast ==========
    function showToast(type, message) {
        const toast = document.querySelector('.editor-toast');
        if (!toast) return;
        
        toast.className = 'editor-toast ' + type;
        const icon = toast.querySelector('.editor-toast-icon');
        const msg = toast.querySelector('.editor-toast-message');
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        
        icon.textContent = icons[type] || 'ℹ';
        msg.textContent = message;
        
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ========== Keyboard Shortcuts ==========
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (isEditMode) {
                    saveData();
                }
            }
            
            // Esc to exit edit mode
            if (e.key === 'Escape' && isEditMode) {
                // Don't exit if a modal is open
                const modal = document.querySelector('.editor-modal-overlay.visible');
                if (modal) {
                    closeModal(modal);
                    return;
                }
                toggleEditMode();
            }
        });
    }

    // ========== Utility ==========
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
