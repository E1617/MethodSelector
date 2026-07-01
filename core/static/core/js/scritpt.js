document.addEventListener("DOMContentLoaded", () => {
    
    // #region 1. LOGICA DE NAVEGACIÓN Y MENÚS
    const menuItems = document.querySelectorAll('.nav-links li, #menu-links li');

    function changeMenu(event) {
        menuItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
        console.log("Navegando a: " + event.currentTarget.innerText);
    }

    menuItems.forEach(item => {
        item.addEventListener('click', changeMenu);
    });
    // #endregion

    // #region 2. LOGICA DEL SLIDER DE MÉTODOS (INICIO)
    const sliderContainer = document.getElementById('slider-container');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev && sliderContainer) {
        btnPrev.addEventListener('click', () => {
            sliderContainer.scrollBy({ left: -344, behavior: 'smooth' });
        });
    }

    if (btnNext && sliderContainer) {
        btnNext.addEventListener('click', () => {
            sliderContainer.scrollBy({ left: 344, behavior: 'smooth' });
        });
    }
    // #endregion

    // #region 3. VENTANA MODAL (DETALLES DE BIBLIOTECA)
    const modal = document.getElementById('method-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cards = document.querySelectorAll('.method-card');

    const mTitle = document.getElementById('modal-title');
    const mTagsContainer = document.getElementById('modal-tags-container');
    const mDef = document.getElementById('modal-def');
    const mEnfoque = document.getElementById('modal-enfoque');
    const mCasos = document.getElementById('modal-casos');
    const mVentajas = document.getElementById('modal-ventajas');
    const mDesventajas = document.getElementById('modal-desventajas');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const nombre = card.getAttribute('data-nombre');
            const tags = card.getAttribute('data-tags');
            const definicion = card.getAttribute('data-definicion');
            const casos = card.getAttribute('data-casos');
            const ventajas = card.getAttribute('data-ventajas');
            const desventajas = card.getAttribute('data-desventajas');
            const enfoque = card.getAttribute('data-enfoque');

            if (nombre) {
                mTitle.innerText = nombre;
                mDef.innerText = definicion;
                mEnfoque.innerText = enfoque;
                mCasos.innerText = casos;
                mVentajas.innerText = ventajas;
                mDesventajas.innerText = desventajas;

                mTagsContainer.innerHTML = '';
                if (tags) {
                    tags.split(',').forEach(tag => {
                        const pill = document.createElement('span');
                        pill.classList.add('modal-pill');
                        pill.innerText = tag.trim();
                        mTagsContainer.appendChild(pill);
                    });
                }

                modal.classList.add('show');
            }
        });
    });

    function closeModal() {
        if (modal) modal.classList.remove('show');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    // #endregion

   // #region 4. BUSCADOR Y FILTROS EN TIEMPO REAL (BIBLIOTECA)
    const searchInput = document.querySelector('.search-input');
    const filterTags = document.querySelectorAll('.filter-tag');

    function filtrarMetodos() {
        // Capturamos las tarjetas dinámicas generadas por Django
        const tarjetasDinamicas = document.querySelectorAll('.method-card');
        
        const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : "";
        
        // Obtenemos el texto del botón presionado en minúsculas (ej: "todos", "formal", "heuristico", "agil")
        const tagActivoText = document.querySelector('.filter-tag.active') ? document.querySelector('.filter-tag.active').innerText.toLowerCase().trim() : "todos";

        tarjetasDinamicas.forEach(card => {
            const nombre = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : "";
            const descripcion = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : "";
            
            // Capturamos la categoría que viene de la base de datos (tanto del tag visual como del atributo data)
            const tipoTag = card.querySelector('.method-tag') ? card.querySelector('.method-tag').innerText.toLowerCase().trim() : "";
            const dataTags = card.getAttribute('data-tags') ? card.getAttribute('data-tags').toLowerCase() : "";

            // 1. Coincidencia por texto en el buscador
            const coincideTexto = nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
            
            // 2. Coincidencia por Filtro (Normalizando tildes para evitar fallos)
            let coincideTag = false;
            
            if (tagActivoText === "todos") {
                coincideTag = true;
            } else {
                // Función rápida para limpiar tildes (convierte "heurístico" en "heuristico", "ágil" en "agil")
                const limpiarTildes = (str) => str.replace(/[á]/g, 'a').replace(/[é]/g, 'e').replace(/[í]/g, 'i').replace(/[ó]/g, 'o').replace(/[ú]/g, 'u');

                const tagBuscadoLimpio = limpiarTildes(tagActivoText);
                const tagTarjetaLimpio = limpiarTildes(tipoTag);
                const dataTagsLimpio = limpiarTildes(dataTags);

                // Comparamos si el filtro activo está incluido en la categoría de la tarjeta
                if (tagTarjetaLimpio.includes(tagBuscadoLimpio) || dataTagsLimpio.includes(tagBuscadoLimpio)) {
                    coincideTag = true;
                }
            }

            // 3. Aplicar visibilidad final
            if (coincideTexto && coincideTag) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filtrarMetodos);
    }

    filterTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            filterTags.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filtrarMetodos();
        });
    });
    // #endregion

  // #region 5. MOTOR DE EVALUACIÓN (WIZARD DINÁMICO CON BACKEND)
    const step1 = document.getElementById('wizard-step-1');
    const step2 = document.getElementById('wizard-step-2');
    const btnTo2 = document.getElementById('btn-to-step-2');
    const btnBack1 = document.getElementById('btn-back-to-1');
    const badge1 = document.getElementById('step-badge-1');
    const badge2 = document.getElementById('step-badge-2');
    
    const registerForm = document.getElementById('project-register-form');
    const questionsForm = document.getElementById('criteria-questions-form');
    const questionsContainer = document.getElementById('dynamic-questions-container');
    const instruccionFase = document.getElementById('instruccion-fase');
    const btnSubmitEvaluar = document.getElementById('btn-submit-evaluar');

    // Definición de las 5 fases dinámicas que vienen de tu Base de Datos
    const fasesDinamicas = ["Equipo", "Cliente", "Dimension del Proyecto", "Entorno tecnologico", "Modelo Decision"];
    let faseActualIndex = 0;
    let respuestasAcumuladas = {}; // Guardará las respuestas temporales de todas las fases

    // Función asíncrona para traer los criterios del backend usando Fetch
    async function cargarPreguntasFase(nombreFase) {
        if (!questionsContainer) return;
        
        try {
            // Actualizamos la instrucción visual para el usuario
            if (instruccionFase) {
                instruccionFase.innerHTML = `<strong>Fase Actual: ${nombreFase}</strong>. Responda los siguientes 4 criterios obtenidos desde la base de datos:`;
            }
            
            // Hacemos la llamada HTTP GET a nuestra API de Django enviando el parámetro
            const response = await fetch(`/api/obtener-criterios/?fase=${encodeURIComponent(nombreFase)}`);
            const data = await response.json();
            
            if (data.criterios && data.criterios.length > 0) {
                questionsContainer.innerHTML = ''; // Limpiamos preguntas anteriores
                
                // Iteramos sobre los 4 criterios devueltos por el Stored Procedure
                data.criterios.forEach((criterio, index) => {
                    const questionCard = document.createElement('div');
                    questionCard.classList.add('question-card'); // Mantenemos tu clase original de estilos
                    
                    // Creamos una clave única para el name del radio button basada en la fase y el índice
                    const radioName = `q-${nombreFase.toLowerCase().replace(/\s+/g, '-')}-${index}`;

                    // Generamos la estructura HTML idéntica a la que tenías pero inyectando el nombre del criterio
                    questionCard.innerHTML = `
                        <h4>${index + 1}. ¿Cómo evalúa el criterio: <strong>${criterio}</strong> para su proyecto?</h4>
                        <div class="radio-options">
                          <label class="radio-container">
                            <input type="radio" name="${radioName}" value="1" required> Bajo / Riguroso (Orientado a procesos tradicionales)
                          </label>
                          <label class="radio-container">
                            <input type="radio" name="${radioName}" value="3"> Moderado / Intermedio (Enfoque híbrido adaptativo)
                          </label>
                          <label class="radio-container">
                            <input type="radio" name="${radioName}" value="5"> Alto / Flexible (Orientado a metodologías ágiles)
                          </label>
                        </div>
                    `;
                    questionsContainer.appendChild(questionCard);
                });

                // Cambiar dinámicamente el texto del botón final según corresponda
                if (faseActualIndex === fasesDinamicas.length - 1) {
                    if (btnSubmitEvaluar) btnSubmitEvaluar.innerText = "Calcular Recomendación Final 📊";
                } else {
                    if (btnSubmitEvaluar) btnSubmitEvaluar.innerText = "Siguiente Fase ➡️";
                }

            } else {
                questionsContainer.innerHTML = '<p>No se encontraron criterios para esta fase en la base de datos.</p>';
            }
        } catch (error) {
            console.error("Error al cargar los criterios desde la BD:", error);
            questionsContainer.innerHTML = '<p>Error de conexión al cargar el formulario dinámico.</p>';
        }
    }

    // Transición del Paso 1 (Estático) al Paso 2 (Dinámico)
    if (btnTo2 && registerForm) {
        btnTo2.addEventListener('click', () => {
            if (registerForm.checkValidity()) {
                step1.classList.remove('active');
                step2.classList.add('active');
                if (badge1 && badge2) {
                    badge1.classList.remove('active');
                    badge2.classList.add('active');
                }
                
                // Iniciamos la carga de la primera fase dinámica ('Equipo')
                faseActualIndex = 0;
                cargarPreguntasFase(fasesDinamicas[faseActualIndex]);
            } else {
                registerForm.reportValidity();
            }
        });
    }

    // Lógica para el botón Atrás
    if (btnBack1) {
        btnBack1.addEventListener('click', () => {
            if (faseActualIndex > 0) {
                // Si está en una fase intermedia, retrocede a la fase dinámica anterior
                faseActualIndex--;
                cargarPreguntasFase(fasesDinamicas[faseActualIndex]);
            } else {
                // Si está en la primera fase dinámica, regresa por completo al Paso 1 de Datos Generales
                if (step1 && step2 && badge1 && badge2) {
                    step2.classList.remove('active');
                    step1.classList.add('active');
                    badge2.classList.remove('active');
                    badge1.classList.add('active');
                }
            }
        });
    }

    // Procesar el envío del cuestionario por fases
    if (questionsForm) {
        questionsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const faseActualNombre = fasesDinamicas[faseActualIndex];
            
            // Almacenamos temporalmente las respuestas de la fase actual en nuestro objeto acumulador
            const FormDataFase = new FormData(questionsForm);
            for (let [key, value] of FormDataFase.entries()) {
                respuestasAcumuladas[key] = parseInt(value);
            }

            // Comprobamos si nos quedan más fases por responder
            if (faseActualIndex < fasesDinamicas.length - 1) {
                // Avanzamos al siguiente bloque dinámico
                faseActualIndex++;
                questionsForm.reset(); // Reseteamos la selección visual para la nueva fase
                cargarPreguntasFase(fasesDinamicas[faseActualIndex]);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll estético arriba
            } else {
                // ¡Llegamos al final de las 5 fases dinámicas! Procesamos los datos definitivos
                const proyecto = {
                    nombre: document.getElementById('proj-name').value,
                    equipo: document.getElementById('team-size').value,
                    requisitos: document.getElementById('req-type').value,
                    contexto: document.getElementById('org-context').value
                };

                // Calculamos el promedio matemático real sumando absolutamente todas las respuestas acumuladas
                const valoresRespuestas = Object.values(respuestasAcumuladas);
                const sumaTotal = valoresRespuestas.reduce((a, b) => a + b, 0);
                const puntajeAgilidadFinal = sumaTotal / valoresRespuestas.length;

                console.log("Datos Finales del Proyecto:", proyecto);
                console.log("Respuestas completas de las 5 fases:", respuestasAcumuladas);
                console.log("Puntaje definitivo de Agilidad (1 al 5):", puntajeAgilidadFinal.toFixed(2));

                alert(`¡Evaluación completada con éxito para "${proyecto.nombre}"!\nSe procesaron las 5 fases dinámicas desde la Base de Datos.\nPuntaje General de Agilidad: ${puntajeAgilidadFinal.toFixed(2)}/5.`);
            }
        });
    }
    // #endregion

});