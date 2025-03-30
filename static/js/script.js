document.addEventListener("DOMContentLoaded", () => {
    configurarCarrusel();
    configurarBotonesFiltro();
    configurarPestanas();
    configurarBotonesInfo();
    configurarScrollStop();
    cargarPrimerFiltro();
});


/* ============================================================
   CARRUSEL Y VISIBILIDAD DE FLECHAS
   ============================================================ */

/**
 * Configura el carrusel de botones (para filtros de años y ligas).
 * Calcula el desplazamiento en función del ancho de un botón y asigna eventos a las flechas.
 * Además, actualiza la visibilidad de las flechas mediante actualizarVisibilidadFlechas().
 */
function configurarCarrusel() {
    const filtros = document.querySelectorAll(".filtro");
    filtros.forEach((filtro) => {
        const botonesWrapper = filtro.querySelector(".filtro__botones-wrapper");
        const leftArrow = filtro.querySelector(".filtro__flecha--izquierda");
        const rightArrow = filtro.querySelector(".filtro__flecha--derecha");

        if (botonesWrapper && leftArrow && rightArrow) {
            const firstButton = botonesWrapper.querySelector(".filtro__boton");
            if (firstButton) {
                const buttonWidth = firstButton.offsetWidth;
                const gap = parseInt(getComputedStyle(botonesWrapper).gap) || 0;
                const extra = buttonWidth > 60 ? 18 : 7;
                const offset = buttonWidth + gap + extra;

                leftArrow.addEventListener("click", () => {
                    botonesWrapper.scrollBy({ left: -offset, behavior: "smooth" });
                });
                rightArrow.addEventListener("click", () => {
                    botonesWrapper.scrollBy({ left: offset, behavior: "smooth" });
                });
            }
            actualizarVisibilidadFlechas(botonesWrapper);
        }
    });
}

/**
 * Actualiza la visibilidad de las flechas añadiendo o quitando la clase "flecha-activa"
 * según si hay contenido oculto a la izquierda o a la derecha en el wrapper.
 */
function actualizarVisibilidadFlechas(wrapper) {
    const leftArrow = wrapper.parentElement.querySelector(".filtro__flecha--izquierda");
    const rightArrow = wrapper.parentElement.querySelector(".filtro__flecha--derecha");
    if (!leftArrow || !rightArrow) return;
    
    if (wrapper.scrollLeft > 0) {
        leftArrow.classList.add("flecha-activa");
    } else {
        leftArrow.classList.remove("flecha-activa");
    }
    
    if (wrapper.scrollLeft + wrapper.clientWidth < wrapper.scrollWidth - 1) {
        rightArrow.classList.add("flecha-activa");
    } else {
        rightArrow.classList.remove("flecha-activa");
    }
}


/* ============================================================
   CONFIGURACIÓN DE BOTONES DE FILTRO (AÑOS Y LIGAS)
   ============================================================ */

/**
 * Configura los botones de cada filtro.
 * Reinicia las clases, marca el primer botón y asigna eventos a cada uno.
 * Se determina el tipo de filtro ("anio" o "liga") según la clase del contenedor.
 */
function configurarBotonesFiltro() {
    const filtros = document.querySelectorAll(".filtro");
    filtros.forEach((filtro) => {
        const botones = Array.from(filtro.querySelectorAll(".filtro__boton"));

        // Reinicia las clases de cada botón
        botones.forEach((boton) => {
            boton.classList.remove("seleccionado", "nohover", "sticky-left", "sticky-right");
        });

        // Selecciona el primer botón, si existe
        if (botones.length > 0) {
            botones[0].classList.add("seleccionado");
        }

        // Determina el tipo de filtro: "anio" o "liga"
        let tipoFiltro = "";
        if (filtro.classList.contains("filtro--anio")) {
            tipoFiltro = "anio";
        } else if (filtro.classList.contains("filtro--liga")) {
            tipoFiltro = "liga";
        }

        // Asigna eventos a cada botón, pasando el tipo de filtro
        botones.forEach((boton) => {
            asignarEventosBoton(boton, botones, tipoFiltro);
        });
    });
}

/**
 * Asigna los eventos "click" y "mousemove" a un botón.
 * Si tipoFiltro es "anio", se llama a cargarLigasDeAnio().
 * Si tipoFiltro es "liga", se llama a actualizarCompeticiones().
 */
function asignarEventosBoton(boton, botones, tipoFiltro = "") {
    boton.addEventListener("click", () => {
        // Marca el botón pulsado y deselecciona a los demás
        boton.classList.add("seleccionado", "nohover");
        botones.forEach((otroBoton) => {
            if (otroBoton !== boton) {
                otroBoton.classList.remove("seleccionado", "nohover", "sticky-left", "sticky-right");
            }
        });
        if (tipoFiltro === "anio") {
            const anio = parseInt(boton.dataset.valor);
            cargarLigasDeAnio(anio);
        } else if (tipoFiltro === "liga") {
            const liga = boton.dataset.valor;
            actualizarCompeticiones(liga);
        }
    });
    boton.addEventListener("mousemove", () => {
        boton.classList.remove("nohover");
    });
}


/* ============================================================
   ACTUALIZACIÓN DEL FILTRO DE LIGAS SEGÚN EL AÑO
   ============================================================ */

/**
 * cargarLigasDeAnio(anio)
 * Actualiza el filtro de ligas en función del año seleccionado.
 * Utiliza diferentes arrays de ligas según el resto de dividir el año entre 5.
 * Además, reinicia el scroll del contenedor de ligas y actualiza la visibilidad de las flechas.
 * Al finalizar, invoca actualizarCompeticiones() con la primera liga (por defecto).
 */
function cargarLigasDeAnio(anio) {
    const ligasMultiplo5 = [
        "Hermida", "Gregarios", "Hors Categorie", "Trueke Bikers",
        "Quick Step Team", "Fleche Wallone Cyclists", "Remco Team",
        "BH Zor Seguros Amaya", "Caja Rural Seguros RGA", "Faun Ardech Classics"
    ];
    const ligasResto1 = ["Hermida", "Gregarios", "Hors Categorie"];
    const ligasResto2 = [
        "Quick Step Team", "Fleche Wallone Cyclists", "Remco Team",
        "BH Zor Seguros Amaya", "Caja Rural Seguros RGA", "Faun Ardech Classics"
    ];
    const ligasResto3 = ["Hermida", "Gregarios", "Hors Categorie", "Trueke Bikers"];
    const ligasResto4 = [
        "Quick Step Team", "Fleche Wallone Cyclists", "Remco Team",
        "Caja Rural Seguros RGA", "Faun Ardech Classics", "Hermida", "Gregarios", "Hors Categorie"
    ];

    const resto = anio % 5;
    let ligasMostrar;
    if (resto === 0) {
        ligasMostrar = ligasMultiplo5;
    } else if (resto === 1) {
        ligasMostrar = ligasResto1;
    } else if (resto === 2) {
        ligasMostrar = ligasResto2;
    } else if (resto === 3) {
        ligasMostrar = ligasResto3;
    } else if (resto === 4) {
        ligasMostrar = ligasResto4;
    }

    const filtroLiga = document.querySelector(".filtro--liga");
    if (filtroLiga) {
        const wrapperLiga = filtroLiga.querySelector(".filtro__botones-wrapper");
        if (wrapperLiga) {
            // Borra los botones actuales
            wrapperLiga.innerHTML = "";
            const nuevosBotones = [];
            ligasMostrar.forEach((liga, indice) => {
                const nuevoBoton = document.createElement("button");
                nuevoBoton.className = "filtro__boton" + (indice === 0 ? " seleccionado" : "");
                nuevoBoton.setAttribute("data-valor", liga);
                nuevoBoton.setAttribute("title", liga);
                nuevoBoton.textContent = liga;
                nuevosBotones.push(nuevoBoton);
                wrapperLiga.appendChild(nuevoBoton);
            });
            // Asigna eventos a los nuevos botones (tipo filtro "liga")
            nuevosBotones.forEach((boton) => {
                asignarEventosBoton(boton, nuevosBotones, "liga");
            });
            // Reinicia el scroll y actualiza las flechas
            wrapperLiga.scrollLeft = 0;
            actualizarVisibilidadFlechas(wrapperLiga);
            // Invoca actualizarCompeticiones con la primera liga (por defecto)
            if (nuevosBotones.length > 0) {
                actualizarCompeticiones(nuevosBotones[0].dataset.valor);
            }
        }
    }
}


/* ============================================================
   ACTUALIZACIÓN DE COMPETICIONES SEGÚN LA LIGA
   ============================================================ */

/**
 * actualizarCompeticiones(liga)
 * Actualiza las pestañas de competición en función de la liga seleccionada.
 * Utiliza un objeto de mapeo que asocia cada liga a un array de competiciones.
 */
function actualizarCompeticiones(liga) {
    const competicionesPorLiga = {
        "Hermida": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Stage Race Championship",
            "Spring Classics", "Womens Classics", "Women Stage Race", "Totales"
        ],
        "Gregarios": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Stage Race Championship",
            "Womens Classics", "Women Stage Race", "Totales"
        ],
        "Hors Categorie": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Stage Race Championship",
            "Spring Classics", "Totales"
        ],
        "Trueke Bikers": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Stage Race Championship",
            "Womens Classics", "Women Stage Race", "Totales"
        ],
        "Quick Step Team": [
            "Warm Up Championship", "Totales"
        ],
        "Fleche Wallone Cyclists": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Totales"
        ],
        "Remco Team": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Womens Classics", "Totales"
        ],
        "BH Zor Seguros Amaya": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Womens Classics",
            "Stage Race Championship", "Totales"
        ],
        "Caja Rural Seguros RGA": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Womens Classics",
            "Stage Race Championship", "Spring Classics", "Totales"
        ],
        "Faun Ardech Classics": [
            "Warm Up Championship", "Superclasico Fantasy Sixes", "Stage Race Championship",
            "Spring Classics", "Womens Classics", "Women Stage Race", "Totales"
        ]
    };

    const competiciones = competicionesPorLiga[liga] || [];
    const contenedorPestanas = document.querySelector(".contenedor-pestanas");
    if (contenedorPestanas) {
        contenedorPestanas.innerHTML = "";
        competiciones.forEach((comp, index) => {
            const btn = document.createElement("button");
            btn.className = "pestana" + (index === 0 ? " activa" : "");
            btn.textContent = comp;
            btn.setAttribute("data-id", comp.toLowerCase().replace(/\s+/g, "-")); // Nombre en formato id
            contenedorPestanas.appendChild(btn);
        });

        // Llamar a configurarPestanas después de generar las pestañas
        configurarPestanas();

        // Cargar la tabla para la pestaña activa (la primera)
        const primeraPestana = document.querySelector(".contenedor-pestanas .pestana.activa");
        if (primeraPestana) {
            const idPestana = primeraPestana.getAttribute("data-id");
            cargarPuntuaciones(idPestana);
        }        
    }
}


/* ============================================================
   CONFIGURACIÓN DE PESTAÑAS
   ============================================================ */

/**
 * Configura las pestañas de la interfaz.
 * Al hacer clic, se actualiza la clase "activa" para resaltar la pestaña seleccionada.
 */
function configurarPestanas() {
    const pestanas = document.querySelectorAll(".pestana");
    pestanas.forEach((pestana, index) => {
        pestana.classList.remove("activa");
        if (index === 0) {
            pestana.classList.add("activa");
        }
        pestana.addEventListener("click", () => {
            pestanas.forEach((p) => p.classList.remove("activa"));
            pestana.classList.add("activa");

            // Obtener el identificador de la pestaña
            const idPestana = pestana.getAttribute("data-id");
            cargarPuntuaciones(idPestana);
        });
    });
}

/* ============================================================
   CONFIGURACIÓN DE BOTONES DE INFORMACIÓN
   ============================================================ */

/**
 * Configura los botones de información para cambiar estilos al hacer clic.
 */
function configurarBotonesInfo() {
    const botonesInfo = document.querySelectorAll(".boton-info");
    botonesInfo.forEach((boton) => {
        boton.addEventListener("click", () => {
            // Remueve la clase "activo" de todos los botones y la añade solo al seleccionado
            botonesInfo.forEach((b) => b.classList.remove("activo"));
            boton.classList.add("activo");
        });
    });
}

/* ============================================================
   SCROLL Y COMPORTAMIENTO STICKY
   ============================================================ */

/**
 * Configura el scroll y la función sticky en los wrappers de botones.
 * Actualiza la visibilidad de las flechas y, al detenerse el scroll, alinea el botón sticky.
 */
function configurarScrollStop() {
    const filtros = document.querySelectorAll(".filtro");
    filtros.forEach((filtro) => {
        const wrapper = filtro.querySelector(".filtro__botones-wrapper");
        if (!wrapper) return;
        let scrollTimer;
        wrapper.addEventListener("scroll", () => {
            updateSticky(wrapper);
            actualizarVisibilidadFlechas(wrapper);
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                alignSticky(wrapper);
            }, 100);
        });
        wrapper.addEventListener("mouseenter", () => {
            actualizarVisibilidadFlechas(wrapper);
        });
    });
}

/**
 * Detecta si el botón seleccionado está cerca de un extremo y le aplica clases sticky.
 */
function updateSticky(wrapper) {
    const selected = wrapper.querySelector(".filtro__boton.seleccionado");
    if (!selected) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    const threshold = 4;
    if (selectedRect.left <= wrapperRect.left + threshold) {
        selected.classList.add("sticky-left");
        selected.classList.remove("sticky-right");
    } else if (selectedRect.right >= wrapperRect.right - threshold) {
        selected.classList.add("sticky-right");
        selected.classList.remove("sticky-left");
    } else {
        selected.classList.remove("sticky-left", "sticky-right");
    }
}

/**
 * Al detenerse el scroll, alinea el botón sticky al borde.
 */
function alignSticky(wrapper) {
    const selected = wrapper.querySelector(".filtro__boton.seleccionado");
    if (!selected) return;
    if (selected.classList.contains("sticky-left")) {
        wrapper.scrollTo({ left: selected.offsetLeft, behavior: "smooth" });
    } else if (selected.classList.contains("sticky-right")) {
        const targetScroll = selected.offsetLeft - (wrapper.clientWidth - selected.offsetWidth);
        wrapper.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
}

function cargarPrimerFiltro() {
    const filtrosSeleccionados = document.querySelectorAll(".filtro__boton.seleccionado");

    filtrosSeleccionados.forEach((filtro) => {
        const valor = filtro.dataset.valor;

        if (!isNaN(valor) && valor.trim() !== '') {
            cargarLigasDeAnio(valor);
            return;
        }
    });
}


/* ============================================================
   GENERACIÓN DE TABLA DE PUNTOS
   ============================================================ */

// Variables globales para almacenar los datos generados y los datos actuales según la liga
let datosActuales = null;
let datosGenerados = null;
const nf = new Intl.NumberFormat("es-ES", { useGrouping: true });

function obtenerDatosPorPestana () {

    return {
        "warm-up-championship": {
            columnas: [
                "Tour Down Under", "Volta a la Comunitat Valenciana", "Étoile de Bessèges",
                "Tour de la Provence", "Tour of Oman", "Volta ao Algarve", "UAE Tour", "O Gran Camino"
            ],
            jugadores: [
                "Alberto", "Alex", "Edu", "Erik", "Igor", "Isra", "Jose Eloy", "Juaco", "Miki", "Rubens", "Vaskel"
            ]
        },
        "superclasico-fantasy-sixes": {
            columnas: [
                "Strade Bianche", "Milano - Torino", "Milano-Sanremo", "Classic Brugge-De Panne",
                "E3 Saxo Classic", "Gent-Wevelgem", "Dwars door Vlaanderen", "Ronde van Vlaanderen",
                "Scheldeprijs", "Paris-Roubaix", "De Brabantse Pijl", "Amstel Gold Race",
                "La Flèche Wallonne", "Liège-Bastogne-Liège", "Eschborn-Frankfurt", "Grand Prix du Morbihan",
                "Tro-Bro Léon", "Circuit Franco-Belge", "Brussels Cycling Classic",
                "Duracell Dwars door het Hageland", "Men's Road Race (OG)", "Donostia San Sebastian Klasikoa",
                "Bretagne Classic - Ouest-France", "BEMER Cyclassics", "Coppa Sabatini",
                "Grand Prix Cycliste de Québec", "Grand Prix Cycliste de Montréal", "Grand Prix de Wallonie",
                "SUPER 8 Classic", "Worlds Elite Road Race", "Sparkassen Münsterland Giro",
                "Giro dell'Emilia", "Paris - Tours Elite", "Coppa Bernocchi", "Tre Valli Varesine",
                "Gran Piemonte", "Il Lombardia", "Giro del Veneto", "Veneto Classic"
            ],
            jugadores: [
                "Aguilar", "Alberto", "Alex", "César", "Edu", "Erik", "Igor", "Isra",
                "Jose Eloy", "Juaco", "Miki", "Piri", "Rubens", "Vaskel",
                "Pablo", "Juanma", "Seronda", "Picullen", "Aitor"
            ]
        },
        "stage-race-championship": {
            columnas: [
                "Paris-Nice", "Tirreno-Adriatico", "Catalunya", "Itzulia", "Romandie",
                "Il Giro", "Dauphine", "Suisse", "Le Tour", "Pologne", "Vuelta España", "Renewi Tour"
            ],
            jugadores: [
                "Aguilar", "Alberto", "Alex", "César", "Edu", "Erik", "Igor", "Isra",
                "Jose Eloy", "Juaco", "Miki", "Piri", "Rubens", "Vaskel",
                "Pablo", "Juanma", "Seronda", "Picullen", "Aitor"
            ]
        },
        "spring-classics": {
            columnas: [
                "Milano-Sanremo", "Classic Brugge-De Panne", "E3 Saxo Classic",
                "Gent-Wevelgem in Flanders Fields", "Dwars door Vlaanderen - A travers la Flandre",
                "Ronde van Vlaanderen - Tour des Flandres", "Scheldeprijs", "Paris-Roubaix",
                "De Brabantse Pijl - La Flèche Brabançonne", "Amstel Gold Race",
                "La Flèche Wallonne", "Liège-Bastogne-Liège"
            ],
            jugadores: [
                "Aguilar", "Alex", "Edu", "Erik", "Igor", "Isra",
                "Jose Eloy", "Juaco", "Miki", "Rubens", "Vaskel",
                "Pablo", "Seronda", "Aitor"
            ]
        },
        "womens-classics": {
            columnas: [
                "Strade Bianche", "GP Oetingen (race cancelled)", "Miron Ronde van Drenthe",
                "Danilith Nokere Koerse", "Trofeo Alfredo Binda - Comune di Cittiglio",
                "Classic Brugge-De Panne", "Gent-Wevelgem In Flanders Fields",
                "Dwars door Vlaanderen - A travers la Flandre WE",
                "Ronde van Vlaanderen - Tour des Flandres", "Scheldeprijs vrouwen elite",
                "Paris-Roubaix Femmes", "De Brabantse Pijl - La Flèche Brabançonne",
                "Amstel Gold Race Ladies Edition", "La Flèche Wallonne Féminine",
                "Liège-Bastogne-Liège Femmes"
            ],
            jugadores: [
                "Aguilar", "Alberto", "Alex", "César", "Edu",
                "Jose Eloy", "Juaco", "Miki", "Rubens", "Vaskel",
                "Picullen", "Aitor"
            ]
        },
        "women-stage-race": {
            columnas: [
                "Vuelta España", "Itzulia", "Burgos", "Ride London", "Tour of Britain",
                "Suisse", "Giro Donne", "Tour Femmes", "Tour de Romandie", "Simac Ladies"
            ],
            jugadores: [
                "Alberto", "Alex", "Edu", "Erik", "Igor", "Isra", "Jose Eloy", "Juaco", "Miki", "Rubens", "Vaskel"
            ]
        },
        "totales": {
            columnas: [
                "#", "Jugador", "Puntos", "Dif. 1º", "Dif. Ant"
            ],
            jugadores: [
                "Aguilar", "Alberto", "Alex", "César", "Edu", "Erik", "Igor", "Isra",
                "Jose Eloy", "Juaco", "Miki", "Piri", "Rubens", "Vaskel",
                "Pablo", "Juanma", "Seronda", "Picullen", "Aitor"
            ]
        }
    }
}

function calcularPuntuaciones(datosActuales) {
    const { columnas, jugadores } = datosActuales;
    const numEventos = columnas.length;
    const n = jugadores.length;
    const eventsPoints = [];
    const dnsValues = [];

    for (let j = 0; j < numEventos; j++) {
        eventsPoints[j] = [];
        dnsValues[j] = [];
        for (let i = 0; i < n; i++) {
            const r = Math.random();
            const dns = r < 0.90 ? 0 : r < 0.95 ? 1 : r < 0.98 ? 2 : 3;
            dnsValues[j][i] = dns;
            eventsPoints[j][i] = dns > 0 ? 0 : Math.floor(Math.random() * (3317 - 1452 + 1)) + 1452;
        }
    }
    
    const posicionesEvento = eventsPoints.map(evento => {
        const arr = evento.map((p, i) => ({ p, i }));
        arr.sort((a, b) => b.p - a.p);
        const pos = Array(evento.length).fill(0);
        arr.forEach((item, index) => {
            pos[item.i] = index + 1;
        });
        return pos;
    });
    
    const totales = jugadores.map((_, i) =>
        eventsPoints.reduce((sum, evento) => sum + evento[i], 0)
    );
    
    const rankingTotales = [...totales]
        .map((puntos, i) => ({ puntos, i }))
        .sort((a, b) => b.puntos - a.puntos)
        .map((obj, index) => ({ ...obj, rank: index + 1 }));

    return { eventsPoints, posicionesEvento, totales, rankingTotales, dnsValues };
}

function cargarPuntuacionesTotales(datosActuales) {

    const { columnas, jugadores } = datosActuales;
    const n = jugadores.length;
    
    // Genera puntos aleatorios entre 73,218 y 124,765 para cada jugador
    const puntos = jugadores.map(() =>
        Math.floor(Math.random() * (124765 - 73218 + 1)) + 73218
    );
    
    // Función para generar DNS según la nueva distribución
    const generarDNSTotales = () => {
        const r = Math.random() * 100; // r en [0, 100)
        if (r < 70) {
            return 0;
        } else if (r < 70 + 10) {
            return 1;
        } else if (r < 70 + 10 + 5) {
            return 2;
        } else if (r < 70 + 10 + 5 + 4) {
            return 3;
        } else if (r < 70 + 10 + 5 + 4 + 3) {
            return 4;
        } else if (r < 70 + 10 + 5 + 4 + 3 + 2) {
            return 5;
        } else if (r < 70 + 10 + 5 + 4 + 3 + 2 + 2) {
            return 6;
        } else if (r < 70 + 10 + 5 + 4 + 3 + 2 + 2 + 1) {
            return 7;
        } else if (r < 70 + 10 + 5 + 4 + 3 + 2 + 2 + 1 + 1) {
            return 8;
        } else if (r < 70 + 10 + 5 + 4 + 3 + 2 + 2 + 1 + 1 + 1) {
            return 9;
        } else {
            return 10;
        }
    };

    const dnsArray = jugadores.map(() => {
        const val = generarDNSTotales();
        return val === 0 ? "" : val;
    });
    
    // Función para distribuir 100 unidades aleatoriamente entre n jugadores
    function distribuir100() {
        const distribucion = Array(n).fill(0);
        for (let i = 0; i < 100; i++) {
            const idx = Math.floor(Math.random() * n);
            distribucion[idx]++;
        }
        return distribucion.map(x => x === 0 ? "" : x);
    }
    const orosArr = distribuir100();
    const platasArr = distribuir100();
    const broncesArr = distribuir100();
    const farolillosArr = distribuir100();
    
    // Creamos la estructura de datos para cada jugador
    let datos = jugadores.map((jugador, i) => ({
        jugador: jugador,
        puntos: puntos[i] === 0 ? "" : puntos[i],
        oros: orosArr[i],
        platas: platasArr[i],
        bronces: broncesArr[i],
        farolillos: farolillosArr[i],
        dns: dnsArray[i]
    }));
    
    return datos;
}

function cargarPuntuaciones(liga) {
    const datosPorPestana = obtenerDatosPorPestana();
    datosActuales = datosPorPestana[liga];

    if (liga === "totales") {
        datosGenerados = cargarPuntuacionesTotales(datosActuales);
    } else {
        datosGenerados = calcularPuntuaciones(datosActuales);
    }

    if (esActivoPuntos()) {
        if (esActivoTotales()) {
            pintarTablaPuntosTotales();
        } else {
            pintarTablaPuntos();
        }
    } else if (esActivoMedallas()) {
        if (esActivoTotales()) {
            pintarTablaMedallasTotales();
        } else {
            pintarTablaMedallas();
        }
    }
}

function esActivoTotales() {
    return document.querySelector('.pestana.activa')?.dataset.id === "totales";
}

function pintarTablaPuntos() {
    const { columnas, jugadores } = datosActuales;
    const { eventsPoints, posicionesEvento, totales, rankingTotales } = datosGenerados;

    // Encabezado de la tabla para "Puntos"
    document.getElementById("encabezado").innerHTML = `
        <div class="celda celda-encabezado fija-izquierda">
            <div class="contenido-celda contenido-celda-encabezado">Jugador</div>
        </div>
        ${columnas.map(col => `
            <div class="celda celda-encabezado">
                <div class="contenido-celda contenido-celda-encabezado">${col}</div>
            </div>`).join("")}
        <div class="celda celda-encabezado fija-derecha">
            <div class="contenido-celda contenido-celda-encabezado">TOTAL</div>
        </div>
    `;

    // Filas de la tabla para "Puntos"
    const cuerpo = document.getElementById("tabla-jugadores");
    cuerpo.innerHTML = jugadores
        .map((jugador, rowIndex) => {
            const puntosTotales = totales[rowIndex];
            const rankingTotal = rankingTotales.find(obj => obj.i === rowIndex).rank;
            const claseTotal = rankingTotal === 1 ? "oro" : rankingTotal === 2 ? "plata" : rankingTotal === 3 ? "bronce" : "";

            return `
                <div class="fila fila-dato">
                    <div class="celda celda-dato fija-izquierda">
                        <div class="contenido-celda contenido-celda-dato">${jugador}</div>
                    </div>
                    ${eventsPoints.map((evento, i) => {
                        const puntos = evento[rowIndex];
                        const posicion = posicionesEvento[i][rowIndex];
                        const clasePos = posicion === 1 ? "oro" : posicion === 2 ? "plata" : posicion === 3 ? "bronce" : "";
                        // Si puntos es 0, no mostramos nada en esa celda.
                        if (puntos === 0) {
                            return `<div class="celda celda-dato"></div>`;
                        } else {
                            return `
                                <div class="celda celda-dato">
                                    <div class="contenido-celda contenido-celda-dato">
                                        <span class="posicion">(${posicion})</span>
                                        <span class="valor ${clasePos}">${nf.format(puntos)}</span>
                                    </div>
                                </div>`;
                        }
                    }).join("")}
                    <div class="celda celda-dato fija-derecha">
                        <div class="contenido-celda contenido-celda-dato">
                            ${puntosTotales === 0 ? "" : `<span class="posicion">(${rankingTotal})</span>
                            <span class="valor total ${claseTotal}">${nf.format(puntosTotales)}</span>`}
                        </div>
                    </div>
                </div>`;
        })
        .join("");

    inicializarScroll();
}

function pintarTablaMedallas() {
    // Extraemos los jugadores y el número de eventos y jugadores
    const { jugadores, columnas } = datosActuales;
    const numEventos = columnas.length;
    const participantes = jugadores.length;
    const { posicionesEvento, totales, eventsPoints, dnsValues } = datosGenerados;
    
    const medallasData = jugadores.map((jugador, i) => {
        let oro = 0, plata = 0, bronce = 0, farolillos = 0, dnsTotal = 0;
        for (let j = 0; j < numEventos; j++) {
            const pos = posicionesEvento[j][i];
            const puntosEvento = eventsPoints[j][i];
            if (dnsValues[j][i] > 0) {
                dnsTotal++;
            }
            if (puntosEvento > 0) {
                if (pos === 1) {
                    oro++;
                } else if (pos === 2) {
                    plata++;
                } else if (pos === 3) {
                    bronce++;
                }
                let activos = eventsPoints[j].filter(p => p > 0).length;
                if (pos === activos) {
                    farolillos++;
                }
            }
        }
        return {
            jugador: jugador,
            puntos: totales[i] === 0 ? "" : totales[i],
            oros: oro === 0 ? "" : oro,
            platas: plata === 0 ? "" : plata,
            bronces: bronce === 0 ? "" : bronce,
            farolillos: farolillos === 0 ? "" : farolillos,
            dns: dnsTotal === 0 ? "" : dnsTotal
        };
    });
    
    // Ordenamos los datos por puntos de forma descendente para determinar la posición global
    medallasData.sort((a, b) => b.puntos - a.puntos);

    // Encabezado para la tabla de "Medallas"
    document.getElementById("encabezado").innerHTML = `
        <div class="celda celda-encabezado celda-posicion">
            <div class="contenido-celda contenido-celda-encabezado">#</div>
        </div>
        <div class="celda celda-encabezado">
            <div class="contenido-celda contenido-celda-encabezado">Jugador</div>
        </div>
        <div class="celda celda-encabezado">
            <div class="contenido-celda contenido-celda-encabezado">Puntos</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🥇</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🥈</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🥉</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🏮</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">DNS</div>
        </div>
    `;

    // Filas para la tabla de "Medallas"
    const cuerpo = document.getElementById("tabla-jugadores");
    cuerpo.innerHTML = medallasData
        .map((dato, index) => {
            // Asigna una clase extra a las primeras tres filas
            const filaExtra = index === 0 ? "fila-oro" : index === 1 ? "fila-plata" : index === 2 ? "fila-bronce" : "";
            return `
                <div class="fila fila-dato ${filaExtra}">
                    <div class="celda celda-dato celda-posicion">
                        <div class="contenido-celda contenido-celda-dato">${index + 1}</div>
                    </div>
                    <div class="celda celda-dato">
                        <div class="contenido-celda contenido-celda-dato izquierda">${dato.jugador}</div>
                    </div>
                    <div class="celda celda-dato">
                        <div class="contenido-celda contenido-celda-dato">${nf.format(dato.puntos)}</div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedalla(dato.oros, "medalla-oro")}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedalla(dato.platas, "medalla-plata")}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedalla(dato.platas, "medalla-bronce")}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedallaFarolillos(dato.farolillos)}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedallaDNS(dato.dns)}
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");

    inicializarScroll();
}

function esActivoPuntos() {
    return document.getElementById("btn-puntos").classList.contains("activo");
}

function esActivoMedallas() {
    return document.getElementById("btn-medallas").classList.contains("activo");
}

// Función para generar el HTML de las medallas si el valor es diferente a ""
function generarMedalla(valor, claseMedalla) {
    return valor !== "" ? `<div class="contenido-celda contenido-celda-dato medalla ${claseMedalla}">${valor}</div>` : "";
}

// Función para generar el HTML de datos de farolillos rojos si el valor es diferente a ""
function generarMedallaFarolillos(valor) {
    return valor !== "" ? `<div class="contenido-celda contenido-celda-dato medalla-farolillo">${valor}</div>` : "";
}

// Función para generar el HTML de datos de DNS si el valor es diferente a ""
function generarMedallaDNS(valor) {
    return valor !== "" ? `<div class="contenido-celda contenido-celda-dato medalla-dns">${valor}</div>` : "";
}

// Función que inicializa el scroll de la taba.
function inicializarScroll() {
    const contenedorTabla = document.querySelector('.contenedor-tabla');
    contenedorTabla.scrollTop = 0;
    contenedorTabla.scrollLeft = 0;
}

// Función para generar DNS con probabilidades normalizadas
function randomDNS() {
    const r = Math.random();
    if (r < 75/100) return 0;
    else if (r < (75+15)/100) return 1;
    else return 2;
}
  

// Función que pinta la tabla de puntos o medallas en función de la selección del usuario.
function switchTabla(tipo) {
    if (tipo === 'puntos') {
        document.getElementById("btn-puntos").classList.add("activo");
        document.getElementById("btn-medallas").classList.remove("activo");
        if (esActivoTotales()) {
            pintarTablaPuntosTotales();
        } else {
            pintarTablaPuntos();
        }
    } else if (tipo === 'medallas') {
        document.getElementById("btn-medallas").classList.add("activo");
        document.getElementById("btn-puntos").classList.remove("activo");
        if (esActivoTotales()) {
            pintarTablaMedallasTotales();
        } else {
            pintarTablaMedallas();
        }
    }
}

function pintarTablaPuntosTotales() {
    // Copiamos y ordenamos los datosTotales en orden descendente por puntos
    let datos = [...datosGenerados].sort((a, b) => b.puntos - a.puntos);
    
    // Calculamos el ranking y las diferencias
    const primerPuntos = datos[0].puntos;
    for (let i = 0; i < datos.length; i++) {
        datos[i].rank = i + 1;
        datos[i].dif1 = i === 0 ? "" : primerPuntos - datos[i].puntos;
        datos[i].difAnterior = i === 0 ? "" : datos[i - 1].puntos - datos[i].puntos;
    }
    
    // Pintamos el encabezado de la tabla
    document.getElementById("encabezado").innerHTML = `
        <div class="celda celda-encabezado fija-izquierda celda-posicion">
            <div class="contenido-celda contenido-celda-encabezado">#</div>
        </div>
        <div class="celda celda-encabezado">
            <div class="contenido-celda contenido-celda-encabezado">Jugador</div>
        </div>
        <div class="celda celda-encabezado">
            <div class="contenido-celda contenido-celda-encabezado">Puntos</div>
        </div>
        <div class="celda celda-encabezado">
            <div class="contenido-celda contenido-celda-encabezado">Dif. 1º</div>
        </div>
        <div class="celda celda-encabezado fija-derecha">
            <div class="contenido-celda contenido-celda-encabezado">Dif. Anterior</div>
        </div>
    `;
    
    // Pintamos las filas de la tabla
    const cuerpo = document.getElementById("tabla-jugadores");
    cuerpo.innerHTML = datos
        .map((dato, index) => {
            // Asigna una clase extra a las primeras tres filas
            const claseTotal = index === 0 ? "oro" : index === 1 ? "plata" : index === 2 ? "bronce" : "";
            const filaExtra = index === 0 ? "fila-oro" : index === 1 ? "fila-plata" : index === 2 ? "fila-bronce" : "";
            return `
                <div class="fila fila-dato ${filaExtra}">
                    <div class="celda celda-dato fija-izquierda celda-posicion">
                        <div class="contenido-celda contenido-celda-dato">${dato.rank}</div>
                    </div>
                    <div class="celda celda-dato">
                        <div class="contenido-celda contenido-celda-dato izquierda">${dato.jugador}</div>
                    </div>
                    <div class="celda celda-dato">
                        <div class="contenido-celda contenido-celda-dato">
                            <span class="valor total ${claseTotal}">${nf.format(dato.puntos)}</span>
                        </div>
                    </div>
                    <div class="celda celda-dato">
                        <div class="contenido-celda contenido-celda-dato">${dato.dif1 === "" ? "" : nf.format(dato.dif1)}</div>
                    </div>
                    <div class="celda celda-dato fija-derecha">
                        <div class="contenido-celda contenido-celda-dato">${dato.difAnterior === "" ? "" : nf.format(dato.difAnterior)}</div>
                    </div>
                </div>
            `;
        })
        .join("");
    
    inicializarScroll();
}

function pintarTablaMedallasTotales() {
    // Copia la estructura de datos generados y la ordena según el criterio:
    // - Descendente por oros, platas, bronces
    // - Ascendente por DNS y farolillos
    let datos = [...datosGenerados].sort((a, b) => {
        const oroA = a.oros === "" ? 0 : Number(a.oros);
        const oroB = b.oros === "" ? 0 : Number(b.oros);
        if (oroB !== oroA) return oroB - oroA;

        const plataA = a.platas === "" ? 0 : Number(a.platas);
        const plataB = b.platas === "" ? 0 : Number(b.platas);
        if (plataB !== plataA) return plataB - plataA;
        
        const bronceA = a.bronces === "" ? 0 : Number(a.bronces);
        const bronceB = b.bronces === "" ? 0 : Number(b.bronces);
        if (bronceB !== bronceA) return bronceB - bronceA;
        
        const dnsA = a.dns === "" ? 0 : Number(a.dns);
        const dnsB = b.dns === "" ? 0 : Number(b.dns);
        if (dnsA !== dnsB) return dnsA - dnsB; // menos DNS es mejor
        
        const farA = a.farolillos === "" ? 0 : Number(a.farolillos);
        const farB = b.farolillos === "" ? 0 : Number(b.farolillos);
        return farA - farB; // menos farolillos es mejor
    });

    // Asignamos ranking y calculamos diferencias basadas en los puntos totales
    const primerPuntos = Number(datos[0].puntos) || 0;
    for (let i = 0; i < datos.length; i++) {
        datos[i].rank = i + 1;
        datos[i].dif1 = i === 0 ? "" : primerPuntos - (Number(datos[i].puntos) || 0);
        datos[i].difAnterior = i === 0 ? "" : (Number(datos[i - 1].puntos) || 0) - (Number(datos[i].puntos) || 0);
    }
    
    // Pintamos el encabezado de la tabla
    // Encabezado para la tabla de "Medallas"
    document.getElementById("encabezado").innerHTML = `
        <div class="celda celda-encabezado celda-posicion">
            <div class="contenido-celda contenido-celda-encabezado">#</div>
        </div>
        <div class="celda celda-encabezado">
            <div class="contenido-celda contenido-celda-encabezado">Jugador</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🥇</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🥈</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🥉</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">🏮</div>
        </div>
        <div class="celda celda-encabezado celda-medalla">
            <div class="contenido-celda contenido-celda-encabezado">DNS</div>
        </div>
    `;

    const cuerpo = document.getElementById("tabla-jugadores");
    cuerpo.innerHTML = datos
        .map((dato, index) => {
            // Asigna una clase extra a las primeras tres filas
            const filaExtra = index === 0 ? "fila-oro" : index === 1 ? "fila-plata" : index === 2 ? "fila-bronce" : "";
            return `
                <div class="fila fila-dato ${filaExtra}">
                    <div class="celda celda-dato celda-posicion">
                        <div class="contenido-celda contenido-celda-dato">${index + 1}</div>
                    </div>
                    <div class="celda celda-dato">
                        <div class="contenido-celda contenido-celda-dato izquierda">${dato.jugador}</div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedalla(dato.oros, "medalla-oro")}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedalla(dato.platas, "medalla-plata")}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedalla(dato.platas, "medalla-bronce")}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedallaFarolillos(dato.farolillos)}
                        </div>
                    </div>
                    <div class="celda celda-dato celda-medalla">
                        <div class="contenido-celda contenido-celda-dato">
                            ${generarMedallaDNS(dato.dns)}
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
    
    inicializarScroll();
}
