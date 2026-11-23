/* Datos de ejemplo del panel de gestión de Dacapo.
   Todo es inventado salvo los nombres del equipo. Se generan alrededor de la fecha de hoy
   para que la demo siempre parezca viva. Los teléfonos 600 000 xxx son ficticios. */
(function () {
  'use strict';

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addD(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function hm(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }

  var ARTISTAS = [
    { id: 'sarai', n: 'Sarai', rol: 'Tatuadora', color: '#d6336c', comision: 50, ig: 'turatitapresumida_ink', estilos: 'Fine line · dotwork · acuarela' },
    { id: 'guille', n: 'Guille', rol: 'Tatuador residente', color: '#e8590c', comision: 50, ig: 'yosolohagotattoos', estilos: 'Neotradicional · color' },
    { id: 'bito', n: 'Bito', rol: 'Tatuador', color: '#0ca678', comision: 50, ig: 'bito_manhigan.tattoo', estilos: 'Blackwork · puntillismo' },
    { id: 'alex', n: 'Alex', rol: 'Tatuador', color: '#1c7ed6', comision: 50, ig: 'dacapostudio', estilos: 'Realismo · black & grey' },
    { id: 'john', n: 'John', rol: 'Body piercer · fundador', color: '#7048e8', comision: 0, ig: 'johnfreirebodypiercing', estilos: 'Piercing · joyería' }
  ];

  var NOMBRES = ['Laura Martí', 'Carlos Ferrer', 'Marta Ribes', 'Pablo Navarro', 'Lucía Gil', 'Javier Soler', 'Andrea Peris', 'Sergio Bou', 'Nerea Climent', 'Iván Monfort', 'Paula Escrig', 'Rubén Vicent', 'Claudia Agut', 'Hugo Beltrán', 'Irene Safont', 'Adrián Cabedo', 'Alba Tena', 'Marcos Gimeno', 'Sara Llorens', 'Daniel Porcar', 'Noelia Sorribes', 'Álex Mas', 'Carla Renau', 'Víctor Albiol', 'Elena Querol', 'Jorge Bellés', 'Aitana Pitarch', 'Raúl Edo', 'Inés Castelló', 'Mario Segarra', 'Julia Moliner', 'Óscar Tirado'];
  var ETIQUETAS = { 2: ['Alergia al látex'], 6: ['Primera vez'], 9: ['VIP'], 12: ['Menor · viene con tutor'], 15: ['Primera vez'], 19: ['Alergia al látex'], 22: ['VIP'], 26: ['Menor · viene con tutor'] };

  var TRABAJOS = {
    sarai: [['Fine line flores · antebrazo', 2], ['Fine line constelación · tobillo', 1], ['Dotwork luna · muñeca', 1], ['Acuarela colibrí · hombro', 2.5], ['Letras «Respira» · costillas', 1], ['Realismo mascota · brazo', 3]],
    guille: [['Neotradicional hannya · muslo', 3.5], ['Rosa y daga a color · gemelo', 3], ['Manga a color · sesión 3 de 4', 3.5], ['Neotradicional lobo · antebrazo', 3], ['Calavera a color · brazo', 2.5]],
    bito: [['Blackwork polilla · gemelo', 2], ['Puntillismo mandala · muslo', 3], ['Whip shading serpiente · antebrazo', 2.5], ['Blackwork barco · pierna', 2], ['Retrato realista · antebrazo · sesión 2 de 2', 3]],
    alex: [['Realismo león · espalda · sesión 2 de 4', 3.5], ['Realismo Joker · antebrazo', 3], ['Estatua black & grey · brazo', 3], ['Reloj y rosa realistas · antebrazo', 2.5], ['Cover-up · hombro', 3]],
    john: [['Hélix', 0.5, 30], ['Tragus', 0.5, 35], ['Septum', 0.5, 40], ['Lóbulo ×2', 0.5, 50], ['Daith', 0.5, 40], ['Ombligo', 0.5, 40], ['Industrial', 0.5, 50], ['Aleta de la nariz', 0.5, 30], ['Cambio de joya · oro 14k', 0.5, 85], ['Revisión de piercing', 0.5, 0]]
  };
  var METODOS = ['Tarjeta', 'Tarjeta', 'Efectivo', 'Bizum'];

  window.DACAPO_SEED = function (hoy, ahoraMin) {
    var r = rng(20261123);
    function pick(a) { return a[Math.floor(r() * a.length)]; }

    var clientes = NOMBRES.map(function (n, i) {
      var y = 1978 + Math.floor(r() * 28);
      if (ETIQUETAS[i] && ETIQUETAS[i][0].indexOf('Menor') === 0) y = 2009 + Math.floor(r() * 2);
      return {
        id: 'c' + (i + 1), n: n, tel: '600 000 ' + (101 + i), nac: y + '-' + pad(1 + Math.floor(r() * 12)) + '-' + pad(1 + Math.floor(r() * 27)),
        etiquetas: ETIQUETAS[i] || [], notas: i === 2 ? 'Usar guantes de nitrilo. Piel sensible en el antebrazo.' : i === 12 ? 'Viene con su madre (Rosa). Autorización firmada.' : '', alta: addD(hoy, -Math.floor(i % 6 === 0 ? 2 + r() * 26 : 40 + r() * 700))
      };
    });

    var citas = [], cobros = [], idc = 1, idp = 1;
    for (var dd = -24; dd <= 13; dd++) {
      var dia = addD(hoy, dd), dow = parse(dia).getDay();
      if (dow === 0) continue;
      var turnos = dow === 6 ? [[630, 840]] : [[630, 840], [990, 1200]];
      ARTISTAS.forEach(function (a) {
        if (dow === 6 && (a.id === 'alex' || a.id === 'guille')) return;
        var occ = dd < 0 ? 0.4 : dd <= 6 ? 0.55 : 0.3;
        if (a.id === 'john') occ = dd < 0 ? 0.3 : dd <= 6 ? 0.4 : 0.2;
        turnos.forEach(function (tu) {
          var t = tu[0];
          while (t < tu[1]) {
            if (r() < occ) {
              var tr = pick(TRABAJOS[a.id]);
              var dur = Math.round(tr[1] * 60);
              if (t + dur > tu[1]) { if (tu[1] - t < 60 && a.id !== 'john') break; dur = tu[1] - t; }
              var precio = a.id === 'john' ? tr[2] : Math.round(dur / 60 * 110 / 10) * 10;
              var senal = precio >= 150 ? 50 : 0;
              var cli = pick(clientes);
              var pasado = dd < 0 || (dd === 0 && t + dur <= ahoraMin);
              var c = {
                id: 'a' + (idc++), fecha: dia, ini: t, fin: t + dur, artista: a.id, cliente: cli.id,
                tipo: a.id === 'john' ? (precio === 0 ? 'revision' : 'piercing') : 'tatuaje', desc: tr[0], precio: precio,
                senal: senal, senalPagada: senal ? (pasado || r() < 0.82) : false, pagado: false, metodo: '',
                estado: 'confirmada', consentimiento: null
              };
              if (pasado) {
                if (r() < 0.015) c.estado = 'no-show';
                else { c.estado = 'hecha'; c.pagado = true; c.metodo = pick(METODOS); c.consentimiento = { fecha: dia, firma: null }; }
              } else if (r() < (dd <= 1 ? 0.35 : 0.15)) c.consentimiento = { fecha: addD(dia, -1), firma: null };
              if (cli.etiquetas.join().indexOf('Menor') >= 0) c.menor = true;
              citas.push(c);
              if (c.senal && c.senalPagada) cobros.push({ id: 'p' + (idp++), fecha: addD(dia, -(3 + Math.floor(r() * 8))), cita: c.id, cliente: cli.id, artista: a.id, concepto: 'Señal · ' + tr[0], importe: c.senal, metodo: 'Bizum' });
              if (c.pagado && c.precio - c.senal > 0) cobros.push({ id: 'p' + (idp++), fecha: dia, cita: c.id, cliente: cli.id, artista: a.id, concepto: (c.senal ? 'Resto · ' : '') + tr[0], importe: c.precio - c.senal, metodo: c.metodo });
              t += dur + (r() < 0.3 ? 30 : 0);
            } else t += a.id === 'john' ? 30 : 60;
          }
        });
      });
    }
    // una doble reserva a propósito (Bito, pasado mañana) para que el panel la detecte
    var pm = addD(hoy, 2); if (parse(pm).getDay() === 0) pm = addD(pm, 1);
    var cb = citas.filter(function (c) { return c.artista === 'bito' && c.fecha === pm; })[0];
    if (cb) citas.push({ id: 'a' + (idc++), fecha: pm, ini: cb.ini + 30, fin: cb.ini + 90, artista: 'bito', cliente: 'c11', tipo: 'tatuaje', desc: 'Blackwork polilla · gemelo', precio: 120, senal: 0, senalPagada: false, pagado: false, metodo: '', estado: 'confirmada', consentimiento: null });

    var h = function (horas) { var d = new Date(); d.setMinutes(d.getMinutes() - horas * 60); return d.toISOString(); };
    var consultas = [
      { id: 'q1', fecha: h(0.6), origen: 'Web', nombre: 'Nerea', tel: '600 000 201', tipo: 'tatuaje', estilo: 'Fine line', zona: 'Antebrazo', cm: 9, color: 'Negro y gris', extras: 'Es mi primer tatuaje', rango: '60 € – 90 €', artista: 'sarai', idea: 'Una rama de olivo con la fecha de nacimiento de mi abuela.', estado: 'nueva' },
      { id: 'q2', fecha: h(3), origen: 'Instagram', nombre: 'Kevin', tel: '600 000 202', tipo: 'tatuaje', estilo: 'Neotradicional', zona: 'Muslo', cm: 25, color: 'Color', extras: '', rango: '640 € – 900 €', artista: 'guille', idea: 'Un tigre con flores de cerezo, estilo como el hannya que subisteis.', estado: 'nueva' },
      { id: 'q3', fecha: h(7), origen: 'Web', nombre: 'Lidia', tel: '600 000 203', tipo: 'piercing', piercings: 'Hélix, Tragus', joya: 'Titanio', rango: '65 €', artista: 'john', idea: '¿Podéis el sábado por la mañana?', estado: 'nueva' },
      { id: 'q4', fecha: h(26), origen: 'WhatsApp', nombre: 'Toni', tel: '600 000 204', tipo: 'tatuaje', estilo: 'Blackwork', zona: 'Gemelo', cm: 18, color: 'Negro y gris', extras: 'Tengo una referencia', rango: '260 € – 370 €', artista: 'bito', idea: 'Una serpiente enroscada en una daga.', estado: 'presupuestada', precio: 300 },
      { id: 'q5', fecha: h(40), origen: 'Web', nombre: 'Marina', tel: '600 000 205', tipo: 'tatuaje', estilo: 'Realismo', zona: 'Brazo', cm: 20, color: 'Negro y gris', extras: '', rango: '560 € – 790 €', artista: 'alex', idea: 'Retrato de mi perro (tengo fotos buenas).', estado: 'presupuestada', precio: 650 },
      { id: 'q6', fecha: h(52), origen: 'Instagram', nombre: 'Jose', tel: '600 000 206', tipo: 'tatuaje', estilo: 'Letras', zona: 'Costillas', cm: 12, color: 'Negro y gris', extras: 'Es mi primer tatuaje', rango: '70 € – 100 €', artista: 'sarai', idea: '«Amor fati» en letra fina.', estado: 'presupuestada', precio: 90 },
      { id: 'q7', fecha: h(80), origen: 'Web', nombre: 'Ainhoa', tel: '600 000 207', tipo: 'tatuaje', estilo: 'Puntillismo', zona: 'Espalda', cm: 30, color: 'Negro y gris', extras: '', rango: '640 € – 900 €', artista: 'bito', idea: 'Mandala entre los omóplatos.', estado: 'senal', precio: 700 },
      { id: 'q8', fecha: h(110), origen: 'WhatsApp', nombre: 'Pau', tel: '600 000 208', tipo: 'piercing', piercings: 'Septum', joya: 'Oro 14k', rango: '85 €', artista: 'john', idea: '', estado: 'senal', precio: 85 },
      { id: 'q9', fecha: h(150), origen: 'Instagram', nombre: 'Celia', tel: '600 000 209', tipo: 'tatuaje', estilo: 'Neotradicional', zona: 'Antebrazo', cm: 15, color: 'Color', extras: '', rango: '300 € – 430 €', artista: 'guille', idea: 'Un búho con luna.', estado: 'perdida', motivo: 'Le pareció caro' }
    ];

    var stock = [
      { id: 's1', cat: 'Agujas', n: 'Cartuchos 3RL 0,25', u: 'cajas de 20', qty: 2, min: 4, prov: 'Suministros Tattoo Levante', precio: 24 },
      { id: 's2', cat: 'Agujas', n: 'Cartuchos 5RL 0,30', u: 'cajas de 20', qty: 6, min: 4, prov: 'Suministros Tattoo Levante', precio: 24 },
      { id: 's3', cat: 'Agujas', n: 'Cartuchos 7RS 0,35', u: 'cajas de 20', qty: 5, min: 3, prov: 'Suministros Tattoo Levante', precio: 24 },
      { id: 's4', cat: 'Agujas', n: 'Cartuchos 9M1 magnum', u: 'cajas de 20', qty: 1, min: 3, prov: 'Suministros Tattoo Levante', precio: 26 },
      { id: 's5', cat: 'Agujas', n: 'Cartuchos 13RM curved magnum', u: 'cajas de 20', qty: 4, min: 2, prov: 'Suministros Tattoo Levante', precio: 28 },
      { id: 's6', cat: 'Tintas', n: 'Negro línea 240 ml', u: 'botes', qty: 3, min: 2, prov: 'Suministros Tattoo Levante', precio: 32 },
      { id: 's7', cat: 'Tintas', n: 'Gris para sombras 120 ml', u: 'botes', qty: 1, min: 2, prov: 'Suministros Tattoo Levante', precio: 21 },
      { id: 's8', cat: 'Tintas', n: 'Set de colores 12 × 30 ml', u: 'sets', qty: 2, min: 1, prov: 'Suministros Tattoo Levante', precio: 95 },
      { id: 's9', cat: 'Higiene', n: 'Guantes de nitrilo talla M', u: 'cajas de 100', qty: 3, min: 5, prov: 'Higiene Castelló', precio: 7 },
      { id: 's10', cat: 'Higiene', n: 'Film protector para tatuaje', u: 'rollos', qty: 4, min: 2, prov: 'Higiene Castelló', precio: 15 },
      { id: 's11', cat: 'Higiene', n: 'Jabón verde 1 L', u: 'botellas', qty: 1, min: 1, prov: 'Higiene Castelló', precio: 12 },
      { id: 's12', cat: 'Higiene', n: 'Papel transfer', u: 'cajas', qty: 2, min: 1, prov: 'Suministros Tattoo Levante', precio: 38 },
      { id: 's13', cat: 'Joyería', n: 'Labret titanio 1,2 × 8 mm', u: 'unidades', qty: 14, min: 10, prov: 'Joyería Body Pro', precio: 4 },
      { id: 's14', cat: 'Joyería', n: 'Aro titanio 1,2 × 8 mm', u: 'unidades', qty: 6, min: 8, prov: 'Joyería Body Pro', precio: 5 },
      { id: 's15', cat: 'Joyería', n: 'Top titanio con circonita', u: 'unidades', qty: 25, min: 15, prov: 'Joyería Body Pro', precio: 3 },
      { id: 's16', cat: 'Joyería', n: 'Barra industrial 1,6 × 38 mm', u: 'unidades', qty: 3, min: 3, prov: 'Joyería Body Pro', precio: 6 },
      { id: 's17', cat: 'Joyería', n: 'Top ópalo blanco', u: 'unidades', qty: 8, min: 6, prov: 'Joyería Body Pro', precio: 9 },
      { id: 's18', cat: 'Joyería', n: 'Aro oro 14k 8 mm', u: 'unidades', qty: 2, min: 2, prov: 'Joyería Body Pro', precio: 42 }
    ];

    var autoclave = [];
    for (var k = 0, n = 0; n < 8; k++) {
      var d2 = addD(hoy, -k); if (parse(d2).getDay() === 0) continue;
      autoclave.push({ id: 'e' + (n + 1), fecha: d2, lote: 'L-' + d2.slice(2).replace(/-/g, '') + '-1', programa: '134 °C · 18 min', resultado: 'Correcto', test: parse(d2).getDay() === 1 ? 'Bowie-Dick OK' : '' });
      n++;
    }

    return { version: 1, creado: hoy, artistas: ARTISTAS, clientes: clientes, citas: citas, cobros: cobros, consultas: consultas, stock: stock, autoclave: autoclave };
  };
  window.DACAPO_UTIL = { iso: iso, parse: parse, addD: addD, hm: hm, pad: pad };
})();
