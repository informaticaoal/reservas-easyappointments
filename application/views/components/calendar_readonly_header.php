<?php
/**
 * Calendar Readonly Header Component
 * 
 * Simplified header for the readonly calendar view.
 * Shows only the logo, user name, and navigation options without admin features.
 *
 * @var string $user_display_name
 */
?>

<nav id="header" class="navbar navbar-expand-md navbar-dark">
    <div class="mx-5">
        <a id="header-logo" class="navbar-brand" href="<?= site_url('booking') ?>">
            <img src="<?= base_url('assets/img/logo-1.png') ?>" alt="logo" class="w-100" style="height: 4rem;">
        </a>
    </div>

    <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#header-menu">
        <span class="sr-only">Toggle navigation</span>
        <span class="navbar-toggler-icon"></span>
    </button>

    <div id="header-menu" class="collapse navbar-collapse flex-row-reverse px-2">
        <ul class="navbar-nav">
            <!-- Calendario (página actual) -->
            <li class="nav-item active">
                <a href="<?= site_url('calendar_readonly') ?>"
                   class="nav-link"
                   data-tippy-content="Ver calendario de reservas">
                    <i class="fas fa-calendar-alt me-2"></i>
                    <?= lang('calendar') ?>
                </a>
            </li>

            <!-- Volver a Reservar -->
            <li class="nav-item">
                <a href="<?= site_url('booking') ?>"
                   class="nav-link"
                   data-tippy-content="Volver a la página de reservas">
                    <i class="fas fa-ticket-alt me-2"></i>
                    Reservar cita
                </a>
            </li>

            <!-- Usuario y opciones -->
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown"
                   data-tippy-content="Opciones de usuario">
                    <i class="fas fa-user me-2"></i>
                    <?= e($user_display_name) ?>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="<?= site_url('account') ?>">
                        <?= lang('account') ?>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item text-danger" href="<?= site_url('logout') ?>">
                        <i class="fas fa-sign-out-alt me-2"></i>
                        <?= lang('log_out') ?>
                    </a>
                </div>
            </li>
        </ul>
    </div>
</nav>

<div id="notification" style="display: none;"></div>

<div id="loading" style="display: none;">
    <div class="any-element animation is-loading">
        &nbsp;
    </div>
</div>
