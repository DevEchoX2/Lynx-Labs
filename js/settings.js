document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    const notifyMain = () => {
        if (window.parent && window.parent.lynxBrowserController) {
            window.parent.lynxBrowserController.applySettings();
        }
    };

    const loadSettings = () => {
        const particles = localStorage.getItem('lynx_particles') !== 'false';
        document.getElementById('toggle-particles').checked = particles;

        const savedBg = localStorage.getItem('lynx_custom_bg');
        if (savedBg && savedBg.startsWith('data:image')) {
            document.getElementById('custom-bg').value = 'Local Image Uploaded';
        } else {
            document.getElementById('custom-bg').value = savedBg || '';
        }

        document.getElementById('panic-key').value = localStorage.getItem('lynx_panic_key') || '';
        document.getElementById('tab-mask').value = localStorage.getItem('lynx_tab_mask') || '';
        document.getElementById('search-provider').value = localStorage.getItem('lynx_search') || 'duckduckgo';
        document.getElementById('wisp-url').value = localStorage.getItem('lynx_wisp_url') || '';

        const lockEsc = localStorage.getItem('lynx_lock_escape') === 'true';
        updateSegmentedControl('esc-lock-toggle', lockEsc ? 'true' : 'false');
    };

    const saveSetting = (key, value) => {
        localStorage.setItem(key, value);
        notifyMain();
    };

    const updateSegmentedControl = (containerId, value) => {
        const container = document.getElementById(containerId);
        const buttons = container.querySelectorAll('.seg-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-val') === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    loadSettings();

    document.getElementById('toggle-particles').addEventListener('change', (e) => saveSetting('lynx_particles', e.target.checked));
    
    document.getElementById('custom-bg').addEventListener('input', (e) => {
        saveSetting('lynx_custom_bg', e.target.value);
    });

    const bgUpload = document.getElementById('custom-bg-upload');
    const uploadBtn = document.getElementById('upload-bg-btn');
    const uploadError = document.getElementById('upload-error');
    const bgInput = document.getElementById('custom-bg');

    uploadBtn.addEventListener('click', () => {
        bgUpload.click();
    });

    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2.5 * 1024 * 1024) {
            uploadError.style.display = 'block';
            return;
        }
        
        uploadError.style.display = 'none';

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;
            bgInput.value = 'Local Image Uploaded';
            saveSetting('lynx_custom_bg', base64String);
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('panic-key').addEventListener('input', (e) => saveSetting('lynx_panic_key', e.target.value));
    document.getElementById('tab-mask').addEventListener('input', (e) => saveSetting('lynx_tab_mask', e.target.value));
    document.getElementById('search-provider').addEventListener('change', (e) => saveSetting('lynx_search', e.target.value));
    document.getElementById('wisp-url').addEventListener('input', (e) => saveSetting('lynx_wisp_url', e.target.value));

    const escToggleBtns = document.querySelectorAll('#esc-lock-toggle .seg-btn');
    escToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.getAttribute('data-val');
            updateSegmentedControl('esc-lock-toggle', val);
            saveSetting('lynx_lock_escape', val);
        });
    });

    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if(confirm("Are you sure? This will wipe all saved settings.")) {
            localStorage.clear();
            notifyMain();
            location.reload();
        }
    });

    const swatches = document.querySelectorAll('.theme-swatch');
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            const color = swatch.getAttribute('data-color');
            saveSetting('lynx_theme_color', color);
        });
    });
});
