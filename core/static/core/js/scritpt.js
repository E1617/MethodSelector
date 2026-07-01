// ... Todo tu JS anterior se queda exactamente igual (Regiones 1, 2, 3 y 4) ...

// #region 5. MOTOR DE EVALUACIÓN (CONEXIÓN CON STORED PROCEDURES)
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

    // Elementos de la nueva Modal Final
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

    // Procesar el envío por fases
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
                // ¡Fin del cuestionario! Calculamos ganadora
                let categoriaGanadora = "agil";
                let maxPuntaje = -1;
                for (let cat in conteoCategoriasGlobal) {
                    if (conteoCategoriasGlobal[cat] > maxPuntaje) {
                        maxPuntaje = conteoCategoriasGlobal[cat];
                        categoriaGanadora = cat;
                    }
                }

                // 1. Mostrar la modal final y asignar el título
                txtCategoriaGanadora.innerText = categoriaGanadora.toUpperCase();
                modalFinal.style.display = "flex";

                // 2. Alimentar el combo llamando a obtener_metodos_por_categoria (usa GetMethodsForCategoria)
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

    // Evento para enviar y guardar definitivamente todo en la base de datos (POST)
    if (finalSaveForm) {
        finalSaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Empaquetamos los datos capturados en el Paso 1
            const payload = {
                proyecto: {
                    nombre: document.getElementById('proj-name').value,
                    descripcion: document.getElementById('proj-desc').value,
                    cliente: document.getElementById('proj-client').value,
                    presupuesto: document.getElementById('proj-budget').value
                },
                metodo_id: parseInt(selectMetodoGanador.value),
                resultado_rec: document.getElementById('txt-recomendacion-final').value
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
// #endregion