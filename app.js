document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN CENTRALIZADA ---
    const CONFIG = {
        API_URL: 'https://appvalidar.azurewebsites.net/api/processFormData?code=diC_fsfHBzDhxSQajupH-Vr78Lh6W2JA6R59VJlQo1cFAzFu4ly9RQ=='
    };

    const SCREENS = {
        LOGIN: 'login-screen',
        MENU: 'menu-screen',
        RESIDENTE: 'residente-form',
        VISITA: 'visita-form',
        EVENTO: 'evento-form',
        SERVICIO: 'servicio-form',
        QR: 'qr-form',
        INCIDENCIAS: 'incidencias-form'
    };
    
    // --- ESTADO DE LA APLICACIÓN ---
    let currentUser = {};

    // --- ELEMENTOS DEL DOM ---
    const screens = document.querySelectorAll('.screen');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginButton = document.getElementById('login-button');
    const togglePassword = document.getElementById('togglePassword');
    const loginError = document.getElementById('login-error');
    const menuItems = document.querySelectorAll('.menu-item');
    const popup = document.getElementById('confirmation-popup');
    const okBtn = document.getElementById('popup-ok-btn');

    // --- LÓGICA DE NAVEGACIÓN ---
    const showScreen = (screenId) => {
        screens.forEach(screen => screen.classList.remove('active'));
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            if (activeScreen.classList.contains('form-page')) {
                generateFormContent(activeScreen);
            }
            activeScreen.classList.add('active');
        } else {
            console.error(`Error: No se encontró la pantalla con ID "${screenId}"`);
        }
    };
    
    // --- LÓGICA DE LOGIN ---
    if (loginForm && togglePassword) {
        togglePassword.classList.remove('fa-eye', 'fa-eye-slash');
        togglePassword.classList.add('fa-eye');

        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            usernameInput.value = rememberedUser;
            rememberMeCheckbox.checked = true;
        }

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            loginError.classList.add('hidden');
            
            loginButton.disabled = true;
            loginButton.textContent = 'Verificando...';

            try {
                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', username, password })
                });
                
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Credenciales inválidas');
                }
                
                currentUser = { username: username, condominio: data.condominio };
                
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                showScreen(SCREENS.MENU);

            } catch (error) {
                loginError.textContent = error.message;
                loginError.classList.remove('hidden');
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Entrar';
            }
        });
    } else {
        console.error("Error: No se encontró el formulario de login o el botón para mostrar/ocultar contraseña.");
    }

    // --- LÓGICA DEL MENÚ ---
    if (menuItems.length > 0) {
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.dataset.screen;
                if (screenId) showScreen(screenId);
            });
        });
    } else {
        console.error("Error: No se encontraron los elementos del menú.");
    }

    // --- DEFINICIÓN DE FORMULARIOS ---
    const formDefinitions = {
        'Residente': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }],
        'Visita': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }],
        'Evento': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'N QR', type: 'select', options: ['1', '5', '10', '20'] }],
        'Personal de servicio': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'Cargo', type: 'text' }],
        'Eliminar QR': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'Nombre QR', type: 'text', field: 'Nombre_QR' }],
        'Incidencias': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'Incidencia', type: 'text' }]
    };

    function generateFormContent(formPage) {
        formPage.innerHTML = ''; 

        const formId = formPage.dataset.formId;
        const fields = formDefinitions[formId];
        let fieldsHtml = '';

        fields.forEach(field => {
            const fieldId = `${formId.toLowerCase().replace(/\s/g, '-')}-${field.label.toLowerCase().replace(/\s/g, '-')}`;
            const dataField = field.field || field.label;
            
            let inputHtml = '';
            if (field.type === 'select') {
                const optionsHtml = field.options.map(opt => `<option>${opt}</option>`).join('');
                inputHtml = `<select id="${fieldId}" data-field="${dataField}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2">${optionsHtml}</select>`;
            } else {
                inputHtml = `<input type="${field.type}" id="${fieldId}" data-field="${dataField}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2">`;
            }

            fieldsHtml += `<div><label for="${fieldId}" class="block font-bold text-gray-700">${field.label}</label>${inputHtml}</div>`;
        });
        
        formPage.innerHTML = `
            <header class="header-app"><div class="header-logo"><img src="./icons/logo.png" alt="Ravens Logo"><span class="header-logo-text">RAVENS ACCESS</span></div></header>
            <div class="form-title-section">
                <h2 class="form-title">${formId}</h2>
                <div class="home-icon cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                </div>
            </div>
            <div class="form-container">
                <form class="space-y-4">
                    ${fieldsHtml}
                    <div class="mt-8">
                        <button type="submit" class="btn-save py-3">Guardar</button>
                    </div>
                    <p class="form-error text-red-600 text-sm text-center hidden mt-2"></p>
                </form>
            </div>
        `;
        
        formPage.querySelector('.home-icon').addEventListener('click', () => showScreen(SCREENS.MENU));
        formPage.querySelector('form').addEventListener('submit', handleFormSubmit);
    }
    
    // --- LÓGICA DE ENVÍO DE FORMULARIOS (FUNCIÓN RESTAURADA) ---
    async function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formPage = form.closest('.form-page');
        const formId = formPage.dataset.formId;
        const inputs = form.querySelectorAll('input[data-field], select[data-field]');
        const saveButton = form.querySelector('.btn-save');
        const errorP = form.querySelector('.form-error');

        errorP.classList.add('hidden');
        
        const data = {
            action: 'submit_form',
            formulario: formId,
            condominio: currentUser.condominio || 'No especificado',
            registradoPor: currentUser.username || 'No especificado'
        };

        let allFieldsValid = true;
        inputs.forEach(input => {
            data[input.dataset.field] = input.value.trim();
            if (!input.value.trim()) {
                allFieldsValid = false;
            }
        });

        if (!allFieldsValid) {
            errorP.textContent = "Por favor, rellena todos los campos.";
            errorP.classList.remove('hidden');
            return;
        }
        
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Error en el servidor');
            }
            showConfirmationPopup();

        } catch (error) {
            console.error("Error al enviar datos:", error);
            errorP.textContent = "Hubo un error al guardar los datos.";
            errorP.classList.remove('hidden');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Guardar';
        }
    }

    function showConfirmationPopup() {
        if (popup) popup.style.display = 'flex';
    }

    if (okBtn) {
        okBtn.addEventListener('click', () => {
            if (popup) popup.style.display = 'none';
            const activeForm = document.querySelector('.form-page.active form');
            if (activeForm) {
                activeForm.reset();
                activeForm.querySelector('.form-error').classList.add('hidden');
            }
            showScreen(SCREENS.MENU);
        });
    }

    showScreen(SCREENS.LOGIN);
});
