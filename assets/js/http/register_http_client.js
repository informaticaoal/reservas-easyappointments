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
 * Register HTTP client.
 *
 * This module implements the register related HTTP requests.
 */
App.Http.Register = (function () {
    /**
     * Register a new customer.
     *
     * @param {Object} customer
     *
     * @return {Object}
     */
    function create(customer) {
        const url = App.Utils.Url.siteUrl('register/create');

        const data = {
            csrf_token: vars('csrf_token'),
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            password: customer.password,
        };

        return $.post(url, data);
    }

    return {
        create,
    };
})();
