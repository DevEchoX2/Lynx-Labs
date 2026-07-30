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
        window.parent.postMessage({ action: 'lynx_settings_updated' }, '*');
    };

    const loadSettings = () => {
        const particles = localStorage.getItem('lynx_particles') !== 'false';
        document.getElementById('toggle-particles').checked = particles;

        const currentBg = localStorage.getItem('lynx_home_bg') || 'none';
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            if (btn.getAttribute('data-bg') === currentBg) {
                btn.style.borderColor = 'var(--accent)';
            } else {
                btn.style.borderColor = 'transparent';
            }
        });

        const currentAccent = localStorage.getItem('lynx_theme_color') || '#06b6d4';
        document.documentElement.style.setProperty('--accent', currentAccent);

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

    document.getElementById('force-save-btn').addEventListener('click', (e) => {
        notifyMain();
        const btn = e.target;
        btn.textContent = "Saved Successfully!";
        setTimeout(() => {
            btn.textContent = "Force Save Settings";
        }, 2000);
    });

    document.getElementById('toggle-particles').addEventListener('change', (e) => {
        saveSetting('lynx_particles', e.target.checked);
    });

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.style.borderColor = 'transparent');
            btn.style.borderColor = 'var(--accent)';
            const bgValue = btn.getAttribute('data-bg');
            saveSetting('lynx_home_bg', bgValue);
        });
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
            document.documentElement.style.setProperty('--accent', color);
            saveSetting('lynx_theme_color', color);
        });
    });
});
