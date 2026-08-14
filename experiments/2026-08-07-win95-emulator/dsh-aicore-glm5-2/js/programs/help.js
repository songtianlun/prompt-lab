/* ===== Help ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  const HELP_PAGES = {
    main: {
      title: 'Windows Help',
      html: `
        <h1>Welcome to Windows 95 Help</h1>
        <p>Use Help to learn how to use Windows 95 and its components.</p>
        <h2>Topics</h2>
        <ul>
          <li><span class="help-topic" data-page="start">Using the Start menu</span></li>
          <li><span class="help-topic" data-page="taskbar">Working with the taskbar</span></li>
          <li><span class="help-topic" data-page="windows">Opening and closing windows</span></li>
          <li><span class="help-topic" data-page="shutdown">Shutting down your computer</span></li>
        </ul>
        <h2>Tips</h2>
        <ul>
          <li>Click <b>Start</b> to begin</li>
          <li>Right-click almost anywhere for a shortcut menu</li>
          <li>Press <b>Ctrl+Alt+Del</b> to see the close program dialog</li>
        </ul>
      `
    },
    start: {
      title: 'Using the Start menu',
      html: `
        <h1>Using the Start menu</h1>
        <p>The <b>Start</b> button and menu give you quick access to programs, documents, settings, and more.</p>
        <h2>To start a program</h2>
        <ol>
          <li>Click <b>Start</b>, and then point to <b>Programs</b>.</li>
          <li>Point to the program group, such as <b>Accessories</b>.</li>
          <li>Click the program you want to start.</li>
        </ol>
        <p><span class="help-topic" data-page="main">Back to Help Topics</span></p>
      `
    },
    taskbar: {
      title: 'Working with the taskbar',
      html: `
        <h1>Working with the taskbar</h1>
        <p>The <b>taskbar</b> appears at the bottom of your screen. It contains the <b>Start</b> button, buttons for each open program, and a clock.</p>
        <h2>To switch between programs</h2>
        <p>Click the program's button on the taskbar.</p>
        <h2>To see the time</h2>
        <p>Rest your mouse pointer on the clock.</p>
        <p><span class="help-topic" data-page="main">Back to Help Topics</span></p>
      `
    },
    windows: {
      title: 'Opening and closing windows',
      html: `
        <h1>Opening and closing windows</h1>
        <h2>To open a window</h2>
        <p>Double-click an icon.</p>
        <h2>To close a window</h2>
        <p>Click the <b>Close</b> button (×) in the upper-right corner of the title bar.</p>
        <h2>To move a window</h2>
        <p>Drag the title bar.</p>
        <h2>To resize a window</h2>
        <p>Drag any edge or corner of the window.</p>
        <p><span class="help-topic" data-page="main">Back to Help Topics</span></p>
      `
    },
    shutdown: {
      title: 'Shutting down your computer',
      html: `
        <h1>Shutting down your computer</h1>
        <p>Before you turn off your computer, you should always shut down Windows 95 first.</p>
        <h2>To shut down</h2>
        <ol>
          <li>Click <b>Start</b>, and then click <b>Shut Down</b>.</li>
          <li>Select the option you want, and then click <b>Yes</b>.</li>
        </ol>
        <p>When you see the "It's now safe to turn off your computer" message, you can turn off the power.</p>
        <p><span class="help-topic" data-page="main">Back to Help Topics</span></p>
      `
    },
    notepad: {
      title: 'Notepad Help',
      html: `
        <h1>Notepad Help</h1>
        <p><b>Notepad</b> is a basic text editor you can use to create simple documents.</p>
        <h2>To create a new document</h2>
        <ol>
          <li>On the <b>File</b> menu, click <b>New</b>.</li>
          <li>Type your text.</li>
          <li>On the <b>File</b> menu, click <b>Save</b>.</li>
        </ol>
      `
    }
  };

  Programs.Help = {
    open(page) {
      page = page || 'main';
      const p = HELP_PAGES[page] || HELP_PAGES.main;

      const body = Util.el('div', { class: 'help-body' });
      const toolbar = Util.el('div', { class: 'help-toolbar' });
      const content = Util.el('div', { class: 'help-content' });
      content.innerHTML = p.html;

      const mkBtn = (label, icon, fn) => {
        const b = Util.el('button', { class: 'btn', style: 'min-width:50px;' }, label);
        if (fn) b.addEventListener('click', fn);
        return b;
      };
      let history = [page];
      let histIdx = 0;
      const backBtn = mkBtn('< Back', null);
      const fwdBtn = mkBtn('Forward >', null);
      backBtn.addEventListener('click', () => { if (histIdx > 0) { histIdx--; showPage(history[histIdx], false); } });
      fwdBtn.addEventListener('click', () => { if (histIdx < history.length - 1) { histIdx++; showPage(history[histIdx], false); } });
      toolbar.appendChild(backBtn);
      toolbar.appendChild(fwdBtn);
      body.appendChild(toolbar);
      body.appendChild(content);

      function showPage(pg, push) {
        const p2 = HELP_PAGES[pg] || HELP_PAGES.main;
        content.innerHTML = p2.html;
        win.title = p2.title + ' - Windows Help';
        Taskbar.setTitle(win.id, win.title);
        bindTopics();
        if (push !== false) {
          history = history.slice(0, histIdx + 1);
          history.push(pg);
          histIdx = history.length - 1;
        }
        backBtn.disabled = histIdx === 0;
        fwdBtn.disabled = histIdx === history.length - 1;
      }

      function bindTopics() {
        content.querySelectorAll('.help-topic').forEach(t => {
          t.addEventListener('click', () => showPage(t.dataset.page));
        });
      }
      bindTopics();
      backBtn.disabled = true;
      fwdBtn.disabled = true;

      const win = WindowManager.create({
        title: p.title + ' - Windows Help',
        icon: '❓',
        width: 480, height: 380,
        x: 140, y: 60,
        menu: [
          { label: '<u>F</u>ile', items: [
            { label: 'Print Topic' },
            { separator: true },
            { label: 'Exit', onClick: () => WindowManager.close(win.id) }
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'About Help', onClick: () => Programs.About.open('help') }
          ]}
        ],
        content: body
      });
      return win;
    }
  };
})();
