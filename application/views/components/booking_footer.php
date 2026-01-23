<?php
/**
 * Local variables.
 *
 * @var bool $display_login_button
 */
?>

<div id="frame-footer" class="d-flex flex-wrap justify-content-center align-items-center">
    <small>

        <span class="footer-options">
    
            <?php if ($display_login_button): ?>
                <?php if (session('user_id')): ?>
                    <?php if (session('role_slug') === DB_SLUG_CUSTOMER): ?>
                        <!-- Mostrar "Cerrar sesión" para clientes -->
                        <a class="backend-link badge bg-danger text-decoration-none px-2"
                           href="<?= site_url('logout') ?>">
                            <i class="fas fa-sign-out-alt me-2"></i>
                            Cerrar sesión
                        </a>
                    <?php else: ?>
                        <!-- Mostrar "Sección de gestión interna" para otros roles -->
                        <a class="backend-link badge bg-primary text-decoration-none px-2 fs-6"
                           href="<?= site_url('calendar') ?>">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Volver al panel de control
                        </a>
                    <?php endif; ?>
                <?php else: ?>
                    <!-- Mostrar "Login" si no hay sesión -->
                    <a class="backend-link badge bg-primary text-decoration-none px-2"
                       href="<?= site_url('login') ?>">
                        <i class="fas fa-sign-in-alt me-2"></i>
                        <?= lang('login') ?>
                    </a>
                <?php endif; ?>
            <?php endif; ?>
        </span>
    </small>
</div>
