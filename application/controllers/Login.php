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
 * Login controller.
 *
 * Handles the login page functionality.
 *
 * @package Controllers
 */
class Login extends EA_Controller
{
    /**
     * Login constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->load->library('accounts');
        $this->load->library('ldap_client');
        $this->load->library('email_messages');

        // Determinar URL de destino por defecto
        $default_dest = site_url('calendar');
        
        // Si ya hay sesión y es cliente, usar booking como destino
        if (session('user_id') && session('role_slug') === DB_SLUG_CUSTOMER) {
            $default_dest = site_url('booking');
        }

        script_vars([
            'dest_url' => session('dest_url', $default_dest),
        ]);
    }

    /**
     * Render the login page.
     */
    public function index(): void
    {
        if (session('user_id')) {
            // Redirigir según el rol del usuario
            $role_slug = session('role_slug');
            if ($role_slug === DB_SLUG_CUSTOMER) {
                redirect('booking');
            } else {
                redirect('calendar');
            }
            return;
        }

        html_vars([
            'page_title' => lang('login'),
            'base_url' => config('base_url'),
            'dest_url' => session('dest_url', site_url('calendar')),
            'company_name' => setting('company_name'),
        ]);

        $this->load->view('pages/login');
    }

    /**
     * Validate the provided credentials and start a new session if the validation was successful.
     */
    public function validate(): void
    {
        try {
            $username = request('username');

            if (empty($username)) {
                throw new InvalidArgumentException('No username value provided.');
            }

            $password = request('password');

            if (empty($password)) {
                throw new InvalidArgumentException('No password value provided.');
            }

            $user_data = $this->accounts->check_login($username, $password);

            if (empty($user_data)) {
                $user_data = $this->ldap_client->check_login($username, $password);
            }

            if (empty($user_data)) {
                throw new InvalidArgumentException(lang('invalid_credentials_provided'));
            }

            $this->session->sess_regenerate();

            session($user_data); // Save data in the session.

            // Determinar la URL de redirección según el rol
            $dest_url = session('dest_url');
            
            // Si es un cliente, redirigir al booking en lugar del calendar
            if ($user_data['role_slug'] === DB_SLUG_CUSTOMER) {
                $dest_url = site_url('booking');
            } elseif (empty($dest_url)) {
                // Para otros roles, usar calendar por defecto si no hay dest_url
                $dest_url = site_url('calendar');
            }

            json_response([
                'success' => true,
                'dest_url' => $dest_url,
            ]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }
}
