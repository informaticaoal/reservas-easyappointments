<?php extend('layouts/account_layout'); ?>

<?php section('content'); ?>

<h3><?= lang('log_out') ?></h3>

<p>
    <small>
        <?= lang('logout_success') ?>
    </small>
</p>

<div class="d-flex justify-content-center my-4">
    <a href="<?= site_url() ?>" class="btn btn-primary btn-large my-1">
        <i class="fa-solid fa-right-to-bracket mx-1"></i>
        Iniciar sesión
    </a>
    
</div>

<?php end_section('content'); ?>


