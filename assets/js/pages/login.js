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
 * Login page.
 *
 * This module implements the functionality of the login page.
 */
App.Pages.Login = (function () {
    const $loginForm = $('#login-form');
    const $username = $('#username');
    const $password = $('#password');

    /**
     * Login Button "Click"
     *
     * Make an ajax call to the server and check whether the user's credentials are right.
     *
     * If yes then redirect him to his desired page, otherwise display a message.
     */
    function onLoginFormSubmit(event) {
        event.preventDefault();

        const username = $username.val();
        const password = $password.val();

        if (!username || !password) {
            return;
        }

        const $alert = $('.alert');

        $alert.addClass('d-none');

        App.Http.Login.validate(username, password).done((response) => {
            if (response.success) {
                // Usar la URL proporcionada por el servidor
                // El servidor determina la URL correcta según el rol del usuario
                const destUrl = response.dest_url ? response.dest_url : vars('dest_url');
                
                // Pequeño delay para asegurar que la sesión se guarde correctamente
                setTimeout(() => {
                    window.location.href = destUrl;
                }, 100);
            } else {
                $alert.text(lang('login_failed'));
                $alert.removeClass('d-none alert-danger alert-success').addClass('alert-danger');
            }
        });
    }

    $loginForm.on('submit', onLoginFormSubmit);

    return {};
})();
