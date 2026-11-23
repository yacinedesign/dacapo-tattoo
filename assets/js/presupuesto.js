/* Presupuestador de Dacapo Tattoo & Piercing.
   Se monta en cualquier elemento con [data-presupuestador].
   PRECIOS DE EJEMPLO: hay que sustituirlos por los del estudio (ver README). */
(function () {
  'use strict';

  var C = {
    whatsTatuaje: '34615477362',
    whatsPiercing: '34614379252',
    minimo: 50,          // € mínimos por tatuaje
    exponente: 1.7,      // cómo crece el precio con el tamaño
    colorExtra: 1.15,    // tinta de color
    rangoBajo: 0.85, rangoAlto: 1.2,
    euroHora: 110,       // para estimar horas y sesiones
    horasSesion: 5,
    estilos: [
      { id: 'fineline', aid: 'sarai', n: 'Fine line', d: 'Líneas finas y delicadas', k: 0.8, img: 'assets/img/sarai-flores.jpg', artista: 'Sarai', ig: 'turatitapresumida_ink', porque: 'su fuerte es el fine line, el dotwork y la acuarela' },
      { id: 'puntillismo', aid: 'bito', n: 'Puntillismo', d: 'Dotwork y mandalas', k: 1.5, img: 'assets/img/bito-mandala.jpg', artista: 'Bito', ig: 'bito_manhigan.tattoo', porque: 'trabaja puntillismo de arrastre y blackwork' },
      { id: 'blackwork', aid: 'bito', n: 'Blackwork', d: 'Negro sólido y sombreado', k: 1.3, soloNegro: true, img: 'assets/img/bito-polilla.jpg', artista: 'Bito', ig: 'bito_manhigan.tattoo', porque: 'trabaja blackwork y whip shading' },
      { id: 'realismo', aid: 'bito', n: 'Realismo', d: 'Retratos en negro y gris', k: 2.6, img: 'assets/img/estudio-gato.jpg', artista: 'Sarai o Bito', ig: 'dacapostudio', porque: 'los dos tienen retratos realistas en su perfil' },
      { id: 'neotradicional', aid: 'guille', n: 'Neotradicional', d: 'Color, línea y contraste', k: 2.0, color: true, img: 'assets/img/guille-hannya.jpg', artista: 'Guille', ig: 'yosolohagotattoos', porque: 'sus piezas de color son de lo más visto del estudio' },
      { id: 'letras', aid: 'sarai', n: 'Letras', d: 'Nombres, fechas y frases', k: 0.6, img: '', artista: 'Sarai', ig: 'turatitapresumida_ink', porque: 'el trazo fino es lo suyo' }
    ],
    zonas: {
      antebrazo: { n: 'Antebrazo', en: 'en el antebrazo', f: 1, max: 28 },
      brazo: { n: 'Brazo', en: 'en el brazo', f: 1, max: 25 },
      mano: { n: 'Mano', en: 'en la mano', f: 1.25, max: 10 },
      pecho: { n: 'Pecho', en: 'en el pecho', f: 1.1, max: 35 },
      costillas: { n: 'Costillas', en: 'en las costillas', f: 1.2, max: 30 },
      abdomen: { n: 'Abdomen', en: 'en el abdomen', f: 1.1, max: 28 },
      cuello: { n: 'Cuello', en: 'en el cuello', f: 1.2, max: 12 },
      nuca: { n: 'Nuca', en: 'en la nuca', f: 1.1, max: 12 },
      espalda: { n: 'Espalda', en: 'en la espalda', f: 1, max: 60 },
      lumbar: { n: 'Zona lumbar', en: 'en la zona lumbar', f: 1.05, max: 35 },
      muslo: { n: 'Muslo', en: 'en el muslo', f: 1, max: 35 },
      espinilla: { n: 'Espinilla', en: 'en la espinilla', f: 1.1, max: 30 },
      gemelo: { n: 'Gemelo', en: 'en el gemelo', f: 1, max: 30 },
      pie: { n: 'Pie o tobillo', en: 'en el pie', f: 1.2, max: 12 }
    },
    extras: [
      { id: 'cover', n: 'Cover-up', d: 'Tapar un tatuaje antiguo', mult: 1.35 },
      { id: 'primero', n: 'Es mi primer tatuaje', d: 'Te lo explicamos todo' },
      { id: 'referencia', n: 'Tengo una referencia', d: 'La mandas por WhatsApp' }
    ],
    oreja: [
      { id: 'lobulo', n: 'Lóbulo', p: 25, x: 122, y: 266 },
      { id: 'lobulo2', n: 'Segundo lóbulo', p: 25, x: 141, y: 250 },
      { id: 'helix', n: 'Hélix', p: 30, x: 200, y: 100 },
      { id: 'fhelix', n: 'Forward hélix', p: 35, x: 100, y: 68 },
      { id: 'flat', n: 'Flat', p: 35, x: 180, y: 86 },
      { id: 'industrial', n: 'Industrial', p: 50, x: 148, y: 50 },
      { id: 'rook', n: 'Rook', p: 40, x: 124, y: 92 },
      { id: 'daith', n: 'Daith', p: 40, x: 114, y: 134 },
      { id: 'tragus', n: 'Tragus', p: 35, x: 86, y: 168 },
      { id: 'conch', n: 'Conch', p: 35, x: 140, y: 152 }
    ],
    caraCuerpo: [
      { id: 'nariz', n: 'Aleta de la nariz', p: 30 },
      { id: 'septum', n: 'Septum', p: 40 },
      { id: 'labret', n: 'Labio (labret)', p: 35 },
      { id: 'medusa', n: 'Medusa', p: 35 },
      { id: 'ceja', n: 'Ceja', p: 35 },
      { id: 'lengua', n: 'Lengua', p: 45 },
      { id: 'ombligo', n: 'Ombligo', p: 40 },
      { id: 'microdermal', n: 'Microdermal', p: 60 }
    ],
    joyas: [
      { id: 'titanio', n: 'Titanio', d: 'Grado implante · incluida', p: 0, g: 'linear-gradient(135deg,#eef1f4,#8a9099)' },
      { id: 'anodizado', n: 'Titanio de color', d: '+5 € por joya', p: 5, g: 'conic-gradient(#7b5cff,#2fd5ff,#ffcc3d,#ff4fa3,#7b5cff)' },
      { id: 'opalo', n: 'Ópalo o cristal', d: '+12 € por joya', p: 12, g: 'radial-gradient(circle at 35% 35%,#ffffff,#a9e0ff 45%,#d6b4ff)' },
      { id: 'oro', n: 'Oro 14k', d: '+45 € por joya', p: 45, g: 'linear-gradient(135deg,#ffe7a0,#c9921b)' }
    ]
  };

  var EMBLEMA = '<svg viewBox="0 0 320 330" aria-hidden="true"><use href="#emblema"/></svg>';
  var ICO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';
  var PPC = 2.44; // píxeles del dibujo por centímetro real (figura de unos 170 cm)

  function fmt(n) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n) + ' €'; }
  function r10(n) { return Math.round(n / 10) * 10; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function wa(num, txt) { return 'https://wa.me/' + num + '?text=' + encodeURIComponent(txt); }

  /* ---------- dibujo del cuerpo (frente y espalda) ---------- */
  function figura(dx, espalda) {
    var s = '';
    function t(x) { return x + dx; }
    function path(d) { return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, x, y) { return (+x + dx) + ' ' + y; }); }
    function zonaPath(z, d, etq) { return '<path class="zona" data-zona="' + z + '" d="' + path(d) + '" tabindex="0" role="button" aria-label="' + etq + '"/>'; }
    function zonaLinea(z, x1, y1, x2, y2, w, etq) {
      return '<line class="zona linea-borde" x1="' + t(x1) + '" y1="' + y1 + '" x2="' + t(x2) + '" y2="' + y2 + '" stroke-width="' + (w + 2.4) + '"/>' +
        '<line class="zona linea" data-zona="' + z + '" x1="' + t(x1) + '" y1="' + y1 + '" x2="' + t(x2) + '" y2="' + y2 + '" stroke-width="' + w + '" tabindex="0" role="button" aria-label="' + etq + '"/>';
    }
    function zonaElipse(z, cx, cy, rx, ry, etq) { return '<ellipse class="zona" data-zona="' + z + '" cx="' + t(cx) + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" tabindex="0" role="button" aria-label="' + etq + '"/>'; }

    s += '<ellipse class="base" cx="' + t(115) + '" cy="36" rx="21" ry="25"/>';
    if (!espalda) {
      s += '<rect class="zona" data-zona="cuello" x="' + t(105) + '" y="60" width="20" height="22" rx="6" tabindex="0" role="button" aria-label="Cuello"/>';
      s += '<path class="base" d="' + path('M80 196 L150 196 C 152 212 152 226 150 240 L 80 240 C 78 226 78 212 80 196 Z') + '"/>';
      s += zonaPath('pecho', 'M76 86 C 92 76 138 76 154 86 L 156 134 L 74 134 Z', 'Pecho');
      s += zonaPath('costillas', 'M74 134 L 92 134 L 92 198 L 80 198 C 77 176 74 156 74 134 Z', 'Costillas');
      s += zonaPath('costillas', 'M156 134 L 138 134 L 138 198 L 150 198 C 153 176 156 156 156 134 Z', 'Costillas');
      s += zonaPath('abdomen', 'M92 134 L 138 134 L 138 206 L 92 206 Z', 'Abdomen');
    } else {
      s += '<rect class="zona" data-zona="nuca" x="' + t(105) + '" y="60" width="20" height="22" rx="6" tabindex="0" role="button" aria-label="Nuca"/>';
      s += '<path class="base" d="' + path('M78 206 L 152 206 C 153 220 152 230 150 242 L 80 242 C 78 230 77 220 78 206 Z') + '"/>';
      s += zonaPath('espalda', 'M76 86 C 92 76 138 76 154 86 L 156 170 L 74 170 Z', 'Espalda');
      s += zonaPath('lumbar', 'M74 170 L 156 170 C 155 182 153 195 152 206 L 78 206 C 77 195 75 182 74 170 Z', 'Zona lumbar');
    }
    // brazos
    s += zonaLinea('brazo', 68, 96, 57, 160, 19, 'Brazo') + zonaLinea('brazo', 162, 96, 173, 160, 19, 'Brazo');
    s += zonaLinea('antebrazo', 55, 168, 45, 230, 17, 'Antebrazo') + zonaLinea('antebrazo', 175, 168, 185, 230, 17, 'Antebrazo');
    s += zonaElipse('mano', 43, 251, 9.5, 14, 'Mano') + zonaElipse('mano', 187, 251, 9.5, 14, 'Mano');
    // piernas
    s += zonaLinea('muslo', 100, 250, 97, 322, 27, 'Muslo') + zonaLinea('muslo', 130, 250, 133, 322, 27, 'Muslo');
    var pierna = espalda ? 'gemelo' : 'espinilla';
    var pn = espalda ? 'Gemelo' : 'Espinilla';
    s += zonaLinea(pierna, 97, 334, 97, 402, 20, pn) + zonaLinea(pierna, 133, 334, 133, 402, 20, pn);
    s += zonaElipse('pie', 96, 420, 13, 7, 'Pie') + zonaElipse('pie', 134, 420, 13, 7, 'Pie');
    s += '<text class="rotulo" x="' + t(115) + '" y="448">' + (espalda ? 'Espalda' : 'Frente') + '</text>';
    return s;
  }

  function svgCuerpo() {
    return '<svg class="cuerpo" viewBox="0 0 460 456" role="group" aria-label="Elige la zona del cuerpo">' +
      figura(0, false) + figura(230, true) +
      '<ellipse class="tam" cx="0" cy="0" rx="0" ry="0"/></svg>';
  }

  /* ---------- dibujo de la oreja ---------- */
  function svgOreja() {
    var s = '<svg class="oreja" viewBox="0 0 230 300" role="group" aria-label="Elige los piercings de la oreja">';
    s += '<path class="piel" d="M88 66 C 92 26 146 4 182 30 C 210 52 210 106 198 146 C 188 180 170 196 164 222 C 159 246 158 272 134 285 C 110 296 92 280 95 256 C 97 238 102 224 96 210 C 90 198 76 190 76 172 C 76 152 86 140 84 120 C 82 100 84 82 88 66 Z"/>';
    s += '<path class="pliegue" d="M96 72 C 104 38 150 20 178 42 C 198 60 197 104 186 140 C 178 166 164 182 154 204"/>';
    s += '<path class="pliegue" d="M108 80 C 132 62 166 74 168 110 C 170 140 158 168 140 184"/>';
    s += '<path class="pliegue" d="M118 100 C 132 88 152 90 164 102"/>';
    s += '<path class="pliegue" d="M86 112 C 98 108 110 116 116 128"/>';
    s += '<path class="pliegue" d="M112 198 C 126 204 142 198 148 186"/>';
    s += '<path class="pliegue" d="M92 150 C 99 158 99 176 92 186"/>';
    s += '<ellipse class="canal" cx="106" cy="164" rx="7" ry="10"/>';
    s += '<line class="barra" x1="112" y1="44" x2="186" y2="60"/>';
    C.oreja.forEach(function (p) {
      s += '<g class="punto" data-p="' + p.id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + p.n + ', ' + p.p + ' euros">' +
        '<title>' + p.n + '</title><circle class="halo" cx="' + p.x + '" cy="' + p.y + '" r="11"/>' +
        '<circle class="zona-p" cx="' + p.x + '" cy="' + p.y + '" r="6"/></g>';
    });
    return s + '</svg>';
  }

  /* ---------- plantilla ---------- */
  function plantilla() {
    var zonasOpts = Object.keys(C.zonas).map(function (k) { return '<option value="' + k + '">' + C.zonas[k].n + '</option>'; }).join('');
    return '' +
      '<div class="presu-tabs" role="tablist" aria-label="Qué quieres hacerte">' +
        '<button type="button" role="tab" data-tipo="tatuaje" aria-selected="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 20 15 9m2-2 3-3M13 7l4 4M9 15l-2 2"/></svg>Tatuaje</button>' +
        '<button type="button" role="tab" data-tipo="piercing" aria-selected="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="5" r="2.2" fill="currentColor"/></svg>Piercing</button>' +
      '</div>' +
      '<div class="presu-grid">' +
        '<div class="presu-controles">' +
          '<div class="presu-mini"><span>Orientativo</span><b class="mini-precio"></b><a href="#" class="mini-ver">Ver resumen ↓</a></div>' +
          '<div data-panel="tatuaje">' +
            '<div class="paso"><div class="paso-cab"><span>01</span><div><h3>¿Qué estilo te gusta?</h3><p>Elige el que más se parezca a tu idea. Las fotos son trabajos del estudio.</p></div></div>' +
              '<div class="estilos" role="radiogroup" aria-label="Estilo"></div></div>' +
            '<div class="paso"><div class="paso-cab"><span>02</span><div><h3>¿Dónde lo quieres?</h3><p>Toca la zona en el dibujo. La línea discontinua es el tamaño real que elijas abajo.</p></div></div>' +
              '<div class="cuerpo-wrap">' + svgCuerpo() +
                '<div class="cuerpo-lado"><label for="pz-zona">Zona elegida</label><select id="pz-zona" class="select">' + zonasOpts + '</select>' +
                '<p class="zona-nota"></p></div></div></div>' +
            '<div class="paso"><div class="paso-cab"><span>03</span><div><h3>¿De qué tamaño?</h3><p>Mide el lado más largo, más o menos.</p></div></div>' +
              '<div class="tam-cab"><label for="pz-cm">Tamaño aproximado</label><output class="tam-num" for="pz-cm"></output></div>' +
              '<input class="rango" type="range" id="pz-cm" min="3" step="1">' +
              '<div class="rango-ext"><span>3 cm</span><span class="tam-max"></span></div>' +
              '<p class="tam-ref"></p>' +
              '<p class="campo">Tinta</p>' +
              '<div class="seg" role="radiogroup" aria-label="Tinta"><button type="button" role="radio" data-color="0"><i></i>Negro y gris</button><button type="button" role="radio" data-color="1"><i></i>Color</button></div>' +
              '<p class="campo">¿Algo más? <span>Opcional</span></p><div class="extras"></div></div>' +
          '</div>' +
          '<div data-panel="piercing" hidden>' +
            '<div class="paso"><div class="paso-cab"><span>01</span><div><h3>¿Dónde te lo quieres hacer?</h3><p>Toca los puntos de la oreja o elige en la lista. Puedes marcar varios.</p></div></div>' +
              '<div class="oreja-wrap">' + svgOreja() +
                '<div><p class="campo" style="margin-top:0">Oreja</p><div class="lista-p" data-lista="oreja"></div>' +
                '<p class="campo">Cara y cuerpo</p><div class="lista-p" data-lista="cuerpo"></div></div></div></div>' +
            '<div class="paso"><div class="paso-cab"><span>02</span><div><h3>¿Con qué joya?</h3><p>Se pone siempre joya de primera perforación. Luego la cambias cuando cure.</p></div></div>' +
              '<div class="joyas" role="radiogroup" aria-label="Joya"></div></div>' +
          '</div>' +
          '<div class="paso"><div class="paso-cab"><span class="n-idea">04</span><div><h3>Cuéntanos tu idea</h3><p>Opcional. Va dentro del mensaje de WhatsApp.</p></div></div>' +
            '<div class="idea-campos"><label>Tu nombre<input type="text" class="pz-nombre" autocomplete="given-name" placeholder="Nombre" maxlength="40"></label>' +
            '<label>Tu idea<textarea class="pz-idea" rows="2" maxlength="400" placeholder="Por ejemplo: una golondrina pequeña con el nombre de mi madre…"></textarea></label></div></div>' +
        '</div>' +
        '<aside class="presu-resultado" aria-live="polite">' +
          '<div class="res-top"><span class="pill res-pill">Tu tatuaje</span>' + EMBLEMA + '</div>' +
          '<h3 class="res-tit"></h3><p class="res-sub"></p>' +
          '<div class="res-precio"></div><p class="res-tiempo"></p>' +
          '<div class="res-artista"></div>' +
          '<div class="res-div"></div><dl class="res-resumen"></dl>' +
          '<a class="btn res-wa" target="_blank" rel="noopener">' + ICO_WA + '<span>Enviar mi idea por WhatsApp</span></a>' +
          '<p class="res-nota"></p>' +
        '</aside>' +
      '</div>';
  }

  function refTamano(cm) {
    if (cm <= 3) return 'Como una moneda de 2 €';
    if (cm <= 6) return 'Como una caja de cerillas';
    if (cm <= 9) return 'Como una tarjeta de crédito';
    if (cm <= 15) return 'Como un móvil';
    if (cm <= 22) return 'Como la palma y los dedos de una mano';
    if (cm <= 30) return 'Como un folio A4 a lo largo';
    if (cm <= 45) return 'Pieza grande: media espalda o media manga';
    return 'Pieza muy grande: espalda entera';
  }

  function mount(root) {
    root.innerHTML = plantilla();
    var $ = function (s) { return root.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var st = { tipo: 'tatuaje', estilo: 'blackwork', zona: 'antebrazo', zonaEl: null, cm: 12, color: false, extras: [], nombre: '', idea: '', piercings: ['helix'], joya: 'titanio' };

    /* estilos */
    var cajaEst = $('.estilos');
    C.estilos.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'estilo'; b.setAttribute('role', 'radio'); b.dataset.id = e.id;
      b.innerHTML = (e.img ? '<img src="' + e.img + '" alt="" loading="lazy">' : '<span class="muestra">Amor eterno</span>') +
        '<span class="check" aria-hidden="true">✓</span><span class="txt"><strong>' + esc(e.n) + '</strong><small>' + esc(e.d) + '</small></span>';
      b.addEventListener('click', function () {
        st.estilo = e.id;
        if (e.color) st.color = true;
        if (e.soloNegro) st.color = false;
        pintar();
      });
      cajaEst.appendChild(b);
    });

    /* zonas del cuerpo */
    var zonasEl = $$('.cuerpo [data-zona]');
    zonasEl.forEach(function (el) {
      function elegir() { st.zona = el.dataset.zona; st.zonaEl = el; pintar(); }
      el.addEventListener('click', elegir);
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); elegir(); } });
    });
    st.zonaEl = zonasEl.filter(function (el) { return el.dataset.zona === st.zona; })[0];
    $('#pz-zona').addEventListener('change', function () {
      st.zona = this.value;
      st.zonaEl = zonasEl.filter(function (el) { return el.dataset.zona === st.zona; })[0];
      pintar();
    });

    /* tamaño */
    var rango = $('#pz-cm');
    rango.addEventListener('input', function () { st.cm = +rango.value; pintar(); });

    /* tinta */
    $$('.seg button').forEach(function (b) {
      b.addEventListener('click', function () { if (b.disabled) return; st.color = b.dataset.color === '1'; pintar(); });
    });

    /* extras */
    var cajaEx = $('.extras');
    C.extras.forEach(function (x) {
      var l = document.createElement('label'); l.className = 'extra';
      l.innerHTML = '<input type="checkbox" value="' + x.id + '"><span><b>' + esc(x.n) + '</b><small>' + esc(x.d) + '</small></span>';
      l.querySelector('input').addEventListener('change', function () {
        var on = this.checked;
        st.extras = on ? st.extras.concat(x.id) : st.extras.filter(function (i) { return i !== x.id; });
        pintar();
      });
      cajaEx.appendChild(l);
    });

    /* piercing: lista y oreja */
    function botonP(p, caja) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'p-btn'; b.dataset.p = p.id; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span>' + esc(p.n) + '</span><small>' + p.p + ' €</small>';
      b.addEventListener('click', function () { alternar(p.id); });
      caja.appendChild(b);
    }
    C.oreja.forEach(function (p) { botonP(p, $('[data-lista="oreja"]')); });
    C.caraCuerpo.forEach(function (p) { botonP(p, $('[data-lista="cuerpo"]')); });
    $$('.oreja .punto').forEach(function (g) {
      g.addEventListener('click', function () { alternar(g.dataset.p); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alternar(g.dataset.p); } });
    });
    function alternar(id) {
      var i = st.piercings.indexOf(id);
      if (i >= 0) st.piercings.splice(i, 1); else st.piercings.push(id);
      pintar();
    }
    var cajaJ = $('.joyas');
    C.joyas.forEach(function (j) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'joya'; b.setAttribute('role', 'radio'); b.dataset.id = j.id;
      b.innerHTML = '<i style="--g:' + j.g + '"></i><b>' + esc(j.n) + '</b><small>' + esc(j.d) + '</small>';
      b.addEventListener('click', function () { st.joya = j.id; pintar(); });
      cajaJ.appendChild(b);
    });

    /* pestañas */
    $$('.presu-tabs button').forEach(function (b) {
      b.addEventListener('click', function () { abrir(b.dataset.tipo); });
    });
    function abrir(tipo) { st.tipo = tipo; pintar(); }
    root.__abrir = abrir;
    $('.res-wa').addEventListener('click', function () {
      if (!root.__lead) return;
      try {
        var k = 'dacapo-consultas-web', l = JSON.parse(localStorage.getItem(k) || '[]');
        l.push(Object.assign({ id: 'w' + Date.now(), fecha: new Date().toISOString(), origen: 'Web', tel: '', estado: 'nueva', web: true }, root.__lead));
        localStorage.setItem(k, JSON.stringify(l.slice(-30)));
      } catch (e) { /* sin almacenamiento: no pasa nada */ }
    });

    /* idea */
    $('.mini-ver').addEventListener('click', function (ev) {
      ev.preventDefault();
      $('.presu-resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('.pz-nombre').addEventListener('input', function () { st.nombre = this.value.trim(); pintar(); });
    $('.pz-idea').addEventListener('input', function () { st.idea = this.value.trim(); pintar(); });

    function todosP() { return C.oreja.concat(C.caraCuerpo); }

    function calcTatuaje() {
      var e = C.estilos.filter(function (x) { return x.id === st.estilo; })[0];
      var z = C.zonas[st.zona];
      var p = (C.minimo + e.k * Math.pow(st.cm, C.exponente)) * z.f * (st.color ? C.colorExtra : 1);
      st.extras.forEach(function (id) { var x = C.extras.filter(function (q) { return q.id === id; })[0]; if (x && x.mult) p *= x.mult; });
      var lo = Math.max(C.minimo, r10(p * C.rangoBajo)), hi = Math.max(lo + 20, r10(p * C.rangoAlto));
      var horas = p / C.euroHora;
      var sesiones = horas <= C.horasSesion ? 1 : Math.ceil(horas / C.horasSesion);
      var tiempo;
      if (sesiones === 1) {
        var h = Math.max(1, Math.round(horas * 2) / 2);
        tiempo = '1 sesión · unas ' + String(h).replace('.', ',') + ' h';
        if (h <= 1) tiempo = '1 sesión · alrededor de 1 h';
      } else tiempo = sesiones + ' sesiones de unas ' + C.horasSesion + ' h';
      return { e: e, z: z, lo: lo, hi: hi, tiempo: tiempo };
    }

    function pintar() {
      var esT = st.tipo === 'tatuaje';
      $$('.presu-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tipo === st.tipo)); });
      $('[data-panel="tatuaje"]').hidden = !esT;
      $('[data-panel="piercing"]').hidden = esT;
      $('.n-idea').textContent = esT ? '04' : '03';
      $('.pz-idea').placeholder = esT ? 'Por ejemplo: una golondrina pequeña con el nombre de mi madre…' : 'Por ejemplo: quiero hacerme el hélix y el tragus el mismo día…';

      var nota = $('.res-nota'), boton = $('.res-wa'), resumen = $('.res-resumen');
      var filas = [], mensaje = '', numero = '', lead = null;

      if (esT) {
        var z = C.zonas[st.zona];
        if (st.cm > z.max) st.cm = z.max;
        rango.max = z.max; rango.value = st.cm;
        $('.tam-max').textContent = z.max + ' cm';
        $('.tam-num').textContent = st.cm + ' cm';
        $('.tam-ref').textContent = refTamano(st.cm);
        $('#pz-zona').value = st.zona;
        $('.zona-nota').innerHTML = z.f > 1.1 ? '<b>' + z.n + '</b> es una zona más delicada: lleva algo más de tiempo y cuidado.' : z.en.charAt(0).toUpperCase() + z.en.slice(1, 3) + ' <b>' + z.en.slice(3) + '</b> caben piezas de hasta unos ' + z.max + ' cm.';
        $$('.estilo').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.id === st.estilo)); });
        var r = calcTatuaje();
        $$('.seg button').forEach(function (b) {
          var negro = b.dataset.color === '0';
          b.setAttribute('aria-checked', String(negro ? !st.color : st.color));
          b.disabled = !negro && !!r.e.soloNegro;
          b.title = b.disabled ? 'El blackwork es solo en negro' : '';
        });
        zonasEl.forEach(function (el) { el.classList.toggle('activa', el === st.zonaEl); });
        var tam = $('.cuerpo .tam');
        if (st.zonaEl && st.zonaEl.getBBox) {
          try {
            var bb = st.zonaEl.getBBox();
            var ry = st.cm * PPC / 2, rx = Math.max(4, ry * (st.zona === 'espalda' || st.zona === 'pecho' || st.zona === 'lumbar' || st.zona === 'abdomen' ? 0.85 : 0.55));
            tam.setAttribute('cx', bb.x + bb.width / 2); tam.setAttribute('cy', bb.y + bb.height / 2);
            tam.setAttribute('rx', rx.toFixed(1)); tam.setAttribute('ry', ry.toFixed(1));
          } catch (err) { /* el SVG aún no se ve */ }
        }
        $('.res-pill').textContent = 'Tu tatuaje';
        $('.res-tit').textContent = r.e.n + ' ' + r.z.en;
        $('.res-sub').textContent = 'Precio orientativo';
        $('.res-precio').textContent = fmt(r.lo) + ' – ' + fmt(r.hi);
        $('.res-tiempo').textContent = r.tiempo;
        $('.res-artista').innerHTML = 'Te recomendamos a <b>' + esc(r.e.artista) + '</b>: ' + esc(r.e.porque) + '. <a href="https://www.instagram.com/' + r.e.ig + '/" target="_blank" rel="noopener">@' + r.e.ig + '</a>';
        var tinta = st.color ? 'Color' : 'Negro y gris';
        var ex = st.extras.map(function (id) { return C.extras.filter(function (q) { return q.id === id; })[0].n; });
        filas = [['Estilo', r.e.n], ['Zona', r.z.n], ['Tamaño', 'unos ' + st.cm + ' cm'], ['Tinta', tinta], ['Extras', ex.length ? ex.join(', ') : 'Ninguno']];
        numero = C.whatsTatuaje;
        mensaje = 'Hola, Dacapo.' + (st.nombre ? ' Soy ' + st.nombre + '.' : '') + ' Quiero pedir presupuesto para un tatuaje:\n' +
          '- Estilo: ' + r.e.n + '\n- Zona: ' + r.z.n + '\n- Tamaño: unos ' + st.cm + ' cm\n- Tinta: ' + tinta.toLowerCase() + '\n' +
          (ex.length ? '- ' + ex.join(', ') + '\n' : '') +
          (st.idea ? '\nMi idea: ' + st.idea + '\n' : '') +
          '\nPrecio orientativo de la web: ' + fmt(r.lo) + ' – ' + fmt(r.hi) + '.' +
          (st.extras.indexOf('referencia') >= 0 ? '\nOs mando la referencia por aquí.' : '');
        nota.textContent = 'Precios de ejemplo para esta demo: el estudio pone los suyos. El precio final lo da el artista al ver tu diseño. Tatuaje mínimo: ' + C.minimo + ' €.';
        lead = { tipo: 'tatuaje', estilo: r.e.n, zona: r.z.n, cm: st.cm, color: tinta, extras: ex.join(', '), rango: fmt(r.lo) + ' – ' + fmt(r.hi), artista: r.e.aid };
        boton.querySelector('span').textContent = 'Enviar mi idea por WhatsApp';
        boton.removeAttribute('aria-disabled');
      } else {
        var lista = todosP().filter(function (p) { return st.piercings.indexOf(p.id) >= 0; });
        var j = C.joyas.filter(function (x) { return x.id === st.joya; })[0];
        var total = lista.reduce(function (n, p) { return n + p.p + j.p; }, 0);
        $$('.p-btn, .oreja .punto').forEach(function (b) {
          var on = st.piercings.indexOf(b.dataset.p) >= 0;
          b.setAttribute('aria-pressed', String(on));
          if (b.classList.contains('punto')) b.classList.toggle('activo', on);
        });
        $('.oreja .barra').classList.toggle('visible', st.piercings.indexOf('industrial') >= 0);
        $$('.joya').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.id === st.joya)); });
        $('.res-pill').textContent = 'Tu piercing';
        if (!lista.length) {
          $('.res-tit').textContent = 'Elige dónde';
          $('.res-sub').textContent = 'Toca un punto de la oreja o un piercing de la lista';
          $('.res-precio').textContent = '—';
          $('.res-tiempo').textContent = '';
        } else {
          $('.res-tit').textContent = lista.length === 1 ? lista[0].n : 'Proyecto de ' + lista.length + ' piercings';
          $('.res-sub').textContent = 'Precio orientativo con perforación y joya';
          $('.res-precio').textContent = fmt(total);
          var min = 15 + lista.length * 10;
          $('.res-tiempo').textContent = 'Cita de unos ' + min + ' minutos';
        }
        $('.res-artista').innerHTML = 'Te atiende <b>John</b>, body piercer desde 2009 y fundador del estudio. <a href="https://www.instagram.com/johnfreirebodypiercing/" target="_blank" rel="noopener">@johnfreirebodypiercing</a>';
        filas = lista.map(function (p) { return [p.n, fmt(p.p + j.p)]; });
        filas.push(['Joya', j.n]);
        numero = C.whatsPiercing;
        mensaje = 'Hola, John.' + (st.nombre ? ' Soy ' + st.nombre + '.' : '') + ' Quiero pedir cita para piercing:\n' +
          lista.map(function (p) { return '- ' + p.n; }).join('\n') + '\nJoya: ' + j.n.toLowerCase() + '\n' +
          (st.idea ? '\n' + st.idea + '\n' : '') +
          '\nPrecio orientativo de la web: ' + fmt(total) + '.\n¿Qué huecos tenéis?';
        nota.textContent = 'Precios de ejemplo para esta demo: el estudio pone los suyos. Si eres menor de edad, ven con tu madre, padre o tutor y su autorización.';
        lead = lista.length ? { tipo: 'piercing', piercings: lista.map(function (p) { return p.n; }).join(', '), joya: j.n, rango: fmt(total), artista: 'john' } : null;
        boton.querySelector('span').textContent = 'Pedir cita por WhatsApp';
        if (lista.length) boton.removeAttribute('aria-disabled'); else boton.setAttribute('aria-disabled', 'true');
      }

      resumen.innerHTML = '';
      filas.forEach(function (f) {
        var d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = f[0]; dd.textContent = f[1]; d.appendChild(dt); d.appendChild(dd); resumen.appendChild(d);
      });
      boton.href = wa(numero, mensaje);
      root.__lead = lead ? Object.assign(lead, { nombre: st.nombre, idea: st.idea }) : null;
      $('.mini-precio').textContent = $('.res-precio').textContent;
      root.dispatchEvent(new CustomEvent('presupuesto', { bubbles: true, detail: { tipo: st.tipo, mensaje: mensaje, numero: numero } }));
    }

    pintar();
    // el tamaño del óvalo necesita el SVG ya pintado
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { pintar(); io.disconnect(); } });
      io.observe(root);
    }
  }

  window.Presupuestador = {
    abrir: function (tipo) {
      var r = document.querySelector('[data-presupuestador]');
      if (r && r.__abrir) r.__abrir(tipo);
    }
  };
  document.querySelectorAll('[data-presupuestador]').forEach(mount);
})();
