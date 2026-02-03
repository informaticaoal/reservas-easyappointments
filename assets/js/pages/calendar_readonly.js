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
 * Calendar Readonly Page.
 *
 * This module implements the functionality of the readonly calendar page.
 */
App.Pages.CalendarReadonly = (function () {
    /**
     * Initialize the page.
     */
    function initialize() {
        App.Utils.CalendarReadonlyView.initialize();
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return {
        initialize,
    };
})();
