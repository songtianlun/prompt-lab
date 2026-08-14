/* ===== Internet Explorer (mock) ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  const PAGES = {
    'http://www.microsoft.com/windows95': {
      title: 'Microsoft Windows 95 Home Page',
      html: `
        <div class="ie-mock-page">
          <div class="ie-marquee">★★★ Welcome to the World Wide Web! ★★★ Best viewed at 800x600 ★★★</div>
          <h1>Welcome to Windows 95!</h1>
          <hr>
          <p><img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90'><rect width='120' height='90' fill='%23008080'/><text x='60' y='50' font-size='14' fill='white' text-anchor='middle'>Windows 95</text></svg>" alt="Win95" style="float:right;margin-left:12px;border:2px solid #000;"></p>
          <p>Windows 95 is the <b>best</b> operating system ever made. It introduces the revolutionary <i>Start button</i> and <i>Taskbar</i>.</p>
          <h2>What's New</h2>
          <ul>
            <li>The <b>Start Menu</b> — everything you need in one place</li>
            <li><b>Plug and Play</b> — install hardware with ease</li>
            <li>32-bit preemptive multitasking</li>
            <li>Long filename support</li>
            <li><b>Internet Explorer</b> — surf the World Wide Web</li>
          </ul>
          <h2>Links</h2>
          <ul>
            <li><a href="http://www.microsoft.com">Microsoft Corporation</a></li>
            <li><a href="http://www.microsoft.com/windows95/press">Press Releases</a></li>
            <li><a href="http://www.microsoft.com/support">Technical Support</a></li>
          </ul>
          <hr>
          <p style="font-size:11px;color:#666;">You are visitor number <span class="ie-counter">0000142</span></p>
          <p style="font-size:11px;">&copy; 1995 Microsoft Corporation. All rights reserved.</p>
        </div>
      `
    },
    'http://www.geocities.com/~user/home.html': {
      title: 'My Awesome Home Page!',
      html: `
        <div class="ie-mock-page" style="background:#000080;color:#ffff00;padding:16px;">
          <h1 style="color:#ff00ff;text-align:center;">~*~ Welcome to my Home Page ~*~</h1>
          <p style="text-align:center;"><img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='45' fill='%23ff00ff'/><text x='50' y='55' text-anchor='middle' fill='white' font-size='20'>ME</text></svg>" alt="Under construction"></p>
          <p style="text-align:center;">🚧 This page is under construction! 🚧</p>
          <p>Hi! My name is Bob and this is my home page on the <b>Information Superhighway</b>!</p>
          <p>Things I like:</p>
          <ul>
            <li>Computers (486 DX2/66 with 16MB RAM!)</li>
            <li>The X-Files</li>
            <li>Collecting Pogs</li>
          </ul>
          <p>Sign my <a href="#" style="color:#00ffff;">guestbook</a>!</p>
          <p style="text-align:center;">
            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='88' height='31'><rect width='88' height='31' fill='%23000000'/><text x='44' y='20' text-anchor='middle' fill='%2300ff00' font-size='10'>Netscape Now!</text></svg>" alt="Netscape">
            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='88' height='31'><rect width='88' height='31' fill='%23ff0000'/><text x='44' y='20' text-anchor='middle' fill='white' font-size='9'>HTML 3.2</text></svg>" alt="HTML 3.2">
          </p>
          <p style="font-size:10px;color:#c0c0c0;">Best viewed in Netscape Navigator 3.0 at 800x600</p>
        </div>
      `
    },
    'about:home': {
      title: 'Internet Explorer Start Page',
      html: `
        <div class="ie-mock-page" style="text-align:center;padding-top:40px;">
          <h1 style="color:#000080;">Microsoft Internet Explorer</h1>
          <p style="font-size:18px;margin:20px 0;">Where do you want to go today?</p>
          <p>
            <a href="http://www.microsoft.com/windows95" style="font-size:14px;">Microsoft Windows 95</a> &nbsp;|&nbsp;
            <a href="http://www.geocities.com/~user/home.html" style="font-size:14px;">A Cool GeoCities Page</a>
          </p>
          <hr style="margin:30px 0;">
          <p style="font-size:11px;color:#666;">Type a URL in the address bar above to "surf" the web.</p>
        </div>
      `
    }
  };

  Programs.IE = {
    open(url) {
      url = url || 'about:home';

      const body = Util.el('div', { class: 'ie-body' });

      // Toolbar
      const toolbar = Util.el('div', { class: 'ie-toolbar' });
      const mkBtn = (label, icon, fn) => {
        const b = Util.el('div', { class: 'explorer-tb-btn' });
        b.appendChild(Util.el('span', {}, Util.icon(icon)));
        b.appendChild(Util.el('span', {}, label));
        if (fn) b.addEventListener('click', fn);
        return b;
      };
      const backStack = [];
      const fwdStack = [];
      let currentUrl = url;

      const backBtn = mkBtn('Back', '◀');
      const fwdBtn = mkBtn('Forward', '▶');
      const stopBtn = mkBtn('Stop', '✖');
      const refreshBtn = mkBtn('Refresh', '🔄');
      const homeBtn = mkBtn('Home', '🏠', () => navigate('about:home'));
      toolbar.appendChild(backBtn);
      toolbar.appendChild(fwdBtn);
      toolbar.appendChild(stopBtn);
      toolbar.appendChild(refreshBtn);
      toolbar.appendChild(homeBtn);
      body.appendChild(toolbar);

      // Address
      const addrRow = Util.el('div', { class: 'ie-address-row' });
      addrRow.appendChild(Util.el('span', {}, 'Address'));
      const addrField = Util.el('input', { class: 'text-input', style: 'flex:1;', value: url });
      addrRow.appendChild(addrField);
      const goBtn = Util.el('button', { class: 'btn', style: 'min-width:40px;' }, 'Go');
      goBtn.addEventListener('click', () => navigate(addrField.value));
      addrRow.appendChild(goBtn);
      addrField.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(addrField.value); });
      body.appendChild(addrRow);

      // Content
      const content = Util.el('div', { class: 'ie-content' });
      body.appendChild(content);

      function navigate(newUrl, pushHistory) {
        if (!newUrl) newUrl = 'about:home';
        if (newUrl === 'home' || newUrl === 'www') newUrl = 'about:home';
        if (pushHistory !== false && newUrl !== currentUrl) {
          backStack.push(currentUrl);
          fwdStack.length = 0;
        }
        currentUrl = newUrl;
        addrField.value = newUrl;
        const page = PAGES[newUrl];
        if (page) {
          content.innerHTML = page.html;
          content.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', e => {
              e.preventDefault();
              const href = a.getAttribute('href');
              if (href && href !== '#') navigate(href);
            });
          });
          win.title = page.title + ' - Microsoft Internet Explorer';
          Taskbar.setTitle(win.id, win.title);
        } else {
          content.innerHTML = `
            <div style="text-align:center;padding:40px;">
              <h2 style="color:#cc0000;">Cannot find server</h2>
              <p>Internet Explorer cannot display the webpage</p>
              <p style="margin-top:20px;color:#666;">Most likely causes:</p>
              <ul style="text-align:left;max-width:400px;margin:10px auto;">
                <li>You are not connected to the Internet.</li>
                <li>The website is encountering problems.</li>
                <li>There might be a typing error in the address.</li>
              </ul>
              <p style="margin-top:20px;">Try: <a href="about:home" style="color:blue;">Internet Explorer Start Page</a></p>
            </div>
          `;
          content.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', e => {
              e.preventDefault();
              navigate(a.getAttribute('href'));
            });
          });
          win.title = 'Cannot find server - Microsoft Internet Explorer';
          Taskbar.setTitle(win.id, win.title);
        }
        updateButtons();
      }

      function updateButtons() {
        backBtn.style.opacity = backStack.length ? '1' : '0.5';
        fwdBtn.style.opacity = fwdStack.length ? '1' : '0.5';
      }

      backBtn.addEventListener('click', () => {
        if (!backStack.length) return;
        fwdStack.push(currentUrl);
        navigate(backStack.pop(), false);
      });
      fwdBtn.addEventListener('click', () => {
        if (!fwdStack.length) return;
        backStack.push(currentUrl);
        navigate(fwdStack.pop(), false);
      });
      refreshBtn.addEventListener('click', () => navigate(currentUrl, false));
      stopBtn.addEventListener('click', () => {});

      const win = WindowManager.create({
        title: 'Microsoft Internet Explorer',
        icon: '🌐',
        width: 640, height: 480,
        x: 60, y: 30,
        menu: [
          { label: '<u>F</u>ile', items: [
            { label: 'New', items: [
              { label: 'Window', onClick: () => Programs.IE.open() }
            ]},
            { label: 'Open...', shortcut: 'Ctrl+O', onClick: () => {
              const u = prompt('Open:', 'http://');
              if (u) navigate(u);
            }},
            { separator: true },
            { label: 'Close', onClick: () => WindowManager.close(win.id) }
          ]},
          { label: '<u>E</u>dit', items: [
            { label: 'Copy', shortcut: 'Ctrl+C' },
            { label: 'Select All', shortcut: 'Ctrl+A' }
          ]},
          { label: '<u>V</u>iew', items: [
            { label: 'Source', onClick: () => Programs.Notepad.open('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN">\n<html>\n<head><title>' + currentUrl + '</title></head>\n<body>\n<!-- This is a mock page -->\n</body>\n</html>') },
            { label: 'Full Screen', shortcut: 'F11' }
          ]},
          { label: '<u>G</u>o', items: [
            { label: 'Back', shortcut: 'Alt+←', onClick: () => backBtn.click() },
            { label: 'Forward', shortcut: 'Alt+→', onClick: () => fwdBtn.click() },
            { label: 'Home Page', onClick: () => navigate('about:home') }
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'About Internet Explorer', onClick: () => Programs.About.open('ie') }
          ]}
        ],
        statusBar: ['Done', 'Internet zone'],
        content: body
      });

      navigate(url);
      return win;
    }
  };
})();
