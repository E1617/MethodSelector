let modalCargado = false;

function openModal(modalCurrent) {
    const modalName = modalCurrent + "-modal";
    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    if (!modalCargado) {
        fetch('/elementos/')
            .then(response => response.text())
            .then(html => {
                modalPlaceholder.innerHTML = html;
                modalCargado = true;
                
                const modal = document.getElementById(modalName);
                if (modal) {
                    modal.classList.add('show');
                    
                    // 🎯 AQUÍ LLAMAMOS A LA INICIALIZACIÓN DEL BUSCADOR
                    inicializarBuscadorHibrido(); 
                }
            })
            .catch(error => console.error('Error al cargar el modal:', error));
    } else {
        const modal = document.getElementById(modalName);
        if (modal) {
            modal.classList.add('show');
            
            // También lo llamamos aquí por seguridad al volver a abrirlo
            inicializarBuscadorHibrido();
        }
    }
}

function closeModal(modalCurrent) {
    const modalName = modalCurrent + "-modal";
    const modal = document.getElementById(modalName);
    if (modal) modal.classList.remove('show');
}

function switchModalTab(tabName) {
    // 1. Manejar las pestañas visuales (activar/desactivar)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById('tab-btn-' + tabName);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 2. Controlar la visibilidad de los contenidos
    const tabNuevo = document.getElementById('content-tab-nuevo');
    const tabHibrido = document.getElementById('content-tab-hibrido');

    if (tabNuevo && tabHibrido) {
        if (tabName === 'nuevo') {
            tabNuevo.style.display = 'block';
            tabHibrido.style.display = 'none';
        } else if (tabName === 'hibrido') {
            tabNuevo.style.display = 'none';
            tabHibrido.style.display = 'block';
        }
    }
}

// #region 4. BUSCADOR Y FILTROS EN TIEMPO REAL (BIBLIOTECA)

// Función para inicializar los listeners de búsqueda una vez que el modal ya existe en el DOM
function inicializarBuscadorHibrido() {
  const searchInput = document.querySelector('#filtroElements.search-input');
  const filterTags = document.querySelectorAll('.filter-tag');

  if (searchInput) {
    // Eliminamos listeners previos para no duplicarlos si abren/cierran el modal varias veces
    searchInput.removeEventListener('input', filtrarElementos);
    searchInput.addEventListener('input', filtrarElementos);
  }

  if (filterTags.length > 0) {
    filterTags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        filterTags.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        filtrarElementos();
      });
    });
  }
}

function filtrarElementos() {
  const searchInput = document.querySelector('#filtroElements.search-input');
  const tarjetasDinamicas = document.querySelectorAll('.element-card');
  
  const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : "";
  
  // Si no hay botones de tags de filtro en el DOM, por defecto es "todos"
  const tagActivoEl = document.querySelector('.filter-tag.active');
  const tagActivoText = tagActivoEl ? tagActivoEl.innerText.toLowerCase().trim() : "todos";

  tarjetasDinamicas.forEach(card => {
    // Extraemos los datos reales de la tarjeta
    const nombreElemento = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : "";
    const descripcion = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : "";
    const metodoOrigen = card.querySelector('.element-tag') ? card.querySelector('.element-tag').innerText.toLowerCase().trim() : "";
    
    // Atributos data por si acaso
    const dataTags = card.getAttribute('data-tags') ? card.getAttribute('data-tags').toLowerCase() : "";

    // 💡 Ampliamos la búsqueda para que busque coincidencia en el título del elemento, 
    // la descripción Y TAMBIÉN en el nombre del método (ej: si escriben "Scrum" o "Z")
    const coincideTexto = 
      nombreElemento.includes(textoBusqueda) || 
      descripcion.includes(textoBusqueda) || 
      metodoOrigen.includes(textoBusqueda) ||
      dataTags.includes(textoBusqueda);

    let coincideTag = false;
    
    if (tagActivoText === "todos") {
      coincideTag = true;
    } else {
      const limpiarTildes = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const tagBuscadoLimpio = limpiarTildes(tagActivoText);
      const tagTarjetaLimpio = limpiarTildes(metodoOrigen);
      const dataTagsLimpio = limpiarTildes(dataTags);

      if (tagTarjetaLimpio.includes(tagBuscadoLimpio) || dataTagsLimpio.includes(tagBuscadoLimpio)) {
         coincideTag = true;
      }
    }

    // Mostramos u ocultamos la tarjeta usando flex para no romper tu diseño CSS
    if (coincideTexto && coincideTag) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}
// #endregion

// 1. Hace que al dar clic a la tarjeta se active/desactive su checkbox y su estilo visual
function toggleCardSelection(cardElement) {
    const checkbox = cardElement.querySelector('.element-checkbox');
    
    // Si el clic viene directo de la tarjeta (y no del checkbox directamente)
    if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }
    
    // Añade o remueve la clase de selección
    if (checkbox.checked) {
        cardElement.classList.add('selected');
    } else {
        cardElement.classList.remove('selected');
    }
}

// 2. Función para obtener los datos de la selección al guardar
function saveMethodHibrid() {
    const nombreMetodo = document.getElementById('input-namenew').value.trim();
    const descripcionMetodo = document.getElementById('input-descriptionnew').value.trim();
    const enfoqueMetodo = document.getElementById('input-enfoquenew').value.trim();
    const usoMetodo = document.getElementById('input-casosusonew').value.trim();
    const ventajaMetodo = document.getElementById('input-ventajasnew').value.trim();
    const desventajaMetodo = document.getElementById('input-desventajasnew').value.trim();
    
    // Obtener todos los checkboxes que están marcados
    const checkboxesSeleccionados = document.querySelectorAll('.element-checkbox:checked');
    
    // Guardar los IDs en una lista
    const idsSeleccionados = Array.from(checkboxesSeleccionados).map(cb => parseInt(cb.value));
    
    // Validaciones básicas antes de enviar
    if (!nombreMetodo) {
        alert("Por favor, ingresa un nombre para la metodología.");
        return;
    }
    if (idsSeleccionados.length === 0) {
        alert("Por favor, selecciona al menos un elemento de la biblioteca.");
        return;
    }
    
    // Objeto listo para mandar a Django
    const datosEnviar = {
        nombre: nombreMetodo,
        descripcion: descripcionMetodo,
        enfoque: enfoqueMetodo,
        uso: usoMetodo,
        ventaja: ventajaMetodo,
        desventaja: desventajaMetodo,
        elementos: idsSeleccionados
    };
    
    enviarDatosAlServidor(datosEnviar);
}

function enviarDatosAlServidor(datos) {
    fetch('/SaveMethodHibrid/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': obtenerCSRFToken() 
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('¡Metodología híbrida guardada con éxito!');
            closeModal('newmethod');
            location.reload(); 
        } else {
            alert('Error al guardar: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


function obtenerCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
}

function saveMethod(){
  const nombreMetodo = document.getElementById('input-name').value.trim();
  const categoriaMetodo = document.getElementById('input-cat').value.trim();
  const descripcionMetodo = document.getElementById('input-def').value.trim();
  const enfoqueMetodo = document.getElementById('input-enfoque').value.trim();
  const casoUsoMetodo = document.getElementById('input-casosuso').value.trim();
  const ventajaMetodo = document.getElementById('input-ventajas').value.trim();
  const desventajaMetodo = document.getElementById('input-desventajas').value.trim();
  
  // Obtener todos los checkboxes que están marcados
  const checkboxesSeleccionados = document.querySelectorAll('.element-checkbox:checked');
  
  // Guardar los IDs en una lista
  const idsSeleccionados = Array.from(checkboxesSeleccionados).map(cb => parseInt(cb.value));
  
  // Validaciones básicas antes de enviar
  if (!nombreMetodo) {
      alert("Por favor, ingresa un nombre para la metodología.");
      return;
  }
  if (!descripcionMetodo) {
      alert("Por favor, completa una descripción");
      return;
  }
  if (!categoriaMetodo) {
      alert("Por favor, completa una categoria");
      return;
  }
  
  // Objeto listo para mandar a Django
  const datosEnviar = {
      nombre: nombreMetodo,
      categoria: categoriaMetodo,
      descripcion: descripcionMetodo,
      enfoque: enfoqueMetodo,
      uso: casoUsoMetodo,
      ventaja: ventajaMetodo,
      desventaja: desventajaMetodo 
  };
  
  sendMethodNew(datosEnviar);
}

function sendMethodNew(datos) {
    fetch('/SaveMethod/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': obtenerCSRFToken() 
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('¡Metodología guardada con éxito!');
            closeModal('newmethod');
            location.reload(); 
        } else {
            alert('Error al guardar: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
