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
 * Register controller.
 *
 * Handles the customer registration page functionality.
 *
 * @package Controllers
 */
class Register extends EA_Controller
{
    /**
     * Register constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->load->model('customers_model');
        $this->load->model('users_model');
        $this->load->library('accounts');
    }

    /**
     * Render the register page.
     */
    public function index(): void
    {
        // Solo los administradores pueden acceder a la página de registro
        $user_id = session('user_id');
        $role_slug = session('role_slug');
        
        if (!$user_id) {
            // Si no hay usuario logueado, redirigir al login
            redirect('login');
            return;
        }
        
        // Verificar que el usuario sea administrador
        if ($role_slug !== DB_SLUG_ADMIN) {
            // Si no es administrador, redirigir a booking después de mostrar un mensaje
            $redirect_url = site_url('booking');
            
            // Mostrar mensaje de error y redirigir
            echo '<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Acceso Denegado</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f5f5f5;
                    }
                    .message-box {
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        text-align: center;
                        max-width: 500px;
                    }
                    h1 {
                        color: #d9534f;
                        margin-top: 0;
                    }
                    p {
                        color: #666;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="message-box">
                    <h1>403 - Acceso Denegado</h1>
                    <p>Solo los administradores pueden acceder a esta página.</p>
                    <p>Serás redirigido en un momento...</p>
                </div>
                <script>
                    setTimeout(function() {
                        window.location.href = "' . $redirect_url . '";
                    }, 1500);
                </script>
            </body>
            </html>';
            return;
        }

        html_vars([
            'page_title' => 'Registro de Usuario',
            'base_url' => config('base_url'),
            'company_name' => setting('company_name'),
        ]);

        $this->load->view('pages/register');
    }

    /**
     * Register a new customer with login credentials.
     */
    public function create(): void
    {
        try {
            // Verificar que solo los administradores puedan crear usuarios
            $user_id = session('user_id');
            $role_slug = session('role_slug');
            
            if (!$user_id || $role_slug !== DB_SLUG_ADMIN) {
                throw new RuntimeException('Solo los administradores pueden registrar nuevos usuarios.');
            }
            
            $first_name = request('first_name');
            $last_name = request('last_name');
            $email = request('email');
            $password = request('password');

            // Validación básica
            if (empty($first_name)) {
                throw new InvalidArgumentException('El nombre es requerido.');
            }

            if (empty($last_name)) {
                throw new InvalidArgumentException('El apellido es requerido.');
            }

            if (empty($email)) {
                throw new InvalidArgumentException('El email es requerido.');
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('El email no es válido.');
            }

            if (empty($password)) {
                throw new InvalidArgumentException('La contraseña es requerida.');
            }

            if (strlen($password) < 7) {
                throw new InvalidArgumentException('La contraseña debe tener al menos 7 caracteres.');
            }

            // Verificar si el email ya existe
            $existing_customer = $this->customers_model->get(['email' => $email]);
            
            if (!empty($existing_customer)) {
                throw new InvalidArgumentException('Ya existe una cuenta con este email.');
            }

            // Obtener el role_id de customer
            $customer_role = $this->db->get_where('roles', ['slug' => DB_SLUG_CUSTOMER])->row_array();
            
            if (empty($customer_role)) {
                throw new RuntimeException('No se pudo encontrar el rol de cliente.');
            }

            // Generar un username único basado en nombre y apellidos
            // Convertir a minúsculas y eliminar espacios y caracteres especiales
            $username = strtolower($first_name . $last_name);
            $username = $this->clean_username($username);
            $base_username = $username;
            $counter = 1;
            
            while ($this->username_exists($username)) {
                $username = $base_username . $counter;
                $counter++;
            }

            // Crear el registro en ea_users
            $user_data = [
                'first_name' => $first_name,
                'last_name' => $last_name,
                'email' => $email,
                'phone_number' => '',
                'id_roles' => $customer_role['id'],
                'timezone' => 'UTC',
                'language' => 'spanish',
                'create_datetime' => date('Y-m-d H:i:s'),
                'update_datetime' => date('Y-m-d H:i:s'),
            ];

            $this->db->insert('users', $user_data);
            $user_id = $this->db->insert_id();

            if (!$user_id) {
                throw new RuntimeException('No se pudo crear el usuario.');
            }

            // Generar salt y hashear la contraseña usando el método de Easy!Appointments
            $this->load->helper('password');
            $salt = generate_salt();
            $hashed_password = hash_password($salt, $password);

            // Crear el registro en ea_user_settings con las credenciales
            $settings_data = [
                'id_users' => $user_id,
                'username' => $username,
                'password' => $hashed_password,
                'salt' => $salt,
                'notifications' => 1,
                'calendar_view' => CALENDAR_VIEW_DEFAULT,
            ];

            $this->db->insert('user_settings', $settings_data);

            json_response([
                'success' => true,
                'message' => 'Registro exitoso. Ya puedes iniciar sesión.',
            ]);

        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    /**
     * Check if a username already exists.
     *
     * @param string $username Username to check.
     * 
     * @return bool True if exists, false otherwise.
     */
    private function username_exists(string $username): bool
    {
        $count = $this->db->get_where('user_settings', ['username' => $username])->num_rows();
        return $count > 0;
    }

    /**
     * Clean username by removing special characters and accents.
     *
     * @param string $username Username to clean.
     * 
     * @return string Cleaned username.
     */
    private function clean_username(string $username): string
    {
        // Eliminar acentos
        $username = iconv('UTF-8', 'ASCII//TRANSLIT', $username);
        
        // Eliminar caracteres especiales, solo dejar letras y números
        $username = preg_replace('/[^a-zA-Z0-9]/', '', $username);
        
        // Convertir a minúsculas
        $username = strtolower($username);
        
        return $username;
    }
}
