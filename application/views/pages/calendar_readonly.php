<?php extend('layouts/calendar_readonly_layout'); ?>

<?php section('content'); ?>

<div class="container-fluid backend-page" id="calendar-readonly-page">
    <div class="row" id="calendar-toolbar">
        <div id="calendar-filter" class="col-md-4">
            <div class="calendar-filter-items">
                <select id="select-filter-item"
                        class="form-select col"
                        data-tippy-content="<?= lang('select_filter_item_hint') ?>"
                        aria-label="Filter">
                    <!-- JS -->
                </select>
            </div>
        </div>

        <div id="calendar-actions" class="col-md-8">
            <button id="reload-appointments" class="btn btn-light"
                    data-tippy-content="<?= lang('reload_appointments_hint') ?>">
                <i class="fas fa-sync-alt"></i>
            </button>

            <?php if (vars('calendar_view') === 'default'): ?>
                <a class="btn btn-light mb-0" href="<?= site_url('calendar_readonly?view=table') ?>"
                   data-tippy-content="<?= lang('table') ?>">
                    <i class="fas fa-table"></i>
                </a>
            <?php endif; ?>

            <?php if (vars('calendar_view') === 'table'): ?>
                <a class="btn btn-light mb-0" href="<?= site_url('calendar_readonly?view=default') ?>"
                   data-tippy-content="<?= lang('default') ?>">
                    <i class="fas fa-calendar-alt"></i>
                </a>
            <?php endif; ?>
            
            <span class="badge bg-info ms-3 py-2">
                <i class="fas fa-eye me-1"></i>
                Modo solo lectura
            </span>
        </div>
    </div>

    <div id="calendar">
        <!-- Dynamically Generated Content -->
    </div>
</div>

<?php end_section('content'); ?>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/vendor/fullcalendar/index.global.min.js') ?>"></script>
<script src="<?= asset_url('assets/vendor/fullcalendar-moment/index.global.min.js') ?>"></script>
<script src="<?= asset_url('assets/js/utils/ui.js') ?>"></script>
<script src="<?= asset_url('assets/js/utils/calendar_readonly_view.js') ?>"></script>
<script src="<?= asset_url('assets/js/pages/calendar_readonly.js') ?>"></script>

<?php end_section('scripts'); ?>
