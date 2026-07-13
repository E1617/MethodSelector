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
        const tarjetasDinamicas = document.querySelectorAll('.method-card');
        const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const tagActivoText = document.querySelector('.filter-tag.active') ? document.querySelector('.filter-tag.active').innerText.toLowerCase().trim() : "todos";

        tarjetasDinamicas.forEach(card => {
            const nombre = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : "";
            const descripcion = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : "";
            const tipoTag = card.querySelector('.method-tag') ? card.querySelector('.method-tag').innerText.toLowerCase().trim() : "";
            const dataTags = card.getAttribute('data-tags') ? card.getAttribute('data-tags').toLowerCase() : "";

            const coincideTexto = nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
            let coincideTag = false;
            
            if (tagActivoText === "todos") {
                coincideTag = true;
            } else {
                const limpiarTildes = (str) => str.replace(/[á]/g, 'a').replace(/[é]/g, 'e').replace(/[í]/g, 'i').replace(/[ó]/g, 'o').replace(/[ú]/g, 'u');

                const tagBuscadoLimpio = limpiarTildes(tagActivoText);
                const tagTarjetaLimpio = limpiarTildes(tipoTag);
                const dataTagsLimpio = limpiarTildes(dataTags);

                if (tagTarjetaLimpio.includes(tagBuscadoLimpio) || dataTagsLimpio.includes(tagBuscadoLimpio)) {
                    coincideTag = true;
                }
            }

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

    // #region 5. MOTOR DE EVALUACIÓN 
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

    const modalFinal = document.getElementById('modal-resultado-final');
    const txtCategoriaGanadora = document.getElementById('txt-categoria-ganadora');
    const selectMetodoGanador = document.getElementById('select-metodo-ganador');
    const finalSaveForm = document.getElementById('final-save-form');
    const btnCerrarModalFinal = document.getElementById('btn-cerrar-modal-final');

    const fasesDinamicas = ["Equipo", "Cliente", "Dimension del Proyecto", "Entorno tecnologico", "Modelo de decision"];
    let faseActualIndex = 0;
    let conteoCategoriasGlobal = { agil: 0, formal: 0, heuristico: 0, evolutivo: 0 };

    async function cargarPreguntasFase(nombreFase) {
        if (!questionsContainer) return;
        try {
            if (instruccionFase) {
                instruccionFase.innerHTML = `<strong>Fase Actual: ${nombreFase}</strong>. Evalúe los siguientes factores clave para su proyecto:`;
            }
            const response = await fetch(`/api/obtener-criterios/?fase=${encodeURIComponent(nombreFase)}`);
            const data = await response.json();
            
            if (data.criterios && data.criterios.length > 0) {
                questionsContainer.innerHTML = '';
                data.criterios.forEach((criterio, index) => {
                    const questionCard = document.createElement('div');
                    questionCard.classList.add('question-card');
                    const radioName = `q-${nombreFase.toLowerCase().replace(/\s+/g, '-')}-${index}`;

                    questionCard.innerHTML = `
                        <h4>${index + 1}. ¿Cómo afecta el criterio <strong>${criterio}</strong> al desarrollo del proyecto?</h4>
                        <div class="radio-options">
                            <label class="radio-container">
                                <input type="radio" name="${radioName}" value="5" data-categoria="agil" required> Alto / Flexible (Enfoque Ágil)
                            </label>
                            <label class="radio-container">
                                <input type="radio" name="${radioName}" value="5" data-categoria="formal"> Rígido / Normativo (Enfoque Formal)
                            </label>
                            <label class="radio-container">
                                <input type="radio" name="${radioName}" value="5" data-categoria="heuristico"> Complejo / Algorítmico (Enfoque Heurístico)
                            </label>
                            <label class="radio-container">
                                <input type="radio" name="${radioName}" value="5" data-categoria="evolutivo"> Experimental / Incierto (Enfoque Evolutivo)
                            </label>
                        </div>
                    `;
                    questionsContainer.appendChild(questionCard);
                });

                if (faseActualIndex === fasesDinamicas.length - 1) {
                    if (btnSubmitEvaluar) btnSubmitEvaluar.innerText = "Calcular Recomendación Final 📊";
                } else {
                    if (btnSubmitEvaluar) btnSubmitEvaluar.innerText = "Siguiente Fase ➡️";
                }
            } else {
                questionsContainer.innerHTML = '<p>No se encontraron criterios para esta fase en la base de datos.</p>';
            }
        } catch (error) {
            console.error("Error al cargar los criterios:", error);
            questionsContainer.innerHTML = '<p>Error de conexión al cargar el formulario dinámico.</p>';
        }
    }

    if (btnTo2 && registerForm) {
        btnTo2.addEventListener('click', () => {
            if (registerForm.checkValidity()) {
                step1.classList.remove('active');
                step2.classList.add('active');
                if (badge1 && badge2) {
                    badge1.classList.remove('active');
                    badge2.classList.add('active');
                }
                faseActualIndex = 0;
                conteoCategoriasGlobal = { agil: 0, formal: 0, heuristico: 0, evolutivo: 0 };
                cargarPreguntasFase(fasesDinamicas[faseActualIndex]);
            } else {
                registerForm.reportValidity();
            }
        });
    }

    if (btnBack1) {
        btnBack1.addEventListener('click', () => {
            if (faseActualIndex > 0) {
                faseActualIndex--;
                cargarPreguntasFase(fasesDinamicas[faseActualIndex]);
            } else {
                if (step1 && step2 && badge1 && badge2) {
                    step2.classList.remove('active');
                    step1.classList.add('active');
                    badge2.classList.remove('active');
                    badge1.classList.add('active');
                }
            }
        });
    }

    if (questionsForm) {
        questionsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const radiosSeleccionados = questionsForm.querySelectorAll('input[type="radio"]:checked');
            radiosSeleccionados.forEach(radio => {
                const categoria = radio.getAttribute('data-categoria');
                const puntaje = parseInt(radio.value) || 0;
                if (categoria && conteoCategoriasGlobal.hasOwnProperty(categoria)) {
                    conteoCategoriasGlobal[categoria] += puntaje;
                }
            });

            if (faseActualIndex < fasesDinamicas.length - 1) {
                faseActualIndex++;
                questionsForm.reset();
                cargarPreguntasFase(fasesDinamicas[faseActualIndex]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                let categoriaGanadora = "agil";
                let maxPuntaje = -1;
                for (let cat in conteoCategoriasGlobal) {
                    if (conteoCategoriasGlobal[cat] > maxPuntaje) {
                        maxPuntaje = conteoCategoriasGlobal[cat];
                        categoriaGanadora = cat;
                    }
                }

                txtCategoriaGanadora.innerText = categoriaGanadora.toUpperCase();
                modalFinal.style.display = "flex";

                selectMetodoGanador.innerHTML = '<option value="">Cargando métodos...</option>';
                try {
                    const res = await fetch(`/api/obtener-metodos/?categoria=${categoriaGanadora}`);
                    const data = await res.json();
                    
                    if(data.metodos && data.metodos.length > 0) {
                        selectMetodoGanador.innerHTML = '<option value="" disabled selected>-- Elija el método ganador --</option>';
                        data.metodos.forEach(metodo => {
                            const opt = document.createElement('option');
                            opt.value = metodo.id;
                            opt.textContent = metodo.nombre;
                            selectMetodoGanador.appendChild(opt);
                        });
                    } else {
                        selectMetodoGanador.innerHTML = '<option value="">No hay métodos en esta categoría</option>';
                    }
                } catch(err) {
                    console.error("Error al traer métodos:", err);
                    selectMetodoGanador.innerHTML = '<option value="">Error al cargar metodologías</option>';
                }
            }
        });
    }

    if (finalSaveForm) {
        finalSaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const comboMetodo = document.getElementById('select-metodo-ganador');
            const metodoId = parseInt(comboMetodo.value);
            const nombreMetodoSeleccionado = comboMetodo.options[comboMetodo.selectedIndex].text;
            const selectEquipo = document.getElementById('team-size');
            const selectRequisitos = document.getElementById('req-type'); 

            // Empaquetado de datos del paso 1
            const payload = {
                proyecto: {
                    nombre: document.getElementById('proj-name').value,
                    descripcion: document.getElementById('proj-desc').value,
                    cliente: document.getElementById('proj-client').value,
                    presupuesto: document.getElementById('proj-budget').value,
                    // datos adicionales para el historial
                    Equipo: selectEquipo.options[selectEquipo.selectedIndex].text,
                    Requisitos: selectRequisitos.options[selectRequisitos.selectedIndex].text
                },
                metodo_id: metodoId,
                resultado_rec: nombreMetodoSeleccionado 
            };

            try {
                // Enviamos los datos completos al endpoint de guardado masivo
                const response = await fetch('/api/guardar-evaluacion/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    alert('¡Éxito total! El proyecto fue creado y los criterios fueron mapeados en la tabla Cuestionario vía Stored Procedure.');
                    modalFinal.style.display = "none";
                    window.location.reload(); // Recargamos para limpiar el wizard
                } else {
                    alert('Error en el servidor: ' + result.message);
                }
            } catch (error) {
                console.error("Error al guardar evaluación:", error);
                alert("Ocurrió un error de red al intentar conectarse al servidor.");
            }
        });
    }

    if (btnCerrarModalFinal) {
        btnCerrarModalFinal.addEventListener('click', () => {
            modalFinal.style.display = "none";
        });
    }

});

// #region 6. INTERACCIÓN DINÁMICA DE HISTORIAL Y CARGA ASÍNCRONA DE JUSTIFICACIONES
    const toggleButtons = document.querySelectorAll('.toggle-details-btn');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const targetId = e.target.getAttribute('data-target');
            const targetRow = document.getElementById(targetId);
            
            // EXTRAEMOS EL ID REAL DIRECTAMENTE DEL ATRIBUTO DATA-ID DEL BOTÓN
            const idProyecto = e.target.getAttribute('data-id');

            if (targetRow) {
                if (targetRow.style.display === 'none') {
                    targetRow.style.display = 'table-row';
                    e.target.innerText = 'Ocultar';
                    e.target.style.color = '#dc2626';

                    const justifBox = document.getElementById(`justif-box-${idProyecto}`);
                    
                    if (justifBox && justifBox.innerText.includes('Cargando')) {
                        try {
                            const response = await fetch(`/api/obtener-justificacion/${idProyecto}/`);
                            const data = await response.json();
                            
                            if (data.status === 'success') {
                                justifBox.innerText = data.justificacion;
                            } else {
                                justifBox.innerText = "No se pudieron cargar las cláusulas explicativas.";
                            }
                        } catch (error) {
                            console.error("Error en Fetch Justificación:", error);
                            justifBox.innerText = "Error de conexión al recuperar el dictamen.";
                        }
                    }

                } else {
                    targetRow.style.display = 'none';
                    e.target.innerText = 'Ver Alcance';
                    e.target.style.color = '#2563eb';
                }
            }
        });
    });
    // #endregion