/* ===== Control Panel ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  Programs.ControlPanel = {
    open() {
      const body = Util.el('div', { class: 'cp-body' });
      const grid = Util.el('div', { class: 'cp-grid' });
      const items = [
        { name: 'Display', icon: 'controlpanel', action: () => Programs.ControlPanel.openDisplay() },
        { name: 'Keyboard', icon: 'controlpanel' },
        { name: 'Mouse', icon: 'controlpanel' },
        { name: 'Printers', icon: 'printer' },
        { name: 'Fonts', icon: 'doc' },
        { name: 'Sounds', icon: 'volume' },
        { name: 'System', icon: 'computer' },
        { name: 'Add New Hardware', icon: 'computer' },
        { name: 'Add/Remove Programs', icon: 'programs' },
        { name: 'Date/Time', icon: 'clock' },
        { name: 'Network', icon: 'network' },
        { name: 'Password', icon: 'settings' }
      ];
      items.forEach(it => {
        const el = Util.el('div', { class: 'cp-item' });
        el.appendChild(Util.el('div', { class: 'cp-img' }, Util.icon(it.icon)));
        el.appendChild(Util.el('div', { class: 'cp-label' }, it.name));
        el.addEventListener('mousedown', e => {
          grid.querySelectorAll('.cp-item.selected').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
        });
        el.addEventListener('dblclick', () => { if (it.action) it.action(); });
        grid.appendChild(el);
      });
      body.appendChild(grid);

      const win = WindowManager.create({
        title: 'Control Panel',
        icon: '⚙️',
        width: 420, height: 300,
        x: 160, y: 70,
        menu: [
          { label: '<u>F</u>ile', items: [
            { label: 'Open' },
            { separator: true },
            { label: 'Close', onClick: () => WindowManager.close(win.id) }
          ]},
          { label: '<u>V</u>iew', items: [
            { label: 'Large Icons' },
            { label: 'Small Icons' },
            { label: 'List' },
            { label: 'Details' }
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'About Control Panel', onClick: () => Programs.About.open('windows') }
          ]}
        ],
        statusBar: [items.length + ' object(s)'],
        content: body
      });
      return win;
    },

    openDisplay() {
      const body = Util.el('div', { style: 'display:flex;flex-direction:column;height:100%;' });
      const tabs = Util.el('div', { class: 'display-props-tabs' });
      const tabNames = ['Background', 'Screen Saver', 'Appearance', 'Settings'];
      const tabContents = [];
      let activeTab = 0;
      tabNames.forEach((n, i) => {
        const t = Util.el('div', { class: 'display-props-tab' + (i === 0 ? ' active' : '') }, n);
        t.addEventListener('click', () => {
          tabs.querySelectorAll('.display-props-tab').forEach(x => x.classList.remove('active'));
          t.classList.add('active');
          tabContents.forEach((c, j) => c.style.display = j === i ? 'block' : 'none');
          activeTab = i;
        });
        tabs.appendChild(t);
      });
      body.appendChild(tabs);

      const contentWrap = Util.el('div', { class: 'display-props-body' });

      // Background tab
      const bgTab = Util.el('div');
      bgTab.appendChild(Util.el('div', { class: 'monitor-preview', id: 'dp-preview' }));
      const bgGroup = Util.el('div', { class: 'group-box' });
      bgGroup.appendChild(Util.el('div', { class: 'group-box-title' }, 'Wallpaper'));
      const bgList = Util.el('div', { class: 'listbox', style: 'height:80px;' });
      ['(None)', 'Clouds', 'Setup', 'Windows 95', 'Black Thatch', 'Red Blocks'].forEach((n, i) => {
        const item = Util.el('div', { class: 'listbox-item' + (i === 0 ? ' selected' : '') }, n);
        item.addEventListener('click', () => {
          bgList.querySelectorAll('.listbox-item').forEach(x => x.classList.remove('selected'));
          item.classList.add('selected');
          const preview = document.getElementById('dp-preview');
          if (n === '(None)') preview.style.background = '#008080';
          else if (n === 'Clouds') preview.style.background = 'linear-gradient(to bottom, #87ceeb, #e0f6ff)';
          else if (n === 'Windows 95') preview.style.background = 'linear-gradient(135deg, #008080, #1084d0)';
          else if (n === 'Black Thatch') preview.style.background = '#000';
          else if (n === 'Red Blocks') preview.style.background = 'repeating-linear-gradient(45deg, #800000 0 10px, #400000 10px 20px)';
          else preview.style.background = '#c0c0c0';
        });
        bgList.appendChild(item);
      });
      bgGroup.appendChild(bgList);
      bgTab.appendChild(bgGroup);
      contentWrap.appendChild(bgTab);

      // Screen Saver tab
      const ssTab = Util.el('div', { style: 'display:none;' });
      ssTab.appendChild(Util.el('div', { class: 'monitor-preview' }));
      const ssGroup = Util.el('div', { class: 'group-box' });
      ssGroup.appendChild(Util.el('div', { class: 'group-box-title' }, 'Screen Saver'));
      ssGroup.appendChild(Util.el('select', { class: 'text-input', style: 'width:100%;' },
        ...['(None)', 'Starfield Simulation', 'Flying Windows', 'Mystify', 'Marquee'].map(x => {
          const o = document.createElement('option'); o.textContent = x; return o;
        })
      ));
      ssTab.appendChild(ssGroup);
      contentWrap.appendChild(ssTab);

      // Appearance tab
      const apTab = Util.el('div', { style: 'display:none;' });
      apTab.appendChild(Util.el('div', { style: 'padding:8px;border:1px inset #808080;background:#c0c0c0;margin-bottom:10px;height:120px;display:flex;align-items:center;justify-content:center;' },
        Util.el('div', { style: 'background:#000080;color:#fff;padding:4px 12px;font-weight:bold;' }, 'Active Window')));
      apTab.appendChild(Util.el('div', {}, 'Scheme: '));
      apTab.appendChild(Util.el('select', { class: 'text-input', style: 'width:100%;margin-top:4px;' },
        ...['Windows Default', 'Windows Standard', 'Emerald City', 'Rose', 'Wheat'].map(x => {
          const o = document.createElement('option'); o.textContent = x; return o;
        })
      ));
      contentWrap.appendChild(apTab);

      // Settings tab
      const stTab = Util.el('div', { style: 'display:none;' });
      stTab.appendChild(Util.el('div', { class: 'monitor-preview' }));
      const stGroup = Util.el('div', { class: 'group-box' });
      stGroup.appendChild(Util.el('div', { class: 'group-box-title' }, 'Desktop area'));
      stGroup.appendChild(Util.el('div', {}, 'Drag the slider to change the resolution.'));
      const slider = Util.el('input', { type: 'range', min: '0', max: '3', value: '1', style: 'width:100%;margin:10px 0;' });
      const resLabel = Util.el('div', { style: 'font-size:11px;' }, '800 x 600 pixels');
      slider.addEventListener('input', () => {
        const res = ['640 x 480', '800 x 600', '1024 x 768', '1280 x 1024'][slider.value];
        resLabel.textContent = res + ' pixels';
      });
      stGroup.appendChild(slider);
      stGroup.appendChild(resLabel);
      stTab.appendChild(stGroup);
      const colorGroup = Util.el('div', { class: 'group-box' });
      colorGroup.appendChild(Util.el('div', { class: 'group-box-title' }, 'Color palette' ));
      colorGroup.appendChild(Util.el('select', { class: 'text-input' },
        ...['16 Color', '256 Color', 'High Color (16 bit)', 'True Color (24 bit)'].map(x => {
          const o = document.createElement('option'); o.textContent = x; return o;
        })
      ));
      stTab.appendChild(colorGroup);
      contentWrap.appendChild(stTab);

      body.appendChild(contentWrap);

      const btnRow = Util.el('div', { style: 'display:flex;justify-content:flex-end;gap:6px;padding:8px 12px;border-top:1px solid #808080;' });
      const okBtn = Util.el('button', { class: 'btn default' }, 'OK');
      const cancelBtn = Util.el('button', { class: 'btn' }, 'Cancel');
      const applyBtn = Util.el('button', { class: 'btn' }, 'Apply');
      btnRow.appendChild(okBtn);
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(applyBtn);
      body.appendChild(btnRow);

      const win = WindowManager.create({
        title: 'Display Properties',
        icon: '⚙️',
        width: 380, height: 440,
        x: 200, y: 50,
        resizable: false,
        maximizable: false,
        content: body
      });
      okBtn.addEventListener('click', () => WindowManager.close(win.id));
      cancelBtn.addEventListener('click', () => WindowManager.close(win.id));
      return win;
    }
  };
})();
