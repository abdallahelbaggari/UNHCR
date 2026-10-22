/* UNHCR — professional pass (v2.0, Oct 2026)
   Loaded after the app's own script. It changes presentation only; every feature keeps working.
   • panel titles show their icon instead of code (&#x…;)
   • five tabs: Home, Emergency, Resources, Community, Profile (payments move into Profile)
   • "coming soon" placeholders hidden, developer leftovers removed
   • readable text sizes */
(function () {
  'use strict';

  /* 1. Panel titles: the app passes HTML entities ("&#x1FA79; First Aid"); show them as icons */
  var deco = document.createElement('textarea');
  function decode(s) { deco.innerHTML = String(s == null ? '' : s); return deco.value; }
  var _openP = window.openP;
  window.openP = function (title, html) {
    _openP(decode(title), html);
    cleanup(document.getElementById('pbody'));
  };

  /* 2. Hide placeholders: rows and grids marked "soon" */
  window.csrow = function () { return ''; };
  window.csoon = function () { return ''; };
  function cleanup(root) {
    if (!root) return;
    // section headers that only announce unfinished work
    root.querySelectorAll('.sh').forEach(function (h) {
      if (!h.querySelector('.badge-soon')) return;
      var next = h.nextElementSibling;
      if (next && !next.textContent.trim()) next.remove();
      if (!next || !next.isConnected || /coming soon/i.test(h.textContent)) {
        var n2 = h.nextElementSibling;
        if (n2 && !n2.textContent.trim()) n2.remove();
      }
      h.remove();
    });
    // any remaining inline "SOON" chips inside rows: hide the whole row
    root.querySelectorAll('span,div').forEach(function (el) {
      if (el.children.length) return;
      var t = el.textContent.replace(/[^\w ]/g, '').trim();
      if (t === 'SOON' || t === 'COMING SOON') {
        var row = el.closest('[onclick],.erow,.row') || el.parentElement;
        if (row && row !== root) row.remove();
      }
    });
    // developer leftovers
    root.querySelectorAll('button').forEach(function (b) { if (/Test payment endpoints/i.test(b.textContent)) (b.parentElement || b).remove(); });
    root.querySelectorAll('.bal-card').forEach(function (c) { c.remove(); });
    root.querySelectorAll('div').forEach(function (d) {
      if (!d.children.length || d.children.length < 4) {
        d.innerHTML = d.innerHTML.replace(/,? ?powered by Claude\.?/i, '.').replace(/\s*Powered by Anthropic Claude\.?/i, '');
      }
    });
  }

  /* 3. Re-render hooks: tidy every tab after it draws */
  ['renderHome', 'renderEmergency', 'renderResources', 'renderCommunity', 'renderWallet', 'renderMyUNHCR'].forEach(function (fn) {
    var orig = window[fn]; if (typeof orig !== 'function') return;
    window[fn] = function () {
      var r = orig.apply(this, arguments);
      var scr = document.querySelector('.scr.on .scroll') || document;
      cleanup(scr);
      if (fn === 'renderMyUNHCR') addSupportRow();
      if (fn === 'renderHome' || fn === 'renderWallet') addPriceCard(fn);
      return r;
    };
  });


  /* Live Pi price card (OKX first, then CoinGecko) on Home and Payments */
  function addPriceCard(fn) {
    if (!window.PiPrice) return;
    var scr = document.getElementById(fn === 'renderHome' ? 'scr-home' : 'scr-wallet'); if (!scr || scr.querySelector('.hp-price')) return;
    var box = document.createElement('div'); box.className = 'hp-price'; box.style.margin = '12px 16px 4px';
    var after = null;
    scr.querySelectorAll('div').forEach(function (d) { if (!after && /Independent application/.test(d.textContent) && d.children.length < 4 && d.textContent.length < 200) after = d; });
    if (after && after.parentNode) after.parentNode.insertBefore(box, after.nextSibling);
    else { var sb = scr.querySelector('.sbar'); if (sb && sb.nextSibling) sb.parentNode.insertBefore(box, sb.nextSibling); else scr.prepend(box); }
    PiPrice.mount(box, { accent: '#1257B0', currency: 'USD' });
  }

  /* 4. Five tabs: Payments lives in Profile as "Support the app" */
  function fixNav() {
    var nav = document.getElementById('nav'); if (!nav) return;
    nav.querySelectorAll('.nb').forEach(function (b) {
      var on = b.getAttribute('onclick') || '';
      if (on.indexOf("'wallet'") >= 0) b.remove();
      if (on.indexOf("'myunhcr'") >= 0) b.lastChild.textContent = 'Profile';
    });
    nav.classList.add('hp-nav5');
  }
  function addSupportRow() {
    var el = document.getElementById('my-scroll'); if (!el || document.getElementById('hp-support')) return;
    var row = document.createElement('div');
    row.id = 'hp-support';
    row.innerHTML = '<button class="hp-row" onclick="goTab(\'wallet\')"><span class="hp-ic">π</span><span class="hp-tx"><b>Support the app with Pi</b><small>Supports this independent app · not a UN donation</small></span><span class="hp-ch">›</span></button>';
    var first = el.querySelector('.sh');
    el.insertBefore(row, first || el.firstChild);
  }
  // wallet screen: a way back to Profile now that it has no tab
  var _rw = window.renderWallet;
  if (typeof _rw === 'function') {
    window.renderWallet = function () {
      var r = _rw.apply(this, arguments);
      var el = document.getElementById('wallet-scroll');
      if (el && !el.querySelector('.hp-back')) el.insertAdjacentHTML('afterbegin', '<button class="hp-back" onclick="goTab(\'myunhcr\',document.querySelector(\'.nb[onclick*=myunhcr]\'))">‹ Profile</button>');
      document.querySelectorAll('.nb').forEach(function (b) { b.classList.toggle('on', (b.getAttribute('onclick') || '').indexOf("'myunhcr'") >= 0); });
      return r;
    };
  }

  /* 5. Welcome text: no network jargon */
  function fixWelcome() {
    var n = document.querySelector('#login .note');
    if (n) n.textContent = 'Independent community app. Not affiliated with UNHCR, the United Nations or any government body.';
  }

  function init() { fixNav(); fixWelcome(); cleanup(document.getElementById('app')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
