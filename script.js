document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todos los elementos con la clase 'ramo'
    const ramos = document.querySelectorAll('.ramo');
    // Crea o selecciona el elemento donde se mostrarán los mensajes de requisitos
    let mensajeRequisitosDiv = document.getElementById('mensaje-requisitos');
    if (!mensajeRequisitosDiv) {
        mensajeRequisitosDiv = document.createElement('div');
        mensajeRequisitosDiv.id = 'mensaje-requisitos';
        document.body.appendChild(mensajeRequisitosDiv);
    }

    // Cargar el estado de los ramos desde localStorage al iniciar
    loadApprovedRamos();

    // Añadir un 'event listener' a cada ramo para el clic
    ramos.forEach(ramo => {
        ramo.addEventListener('click', () => {
            const ramoId = ramo.dataset.id; // Obtiene el ID único del ramo
            const isApproved = ramo.classList.contains('aprobado'); // Verifica si ya está aprobado

            if (isApproved) {
                // Si el ramo ya está aprobado, se puede desaprobar (opcional, si se desea esa funcionalidad)
                // ramo.classList.remove('aprobado');
                // removeApprovedRamo(ramoId);
                // alert(`"${ramo.textContent}" ha sido desaprobado.`);
                // Solo se permite desaprobar si ningún ramo que lo requiere está aprobado (comentar lo de abajo si no se quiere desaprobar)
                if (canUnapprove(ramoId)) {
                    ramo.classList.remove('aprobado');
                    removeApprovedRamo(ramoId);
                    updateRamoStates(); // Actualiza el estado visual de todos los ramos
                } else {
                    showMessage(`No puedes desaprobar "${ramo.textContent}" porque otros ramos dependen de este.`, []);
                }

            } else {
                // Si no está aprobado, intentar aprobarlo
                const requisitos = ramo.dataset.requisitos ? ramo.dataset.requisitos.split(',') : []; // Obtiene los requisitos
                const requisitosFaltantes = checkRequisitos(requisitos); // Verifica si se cumplen los requisitos

                if (requisitosFaltantes.length === 0) {
                    // Si no hay requisitos faltantes, marcar como aprobado
                    ramo.classList.add('aprobado');
                    saveApprovedRamo(ramoId); // Guarda el estado en localStorage
                    updateRamoStates(); // Actualiza el estado visual de todos los ramos
                    // Se podría agregar una pequeña confirmación visual, pero la marca es suficiente.
                } else {
                    // Si hay requisitos faltantes, mostrar mensaje
                    const nombresRamosFaltantes = requisitosFaltantes.map(reqId => {
                        const reqRamo = document.querySelector(`[data-id="${reqId}"]`);
                        return reqRamo ? reqRamo.textContent : reqId; // Obtiene el nombre legible
                    });
                    showMessage(`Para aprobar "${ramo.textContent}", necesitas aprobar primero:`, nombresRamosFaltantes);
                }
            }
        });
    });

    // Función para verificar si se cumplen los requisitos de un ramo
    function checkRequisitos(requisitos) {
        const faltantes = [];
        requisitos.forEach(reqId => {
            const reqRamo = document.querySelector(`[data-id="${reqId}"]`);
            if (reqRamo && !reqRamo.classList.contains('aprobado')) {
                faltantes.push(reqId);
            }
        });
        return faltantes;
    }

    // Función para mostrar el mensaje de requisitos
    function showMessage(title, items) {
        mensajeRequisitosDiv.innerHTML = `<h3>${title}</h3>`;
        if (items.length > 0) {
            const ul = document.createElement('ul');
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            mensajeRequisitosDiv.appendChild(ul);
        }
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Entendido';
        closeButton.addEventListener('click', () => {
            mensajeRequisitosDiv.style.display = 'none';
        });
        mensajeRequisitosDiv.appendChild(closeButton);
        mensajeRequisitosDiv.style.display = 'block';
    }

    // Funciones para guardar y cargar el estado en localStorage
    function saveApprovedRamo(ramoId) {
        let approvedRamos = JSON.parse(localStorage.getItem('approvedRamos')) || [];
        if (!approvedRamos.includes(ramoId)) {
            approvedRamos.push(ramoId);
            localStorage.setItem('approvedRamos', JSON.stringify(approvedRamos));
        }
    }

    function removeApprovedRamo(ramoId) {
        let approvedRamos = JSON.parse(localStorage.getItem('approvedRamos')) || [];
        approvedRamos = approvedRamos.filter(id => id !== ramoId);
        localStorage.setItem('approvedRamos', JSON.stringify(approvedRamos));
    }

    function loadApprovedRamos() {
        const approvedRamos = JSON.parse(localStorage.getItem('approvedRamos')) || [];
        approvedRamos.forEach(ramoId => {
            const ramo = document.querySelector(`[data-id="${ramoId}"]`);
            if (ramo) {
                ramo.classList.add('aprobado');
            }
        });
        updateRamoStates(); // Asegura que los ramos se bloqueen correctamente al cargar
    }

    // Función para actualizar el estado visual de todos los ramos (bloqueado o no)
    function updateRamoStates() {
        ramos.forEach(ramo => {
            const requisitos = ramo.dataset.requisitos ? ramo.dataset.requisitos.split(',') : [];
            const isApproved = ramo.classList.contains('aprobado');

            if (!isApproved && checkRequisitos(requisitos).length > 0) {
                ramo.classList.add('bloqueado');
            } else {
                ramo.classList.remove('bloqueado');
            }
        });
    }

    // Función auxiliar para verificar si un ramo puede ser desaprobado (si otro ramo depende de él)
    function canUnapprove(ramoId) {
        let canUnapprove = true;
        ramos.forEach(ramo => {
            if (ramo.classList.contains('aprobado')) {
                const requisitos = ramo.dataset.requisitos ? ramo.dataset.requisitos.split(',') : [];
                if (requisitos.includes(ramoId)) {
                    canUnapprove = false; // Si un ramo aprobado depende de este, no se puede desaprobar
                }
            }
        });
        return canUnapprove;
    }

    // Ejecutar la actualización inicial al cargar la página para aplicar los estados de bloqueado
    updateRamoStates();
});
