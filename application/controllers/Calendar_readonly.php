<?php defined('BASEPATH') or exit('No direct script access allowed');

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
 * Calendar Readonly controller.
 *
 * Handles the readonly calendar view for customers and non-admin users.
 * This calendar displays appointments but does not allow modifications.
 *
 * @package Controllers
 */
class Calendar_readonly extends EA_Controller
{
    /**
     * Calendar_readonly constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->load->model('appointments_model');
        $this->load->model('unavailabilities_model');
        $this->load->model('customers_model');
        $this->load->model('services_model');
        $this->load->model('providers_model');
        $this->load->model('roles_model');

        $this->load->library('accounts');
        $this->load->library('timezones');
    }

    /**
     * Display the readonly calendar page.
     *
     * This method displays a readonly calendar with appointments.
     * Users can only view appointments, not modify them.
     */
    public function index(): void
    {
        $user_id = session('user_id');

        // Verificar que el usuario esté autenticado
        if (!$user_id) {
            redirect('login');
            return;
        }

        $role_slug = session('role_slug');

        $user = $this->users_model->find($user_id);

        $available_providers = $this->providers_model->get_available_providers();
        $available_services = $this->services_model->get_available_services();

        $calendar_view = request('view', 'default');

        script_vars([
            'user_id' => $user_id,
            'role_slug' => $role_slug,
            'date_format' => setting('date_format'),
            'time_format' => setting('time_format'),
            'first_weekday' => setting('first_weekday'),
            'company_working_plan' => setting('company_working_plan'),
            'timezones' => $this->timezones->to_array(),
            'calendar_view' => $calendar_view,
            'available_providers' => $available_providers,
            'available_services' => $available_services,
            'readonly_mode' => true, // Indicador de modo solo lectura
        ]);

        html_vars([
            'page_title' => lang('calendar'),
            'active_menu' => PRIV_APPOINTMENTS,
            'user_display_name' => $this->accounts->get_user_display_name($user_id),
            'timezone' => session('timezone'),
            'timezones' => $this->timezones->to_array(),
            'grouped_timezones' => $this->timezones->to_grouped_array(),
            'calendar_view' => $calendar_view,
            'available_providers' => $available_providers,
            'available_services' => $available_services,
            'readonly_mode' => true, // Indicador de modo solo lectura
        ]);

        $this->load->view('pages/calendar_readonly');
    }

    /**
     * Get calendar appointments for the readonly view.
     *
     * @param string|null $start_date
     * @param string|null $end_date
     */
    public function get_calendar_appointments(?string $start_date = null, ?string $end_date = null): void
    {
        $user_id = session('user_id');

        // Verificar que el usuario esté autenticado
        if (!$user_id) {
            response('Unauthorized', 401);
            return;
        }

        try {
            if (!$start_date) {
                $start_date = request('start_date');
            }

            if (!$end_date) {
                $end_date = request('end_date');
            }

            $filter_type = request('filter_type', 'all');
            $record_id = request('record_id');

            $where_clause = [
                'start_datetime >=' => $start_date,
                'end_datetime <=' => $end_date,
            ];

            if ($filter_type === 'provider' && !empty($record_id)) {
                $where_clause['id_users_provider'] = $record_id;
            }

            if ($filter_type === 'service' && !empty($record_id)) {
                $where_clause['id_services'] = $record_id;
            }

            $appointments = $this->appointments_model->get($where_clause);

            foreach ($appointments as &$appointment) {
                $this->appointments_model->load($appointment, [
                    'service',
                    'provider',
                    'customer',
                ]);
            }

            json_response($appointments);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }
}
