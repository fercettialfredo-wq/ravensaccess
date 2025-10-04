document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        API_PROXY_URL: 'https://appvalidar.azurewebsites.net/api/processFormData?code=diC_fsfHBzDhxSQajupH-Vr78Lh6W2JA6R59VJlQo1cFAzFu4ly9RQ=='
    };
    const SCREENS = {
        LOGIN: 'login-screen',
        MENU: 'menu-screen'
    };
    let currentUser = {};
    const screens = document.querySelectorAll('.screen');
    const popup = document.getElementById('confirmation-popup');

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
    
    const initLogin = () => {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeCheckbox = document.getElementById('remember-me');
        const loginButton = document.getElementById('login-button');
        const togglePassword = document.getElementById('togglePassword');
        const loginError = document.getElementById('login-error');

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
                const response = await fetch(CONFIG.API_PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', username, password })
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Credenciales inválidas');
                }
                currentUser = { username: username, condominio: data.condominio };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
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
    };

    const initMenu = () => {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.dataset.screen;
                if (screenId) showScreen(screenId);
            });
        });
    };

    const initLogout = () => {
        document.getElementById('logout-button').addEventListener('click', () => {
            currentUser = {};
            sessionStorage.removeItem('currentUser');
            showScreen(SCREENS.LOGIN);
        });
    };

    const formDefinitions = {
        'Residente': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }],
        'Visita': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }],
        'Evento': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'N QR', type: 'select', options: ['1', '5', '10', '20'] }],
        'Personal de servicio': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'Cargo', type: 'text' }],
        'Eliminar QR': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'Nombre QR', type: 'text', field: 'Nombre_QR' }],
        'Incidencias': [{ label: 'Nombre', type: 'text' }, { label: 'Torre', type: 'text' }, { label: 'Departamento', type: 'text' }, { label: 'Incidencia', type: 'textarea' }]
    };

    const generateFormContent = (formPage) => {
        const formId = formPage.dataset.formId;
        const fields = formDefinitions[formId];
        let fieldsHtml = '';

        fields.forEach(field => {
            const fieldId = `${formId.toLowerCase().replace(/\s/g, '-')}-${field.label.toLowerCase().replace(/\s/g, '-')}`;
            const dataField = field.field || field.label;
            let inputHtml = '';
            if (field.type === 'select') {
                const optionsHtml = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                inputHtml = `<select id="${fieldId}" data-field="${dataField}" required class="input-field">${optionsHtml}</select>`;
            } else if (field.type === 'textarea') {
                inputHtml = `<textarea id="${fieldId}" data-field="${dataField}" required class="input-field" rows="4"></textarea>`;
            } else {
                inputHtml = `<input type="${field.type}" id="${fieldId}" data-field="${dataField}" required class="input-field">`;
            }
            // Envolvemos cada campo en un div para la validación
            fieldsHtml += `<div class="form-field"><label for="${fieldId}" class="block font-bold text-gray-700">${field.label}</label>${inputHtml}</div>`;
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
                <form class="space-y-4" novalidate>${fieldsHtml}<div class="mt-8"><button type="submit" class="btn-save py-3">Guardar</button></div><p class="form-error text-red-600 text-sm text-center hidden mt-2"></p></form>
            </div>`;
        
        formPage.querySelector('.home-icon').addEventListener('click', () => showScreen(SCREENS.MENU));
        formPage.querySelector('form').addEventListener('submit', handleFormSubmit);
        
        formPage.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('input', () => {
                if (input.value.trim()) {
                    // CAMBIO: Quita la clase de error del div contenedor
                    input.closest('.form-field').classList.remove('form-field-invalid');
                }
            });
        });
    }
    
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formPage = form.closest('.form-page');
        const formId = formPage.dataset.formId;
        const fields = form.querySelectorAll('.form-field');
        const saveButton = form.querySelector('.btn-save');
        const errorP = form.querySelector('.form-error');

        errorP.classList.add('hidden');
        let allFieldsValid = true;

        fields.forEach(field => {
            const input = field.querySelector('.input-field');
            if (!input.value.trim()) {
                allFieldsValid = false;
                field.classList.add('form-field-invalid'); // CAMBIO: Añade clase de error al div
            } else {
                field.classList.remove('form-field-invalid'); // CAMBIO: Quita clase de error al div
            }
        });

        if (!allFieldsValid) {
            errorP.textContent = "Por favor, rellena todos los campos marcados.";
            errorP.classList.remove('hidden');
            return;
        }
        
        const data = {
            action: 'submit_form',
            formulario: formId,
            condominio: currentUser.condominio || 'No especificado',
            registradoPor: currentUser.username || 'No especificado'
        };
        form.querySelectorAll('.input-field').forEach(input => {
            data[input.dataset.field] = input.value.trim();
        });

        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        try {
            const response = await fetch(CONFIG.API_PROXY_URL, {
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

    const initPopup = () => {
        const okBtn = document.getElementById('popup-ok-btn');
        if (okBtn) {
            okBtn.addEventListener('click', () => {
                if (popup) popup.style.display = 'none';
                const activeForm = document.querySelector('.form-page.active form');
                if (activeForm) {
                    activeForm.reset();
                    activeForm.querySelectorAll('.form-field').forEach(field => field.classList.remove('form-field-invalid'));
                    activeForm.querySelector('.form-error').classList.add('hidden');
                }
                showScreen(SCREENS.MENU);
            });
        }
    };
    
    const checkSession = () => {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showScreen(SCREENS.MENU);
        } else {
            showScreen(SCREENS.LOGIN);
        }
    };

    const main = () => {
        initLogin();
        initMenu();
        initLogout();
        initPopup();
        checkSession();
    };

    main();
});
