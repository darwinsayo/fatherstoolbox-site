/* The Resources drop-down in the header. Opens on hover or focus where there is a mouse.
   On touch screens a tap on the word Resources or the arrow opens it; "All resources" inside goes to the page. Arrow keys move through it; Escape closes it. */
(function () {
  'use strict';
  var li = document.querySelector('.site-header .has-menu');
  if (!li) return;
  var btn = li.querySelector('.menu-toggle'), top = li.querySelector('a'), items = [].slice.call(li.querySelectorAll('.submenu a'));
  var hover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches, timer;
  function set(open) { li.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  function isOpen() { return li.classList.contains('open'); }
  btn.addEventListener('click', function (e) { e.preventDefault(); set(!isOpen()); if (isOpen() && e.detail === 0) items[0].focus(); });
  if (hover) {
    li.addEventListener('mouseenter', function () { clearTimeout(timer); set(true); });
    li.addEventListener('mouseleave', function () { timer = setTimeout(function () { if (!li.contains(document.activeElement)) set(false); }, 200); });
    top.addEventListener('focus', function () { set(true); });
  } else {
    top.addEventListener('click', function (e) { e.preventDefault(); set(!isOpen()); });
    top.setAttribute('aria-haspopup', 'true');
  }
  li.addEventListener('focusout', function () { setTimeout(function () { if (!li.contains(document.activeElement) && !li.matches(':hover')) set(false); }, 0); });
  li.addEventListener('keydown', function (e) {
    var i = items.indexOf(document.activeElement);
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); set(false); btn.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); set(true); items[i < 0 ? 0 : (i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); set(true); items[i <= 0 ? items.length - 1 : i - 1].focus(); }
    else if ((e.key === 'Home' || e.key === 'End') && i >= 0) { e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus(); }
  });
  document.addEventListener('click', function (e) { if (isOpen() && !li.contains(e.target)) set(false); });
})();
