/* Dacapo · web demo: tema, menú, galería, horario y revelados */
(function () {
  'use strict';
  var html = document.documentElement;

  /* selector de color */
  var botonesTema = document.querySelectorAll('.temas button');
  function marcarTema() {
    botonesTema.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.tema === (html.dataset.tema || 'rojo'))); });
  }
  botonesTema.forEach(function (b) {
    b.addEventListener('click', function () {
      html.dataset.tema = b.dataset.tema;
      try { localStorage.setItem('dacapo-tema', b.dataset.tema); } catch (e) { /* sin almacenamiento */ }
      marcarTema();
    });
  });
  marcarTema();

  /* cabecera y menú móvil */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  var menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var abierto = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', String(abierto));
      menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    document.querySelectorAll('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* enlaces que abren una pestaña del presupuestador */
  document.querySelectorAll('[data-abrir]').forEach(function (a) {
    a.addEventListener('click', function () { if (window.Presupuestador) window.Presupuestador.abrir(a.dataset.abrir); });
  });

  /* galería: filtros, ver más y visor */
  var galeria = document.getElementById('galeria');
  if (galeria) {
    var figs = Array.prototype.slice.call(galeria.querySelectorAll('figure'));
    var filtro = 'todos', todos = false;
    var verMas = document.getElementById('ver-mas'), verIg = document.getElementById('ver-ig');
    function aplicar() {
      figs.forEach(function (f) {
        var okCat = filtro === 'todos' || f.dataset.cat === filtro;
        var okExtra = todos || filtro !== 'todos' || !f.hasAttribute('data-extra');
        f.hidden = !(okCat && okExtra);
      });
      var quedan = filtro === 'todos' && !todos;
      if (verMas) verMas.hidden = !quedan;
      if (verIg) verIg.hidden = quedan;
    }
    document.querySelectorAll('[data-filtro]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro = b.dataset.filtro;
        document.querySelectorAll('[data-filtro]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        aplicar();
      });
    });
    if (verMas) verMas.addEventListener('click', function () { todos = true; aplicar(); });
    aplicar();

    var visor = document.getElementById('visor');
    var vImg = visor.querySelector('img'), vTxt = visor.querySelector('p');
    var actual = 0, ultimoFoco = null;
    function visibles() { return figs.filter(function (f) { return !f.hidden; }); }
    function mostrar(i) {
      var v = visibles(); if (!v.length) return;
      actual = (i + v.length) % v.length;
      var f = v[actual], img = f.querySelector('img');
      vImg.src = img.currentSrc || img.src; vImg.alt = img.alt;
      vTxt.innerHTML = '<b>' + f.querySelector('b').textContent + '</b> · ' + f.querySelector('figcaption span').textContent;
    }
    function abrirVisor(f) {
      ultimoFoco = document.activeElement;
      mostrar(visibles().indexOf(f));
      visor.hidden = false; document.body.style.overflow = 'hidden';
      visor.querySelector('.v-cerrar').focus();
    }
    function cerrarVisor() {
      visor.hidden = true; document.body.style.overflow = '';
      if (ultimoFoco) ultimoFoco.focus();
    }
    figs.forEach(function (f) {
      f.addEventListener('click', function () { abrirVisor(f); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor(f); } });
    });
    visor.querySelector('.v-cerrar').addEventListener('click', cerrarVisor);
    visor.querySelector('.v-prev').addEventListener('click', function () { mostrar(actual - 1); });
    visor.querySelector('.v-next').addEventListener('click', function () { mostrar(actual + 1); });
    visor.addEventListener('click', function (e) { if (e.target === visor) cerrarVisor(); });
    document.addEventListener('keydown', function (e) {
      if (visor.hidden) return;
      if (e.key === 'Escape') cerrarVisor();
      if (e.key === 'ArrowLeft') mostrar(actual - 1);
      if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
  }

  /* abierto ahora (hora de Madrid) */
  var HORARIO = { 0: [], 1: [[630, 840], [990, 1200]], 2: [[630, 840], [990, 1200]], 3: [[630, 840], [990, 1200]], 4: [[630, 840], [990, 1200]], 5: [[630, 840], [990, 1200]], 6: [[630, 840]] };
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function hhmm(m) { return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); }
  function ahoraMadrid() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
      return { d: d, m: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  var estado = document.getElementById('estado');
  if (estado) {
    var a = ahoraMadrid(), txt = '', abierto = false;
    var hoy = HORARIO[a.d];
    for (var i = 0; i < hoy.length; i++) {
      if (a.m >= hoy[i][0] && a.m < hoy[i][1]) { abierto = true; txt = 'Abierto · cierra a las ' + hhmm(hoy[i][1]); break; }
      if (a.m < hoy[i][0]) { txt = 'Cerrado · abre hoy a las ' + hhmm(hoy[i][0]); break; }
    }
    if (!abierto && !txt) {
      for (var k = 1; k <= 7; k++) {
        var d = (a.d + k) % 7;
        if (HORARIO[d].length) { txt = 'Cerrado · abre ' + (k === 1 ? 'mañana' : 'el ' + DIAS[d]) + ' a las ' + hhmm(HORARIO[d][0][0]); break; }
      }
    }
    estado.classList.toggle('abierto', abierto);
    estado.querySelector('span').textContent = txt;
    var clave = a.d === 0 ? '0' : a.d === 6 ? '6' : '1-5';
    document.querySelectorAll('#horario [data-dia="' + clave + '"]').forEach(function (s) { s.classList.add('hoy'); });
  }

  /* revelado al hacer scroll */
  var rev = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('visto'); });

  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
