/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.5.0
 * ---------------------------------------------------------------------------- */

/**
 * Register page.
 *
 * This module implements the functionality of the register page.
 */
App.Pages.Register = (function () {
    const $registerForm = $('#register-form');
    const $firstName = $('#first-name');
    const $lastName = $('#last-name');
    const $email = $('#email');
    const $password = $('#password');
    const $confirmPassword = $('#confirm-password');
    const $alert = $('.alert');

    /**
     * Initialize the module.
     */
    function initialize() {
        addEventListeners();
    }

    /**
     * Add event listeners.
     */
    function addEventListeners() {
        $registerForm.on('submit', onFormSubmit);
    }

    /**
     * Handle form submission.
     *
     * @param {jQuery.Event} event
     */
    function onFormSubmit(event) {
        event.preventDefault();

        $alert.addClass('d-none');

        // Validar que las contraseñas coincidan
        if ($password.val() !== $confirmPassword.val()) {
            displayMessage('Las contraseñas no coinciden.', 'danger');
            return;
        }

        // Validar longitud de contraseña
        if ($password.val().length < 7) {
            displayMessage('La contraseña debe tener al menos 7 caracteres.', 'danger');
            return;
        }

        const customer = {
            first_name: $firstName.val(),
            last_name: $lastName.val(),
            email: $email.val(),
            password: $password.val(),
        };

        register(customer);
    }

    /**
     * Register a new customer.
     *
     * @param {Object} customer
     */
    function register(customer) {
        const $submitButton = $('#register-submit');
        $submitButton.prop('disabled', true);

        App.Http.Register.create(customer)
            .done((response) => {
                if (response.success) {
                    displayMessage(
                        '¡Registro exitoso! Redirigiendo al inicio de sesión...',
                        'success'
                    );

                    setTimeout(() => {
                        window.location.href = App.Utils.Url.siteUrl('login');
                    }, 2000);
                }
            })
            .fail((jqXHR) => {
                let message = 'Error al registrar. Por favor, intenta de nuevo.';

                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    message = jqXHR.responseJSON.message;
                }

                displayMessage(message, 'danger');
                $submitButton.prop('disabled', false);
            });
    }

    /**
     * Display a message to the user.
     *
     * @param {String} message
     * @param {String} type 'success', 'danger', 'warning', 'info'
     */
    function displayMessage(message, type) {
        $alert
            .removeClass('d-none alert-success alert-danger alert-warning alert-info')
            .addClass('alert-' + type)
            .text(message);

        // Scroll to top to show alert
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    }

    return {
        initialize,
    };
})();

// Initialize module when document is ready
$(document).ready(() => {
    App.Pages.Register.initialize();
});
