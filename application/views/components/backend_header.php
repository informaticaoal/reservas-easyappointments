<?php
/**
 * Local variables.
 *
 * @var string $active_menu
 * @var string $company_logo
 */
?>

<nav id="header" class="navbar navbar-expand-md navbar-dark">
    <div class="mx-5">
        <a id="header-logo" class="navbar-brand" href="<?= site_url('calendar') ?>">
            <img src="<?= base_url('assets/img/logo-1.png') ?>" alt="logo" class="w-100" style="height: 4rem;">
        </a>
    </div>

    <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#header-menu">
        <span class="sr-only">Toggle navigation</span>
        <span class="navbar-toggler-icon"></span>
    </button>

    <div id="header-menu" class="collapse navbar-collapse flex-row-reverse px-2">
        <ul class="navbar-nav">
            <?php $hidden = can('view', PRIV_APPOINTMENTS) ? '' : 'd-none'; ?>
            <?php $active = $active_menu == PRIV_APPOINTMENTS ? 'active' : ''; ?>
            <li class="nav-item <?= $active . $hidden ?>">
                <a href="<?= site_url(
                    'calendar' . (vars('calendar_view') === CALENDAR_VIEW_TABLE ? '?view=table' : ''),
                ) ?>"
                   class="nav-link"
                   data-tippy-content="<?= lang('manage_appointment_record_hint') ?>">
                    <i class="fas fa-calendar-alt me-2"></i>
                    <?= lang('calendar') ?>
                </a>
            </li>

            <?php $hidden = can('view', PRIV_CUSTOMERS) ? '' : 'd-none'; ?>
            <?php $active = $active_menu == PRIV_CUSTOMERS ? 'active' : ''; ?>
            <li class="nav-item <?= $active . $hidden ?>">
                <a href="<?= site_url('customers') ?>" class="nav-link"
                   data-tippy-content="<?= lang('manage_customers_hint') ?>">
                    <i class="fas fa-user-friends me-2"></i>
                    Usuarios
                </a>
            </li>

            <?php $hidden = can('view', PRIV_SERVICES) ? '' : 'd-none'; ?>
            <?php $active = $active_menu == PRIV_SERVICES ? 'active' : ''; ?>
            <li class="nav-item dropdown <?= $active . $hidden ?>">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown"
                   data-tippy-content="<?= lang('manage_services_hint') ?>">
                    <i class="fas fa-business-time me-2"></i>
                    <?= lang('services') ?>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="<?= site_url('services') ?>">
                        <?= lang('services') ?>
                    </a>
                    <a class="dropdown-item" href="<?= site_url('service_categories') ?>">
                        <?= lang('categories') ?>
                    </a>
                </div>
            </li>

            <?php $hidden = can('view', PRIV_USERS) ? '' : 'd-none'; ?>
            <?php $active = $active_menu == PRIV_USERS ? 'active' : ''; ?>
            <li class="nav-item dropdown <?= $active . $hidden ?>">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown"
                   data-tippy-content="<?= lang('manage_users_hint') ?>">
                    <i class="fas fa-users me-2"></i>
                    Grupos
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="<?= site_url('providers') ?>">
                        <?= lang('providers') ?>
                    </a>
                    <!-- <a class="dropdown-item" href="<?= site_url('secretaries') ?>">
                        <?= lang('secretaries') ?>
                    </a> -->
                    <a class="dropdown-item" href="<?= site_url('admins') ?>">
                        <?= lang('admins') ?>
                    </a>
                    <div class="dropdown-divider"></div>
                    <?php $hidden_register = session('role_slug') === DB_SLUG_ADMIN ? '' : 'd-none'; ?>
                    <a class="dropdown-item <?= $hidden_register ?>" href="<?= site_url('register') ?>">
                        <i class="fas fa-user-plus me-2"></i>
                        <?= lang('register') ?>
                    </a>
                </div>
            </li>

            <?php slot('before_user_nav_item'); ?>

            <?php $hidden = can('view', PRIV_SYSTEM_SETTINGS) || can('view', PRIV_USER_SETTINGS) ? '' : 'd-none'; ?>
            <?php $active = $active_menu == PRIV_SYSTEM_SETTINGS ? 'active' : ''; ?>
            <li class="nav-item dropdown <?= $active . $hidden ?>">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown"
                   data-tippy-content="<?= lang('settings_hint') ?>">
                    <i class="fas fa-user me-2"></i>
                    <?= e(vars('user_display_name')) ?>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                    <?php if (can('view', PRIV_SYSTEM_SETTINGS)): ?>
                        <a class="dropdown-item" href="<?= site_url('general_settings') ?>">
                            <?= lang('settings') ?>
                        </a>
                    <?php endif; ?>

                    <?php slot('after_settings_dropdown_item'); ?>

                    <a class="dropdown-item" href="<?= site_url('account') ?>">
                        <?= lang('account') ?>
                    </a>
                    <a class="dropdown-item" href="<?= site_url('about') ?>">
                        <?= lang('about') ?>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="<?= site_url('logout') ?>">
                        <?= lang('log_out') ?>
                    </a>
                </div>
            </li>
        </ul>
    </div>
</nav>

<div id="object-reservations-alert" class="container-fluid px-5 mt-3" style="display: none;"></div>

<div id="notification" style="display: none;"></div>

<div id="loading" style="display: none;">
    <div class="any-element animation is-loading">
        &nbsp;
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const alertContainer = document.getElementById('object-reservations-alert');
        const originalTitle = document.title;
        let titleInterval = null;

        const alertStorageKey = 'EasyAppointments.ObjectReservationsLastSeenCount';

        function restoreTitle() {
            if (titleInterval) {
                clearInterval(titleInterval);
                titleInterval = null;
            }
            document.title = originalTitle;
        }

        function startTitleBlink(count) {
            if (titleInterval) {
                return;
            }

            const message = `(!) Reservas con objetos`;
            titleInterval = setInterval(function () {
                document.title = document.title === originalTitle ? message : originalTitle;
            }, 1500);
        }

        function showDesktopNotification(count) {
            if (!('Notification' in window) || Notification.permission !== 'granted') {
                return;
            }

            const notification = new Notification('Reserva con objetos solicitados', {
                body: `Hay reservas que requieren artículos preparados.`,
                icon: '<?= base_url('assets/img/logo-1.png') ?>',
                tag: 'object-reservations-alert',
                renotify: true,
            });

            notification.onclick = function () {
                window.focus();
                this.close();
            };
        }

        function getObjectReservationsLastSeenCount() {
            try {
                const value = window.localStorage.getItem(alertStorageKey);
                return value ? Number(value) || 0 : 0;
            } catch (error) {
                return 0;
            }
        }

        function setObjectReservationsLastSeenCount(count) {
            try {
                window.localStorage.setItem(alertStorageKey, String(count));
            } catch (error) {
                // Ignore storage errors.
            }
        }

        function markObjectReservationsAsSeen(count) {
            setObjectReservationsLastSeenCount(count);
            alertContainer.style.display = 'none';
            restoreTitle();
        }

        function fetchAndUpdateAlert() {
            fetch('<?= site_url('calendar/object_reservations_count') ?>', {
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(function (data) {
                    if (!data || !data.count) {
                        alertContainer.style.display = 'none';
                        restoreTitle();
                        return;
                    }

                    const count = Number(data.count);
                    const seenCount = getObjectReservationsLastSeenCount();

                    if (!count || count <= seenCount) {
                        alertContainer.style.display = 'none';
                        restoreTitle();
                        return;
                    }

                    alertContainer.style.display = 'block';
                    alertContainer.innerHTML = `
                        <div class="alert alert-warning mb-0 rounded-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div>
                                <strong>Hay reservas con peticiones nuevas.</strong>
                                <div class="small text-muted">Revisa las reservas que requieren preparación de artículos.</div>
                            </div>
                            <button id="object-reservations-dismiss-button" type="button" class="btn btn-sm btn-secondary mt-2 mt-md-0">Marcar como visto</button>
                        </div>
                    `;

                    const dismissButton = document.getElementById('object-reservations-dismiss-button');

                    if (dismissButton) {
                        dismissButton.addEventListener('click', function () {
                            markObjectReservationsAsSeen(count);
                        });
                    }

                    if (document.hidden) {
                        startTitleBlink(count);
                        showDesktopNotification(count);
                    }

                    document.addEventListener('visibilitychange', function () {
                        if (document.hidden) {
                            startTitleBlink(count);
                        } else {
                            restoreTitle();
                        }
                    });
                })
                .catch(function () {
                    // Silenciar errores de notificación para no afectar el flujo del backend.
                });
        }

        if (!alertContainer) {
            return;
        }

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(function (permission) {
                // El permiso se procesa en caso de que el usuario acepte.
            });
        }

        // Cargar inicialmente
        fetchAndUpdateAlert();

        // Actualizar cada 30 segundos
        setInterval(fetchAndUpdateAlert, 30000);
    });
</script>
