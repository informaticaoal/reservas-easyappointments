<?php extend('layouts/account_layout'); ?>

<?php section('content'); ?>

<h2>Iniciar sesión</h2>

<hr>
<div class="alert d-none"></div>

<form id="login-form">
    <div class="mb-3 mt-5">
        <label for="username" class="form-label">
            <?= lang('username') ?>
        </label>
        <input type="text" id="username" placeholder="<?= lang(
            'enter_username_here',
        ) ?>" class="form-control" required/>
    </div>

    <div class="mb-4">
        <label for="password" class="form-label">
            <?= lang('password') ?>
        </label>
        <input type="password" id="password" placeholder="<?= lang(
            'enter_password_here',
        ) ?>" class="form-control" required/>
    </div>

    <div class="d-flex justify-content-center align-items-center mb-3">

        <button type="submit" id="login" class="btn btn-primary">
            <i class="fas fa-sign-in-alt me-2"></i>
            <?= lang('login') ?>
        </button>
    </div>

</form>
<?php end_section('content'); ?>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/js/http/login_http_client.js') ?>"></script>
<script src="<?= asset_url('assets/js/pages/login.js') ?>"></script>

<?php end_section('scripts'); ?>
