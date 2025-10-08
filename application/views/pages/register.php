<?php extend('layouts/account_layout'); ?>

<?php section('content'); ?>

<h2>Crear Cuenta</h2>

<p>
    <small>
        Completa el formulario para crear una nueva cuenta de usuario.
    </small>
</p>

<hr>
<div class="alert d-none"></div>

<form id="register-form">
    <div class="mb-3 mt-4">
        <label for="first-name" class="form-label">
            Nombre
            <span class="text-danger">*</span>
        </label>
        <input type="text" id="first-name" placeholder="Ingresa tu nombre" class="form-control" required/>
    </div>

    <div class="mb-3">
        <label for="last-name" class="form-label">
            Apellido
            <span class="text-danger">*</span>
        </label>
        <input type="text" id="last-name" placeholder="Ingresa tu apellido" class="form-control" required/>
    </div>

    <div class="mb-3">
        <label for="email" class="form-label">
            Email
            <span class="text-danger">*</span>
        </label>
        <input type="email" id="email" placeholder="tu@email.com" class="form-control" required/>
        <small class="form-text text-muted">
            Usarás este email para iniciar sesión
        </small>
    </div>

    <div class="mb-3">
        <label for="password" class="form-label">
            Contraseña
            <span class="text-danger">*</span>
        </label>
        <input type="password" id="password" placeholder="Mínimo 7 caracteres" class="form-control" required minlength="7"/>
    </div>

    <div class="mb-4">
        <label for="confirm-password" class="form-label">
            Confirmar Contraseña
            <span class="text-danger">*</span>
        </label>
        <input type="password" id="confirm-password" placeholder="Repite tu contraseña" class="form-control" required/>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-4">
        <a href="<?= site_url('calendar') ?>" class="text-decoration-none">
            <i class="fas fa-arrow-left me-1"></i>
            Volver
        </a>

        <button type="submit" id="register-submit" class="btn btn-primary">
            <i class="fas fa-user-plus me-2"></i>
            Registrarse
        </button>
    </div>
</form>

<?php end_section('content'); ?>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/js/http/register_http_client.js') ?>"></script>
<script src="<?= asset_url('assets/js/pages/register.js') ?>"></script>

<?php end_section('scripts'); ?>
