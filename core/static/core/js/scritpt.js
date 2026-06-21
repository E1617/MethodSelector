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
        const textoBusqueda = searchInput ? searchInput.value.toLowerCase() : "";
        const tagActivo = document.querySelector('.filter-tag.active') ? document.querySelector('.filter-tag.active').innerText.toLowerCase() : "todos";

        cards.forEach(card => {
            const nombre = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : "";
            const descripcion = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : "";
            const tipoTag = card.querySelector('.method-tag') ? card.querySelector('.method-tag').innerText.toLowerCase() : "";

            const coincideTexto = nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
            
            let coincideTag = false;
            if (tagActivo === "todos") {
                coincideTag = true;
            } else if (tagActivo === "ágiles" && tipoTag === "ágil") {
                coincideTag = true;
            } else if (tagActivo === "tradicionales" && tipoTag === "tradicional") {
                coincideTag = true;
            } else if (tagActivo === "estructurados" && tipoTag === "estructurado") {
                coincideTag = true;
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

    // #region 5. MOTOR DE EVALUACIÓN (WIZARD)
    const step1 = document.getElementById('wizard-step-1');
    const step2 = document.getElementById('wizard-step-2');
    const btnTo2 = document.getElementById('btn-to-step-2');
    const btnBack1 = document.getElementById('btn-back-to-1');
    const badge1 = document.getElementById('step-badge-1');
    const badge2 = document.getElementById('step-badge-2');
    
    const registerForm = document.getElementById('project-register-form');
    const questionsForm = document.getElementById('criteria-questions-form');

    // Transición del Paso 1 al Paso 2 con validación nativa
    if (btnTo2 && registerForm) {
        btnTo2.addEventListener('click', () => {
            // Validar que los campos obligatorios del registro estén completos antes de pasar
            if (registerForm.checkValidity()) {
                step1.classList.remove('active');
                step2.classList.add('active');
                if(badge1 && badge2) {
                    badge1.classList.remove('active');
                    badge2.classList.add('active');
                }
            } else {
                // Si falta algo, dispara las alertas nativas del navegador
                registerForm.reportValidity();
            }
        });
    }

    // Regresar al Paso 1
    if (btnBack1) {
        btnBack1.addEventListener('click', () => {
            if(step1 && step2 && badge1 && badge2) {
                step2.classList.remove('active');
                step1.classList.add('active');
                badge2.classList.remove('active');
                badge1.classList.add('active');
            }
        });
    }

    // Procesar envío del cuestionario (Cálculo preliminar)
    if (questionsForm) {
        questionsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Captura de datos generales del Paso 1
            const proyecto = {
                nombre: document.getElementById('proj-name').value,
                equipo: document.getElementById('team-size').value,
                requisitos: document.getElementById('req-type').value,
                contexto: document.getElementById('org-context').value
            };

            // Captura de respuestas del Paso 2
            const rVolatilidad = parseInt(document.querySelector('input[name="q-volatility"]:checked').value);
            const rCriticidad = parseInt(document.querySelector('input[name="q-criticality"]:checked').value);
            const rInvolucramiento = parseInt(document.querySelector('input[name="q-delivery"]:checked').value);

            // Algoritmo matemático base (Promedio de factores)
            // Valores cercanos a 5 -> Agilidad alta (Scrum/XP)
            // Valores cercanos a 1 -> Rigidez Estructurada/Tradicional (Cascada/SSA-SD)
            const puntajeAgilidad = (rVolatilidad + rCriticidad + rInvolucramiento) / 3;

            console.log("Datos del Proyecto:", proyecto);
            console.log("Puntaje obtenido de Agilidad (1 al 5):", puntajeAgilidad.toFixed(2));

            alert(`¡Cálculo procesado con éxito para "${proyecto.nombre}"!\nPuntaje de Agilidad: ${puntajeAgilidad.toFixed(2)}/5.\nPronto añadiremos la pantalla con los gráficos de recomendación.`);
        });
    }
    // #endregion

});