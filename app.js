(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('js');

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-enter], .stair').forEach(function (el) {
    io.observe(el);
  });
})();

(function () {
  var form = document.getElementById('rsvp-form');
  var select = document.getElementById('rsvp-day');
  if (!form || !select) return;

  var dayBars = Array.from(document.querySelectorAll('.bar'));
  dayBars.forEach(function (bar) {
    var title = bar.querySelector('.bar-title');
    var date = bar.querySelector('.bar-date');
    if (!title || !date) return;
    var dayName = title.textContent.replace(/^\s*\d+\s*/, '').trim();
    var label = date.textContent.trim() + ' — ' + dayName;
    var option = document.createElement('option');
    option.value = label;
    option.textContent = label;
    select.appendChild(option);

    var button = bar.querySelector('.rsvp-day-btn');
    if (button) {
      button.addEventListener('click', function () {
        select.value = label;
        document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(function () { form.elements.guestName.focus(); }, 450);
      });
    }
  });

  function readableTime(value) {
    if (!value) return 'Not specified';
    var parts = value.split(':');
    var hour = Number(parts[0]);
    var minute = parts[1];
    var suffix = hour >= 12 ? 'p.m.' : 'a.m.';
    hour = hour % 12 || 12;
    return hour + ':' + minute + ' ' + suffix;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    var guest = data.get('guestName').trim();
    var day = data.get('johnukkahDay');
    var note = data.get('note').trim();
    var text = [
      'Johnukkah RSVP',
      'Name: ' + guest,
      'Day: ' + day,
      'Arriving: ' + readableTime(data.get('arrivalTime')),
      'Leaving: ' + readableTime(data.get('departureTime')),
      'Note: ' + (note || 'None')
    ].join('\n');
    var subject = encodeURIComponent('I want to Johnukkah with you!');
    var body = encodeURIComponent(text);
    var recipient = 'luetkemeyer.john@gmail.com';
    window.location.href = 'mailto:' + recipient + '?subject=' + subject + '&body=' + body;
    document.getElementById('rsvp-status').textContent = 'A ready-to-send RSVP email has opened.';
  });
})();

(function () {
  var picker = document.getElementById('date-picker');
  var panels = Array.from(document.querySelectorAll('#calendar-panels > .bar'));
  if (!picker || !panels.length) return;

  var calendarItems = [];
  panels.forEach(function (panel) {
    var dateText = panel.querySelector('.bar-date').textContent.trim();
    var parts = dateText.split('·').map(function (part) { return part.trim(); });
    var weekday = parts[0] || '';
    var monthDay = (parts[1] || '').split(/\s+/);
    calendarItems.push({ type: 'day', weekday: weekday, month: monthDay[0] || 'Dec', number: Number(monthDay[1]), panel: panel });
  });
  calendarItems.push({ type: 'reserved', weekday: 'Thu', month: 'Dec', number: 24 });
  calendarItems.push({ type: 'reserved', weekday: 'Fri', month: 'Dec', number: 25 });
  calendarItems.sort(function (a, b) { return a.number - b.number; });

  var reservedPanel = document.createElement('section');
  reservedPanel.className = 'reserved-panel';
  reservedPanel.hidden = true;
  reservedPanel.setAttribute('role', 'tabpanel');
  reservedPanel.innerHTML = '<p class="reserved-date"></p><h3>Reserved for Jesus</h3><p>Christmas Eve and Christmas Day belong to Jesus. Johnukkah resumes December 26.</p>';
  document.getElementById('calendar-panels').appendChild(reservedPanel);

  function activateItem(index, moveFocus) {
    var buttons = Array.from(picker.querySelectorAll('.date-button'));
    var item = calendarItems[index];
    panels.forEach(function (panel) {
      var active = item.type === 'day' && panel === item.panel;
      panel.classList.toggle('calendar-active', active);
      panel.open = active;
      panel.hidden = !active;
    });
    reservedPanel.hidden = item.type !== 'reserved';
    reservedPanel.classList.toggle('calendar-active', item.type === 'reserved');
    if (item.type === 'reserved') reservedPanel.querySelector('.reserved-date').textContent = item.month + ' ' + item.number + ' · ' + item.weekday;
    buttons.forEach(function (button, buttonIndex) {
      var active = buttonIndex === index;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
    if (moveFocus && buttons[index]) buttons[index].focus();
  }

  calendarItems.forEach(function (item, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-button' + (item.type === 'reserved' ? ' date-reserved' : '');
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', item.month + ' ' + item.number + ', ' + item.weekday + (item.type === 'reserved' ? ': Reserved for Jesus' : ''));
    button.innerHTML = '<span class="date-month">' + item.month.toUpperCase() + '</span>' +
      '<span class="date-number">' + item.number + '</span>' +
      '<span class="date-weekday">' + item.weekday + '</span>';
    button.addEventListener('click', function () { activateItem(index, false); });
    button.addEventListener('keydown', function (event) {
      var next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % calendarItems.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + calendarItems.length) % calendarItems.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = calendarItems.length - 1;
      if (next !== null) { event.preventDefault(); activateItem(next, true); }
    });
    picker.appendChild(button);
  });
  activateItem(0, false);
})();
