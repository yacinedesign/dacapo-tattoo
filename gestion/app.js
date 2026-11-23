/* Panel de gestión de Dacapo · demo sin servidor.
   Los datos viven en localStorage de este navegador y se regeneran cada día. */
(function () {
  'use strict';
  var U = window.DACAPO_UTIL;
  var CLAVE = 'dacapo-gestion-v1', CLAVE_WEB = 'dacapo-consultas-web';
  var ahoraD = new Date();
  var HOY = U.iso(ahoraD), AHORA = ahoraD.getHours() * 60 + ahoraD.getMinutes();
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIAS_C = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var P = 1.15;              // píxeles por minuto en la agenda
  var A_INI = 600, A_FIN = 1230;
  var S;

  /* ---------- estado ---------- */
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } }
  function cargar() {
    try {
      var t = localStorage.getItem(CLAVE);
      if (t) { var o = JSON.parse(t); if (o && o.version === 1 && o.creado === HOY) return o; }
    } catch (e) { /* datos corruptos: se regeneran */ }
    return window.DACAPO_SEED(HOY, AHORA);
  }
  function importarWeb() {
    var nuevas = 0;
    try {
      var l = JSON.parse(localStorage.getItem(CLAVE_WEB) || '[]');
      l.forEach(function (q) {
        if (!q || !q.id || S.consultas.some(function (x) { return x.id === q.id; })) return;
        q.estado = 'nueva'; q.web = true; q.nombre = q.nombre || 'Sin nombre';
        S.consultas.unshift(q); nuevas++;
      });
    } catch (e) { /* nada */ }
    if (nuevas) guardar();
    return nuevas;
  }

  /* ---------- utilidades ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function eur(n) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n || 0) + ' €'; }
  function art(id) { return S.artistas.filter(function (a) { return a.id === id; })[0] || { n: '—', color: '#999' }; }
  function cli(id) { return S.clientes.filter(function (c) { return c.id === id; })[0] || { n: 'Cliente', tel: '' }; }
  function cita(id) { return S.citas.filter(function (c) { return c.id === id; })[0]; }
  function ini(n) { return n.split(' ').map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase(); }
  function primerNombre(n) { return String(n).split(' ')[0]; }
  function dow(f) { return U.parse(f).getDay(); }
  function fechaCorta(f) { var d = U.parse(f); return DIAS_C[d.getDay()] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3); }
  function fechaRel(f) {
    if (f === HOY) return 'hoy'; if (f === U.addD(HOY, 1)) return 'mañana'; if (f === U.addD(HOY, -1)) return 'ayer';
    var d = U.parse(f), diff = Math.round((d - U.parse(HOY)) / 864e5);
    if (diff > 0 && diff < 7) return DIAS[d.getDay()];
    return fechaCorta(f);
  }
  function hace(ts) {
    var m = Math.max(1, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
    if (m < 60) return 'hace ' + m + ' min'; var h = Math.round(m / 60);
    if (h < 24) return 'hace ' + h + ' h'; var d = Math.round(h / 24); return 'hace ' + d + (d === 1 ? ' día' : ' días');
  }
  function lunes(f) { var d = dow(f); return U.addD(f, d === 0 ? -6 : 1 - d); }
  function semanaISO(f) { var d = U.parse(f); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); var w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7); }
  function turnos(f) { var d = dow(f); return d === 0 ? [] : d === 6 ? [[630, 840]] : [[630, 840], [990, 1200]]; }
  function trabaja(a, f) { var d = dow(f); if (d === 0) return false; if (d === 6 && (a.id === 'alex' || a.id === 'guille')) return false; return true; }
  function activas() { return S.citas.filter(function (c) { return c.estado !== 'cancelada'; }); }
  function pasada(c) { return c.fecha < HOY || (c.fecha === HOY && c.fin <= AHORA); }
  function choques() {
    var r = [], porClave = {};
    activas().forEach(function (c) { if (c.fecha < HOY || c.estado === 'no-show') return; var k = c.artista + c.fecha; (porClave[k] = porClave[k] || []).push(c); });
    Object.keys(porClave).forEach(function (k) {
      var l = porClave[k].sort(function (a, b) { return a.ini - b.ini; });
      for (var i = 0; i < l.length; i++) for (var j = i + 1; j < l.length; j++) if (l[j].ini < l[i].fin && l[i].ini < l[j].fin) r.push([l[i], l[j]]);
    });
    return r;
  }
  function ocupacion(a, desde, dias) {
    var disp = 0, ocup = 0;
    for (var i = 0; i < dias; i++) {
      var f = U.addD(desde, i); if (!trabaja(a, f)) continue;
      turnos(f).forEach(function (t) { disp += t[1] - t[0]; });
    }
    activas().forEach(function (c) { if (c.artista === a.id && c.fecha >= desde && c.fecha < U.addD(desde, dias) && c.estado !== 'no-show') ocup += c.fin - c.ini; });
    return disp ? Math.min(100, Math.round(ocup / disp * 100)) : 0;
  }
  function cobrosMes(mes) { return S.cobros.filter(function (p) { return p.fecha.slice(0, 7) === mes; }); }
  function suma(l, k) { return l.reduce(function (n, x) { return n + (+x[k] || 0); }, 0); }
  function precioDe(q) { return q.precio || parseInt(String(q.rango || '').replace(/\./g, '').match(/\d+/) || [0], 10); }
  function durDe(q) { return q.tipo === 'piercing' ? 30 : Math.min(240, Math.max(60, Math.round(precioDe(q) / 110 * 2) * 30)); }
  function waTexto(t) { return 'https://wa.me/?text=' + encodeURIComponent(t); }
  function huecoLibre(aid, dur) {
    for (var i = 1; i < 21; i++) {
      var f = U.addD(HOY, i); var a = art(aid); if (!trabaja(a, f)) continue;
      var citasDia = activas().filter(function (c) { return c.artista === aid && c.fecha === f; });
      var ts = turnos(f);
      for (var k = 0; k < ts.length; k++) for (var t = ts[k][0]; t + dur <= ts[k][1]; t += 30) {
        var libre = !citasDia.some(function (c) { return t < c.fin && c.ini < t + dur; });
        if (libre) return { fecha: f, ini: t };
      }
    }
    return null;
  }

  /* ---------- avisos (toast) y capas ---------- */
  var toastT;
  function toast(t) { var el = document.getElementById('toast'); el.querySelector('span').textContent = t; el.classList.add('ver'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('ver'); }, 2600); }
  var pila = [];
  function abrirCapa(tipo, html, alMontar) {
    var cont = document.getElementById('capas');
    var capa = document.createElement('div'); capa.className = 'capa';
    var el = document.createElement('div'); el.className = tipo; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.innerHTML = html;
    capa.style.zIndex = 40 + pila.length * 2; el.style.zIndex = 41 + pila.length * 2;
    cont.appendChild(capa); cont.appendChild(el);
    var item = { capa: capa, el: el, foco: document.activeElement };
    pila.push(item);
    capa.addEventListener('click', cerrarCapa);
    requestAnimationFrame(function () { capa.classList.add('ver'); el.classList.add('ver'); });
    if (alMontar) alMontar(el);
    var f = el.querySelector('input:not([type=checkbox]), select, textarea, .cerrar'); if (f) setTimeout(function () { f.focus(); }, 60);
    return el;
  }
  function cerrarCapa() {
    var it = pila.pop(); if (!it) return;
    it.capa.classList.remove('ver'); it.el.classList.remove('ver');
    setTimeout(function () { it.capa.remove(); it.el.remove(); }, 220);
    if (it.foco && it.foco.focus) it.foco.focus();
  }
  function cerrarTodo() { while (pila.length) cerrarCapa(); }
  function cab(t, sub) { return '<div class="cajon-cab"><div><h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div><button class="cerrar" type="button" data-acc="cerrar" aria-label="Cerrar">✕</button></div>'; }

  /* ---------- tareas del día ---------- */
  function tareas() {
    var t = [];
    choques().forEach(function (p) {
      var a = art(p[0].artista);
      t.push({ ico: 'alerta', c: 'rojo', b: 'Doble reserva · ' + fechaRel(p[0].fecha) + ' ' + U.hm(p[1].ini), s: a.n + ': ' + cli(p[0].cliente).n + ' (' + U.hm(p[0].ini) + '–' + U.hm(p[0].fin) + ') y ' + cli(p[1].cliente).n + ' (' + U.hm(p[1].ini) + ')', acc: '<button class="btn-link" data-acc="ver-dia" data-f="' + p[0].fecha + '">Ver agenda</button><button class="btn btn-sm" data-acc="cita" data-id="' + p[1].id + '">Resolver</button>' });
    });
    S.consultas.filter(function (q) { return q.estado === 'nueva'; }).forEach(function (q) {
      var det = q.tipo === 'piercing' ? 'Piercing: ' + q.piercings : q.estilo + ' en ' + String(q.zona).toLowerCase() + ', ' + q.cm + ' cm';
      t.push({ ico: 'consultas', c: 'azul', b: 'Consulta sin responder · ' + q.origen, s: q.nombre + ': ' + det + ' · ' + q.rango, small: hace(q.fecha) + (q.web ? ' · desde el presupuestador' : ''), acc: '<button class="btn btn-sm btn-osc" data-acc="responder" data-id="' + q.id + '">Responder</button>' });
    });
    activas().filter(function (c) { return (c.fecha === HOY && c.ini > AHORA || c.fecha === U.addD(HOY, 1)) && c.estado === 'confirmada' && !c.consentimiento && c.tipo !== 'revision'; })
      .sort(function (a, b) { return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.ini - b.ini; })
      .forEach(function (c) {
        t.push({ ico: 'firma', c: 'amb', b: 'Falta el consentimiento · ' + fechaRel(c.fecha) + ' ' + U.hm(c.ini), s: cli(c.cliente).n + ' con ' + art(c.artista).n + ': ' + c.desc + (c.menor ? ' · menor: firma también el tutor' : ''), acc: '<button class="btn btn-sm" data-acc="firmar" data-id="' + c.id + '">Firmar</button>' });
      });
    activas().filter(function (c) { return c.fecha >= HOY && c.fecha <= U.addD(HOY, 7) && c.senal && !c.senalPagada && c.estado === 'confirmada'; })
      .forEach(function (c) {
        var txt = '¡Hola, ' + primerNombre(cli(c.cliente).n) + '! Para dejar confirmada tu cita del ' + fechaCorta(c.fecha) + ' a las ' + U.hm(c.ini) + ' con ' + art(c.artista).n + ' nos falta la señal de ' + c.senal + ' € por Bizum. ¡Gracias! · Dacapo';
        t.push({ ico: 'euro', c: 'amb', b: 'Señal sin cobrar · ' + fechaRel(c.fecha) + ' ' + U.hm(c.ini), s: cli(c.cliente).n + ' · ' + c.desc + ' · ' + eur(c.senal), acc: '<a class="btn-link" href="' + waTexto(txt) + '" target="_blank" rel="noopener">Recordar</a><button class="btn btn-sm" data-acc="senal" data-id="' + c.id + '">Cobrada</button>' });
      });
    activas().filter(function (c) { return pasada(c) && c.estado === 'confirmada'; }).forEach(function (c) {
      t.push({ ico: 'euro', c: 'rojo', b: 'Cita sin cerrar · ' + fechaRel(c.fecha) + ' ' + U.hm(c.ini), s: cli(c.cliente).n + ' · ' + c.desc + ' · falta cobrar o marcar «no vino»', acc: '<button class="btn btn-sm btn-osc" data-acc="cobrar" data-id="' + c.id + '">Cobrar</button>' });
    });
    S.stock.filter(function (s) { return s.qty < s.min && !s.pedido; }).forEach(function (s) {
      t.push({ ico: 'stock', c: 'verde', b: 'Stock bajo · ' + s.n, s: 'Quedan ' + s.qty + ' ' + s.u + ' (mínimo ' + s.min + ') · ' + s.prov, acc: '<button class="btn btn-sm" data-acc="pedir" data-id="' + s.id + '">Pedir</button>' });
    });
    return t;
  }

  function badges() {
    var n = S.consultas.filter(function (q) { return q.estado === 'nueva'; }).length;
    var c = activas().filter(function (x) { return x.fecha >= HOY && x.fecha <= U.addD(HOY, 2) && x.estado === 'confirmada' && !x.consentimiento && x.tipo !== 'revision' && !(x.fecha === HOY && x.ini < AHORA); }).length;
    var s = S.stock.filter(function (x) { return x.qty < x.min && !x.pedido; }).length;
    [['b-consultas', n], ['b-consent', c], ['b-stock', s]].forEach(function (p) { var el = document.getElementById(p[0]); el.hidden = !p[1]; el.textContent = p[1]; });
  }

  /* ---------- vistas ---------- */
  var V = {};
  var estadoVista = { dia: dow(HOY) === 0 ? U.addD(HOY, 1) : HOY, verTodo: false, buscar: '', filtroCli: 'todos', filtroCons: 'pendientes', filtroStock: 'todo' };

  V.inicio = function () {
    var hoyC = activas().filter(function (c) { return c.fecha === HOY; }).sort(function (a, b) { return a.ini - b.ini; });
    var prox = hoyC.filter(function (c) { return c.ini >= AHORA; })[0];
    var mes = HOY.slice(0, 7), cm = cobrosMes(mes), total = suma(cm, 'importe');
    var hechasMes = activas().filter(function (c) { return c.fecha.slice(0, 7) === mes && c.estado === 'hecha'; });
    var nuevas = S.consultas.filter(function (q) { return q.estado === 'nueva'; });
    var senPend = activas().filter(function (c) { return c.fecha >= HOY && c.senal && !c.senalPagada && c.estado === 'confirmada'; });
    var lun = lunes(HOY);
    var semana = activas().filter(function (c) { return c.fecha >= lun && c.fecha < U.addD(lun, 7); });
    var occTot = Math.round(S.artistas.reduce(function (n, a) { return n + ocupacion(a, lun, 6); }, 0) / S.artistas.length);
    var decididas = S.consultas.filter(function (q) { return q.estado === 'senal' || q.estado === 'perdida'; });
    var conv = decididas.length ? Math.round(decididas.filter(function (q) { return q.estado === 'senal'; }).length / decididas.length * 100) : 0;
    var noshow = activas().filter(function (c) { return c.estado === 'no-show' && c.fecha >= U.addD(HOY, -30); }).length;
    var bajo = S.stock.filter(function (s) { return s.qty < s.min; }).length;
    var T = tareas();
    var mostrar = estadoVista.verTodo ? T : T.slice(0, 8);

    var h = '<div class="kpis">' +
      kpi('Citas hoy', 'agenda', hoyC.length, prox ? 'Próxima: ' + U.hm(prox.ini) + ' · ' + primerNombre(cli(prox.cliente).n) + ' con ' + art(prox.artista).n : 'No quedan más citas hoy') +
      kpi('Cobrado en ' + MESES[ahoraD.getMonth()], 'euro', eur(total), cm.length + ' cobros · media por cita ' + eur(hechasMes.length ? total / hechasMes.length : 0)) +
      kpi('Consultas nuevas', 'consultas', nuevas.length, nuevas.length ? nuevas.filter(function (q) { return q.origen === 'Web'; }).length + ' desde la web · ' + nuevas.filter(function (q) { return q.origen === 'Instagram'; }).length + ' de Instagram' : 'Todas respondidas', nuevas.length ? 'mal' : 'bien') +
      kpi('Señales pendientes', 'reloj', senPend.length, senPend.length ? eur(suma(senPend, 'senal')) + ' por cobrar' : 'Todas cobradas', senPend.length ? 'mal' : 'bien') +
      '</div>';
    h += '<div class="card kpis-2">' +
      '<div><h4>Ocupación semana</h4><b>' + occTot + ' %</b><div class="barra"><i style="width:' + occTot + '%"></i></div></div>' +
      '<div><h4>Citas esta semana</h4><b>' + semana.length + '</b><p>' + semana.filter(function (c) { return c.tipo === 'tatuaje'; }).length + ' tatuajes · ' + semana.filter(function (c) { return c.tipo !== 'tatuaje'; }).length + ' piercings</p></div>' +
      '<div><h4>Clientes</h4><b>' + S.clientes.length + '</b><p>' + S.clientes.filter(function (c) { return c.alta >= U.addD(HOY, -30); }).length + ' nuevos en 30 días</p></div>' +
      '<div><h4>Conversión</h4><b>' + conv + ' %</b><p>de consultas que pagan señal</p></div>' +
      '<div><h4>No vinieron</h4><b>' + noshow + '</b><p>en los últimos 30 días</p></div>' +
      '<div><h4>Stock bajo</h4><b>' + bajo + '</b><p>artículos bajo mínimo</p></div>' +
      '</div>';
    h += '<div class="rejilla"><section class="card bloque"><div class="bloque-cab"><h2>Para hacer <span class="n">' + T.length + '</span></h2></div>' +
      '<p class="sub">Cada aviso tiene su acción: responder, firmar, cobrar o pedir.</p>' +
      (T.length ? '<ul class="tareas">' + mostrar.map(function (x) {
        return '<li class="tarea"><span class="ico ' + x.c + '"><svg><use href="#i-' + x.ico + '"/></svg></span><div><b>' + esc(x.b) + '</b><span>' + esc(x.s) + '</span>' + (x.small ? '<small>' + esc(x.small) + '</small>' : '') + '</div><div class="acc">' + x.acc + '</div></li>';
      }).join('') + '</ul>' + (T.length > 8 ? '<button class="btn-link" data-acc="ver-todo" style="margin-top:8px">' + (estadoVista.verTodo ? 'Ver menos' : 'Ver los ' + T.length + ' avisos') + '</button>' : '') : '<p class="vacio">Todo al día. 🖤</p>') +
      '</section><div style="display:grid;gap:16px">' +
      '<section class="card bloque"><div class="bloque-cab"><h2>Hoy en el estudio</h2><button class="btn-link" data-acc="ver-dia" data-f="' + HOY + '">Agenda →</button></div>' +
      (hoyC.length ? '<ul class="hoy-lista">' + hoyC.map(function (c) {
        var a = art(c.artista);
        return '<li class="' + (pasada(c) ? 'hecha' : '') + '" data-acc="cita" data-id="' + c.id + '"><time>' + U.hm(c.ini) + '</time><i style="background:' + a.color + '"></i><div><b>' + esc(cli(c.cliente).n) + '</b><span>' + esc(a.n + ' · ' + c.desc) + '</span></div>' + chipEstado(c) + '</li>';
      }).join('') + '</ul>' : '<p class="vacio">Hoy no hay citas.</p>') +
      '</section>' +
      '<section class="card bloque"><div class="bloque-cab"><h2>Ocupación de la semana</h2></div><div class="ocupacion">' +
      S.artistas.map(function (a) { var o = ocupacion(a, lun, 6); return '<div><span>' + a.n + '</span><span class="b"><i style="width:' + o + '%;background:' + a.color + '"></i></span><em>' + o + ' %</em></div>'; }).join('') +
      '</div>' + graficoSemanas() + '</section></div></div>';
    return h;
  };
  function kpi(t, ico, num, p, cls) { return '<div class="card kpi"><h3>' + t + '<svg><use href="#i-' + ico + '"/></svg></h3><div class="num">' + num + '</div><p class="' + (cls || '') + '">' + esc(p) + '</p></div>'; }
  function chipEstado(c) {
    if (c.estado === 'no-show') return '<span class="chip mal">No vino</span>';
    if (c.estado === 'hecha') return '<span class="chip ok">Cobrada</span>';
    if (pasada(c)) return '<span class="chip mal">Sin cerrar</span>';
    if (!c.consentimiento && c.tipo !== 'revision') return '<span class="chip amb">Sin firma</span>';
    if (c.senal && !c.senalPagada) return '<span class="chip amb">Sin señal</span>';
    return '<span class="chip">Confirmada</span>';
  }
  function graficoSemanas() {
    var lun = lunes(HOY), sem = [];
    for (var i = 3; i >= 0; i--) {
      var d = U.addD(lun, -7 * i), tot = suma(S.cobros.filter(function (p) { return p.fecha >= d && p.fecha < U.addD(d, 7); }), 'importe');
      sem.push({ d: d, tot: tot, actual: i === 0 });
    }
    var max = Math.max.apply(null, sem.map(function (s) { return s.tot; }).concat([1]));
    return '<p class="sec-t" style="margin-top:22px">Cobrado por semana</p><div class="semana-graf">' + sem.map(function (s) {
      return '<div class="' + (s.actual ? 'actual' : '') + '"><b>' + eur(s.tot) + '</b><i style="height:' + Math.max(3, Math.round(s.tot / max * 80)) + 'px"></i><span>Sem. ' + semanaISO(s.d) + '</span></div>';
    }).join('') + '</div>';
  }

  V.agenda = function () {
    var f = estadoVista.dia, lun = lunes(f), h = '';
    h += '<div class="ag-barra"><div class="ag-dias">';
    for (var i = 0; i < 6; i++) {
      var d = U.addD(lun, i), n = activas().filter(function (c) { return c.fecha === d; }).length, dt = U.parse(d);
      h += '<button class="ag-dia' + (d === f ? ' sel' : '') + (d === HOY ? ' hoy' : '') + '" data-acc="dia" data-f="' + d + '"><b>' + DIAS_C[dt.getDay()] + '</b><span>' + dt.getDate() + ' ' + MESES[dt.getMonth()].slice(0, 3) + '</span><small>' + n + ' citas</small></button>';
    }
    h += '</div><div class="ag-nav"><button class="btn" data-acc="dia" data-f="' + U.addD(lun, -7) + '" aria-label="Semana anterior">←</button><button class="btn" data-acc="dia" data-f="' + (dow(HOY) === 0 ? U.addD(HOY, 1) : HOY) + '">Hoy</button><button class="btn" data-acc="dia" data-f="' + U.addD(lun, 7) + '" aria-label="Semana siguiente">→</button></div></div>';
    var alto = (A_FIN - A_INI) * P;
    var choqueIds = {}; choques().forEach(function (p) { choqueIds[p[0].id] = choqueIds[p[1].id] = 1; });
    h += '<div class="card agenda"><div class="ag-grid"><div class="ag-head vacia"></div>';
    S.artistas.forEach(function (a) {
      var n = activas().filter(function (c) { return c.fecha === f && c.artista === a.id; }).length;
      h += '<div class="ag-head"><span class="punto" style="background:' + a.color + '"></span>' + a.n + '<small>' + (trabaja(a, f) ? n + ' citas' : 'Día libre') + '</small></div>';
    });
    h += '<div class="ag-horas" style="height:' + alto + 'px">';
    for (var m = A_INI + 30; m < A_FIN; m += 60) h += '<span style="top:' + (m - A_INI) * P + 'px">' + U.hm(m) + '</span>';
    if (f === HOY && AHORA > A_INI && AHORA < A_FIN) h += '<b class="ahora-h" style="top:' + (AHORA - A_INI) * P + 'px">' + U.hm(AHORA) + '</b>';
    h += '</div>';
    var ts = turnos(f);
    S.artistas.forEach(function (a) {
      h += '<div class="ag-col" style="height:' + alto + 'px;--h:' + 60 * P + 'px;background-position:0 ' + 30 * P + 'px">';
      // zonas cerradas
      var abiertos = trabaja(a, f) ? ts : [];
      var cursor = A_INI;
      abiertos.concat([[A_FIN, A_FIN]]).forEach(function (t) {
        if (t[0] > cursor) {
          var etq = t[0] === A_FIN ? (cursor === A_INI ? 'Día libre' : 'Cerrado') : (cursor === A_INI ? '' : 'Descanso');
          h += '<div class="pausa" style="top:' + (cursor - A_INI) * P + 'px;height:' + (t[0] - cursor) * P + 'px">' + (t[0] - cursor >= 90 ? etq : '') + '</div>';
        }
        cursor = Math.max(cursor, t[1]);
      });
      var dia = activas().filter(function (c) { return c.fecha === f && c.artista === a.id; });
      abiertos.forEach(function (t) {
        for (var x = t[0]; x < t[1]; x += 30) {
          var ocupado = dia.some(function (c) { return x < c.fin && c.ini < x + 30; });
          if (!ocupado) h += '<button class="libre" data-acc="nueva-cita" data-artista="' + a.id + '" data-f="' + f + '" data-ini="' + x + '" style="top:' + ((x - A_INI) * P + 1) + 'px;height:' + (30 * P - 2) + 'px" aria-label="Nueva cita con ' + a.n + ' a las ' + U.hm(x) + '">+ ' + U.hm(x) + '</button>';
        }
      });
      dia.forEach(function (c) {
        var cl = 'cita' + (c.estado === 'hecha' ? ' hecha' : '') + (c.estado === 'no-show' ? ' noshow' : '') + (choqueIds[c.id] ? ' choque' : '');
        var corto = (c.fin - c.ini) <= 30;
        var ind = c.tipo === 'revision' ? '' : '<i class="' + (c.consentimiento ? 'ok' : 'mal') + '">' + (c.consentimiento ? '✓ firma' : '✗ firma') + '</i>' + (c.senal ? '<i class="' + (c.senalPagada ? 'ok' : 'mal') + '">' + (c.senalPagada ? '✓ señal' : '✗ señal') + '</i>' : '');
        h += '<button class="' + cl + '" data-acc="cita" data-id="' + c.id + '" style="--c:' + a.color + ';top:' + ((c.ini - A_INI) * P + 1) + 'px;height:' + ((c.fin - c.ini) * P - 2) + 'px">' +
          '<time>' + U.hm(c.ini) + '–' + U.hm(c.fin) + (corto ? ' · ' + esc(primerNombre(cli(c.cliente).n)) : '') + '</time>' +
          (corto ? '' : '<b>' + esc(cli(c.cliente).n) + '</b><span>' + esc(c.desc) + '</span>' + ((c.fin - c.ini) >= 90 ? '<span class="ind">' + ind + '</span>' : '')) + '</button>';
      });
      if (f === HOY && AHORA > A_INI && AHORA < A_FIN) h += '<div class="ahora-c" style="top:' + (AHORA - A_INI) * P + 'px"></div>';
      h += '</div>';
    });
    h += '</div></div>';
    h += '<div class="leyenda"><span>Toca un hueco libre para crear una cita · toca una cita para cobrar, firmar o avisar</span>' + S.artistas.map(function (a) { return '<span><i class="punto" style="background:' + a.color + '"></i>' + a.n + '</span>'; }).join('') + '</div>';
    return h;
  };

  V.consultas = function () {
    var cols = [['nueva', 'Nuevas'], ['presupuestada', 'Presupuestadas'], ['senal', 'Señal cobrada'], ['perdida', 'Perdidas']];
    var h = '<div class="aviso info" style="margin-bottom:16px"><span>Las consultas que hace la gente en el <a href="../presupuesto.html" target="_blank" rel="noopener" style="text-decoration:underline">presupuestador de la web</a> entran aquí solas, con estilo, zona, tamaño y precio orientativo. Pruébalo: rellénalo, pulsa «Enviar por WhatsApp» y vuelve a esta pestaña.</span></div>';
    h += '<div class="kanban">' + cols.map(function (col) {
      var l = S.consultas.filter(function (q) { return q.estado === col[0]; });
      return '<section class="col-k"><h3>' + col[1] + '<b>' + l.length + '</b></h3>' + l.map(tarjetaLead).join('') + (l.length ? '' : '<p class="vacio" style="font-size:13px">Nada por aquí.</p>') + '</section>';
    }).join('') + '</div>';
    return h;
  };
  function detalleLead(q) {
    return q.tipo === 'piercing' ? 'Piercing: ' + q.piercings + ' · joya ' + String(q.joya || '').toLowerCase() : q.estilo + ' · ' + String(q.zona).toLowerCase() + ' · ' + q.cm + ' cm · ' + String(q.color || '').toLowerCase();
  }
  function tarjetaLead(q) {
    var a = art(q.artista);
    var chip = q.origen === 'Web' ? 'mal' : q.origen === 'Instagram' ? 'azul' : 'ok';
    var acc = '';
    if (q.estado === 'nueva') acc = '<button class="btn btn-sm btn-osc" data-acc="responder" data-id="' + q.id + '">Responder</button><button class="btn btn-sm" data-acc="perdida" data-id="' + q.id + '">Perdida</button>';
    if (q.estado === 'presupuestada') acc = '<button class="btn btn-sm btn-osc" data-acc="lead-cita" data-id="' + q.id + '">Señal cobrada → cita</button><button class="btn btn-sm" data-acc="perdida" data-id="' + q.id + '">Perdida</button>';
    if (q.estado === 'senal') acc = q.cita && cita(q.cita) ? '<button class="btn btn-sm" data-acc="cita" data-id="' + q.cita + '">Ver la cita</button>' : '<span class="chip ok">Con cita</span>';
    if (q.estado === 'perdida') acc = '<span class="chip">' + esc(q.motivo || 'Sin respuesta') + '</span><button class="btn-link" data-acc="recuperar" data-id="' + q.id + '">Recuperar</button>';
    return '<article class="lead' + (q.web && q.estado === 'nueva' ? ' nueva-web' : '') + '"><div class="lead-cab"><span class="chip ' + chip + '">' + esc(q.origen) + (q.web ? ' · presupuestador' : '') + '</span><small style="color:var(--dim);font-size:11.5px">' + hace(q.fecha) + '</small></div>' +
      '<h4>' + esc(q.nombre) + '</h4><p class="detalle">' + esc(detalleLead(q)) + '</p>' + (q.idea ? '<p class="idea">«' + esc(q.idea) + '»</p>' : '') +
      '<p>Orientativo: <span class="precio">' + esc(q.rango) + '</span>' + (q.precio ? ' · presupuesto <span class="precio">' + eur(q.precio) + '</span>' : '') + '</p>' +
      '<p style="display:flex;align-items:center;gap:6px"><span class="punto" style="background:' + a.color + '"></span>Para ' + esc(a.n) + '</p>' +
      '<div class="lead-pie">' + acc + '</div></article>';
  }

  V.clientes = function () {
    var q = estadoVista.buscar.toLowerCase(), f = estadoVista.filtroCli;
    var l = S.clientes.map(function (c) {
      var cs = activas().filter(function (x) { return x.cliente === c.id; });
      var hechas = cs.filter(function (x) { return x.estado === 'hecha'; }).sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
      var prox = cs.filter(function (x) { return !pasada(x) && x.estado === 'confirmada'; }).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; })[0];
      return { c: c, visitas: hechas.length, ultima: hechas[0], prox: prox, gastado: suma(S.cobros.filter(function (p) { return p.cliente === c.id; }), 'importe') };
    }).filter(function (x) {
      if (q && (x.c.n + ' ' + x.c.tel).toLowerCase().indexOf(q) < 0) return false;
      if (f === 'proxima') return !!x.prox;
      if (f === 'etiquetas') return x.c.etiquetas.length > 0;
      return true;
    }).sort(function (a, b) { return b.gastado - a.gastado; });
    var h = '<div class="filtros"><input class="buscar" type="search" id="buscar" placeholder="Buscar por nombre o teléfono" value="' + esc(estadoVista.buscar) + '" aria-label="Buscar cliente">' +
      '<div class="seg" role="group" aria-label="Filtrar">' + [['todos', 'Todos'], ['proxima', 'Con cita'], ['etiquetas', 'Con avisos']].map(function (o) { return '<button data-acc="filtro-cli" data-v="' + o[0] + '" aria-pressed="' + (f === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<span style="color:var(--muted);font-size:13px">' + l.length + ' clientes</span></div>';
    h += '<div class="card tabla-wrap"><table class="tabla"><thead><tr><th>Cliente</th><th>Teléfono</th><th>Última visita</th><th>Próxima cita</th><th class="num">Visitas</th><th class="num">Gastado</th></tr></thead><tbody>' +
      l.map(function (x) {
        var c = x.c;
        return '<tr class="clic" data-acc="cliente" data-id="' + c.id + '" tabindex="0"><td><div class="persona"><span class="av" style="background:' + colorNombre(c.n) + '">' + ini(c.n) + '</span><div>' + esc(c.n) + (c.etiquetas.length ? '<div style="margin-top:3px">' + c.etiquetas.map(function (e) { return '<span class="chip ' + (e.indexOf('Alergia') >= 0 || e.indexOf('Menor') >= 0 ? 'amb' : 'osc') + '">' + esc(e) + '</span>'; }).join(' ') + '</div>' : '') + '</div></div></td>' +
          '<td>' + esc(c.tel) + '</td><td>' + (x.ultima ? fechaCorta(x.ultima.fecha) + ' · ' + art(x.ultima.artista).n : '—') + '</td><td>' + (x.prox ? '<span class="chip azul">' + fechaRel(x.prox.fecha) + ' ' + U.hm(x.prox.ini) + '</span>' : '—') + '</td><td class="num">' + x.visitas + '</td><td class="num">' + eur(x.gastado) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    return h;
  };
  function colorNombre(n) { var c = ['#7c5c4a', '#4a6a7c', '#6a4a7c', '#4a7c5c', '#7c4a5c', '#5c5c7c', '#7c6a4a']; var s = 0; for (var i = 0; i < n.length; i++) s += n.charCodeAt(i); return c[s % c.length]; }

  V.consentimientos = function () {
    var f = estadoVista.filtroCons;
    var l = activas().filter(function (c) { return c.tipo !== 'revision' && c.estado !== 'no-show' && c.fecha >= U.addD(HOY, -14) && c.fecha <= U.addD(HOY, 7); })
      .filter(function (c) { return f === 'todos' || (f === 'pendientes' ? !c.consentimiento : !!c.consentimiento); })
      .sort(function (a, b) { return a.fecha < b.fecha ? (f === 'firmados' ? 1 : -1) : a.fecha > b.fecha ? (f === 'firmados' ? -1 : 1) : a.ini - b.ini; });
    var pend = activas().filter(function (c) { return c.tipo !== 'revision' && !pasada(c) && c.estado === 'confirmada' && !c.consentimiento && c.fecha <= U.addD(HOY, 7); }).length;
    var firm = activas().filter(function (c) { return c.consentimiento && c.consentimiento.fecha && c.consentimiento.fecha.slice(0, 7) === HOY.slice(0, 7); }).length;
    var men = activas().filter(function (c) { return c.menor && !pasada(c); }).length;
    var h = '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' + kpi('Pendientes · 7 días', 'firma', pend, pend ? 'Fírmalos en la tablet al llegar' : 'Todo firmado', pend ? 'mal' : 'bien') + kpi('Firmados este mes', 'firma', firm, 'Guardados con fecha y firma') + kpi('Menores con cita', 'clientes', men, men ? 'Firma también el tutor legal' : 'Ninguno') + '</div>';
    h += '<div class="filtros"><div class="seg" role="group" aria-label="Filtrar">' + [['pendientes', 'Pendientes'], ['firmados', 'Firmados'], ['todos', 'Todos']].map(function (o) { return '<button data-acc="filtro-cons" data-v="' + o[0] + '" aria-pressed="' + (f === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div><span style="color:var(--muted);font-size:13px">Citas de los últimos 14 días y los próximos 7</span></div>';
    h += '<div class="card tabla-wrap"><table class="tabla"><thead><tr><th>Cita</th><th>Cliente</th><th>Servicio</th><th>Artista</th><th>Estado</th><th></th></tr></thead><tbody>' +
      (l.length ? l.map(function (c) {
        var est = c.consentimiento ? '<span class="chip ok">Firmado ' + fechaCorta(c.consentimiento.fecha) + '</span>' : (pasada(c) ? '<span class="chip mal">Sin firmar</span>' : '<span class="chip amb">Pendiente</span>');
        return '<tr><td>' + fechaRel(c.fecha) + ' · ' + U.hm(c.ini) + '</td><td><b>' + esc(cli(c.cliente).n) + '</b>' + (c.menor ? ' <span class="chip amb">Menor</span>' : '') + '</td><td>' + (c.tipo === 'piercing' ? 'Piercing · ' : '') + esc(c.desc) + '</td><td><span class="punto" style="background:' + art(c.artista).color + '"></span> ' + art(c.artista).n + '</td><td>' + est + '</td><td class="num">' +
          (c.consentimiento ? '<button class="btn btn-sm" data-acc="ver-firma" data-id="' + c.id + '">Ver</button>' : '<button class="btn btn-sm btn-osc" data-acc="firmar" data-id="' + c.id + '">Firmar</button>') + '</td></tr>';
      }).join('') : '<tr><td colspan="6" class="vacio">No hay consentimientos en esta vista.</td></tr>') + '</tbody></table></div>';
    h += '<p style="color:var(--dim);font-size:12.5px;margin-top:14px">El texto del consentimiento es un modelo de ejemplo. El definitivo lo revisa el estudio con su gestoría según la normativa sanitaria de la Comunitat Valenciana.</p>';
    return h;
  };

  V.caja = function () {
    var mes = HOY.slice(0, 7), cm = cobrosMes(mes), total = suma(cm, 'importe');
    var por = function (m) { return suma(cm.filter(function (p) { return p.metodo === m; }), 'importe'); };
    var senFut = suma(activas().filter(function (c) { return c.fecha > HOY && c.senal && c.senalPagada; }), 'senal');
    var pend = activas().filter(function (c) { return pasada(c) && c.estado === 'confirmada'; });
    var h = '<div class="kpis">' + kpi('Cobrado en ' + MESES[ahoraD.getMonth()], 'euro', eur(total), cm.length + ' movimientos') + kpi('Señales de citas futuras', 'reloj', eur(senFut), 'Ya cobradas, se descuentan al final') + kpi('Pendiente de cobro', 'alerta', eur(suma(pend, 'precio')), pend.length ? pend.length + ' citas sin cerrar' : 'Nada pendiente', pend.length ? 'mal' : 'bien') + kpi('Ticket medio', 'caja', eur(cm.length ? total / cm.length : 0), 'por movimiento') + '</div>';
    h += '<div class="card kpis-2" style="grid-template-columns:repeat(3,1fr)">' + ['Tarjeta', 'Efectivo', 'Bizum'].map(function (m) { var v = por(m); return '<div><h4>' + m + '</h4><b>' + eur(v) + '</b><div class="barra"><i style="width:' + (total ? Math.round(v / total * 100) : 0) + '%;background:var(--ink)"></i></div></div>'; }).join('') + '</div>';
    h += '<div class="rejilla"><section class="card bloque"><div class="bloque-cab"><h2>Movimientos</h2><button class="btn-link" data-acc="exportar">Exportar CSV para la gestoría</button></div>' +
      '<div class="tabla-wrap" style="margin-top:12px"><table class="tabla"><thead><tr><th>Fecha</th><th>Cliente</th><th>Concepto</th><th>Método</th><th class="num">Importe</th></tr></thead><tbody>' +
      S.cobros.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0; }).filter(function (p) { return p.fecha <= HOY; }).slice(0, 40).map(function (p) {
        return '<tr><td style="white-space:nowrap">' + fechaCorta(p.fecha) + '</td><td>' + esc(cli(p.cliente).n) + '</td><td><span class="punto" style="background:' + art(p.artista).color + '"></span> ' + esc(p.concepto) + '</td><td><span class="chip">' + esc(p.metodo) + '</span></td><td class="num"><b>' + eur(p.importe) + '</b></td></tr>';
      }).join('') + '</tbody></table></div></section>';
    h += '<section class="card bloque"><div class="bloque-cab"><h2>Reparto del mes</h2></div><p class="sub">Comisión de ejemplo: 50 % para el artista residente. John es el fundador.</p><div class="tabla-wrap"><table class="tabla"><thead><tr><th>Artista</th><th class="num">Facturado</th><th class="num">Artista</th><th class="num">Estudio</th></tr></thead><tbody>' +
      S.artistas.map(function (a) {
        var f = suma(cm.filter(function (p) { return p.artista === a.id; }), 'importe'), pa = Math.round(f * a.comision / 100);
        return '<tr><td><span class="punto" style="background:' + a.color + '"></span> ' + a.n + '</td><td class="num">' + eur(f) + '</td><td class="num">' + (a.comision ? eur(pa) : '—') + '</td><td class="num"><b>' + eur(f - pa) + '</b></td></tr>';
      }).join('') + '</tbody></table></div></section></div>';
    return h;
  };

  V.equipo = function () {
    var lun = lunes(HOY), mes = HOY.slice(0, 7);
    return '<div class="equipo">' + S.artistas.map(function (a) {
      var sem = activas().filter(function (c) { return c.artista === a.id && c.fecha >= lun && c.fecha < U.addD(lun, 7); });
      var fact = suma(cobrosMes(mes).filter(function (p) { return p.artista === a.id; }), 'importe');
      var prox = activas().filter(function (c) { return c.artista === a.id && !pasada(c) && c.estado === 'confirmada'; }).sort(function (x, y) { return x.fecha < y.fecha ? -1 : x.fecha > y.fecha ? 1 : x.ini - y.ini; }).slice(0, 4);
      return '<article class="card persona-card" style="--c:' + a.color + '"><div class="cab"><span class="av" style="background:' + a.color + '">' + ini(a.n) + '</span><div><h3>' + a.n + '</h3><p>' + esc(a.rol) + ' · ' + esc(a.estilos) + '</p></div></div>' +
        '<dl><div><dt>Ocupación semana</dt><dd>' + ocupacion(a, lun, 6) + ' %</dd></div><div><dt>Citas semana</dt><dd>' + sem.length + '</dd></div><div><dt>Facturado mes</dt><dd>' + eur(fact) + '</dd></div><div><dt>Comisión</dt><dd>' + (a.comision ? a.comision + ' %' : 'Fundador') + '</dd></div></dl>' +
        '<ul>' + (prox.length ? prox.map(function (c) { return '<li><span>' + fechaRel(c.fecha) + ' ' + U.hm(c.ini) + '</span><b>' + esc(cli(c.cliente).n) + '</b></li>'; }).join('') : '<li>Sin citas próximas</li>') + '</ul>' +
        '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-sm" data-acc="nueva-cita" data-artista="' + a.id + '">Nueva cita</button><a class="btn btn-sm" href="https://www.instagram.com/' + a.ig + '/" target="_blank" rel="noopener">@' + esc(a.ig) + '</a></div></article>';
    }).join('') + '</div>';
  };

  V.stock = function () {
    var f = estadoVista.filtroStock;
    var bajo = S.stock.filter(function (s) { return s.qty < s.min; });
    var valor = S.stock.reduce(function (n, s) { return n + s.qty * s.precio; }, 0);
    var l = S.stock.filter(function (s) { return f === 'todo' || (f === 'bajo' ? s.qty < s.min : s.cat === f); });
    var h = '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' + kpi('Bajo mínimo', 'alerta', bajo.length, bajo.filter(function (s) { return !s.pedido; }).length + ' sin pedir', bajo.length ? 'mal' : 'bien') + kpi('Pedidos en curso', 'stock', S.stock.filter(function (s) { return s.pedido; }).length, 'Se marcan al pedir') + kpi('Valor del material', 'euro', eur(valor), 'a precio de compra (ejemplo)') + '</div>';
    h += '<div class="filtros"><div class="seg" role="group" aria-label="Filtrar">' + [['todo', 'Todo'], ['bajo', 'Bajo mínimo'], ['Agujas', 'Agujas'], ['Tintas', 'Tintas'], ['Higiene', 'Higiene'], ['Joyería', 'Joyería']].map(function (o) { return '<button data-acc="filtro-stock" data-v="' + o[0] + '" aria-pressed="' + (f === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="card tabla-wrap"><table class="tabla"><thead><tr><th>Artículo</th><th>Categoría</th><th>Cantidad</th><th>Mínimo</th><th>Estado</th><th>Proveedor</th><th></th></tr></thead><tbody>' +
      l.map(function (s) {
        var est = s.pedido ? '<span class="chip azul">Pedido ' + fechaRel(s.pedido) + '</span>' : s.qty < s.min ? '<span class="chip mal">Bajo</span>' : s.qty === s.min ? '<span class="chip amb">Justo</span>' : '<span class="chip ok">Bien</span>';
        return '<tr><td><b>' + esc(s.n) + '</b><div style="color:var(--dim);font-size:12px">' + esc(s.u) + '</div></td><td>' + esc(s.cat) + '</td><td><span class="stock-q"><button data-acc="stock-menos" data-id="' + s.id + '" aria-label="Quitar uno">−</button><b>' + s.qty + '</b><button data-acc="stock-mas" data-id="' + s.id + '" aria-label="Añadir uno">+</button></span></td><td>' + s.min + '</td><td>' + est + '</td><td>' + esc(s.prov) + '</td><td class="num">' + (s.pedido ? '<button class="btn-link" data-acc="recibido" data-id="' + s.id + '">Recibido</button>' : '<button class="btn btn-sm" data-acc="pedir" data-id="' + s.id + '">Pedir</button>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<section class="card bloque" style="margin-top:16px"><div class="bloque-cab"><h2>Registro del autoclave</h2><button class="btn btn-sm" data-acc="autoclave">Registrar ciclo de hoy</button></div><p class="sub">Para la inspección sanitaria: fecha, lote, programa y resultado de cada esterilización.</p>' +
      '<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Fecha</th><th>Lote</th><th>Programa</th><th>Control</th><th>Resultado</th></tr></thead><tbody>' +
      S.autoclave.map(function (e) { return '<tr><td>' + fechaCorta(e.fecha) + '</td><td><code>' + esc(e.lote) + '</code></td><td>' + esc(e.programa) + '</td><td>' + (e.test ? esc(e.test) : '—') + '</td><td><span class="chip ok">' + esc(e.resultado) + '</span></td></tr>'; }).join('') +
      '</tbody></table></div></section>';
    return h;
  };

  /* ---------- formularios y paneles ---------- */
  function opcionesHora(sel) {
    var o = ''; for (var m = 630; m <= 1170; m += 30) { if (m > 840 && m < 990) continue; o += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + U.hm(m) + '</option>'; } return o;
  }
  function formCita(pre) {
    pre = pre || {};
    var a = pre.artista || 'sarai';
    var html = cab(pre.consulta ? 'Reservar desde la consulta' : 'Nueva cita', pre.consulta ? 'Se crea la cita y se apunta la señal' : 'Se guarda en la agenda del artista') +
      '<form class="form" id="f-cita" novalidate>' +
      '<label class="ancho">Cliente<select name="cliente"><option value="nuevo">+ Cliente nuevo</option>' + S.clientes.slice().sort(function (x, y) { return x.n.localeCompare(y.n); }).map(function (c) { return '<option value="' + c.id + '"' + (pre.cliente === c.id ? ' selected' : '') + '>' + esc(c.n) + '</option>'; }).join('') + '</select></label>' +
      '<label class="nuevo-c">Nombre y apellidos<input name="nombre" value="' + esc(pre.nombre || '') + '" placeholder="Nombre del cliente"></label>' +
      '<label class="nuevo-c">Teléfono<input name="tel" value="' + esc(pre.tel || '') + '" placeholder="600 000 000" inputmode="tel"></label>' +
      '<label>Artista<select name="artista">' + S.artistas.map(function (x) { return '<option value="' + x.id + '"' + (x.id === a ? ' selected' : '') + '>' + x.n + '</option>'; }).join('') + '</select></label>' +
      '<label>Tipo<select name="tipo">' + [['tatuaje', 'Tatuaje'], ['piercing', 'Piercing'], ['retoque', 'Retoque'], ['revision', 'Revisión']].map(function (t) { return '<option value="' + t[0] + '"' + ((pre.tipo || (a === 'john' ? 'piercing' : 'tatuaje')) === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="ancho">Descripción<input name="desc" value="' + esc(pre.desc || '') + '" placeholder="Ej.: fine line flores · antebrazo"></label>' +
      '<label>Fecha<input type="date" name="fecha" value="' + (pre.fecha || (dow(HOY) === 0 ? U.addD(HOY, 1) : HOY)) + '" min="' + HOY + '"></label>' +
      '<label>Hora<select name="ini">' + opcionesHora(+pre.ini || 630) + '</select></label>' +
      '<label>Duración<select name="dur">' + [30, 60, 90, 120, 150, 180, 210, 240].map(function (d) { return '<option value="' + d + '"' + ((pre.dur || (a === 'john' ? 30 : 120)) === d ? ' selected' : '') + '>' + (d < 60 ? d + ' min' : (d / 60 + ' h').replace('.5', ',5')) + '</option>'; }).join('') + '</select></label>' +
      '<label>Precio (€)<input type="number" name="precio" min="0" step="5" value="' + (pre.precio != null ? pre.precio : '') + '" placeholder="0"></label>' +
      '<label>Señal (€)<input type="number" name="senal" min="0" step="5" value="' + (pre.senal != null ? pre.senal : '') + '" placeholder="0"></label>' +
      '<label class="check" style="align-self:end"><input type="checkbox" name="senalPagada"' + (pre.consulta ? ' checked' : '') + '> Señal ya cobrada</label>' +
      '<div class="ancho" id="aviso-cita"></div>' +
      '</form><div class="cajon-pie"><button class="btn" type="button" data-acc="cerrar">Cancelar</button><button class="btn btn-osc" type="submit" form="f-cita">Guardar cita</button></div>';
    abrirCapa('modal', html, function (el) {
      var f = el.querySelector('#f-cita');
      function nuevoC() { var n = f.cliente.value === 'nuevo'; el.querySelectorAll('.nuevo-c').forEach(function (x) { x.style.display = n ? '' : 'none'; }); }
      function comprobar() {
        var ini0 = +f.ini.value, fin0 = ini0 + +f.dur.value, aviso = el.querySelector('#aviso-cita'), msg = [];
        var ch = activas().filter(function (c) { return c.artista === f.artista.value && c.fecha === f.fecha.value && ini0 < c.fin && c.ini < fin0; });
        if (ch.length) msg.push(art(f.artista.value).n + ' ya tiene a ' + cli(ch[0].cliente).n + ' de ' + U.hm(ch[0].ini) + ' a ' + U.hm(ch[0].fin) + '.');
        var dentro = turnos(f.fecha.value).some(function (t) { return ini0 >= t[0] && fin0 <= t[1]; });
        if (!dentro) msg.push('Se sale del horario del estudio (L–V 10:30–14:00 y 16:30–20:00, S 10:30–14:00).');
        if (!trabaja(art(f.artista.value), f.fecha.value)) msg.push(art(f.artista.value).n + ' no trabaja ese día.');
        aviso.innerHTML = msg.length ? '<div class="aviso mal">⚠ ' + esc(msg.join(' ')) + '</div>' : '<div class="aviso ok">✓ Hueco libre.</div>';
      }
      nuevoC(); comprobar();
      f.addEventListener('change', function () { nuevoC(); comprobar(); });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var cid = f.cliente.value;
        if (cid === 'nuevo') {
          if (!f.nombre.value.trim()) { f.nombre.focus(); toast('Falta el nombre del cliente'); return; }
          cid = 'c' + Date.now();
          S.clientes.push({ id: cid, n: f.nombre.value.trim(), tel: f.tel.value.trim() || '—', nac: '', etiquetas: [], notas: '', alta: HOY });
        }
        var c = { id: 'a' + Date.now(), fecha: f.fecha.value, ini: +f.ini.value, fin: +f.ini.value + +f.dur.value, artista: f.artista.value, cliente: cid, tipo: f.tipo.value, desc: f.desc.value.trim() || 'Cita', precio: +f.precio.value || 0, senal: +f.senal.value || 0, senalPagada: f.senalPagada.checked && +f.senal.value > 0, pagado: false, metodo: '', estado: 'confirmada', consentimiento: null };
        S.citas.push(c);
        if (c.senalPagada) S.cobros.push({ id: 'p' + Date.now(), fecha: HOY, cita: c.id, cliente: cid, artista: c.artista, concepto: 'Señal · ' + c.desc, importe: c.senal, metodo: 'Bizum' });
        if (pre.consulta) { var q = S.consultas.filter(function (x) { return x.id === pre.consulta; })[0]; if (q) { q.estado = 'senal'; q.cita = c.id; } }
        guardar(); cerrarTodo(); render();
        toast('Cita guardada: ' + fechaRel(c.fecha) + ' a las ' + U.hm(c.ini) + ' con ' + art(c.artista).n);
      });
    });
  }

  function verCita(id) {
    var c = cita(id); if (!c) return;
    var a = art(c.artista), cl = cli(c.cliente), d = U.parse(c.fecha);
    var choque = choques().filter(function (p) { return p[0].id === id || p[1].id === id; })[0];
    var otra = choque ? (choque[0].id === id ? choque[1] : choque[0]) : null;
    var recordatorio = '¡Hola, ' + primerNombre(cl.n) + '! Te recordamos tu cita en Dacapo el ' + DIAS[d.getDay()] + ' ' + d.getDate() + ' a las ' + U.hm(c.ini) + ' con ' + a.n + '. Plaza País Valencià, 24. Ven con la zona limpia y habiendo comido bien. ¡Nos vemos!';
    var resto = c.precio - (c.senalPagada ? c.senal : 0);
    var acc = '';
    if (c.estado === 'confirmada') {
      acc += '<button class="btn btn-osc" data-acc="cobrar" data-id="' + c.id + '">Cobrar ' + eur(resto) + '</button>';
      if (!c.consentimiento && c.tipo !== 'revision') acc += '<button class="btn" data-acc="firmar" data-id="' + c.id + '">Firmar consentimiento</button>';
      if (c.senal && !c.senalPagada) acc += '<button class="btn" data-acc="senal" data-id="' + c.id + '">Señal cobrada</button>';
      acc += '<a class="btn" href="' + waTexto(recordatorio) + '" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Recordatorio</a>';
      if (pasada(c)) acc += '<button class="btn" data-acc="noshow" data-id="' + c.id + '">No vino</button>';
      else acc += '<button class="btn-link" data-acc="cancelar" data-id="' + c.id + '">Cancelar cita</button>';
    } else acc += '<button class="btn" data-acc="cliente" data-id="' + cl.id + '">Ver ficha del cliente</button>';
    var html = cab(esc(c.desc), DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' · ' + U.hm(c.ini) + '–' + U.hm(c.fin)) +
      '<div class="cajon-cuerpo">' +
      (otra ? '<div class="aviso mal" style="margin-bottom:16px">⚠ Doble reserva: ' + a.n + ' también tiene a ' + esc(cli(otra.cliente).n) + ' de ' + U.hm(otra.ini) + ' a ' + U.hm(otra.fin) + '. Mueve una de las dos.</div>' : '') +
      '<dl class="ficha"><dt>Cliente</dt><dd><button class="btn-link" style="padding:0;color:var(--ink);font-weight:600;text-decoration:underline" data-acc="cliente" data-id="' + cl.id + '">' + esc(cl.n) + '</button> · ' + esc(cl.tel) + (cl.etiquetas && cl.etiquetas.length ? '<div style="margin-top:4px">' + cl.etiquetas.map(function (e) { return '<span class="chip amb">' + esc(e) + '</span>'; }).join(' ') + '</div>' : '') + '</dd>' +
      '<dt>Artista</dt><dd><span class="punto" style="background:' + a.color + '"></span> ' + a.n + '</dd>' +
      '<dt>Tipo</dt><dd>' + ({ tatuaje: 'Tatuaje', piercing: 'Piercing', retoque: 'Retoque', revision: 'Revisión' }[c.tipo] || c.tipo) + '</dd>' +
      '<dt>Precio</dt><dd>' + eur(c.precio) + '</dd>' +
      '<dt>Señal</dt><dd>' + (c.senal ? eur(c.senal) + ' · ' + (c.senalPagada ? '<span class="chip ok">Cobrada</span>' : '<span class="chip mal">Sin cobrar</span>') : 'No hace falta') + '</dd>' +
      '<dt>Consentimiento</dt><dd>' + (c.tipo === 'revision' ? 'No hace falta' : c.consentimiento ? '<span class="chip ok">Firmado ' + fechaCorta(c.consentimiento.fecha) + '</span>' : '<span class="chip amb">Pendiente</span>') + '</dd>' +
      '<dt>Estado</dt><dd>' + chipEstado(c) + (c.metodo ? ' · ' + esc(c.metodo) : '') + '</dd></dl>' +
      (cl.notas ? '<p class="sec-t">Notas del cliente</p><p style="margin:0;font-size:13.5px">' + esc(cl.notas) + '</p>' : '') +
      '</div><div class="cajon-pie">' + acc + '</div>';
    abrirCapa('cajon', html);
  }

  function verCliente(id) {
    var c = cli(id);
    var cs = activas().filter(function (x) { return x.cliente === id; }).sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0; });
    var gast = suma(S.cobros.filter(function (p) { return p.cliente === id; }), 'importe');
    var edad = c.nac ? Math.floor((U.parse(HOY) - U.parse(c.nac)) / (365.25 * 864e5)) : null;
    var html = cab(esc(c.n), 'Cliente desde ' + (c.alta ? fechaCorta(c.alta) : '—') + ' · ' + eur(gast) + ' gastados') +
      '<div class="cajon-cuerpo"><dl class="ficha"><dt>Teléfono</dt><dd>' + esc(c.tel) + '</dd><dt>Edad</dt><dd>' + (edad != null ? edad + ' años' + (edad < 18 ? ' · <span class="chip amb">Menor</span>' : '') : '—') + '</dd>' +
      '<dt>Avisos</dt><dd>' + (c.etiquetas.length ? c.etiquetas.map(function (e) { return '<span class="chip amb">' + esc(e) + '</span>'; }).join(' ') : 'Ninguno') + '</dd></dl>' +
      '<label style="display:grid;gap:6px;font-size:12.5px;font-weight:600;color:var(--muted)">Notas (alergias, zonas, preferencias)<textarea id="notas-c" rows="3" style="border:1px solid var(--line-2);border-radius:8px;padding:10px;font:inherit;color:var(--ink)">' + esc(c.notas) + '</textarea></label>' +
      '<p class="sec-t">Historial · ' + cs.length + ' citas</p><ul class="historial">' +
      (cs.length ? cs.map(function (x) { return '<li data-acc="cita" data-id="' + x.id + '" style="cursor:pointer"><span>' + fechaCorta(x.fecha) + '</span><div><b style="font-weight:600">' + esc(x.desc) + '</b><br><span>' + art(x.artista).n + ' · ' + eur(x.precio) + '</span></div>' + chipEstado(x) + '</li>'; }).join('') : '<li><span>Sin citas todavía</span></li>') +
      '</ul></div><div class="cajon-pie"><button class="btn btn-osc" data-acc="nueva-cita" data-cliente="' + id + '">Nueva cita</button><a class="btn" href="' + waTexto('¡Hola, ' + primerNombre(c.n) + '! Te escribimos de Dacapo Tattoo & Piercing.') + '" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>WhatsApp</a></div>';
    abrirCapa('cajon', html, function (el) {
      el.querySelector('#notas-c').addEventListener('input', function () { c.notas = this.value; guardar(); });
    });
  }

  function cobrar(id) {
    var c = cita(id); if (!c) return;
    var resto = c.precio - (c.senalPagada ? c.senal : 0);
    var html = cab('Cobrar · ' + esc(cli(c.cliente).n), esc(c.desc) + ' con ' + art(c.artista).n) +
      '<form class="form" id="f-cobro"><label>Importe (€)<input type="number" name="imp" min="0" step="1" value="' + resto + '"></label>' +
      '<label>Método<select name="metodo"><option>Tarjeta</option><option>Efectivo</option><option>Bizum</option></select></label>' +
      '<div class="ancho aviso info">Precio ' + eur(c.precio) + (c.senalPagada ? ' − señal ya cobrada ' + eur(c.senal) : '') + ' = <b style="margin-left:4px">' + eur(resto) + '</b></div></form>' +
      '<div class="cajon-pie"><button class="btn" type="button" data-acc="cerrar">Cancelar</button><button class="btn btn-ok" type="submit" form="f-cobro">Cobrar y cerrar cita</button></div>';
    abrirCapa('modal', html, function (el) {
      el.querySelector('#f-cobro').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target, imp = +f.imp.value || 0;
        c.pagado = true; c.estado = 'hecha'; c.metodo = f.metodo.value;
        if (imp > 0) S.cobros.push({ id: 'p' + Date.now(), fecha: HOY, cita: c.id, cliente: c.cliente, artista: c.artista, concepto: (c.senalPagada ? 'Resto · ' : '') + c.desc, importe: imp, metodo: c.metodo });
        guardar(); cerrarTodo(); render(); toast('Cobrado ' + eur(imp) + ' con ' + c.metodo.toLowerCase());
      });
    });
  }

  function firmar(id) {
    var c = cita(id); if (!c) return;
    var cl = cli(c.cliente), esPierc = c.tipo === 'piercing';
    var html = cab('Consentimiento informado · ' + (esPierc ? 'piercing' : 'tatuaje'), esc(cl.n) + ' · ' + esc(c.desc) + ' · ' + art(c.artista).n) +
      '<form class="form" id="f-firma" novalidate><div class="ancho texto-legal"><p><b>Modelo de ejemplo.</b> Declaro que he sido informado/a por Dacapo Tattoo & Piercing de en qué consiste el ' + (esPierc ? 'piercing' : 'tatuaje') + ', sus riesgos (infección, alergia, cicatrización irregular) y los cuidados posteriores, y que he podido hacer todas las preguntas que he querido.</p><p>Doy mi consentimiento para que se realice el trabajo descrito y autorizo al estudio a guardar este documento con mis datos durante el tiempo que exija la normativa.</p></div>' +
      ['Soy mayor de edad o vengo con mi madre, padre o tutor legal', 'No estoy embarazada ni en periodo de lactancia', 'No tomo anticoagulantes ni tengo heridas o problemas de piel en la zona', 'He recibido por escrito las pautas de cuidado'].map(function (t, i) { return '<label class="check ancho"><input type="checkbox" name="d' + i + '" required> ' + t + '</label>'; }).join('') +
      '<label class="ancho">Alergias conocidas<input name="alergias" placeholder="Ninguna" value="' + esc((cl.etiquetas || []).filter(function (e) { return e.indexOf('Alergia') >= 0; }).join(', ')) + '"></label>' +
      (c.menor ? '<label class="ancho">Nombre del tutor legal<input name="tutor" required placeholder="Nombre y apellidos"></label>' : '') +
      '<div class="ancho"><canvas class="firma" id="lienzo" aria-label="Zona de firma: firma con el dedo o el ratón"></canvas><div class="firma-pie"><span>Firma aquí con el dedo o el ratón</span><button type="button" class="btn-link" id="borrar-firma">Borrar</button></div></div>' +
      '<div class="ancho" id="aviso-firma"></div></form>' +
      '<div class="cajon-pie"><button class="btn" type="button" data-acc="cerrar">Cancelar</button><button class="btn btn-osc" type="submit" form="f-firma">Firmar y guardar</button></div>';
    abrirCapa('modal', html, function (el) {
      var cv = el.querySelector('#lienzo'), ctx, dib = false, trazos = 0;
      function ajustar() { var r = cv.getBoundingClientRect(), k = window.devicePixelRatio || 1; cv.width = r.width * k; cv.height = r.height * k; ctx = cv.getContext('2d'); ctx.scale(k, k); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1a1615'; }
      setTimeout(ajustar, 260);
      function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      cv.addEventListener('pointerdown', function (e) { if (!ctx) ajustar(); dib = true; cv.setPointerCapture(e.pointerId); var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); });
      cv.addEventListener('pointermove', function (e) { if (!dib) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); trazos++; });
      cv.addEventListener('pointerup', function () { dib = false; });
      el.querySelector('#borrar-firma').addEventListener('click', function () { ctx.clearRect(0, 0, cv.width, cv.height); trazos = 0; });
      el.querySelector('#f-firma').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target, falta = [];
        for (var i = 0; i < 4; i++) if (!f['d' + i].checked) { falta.push('marca las cuatro casillas'); break; }
        if (c.menor && !f.tutor.value.trim()) falta.push('pon el nombre del tutor');
        if (trazos < 8) falta.push('firma en el recuadro');
        if (falta.length) { el.querySelector('#aviso-firma').innerHTML = '<div class="aviso mal">Antes de guardar: ' + falta.join(', ') + '.</div>'; return; }
        // guardamos la firma reducida para no llenar el almacenamiento
        var mini = document.createElement('canvas'); mini.width = 360; mini.height = 120;
        mini.getContext('2d').drawImage(cv, 0, 0, mini.width, mini.height);
        c.consentimiento = { fecha: HOY, firma: mini.toDataURL('image/png'), alergias: f.alergias.value.trim(), tutor: c.menor ? f.tutor.value.trim() : '' };
        guardar(); cerrarTodo(); render(); toast('Consentimiento firmado y guardado');
      });
    });
  }

  function verFirma(id) {
    var c = cita(id); if (!c || !c.consentimiento) return;
    var k = c.consentimiento;
    abrirCapa('modal', cab('Consentimiento firmado', esc(cli(c.cliente).n) + ' · ' + esc(c.desc)) +
      '<div class="cajon-cuerpo"><dl class="ficha"><dt>Firmado</dt><dd>' + fechaCorta(k.fecha) + '</dd><dt>Artista</dt><dd>' + art(c.artista).n + '</dd><dt>Alergias</dt><dd>' + esc(k.alergias || 'Ninguna') + '</dd>' + (k.tutor ? '<dt>Tutor legal</dt><dd>' + esc(k.tutor) + '</dd>' : '') + '</dl>' +
      (k.firma ? '<p class="sec-t">Firma</p><img src="' + k.firma + '" alt="Firma del cliente" style="border:1px solid var(--line);border-radius:8px;background:#fff;max-width:100%">' : '<div class="aviso info">Firmado en la tablet del estudio (en los datos de ejemplo no se guarda la imagen).</div>') +
      '</div><div class="cajon-pie"><button class="btn" type="button" data-acc="cerrar">Cerrar</button></div>');
  }

  function responder(id) {
    var q = S.consultas.filter(function (x) { return x.id === id; })[0]; if (!q) return;
    var a = art(q.artista), esPierc = q.tipo === 'piercing';
    var dur = durDe(q);
    var hueco = huecoLibre(q.artista, dur);
    var precioSug = precioDe(q);
    function texto(precio) {
      var d = hueco ? U.parse(hueco.fecha) : null;
      return '¡Hola, ' + q.nombre + '! Soy ' + a.n + ', de Dacapo. Gracias por escribirnos 🖤\n\n' +
        (esPierc ? 'Para ' + q.piercings.toLowerCase() + ' con joya de ' + String(q.joya).toLowerCase() + ' serían ' + precio + ' €, perforación y joya incluidas.' : 'Para ' + String(q.estilo).toLowerCase() + ' en ' + String(q.zona).toLowerCase() + ' de unos ' + q.cm + ' cm el precio sería de unos ' + precio + ' €. Te preparo el diseño antes de la cita.') +
        (!esPierc && precio >= 150 ? ' Para reservar pedimos una señal de 50 € por Bizum.' : '') +
        (d ? '\n\n¿Te viene bien el ' + DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' a las ' + U.hm(hueco.ini) + '?' : '');
    }
    var html = cab('Responder a ' + esc(q.nombre), esc(q.origen) + ' · ' + esc(detalleLead(q))) +
      '<div class="form"><label>Precio que le das (€)<input type="number" id="r-precio" min="0" step="5" value="' + precioSug + '"></label>' +
      '<label>Primer hueco de ' + a.n + '<input disabled value="' + (hueco ? fechaCorta(hueco.fecha) + ' · ' + U.hm(hueco.ini) : 'Sin huecos en 3 semanas') + '"></label>' +
      (q.idea ? '<div class="ancho aviso info">Su idea: «' + esc(q.idea) + '»</div>' : '') +
      '<label class="ancho">Mensaje<textarea class="msg" id="r-texto"></textarea></label></div>' +
      '<div class="cajon-pie"><button class="btn" type="button" id="r-copiar">Copiar</button><a class="btn" id="r-wa" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Abrir WhatsApp</a><button class="btn btn-osc" type="button" id="r-ok">Marcar como presupuestada</button></div>';
    abrirCapa('modal', html, function (el) {
      var p = el.querySelector('#r-precio'), t = el.querySelector('#r-texto'), w = el.querySelector('#r-wa');
      function act() { t.value = texto(+p.value || 0); w.href = q.tel ? 'https://wa.me/34' + q.tel.replace(/\D/g, '') + '?text=' + encodeURIComponent(t.value) : waTexto(t.value); }
      act(); p.addEventListener('input', act); t.addEventListener('input', function () { w.href = waTexto(t.value); });
      el.querySelector('#r-copiar').addEventListener('click', function () { (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(function () { toast('Mensaje copiado'); }, function () { t.select(); toast('Selecciónalo y cópialo'); }); });
      el.querySelector('#r-ok').addEventListener('click', function () { q.estado = 'presupuestada'; q.precio = +p.value || 0; guardar(); cerrarTodo(); render(); toast('Consulta de ' + q.nombre + ' presupuestada en ' + eur(q.precio)); });
    });
  }

  function simularWeb() {
    var ej = [
      { nombre: 'Andrea', tipo: 'tatuaje', estilo: 'Fine line', zona: 'Costillas', cm: 14, color: 'Negro y gris', extras: 'Es mi primer tatuaje', rango: '120 € – 170 €', artista: 'sarai', idea: 'Unas ramas de lavanda con el nombre de mi hija.' },
      { nombre: 'Rubén', tipo: 'tatuaje', estilo: 'Blackwork', zona: 'Antebrazo', cm: 16, color: 'Negro y gris', extras: 'Tengo una referencia', rango: '190 € – 260 €', artista: 'bito', idea: 'Un cuervo sobre una calavera.' },
      { nombre: 'Marta', tipo: 'piercing', piercings: 'Conch, Flat', joya: 'Ópalo o cristal', rango: '94 €', artista: 'john', idea: '' }
    ];
    var q = Object.assign({ id: 'w' + Date.now(), fecha: new Date().toISOString(), origen: 'Web', tel: '', estado: 'nueva', web: true }, ej[Math.floor(Math.random() * ej.length)]);
    try { var l = JSON.parse(localStorage.getItem(CLAVE_WEB) || '[]'); l.push(q); localStorage.setItem(CLAVE_WEB, JSON.stringify(l.slice(-30))); } catch (e) { /* nada */ }
    S.consultas.unshift(q); guardar(); render(); toast('Ha entrado una consulta desde la web: ' + q.nombre);
  }

  function exportarCSV() {
    var filas = [['Fecha', 'Cliente', 'Artista', 'Concepto', 'Método', 'Importe']].concat(
      S.cobros.filter(function (p) { return p.fecha.slice(0, 7) === HOY.slice(0, 7); }).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; })
        .map(function (p) { return [p.fecha, cli(p.cliente).n, art(p.artista).n, p.concepto, p.metodo, String(p.importe).replace('.', ',')]; }));
    var csv = '﻿' + filas.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'dacapo-cobros-' + HOY.slice(0, 7) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    toast('CSV del mes descargado');
  }

  function prepararPedido() {
    var bajo = S.stock.filter(function (s) { return s.qty < s.min && !s.pedido; });
    var por = {}; bajo.forEach(function (s) { (por[s.prov] = por[s.prov] || []).push(s); });
    var txt = Object.keys(por).map(function (p) { return p + ':\n' + por[p].map(function (s) { return '- ' + (s.min * 2 - s.qty) + ' ' + s.u + ' de ' + s.n; }).join('\n'); }).join('\n\n');
    abrirCapa('modal', cab('Pedido de lo que falta', bajo.length + ' artículos bajo mínimo, agrupados por proveedor') +
      '<div class="form"><label class="ancho">Texto para mandar a cada proveedor<textarea class="msg" id="pedido-t">' + esc(txt || 'No falta nada.') + '</textarea></label></div>' +
      '<div class="cajon-pie"><button class="btn" type="button" id="p-copiar">Copiar</button><button class="btn btn-osc" type="button" id="p-ok"' + (bajo.length ? '' : ' disabled') + '>Marcar todo como pedido</button></div>', function (el) {
      el.querySelector('#p-copiar').addEventListener('click', function () { var t = el.querySelector('#pedido-t'); (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(function () { toast('Pedido copiado'); }, function () { t.select(); }); });
      el.querySelector('#p-ok').addEventListener('click', function () { bajo.forEach(function (s) { s.pedido = HOY; }); guardar(); cerrarTodo(); render(); toast('Pedidos apuntados'); });
    });
  }

  /* ---------- acciones ---------- */
  var ACC = {
    cerrar: cerrarCapa,
    cita: function (d) { verCita(d.id); },
    cliente: function (d) { verCliente(d.id); },
    'nueva-cita': function (d) { formCita({ artista: d.artista, fecha: d.f, ini: d.ini ? +d.ini : null, cliente: d.cliente }); },
    cobrar: function (d) { cobrar(d.id); },
    firmar: function (d) { firmar(d.id); },
    'ver-firma': function (d) { verFirma(d.id); },
    responder: function (d) { responder(d.id); },
    senal: function (d) {
      var c = cita(d.id); if (!c) return; c.senalPagada = true;
      S.cobros.push({ id: 'p' + Date.now(), fecha: HOY, cita: c.id, cliente: c.cliente, artista: c.artista, concepto: 'Señal · ' + c.desc, importe: c.senal, metodo: 'Bizum' });
      guardar(); cerrarTodo(); render(); toast('Señal de ' + eur(c.senal) + ' cobrada');
    },
    noshow: function (d) { var c = cita(d.id); c.estado = 'no-show'; guardar(); cerrarTodo(); render(); toast('Marcada como «no vino»'); },
    cancelar: function (d) { var c = cita(d.id); c.estado = 'cancelada'; guardar(); cerrarTodo(); render(); toast('Cita cancelada: el hueco queda libre'); },
    perdida: function (d) { var q = S.consultas.filter(function (x) { return x.id === d.id; })[0]; q.estado = 'perdida'; q.motivo = 'Sin respuesta'; guardar(); render(); },
    recuperar: function (d) { var q = S.consultas.filter(function (x) { return x.id === d.id; })[0]; q.estado = 'nueva'; guardar(); render(); },
    'lead-cita': function (d) {
      var q = S.consultas.filter(function (x) { return x.id === d.id; })[0];
      var esP = q.tipo === 'piercing', dur = durDe(q);
      var h = huecoLibre(q.artista, dur);
      formCita({ consulta: q.id, nombre: q.nombre, tel: q.tel, artista: q.artista, tipo: esP ? 'piercing' : 'tatuaje', desc: esP ? q.piercings : q.estilo + ' · ' + String(q.zona).toLowerCase(), precio: q.precio || 0, senal: esP ? 0 : 50, dur: dur, fecha: h ? h.fecha : null, ini: h ? h.ini : null });
    },
    'simular-web': simularWeb,
    'ver-dia': function (d) { estadoVista.dia = d.f; cerrarTodo(); if (ruta() === 'agenda') render(); else location.hash = '#/agenda'; },
    dia: function (d) { estadoVista.dia = d.f; render(); },
    'ver-todo': function () { estadoVista.verTodo = !estadoVista.verTodo; render(); },
    'filtro-cli': function (d) { estadoVista.filtroCli = d.v; render(); },
    'filtro-cons': function (d) { estadoVista.filtroCons = d.v; render(); },
    'filtro-stock': function (d) { estadoVista.filtroStock = d.v; render(); },
    'stock-mas': function (d) { var s = S.stock.filter(function (x) { return x.id === d.id; })[0]; s.qty++; guardar(); render(); },
    'stock-menos': function (d) { var s = S.stock.filter(function (x) { return x.id === d.id; })[0]; if (s.qty > 0) s.qty--; guardar(); render(); },
    pedir: function (d) { var s = S.stock.filter(function (x) { return x.id === d.id; })[0]; s.pedido = HOY; guardar(); render(); toast('Pedido apuntado: ' + s.n); },
    recibido: function (d) { var s = S.stock.filter(function (x) { return x.id === d.id; })[0]; s.qty += Math.max(1, s.min * 2 - s.qty); s.pedido = null; guardar(); render(); toast('Recibido: ' + s.n); },
    'preparar-pedido': prepararPedido,
    autoclave: function () {
      var n = S.autoclave.filter(function (e) { return e.fecha === HOY; }).length + 1;
      S.autoclave.unshift({ id: 'e' + Date.now(), fecha: HOY, lote: 'L-' + HOY.slice(2).replace(/-/g, '') + '-' + n, programa: '134 °C · 18 min', resultado: 'Correcto', test: '' });
      guardar(); render(); toast('Ciclo ' + n + ' de hoy registrado');
    },
    exportar: exportarCSV,
    'nuevo-cliente': function () {
      abrirCapa('modal', cab('Nuevo cliente', 'Se guarda en la lista de clientes') +
        '<form class="form" id="f-cli"><label class="ancho">Nombre y apellidos<input name="n" required></label><label>Teléfono<input name="tel" inputmode="tel" placeholder="600 000 000"></label><label>Fecha de nacimiento<input type="date" name="nac"></label><label class="ancho">Avisos (alergias, primera vez…)<input name="et" placeholder="Separados por comas"></label><label class="ancho">Notas<textarea name="notas" rows="2"></textarea></label></form>' +
        '<div class="cajon-pie"><button class="btn" type="button" data-acc="cerrar">Cancelar</button><button class="btn btn-osc" type="submit" form="f-cli">Guardar</button></div>', function (el) {
        el.querySelector('#f-cli').addEventListener('submit', function (ev) {
          ev.preventDefault(); var f = ev.target; if (!f.n.value.trim()) { f.n.focus(); return; }
          S.clientes.push({ id: 'c' + Date.now(), n: f.n.value.trim(), tel: f.tel.value.trim() || '—', nac: f.nac.value, etiquetas: f.et.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean), notas: f.notas.value, alta: HOY });
          guardar(); cerrarTodo(); render(); toast('Cliente guardado');
        });
      });
    }
  };

  /* ---------- router y pintado ---------- */
  var RUTAS = {
    inicio: { t: 'Inicio', top: [['ir', 'Agenda', '#/agenda'], ['nueva-cita', 'Nueva cita', null, 'btn-osc']] },
    agenda: { t: 'Agenda', top: [['nueva-cita', 'Nueva cita', null, 'btn-osc']] },
    consultas: { t: 'Consultas', top: [['simular-web', 'Simular consulta de la web'], ['nueva-cita', 'Nueva cita', null, 'btn-osc']] },
    clientes: { t: 'Clientes', top: [['nuevo-cliente', 'Nuevo cliente'], ['nueva-cita', 'Nueva cita', null, 'btn-osc']] },
    consentimientos: { t: 'Consentimientos', top: [['ir', 'Agenda', '#/agenda']] },
    caja: { t: 'Caja y cobros', top: [['exportar', 'Exportar CSV']] },
    equipo: { t: 'Equipo', top: [['ir', 'Agenda', '#/agenda']] },
    stock: { t: 'Stock e higiene', top: [['autoclave', 'Registrar autoclave'], ['preparar-pedido', 'Preparar pedido', null, 'btn-osc']] }
  };
  function ruta() { var r = (location.hash || '').replace(/^#\/?/, '').split('/')[0]; return RUTAS[r] ? r : 'inicio'; }
  function render() {
    var r = ruta(), R = RUTAS[r];
    document.getElementById('titulo').textContent = R.t;
    document.title = R.t + ' · Dacapo Gestión (demo)';
    var d = ahoraD;
    document.getElementById('fecha').textContent = DIAS[d.getDay()] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear() + ' · semana ' + semanaISO(HOY);
    document.getElementById('top-acc').innerHTML = R.top.map(function (b) {
      var ico = b[0] === 'nueva-cita' ? '<svg><use href="#i-mas"/></svg>' : b[0] === 'ir' ? '<svg><use href="#i-agenda"/></svg>' : '';
      return b[0] === 'ir' ? '<a class="btn" href="' + b[2] + '">' + ico + '<span>' + b[1] + '</span></a>' : '<button class="btn ' + (b[3] || '') + '" data-acc="' + b[0] + '">' + ico + '<span>' + b[1] + '</span></button>';
    }).join('');
    document.querySelectorAll('.side nav a').forEach(function (a) { a.classList.toggle('activa', a.dataset.ruta === r); if (a.dataset.ruta === r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var v = document.getElementById('vista');
    var sc = window.scrollY;
    v.innerHTML = V[r]();
    window.scrollTo(0, sc);
    badges();
    var b = document.getElementById('buscar');
    if (b) b.addEventListener('input', function () { estadoVista.buscar = b.value; var pos = b.selectionStart; render(); var nb = document.getElementById('buscar'); nb.focus(); nb.setSelectionRange(pos, pos); });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acc]'); if (!b) return;
    var f = ACC[b.dataset.acc]; if (!f) return;
    if (b.tagName === 'A' && b.getAttribute('href') && b.getAttribute('href').indexOf('http') === 0) return;
    e.preventDefault(); f(b.dataset, b, e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pila.length) { cerrarCapa(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-acc], li[data-acc]')) { e.preventDefault(); e.target.click(); }
  });
  window.addEventListener('hashchange', function () { cerrarTodo(); document.body.classList.remove('menu-abierto'); render(); window.scrollTo(0, 0); });
  window.addEventListener('storage', function (e) { if (e.key === CLAVE_WEB && importarWeb()) { render(); toast('Nueva consulta desde la web'); } });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && importarWeb()) { render(); toast('Nueva consulta desde la web'); } });

  var mm = document.getElementById('menu-movil');
  mm.addEventListener('click', function () { var ab = document.body.classList.toggle('menu-abierto'); mm.setAttribute('aria-expanded', String(ab)); });
  document.querySelectorAll('.side nav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-abierto'); }); });
  document.getElementById('reset').addEventListener('click', function () {
    if (!confirm('¿Borrar los cambios y volver a los datos de ejemplo?')) return;
    try { localStorage.removeItem(CLAVE); localStorage.removeItem(CLAVE_WEB); } catch (e) { /* nada */ }
    S = window.DACAPO_SEED(HOY, AHORA); guardar(); render(); toast('Datos de ejemplo restablecidos');
  });

  S = cargar();
  var n = importarWeb();
  guardar();
  render();
  if (n) toast(n === 1 ? 'Ha entrado 1 consulta desde la web' : 'Han entrado ' + n + ' consultas desde la web');
})();
