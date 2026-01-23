<?php
/**
 * Local variables.
 *
 * @var array $grouped_timezones
 */
?>

<div id="wizard-frame-2" class="wizard-frame" style="display:none;">
    <div class="frame-container">

        <h2 class="frame-title"><?= lang('appointment_date_and_time') ?></h2>

        <div class="row frame-content">
            <div class="col-12 col-md-6">
                <div id="select-date"></div>

                <?php slot('after_select_date'); ?>
            </div>

            <div class="col-12 col-md-6">
                <div id="select-time">
                    <div class="mb-3">
                        <label for="select-appointment-type" class="form-label">
                            Tipo de reserva
                        </label>
                        <select id="select-appointment-type" class="form-select">
                            <option value="hours">Por horas</option>
                            <option value="full-day">Día entero</option>
                            <option value="day-range">Por Tramo de Días</option>
                        </select>
                    </div>

                    <div class="mb-3" style="display:none;">
                        <label for="select-timezone" class="form-label">
                            <?= lang('timezone') ?>
                        </label>
                        <?php component('timezone_dropdown', [
                            'attributes' => 'id="select-timezone" class="form-select" value="UTC"',
                            'grouped_timezones' => $grouped_timezones,
                        ]); ?>
                    </div>

                    <?php slot('after_select_timezone'); ?>

                    <div id="hours-container">
                        <div class="alert alert-info py-2 px-3 mb-3" style="font-size: 0.9rem;">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>Puedes seleccionar varias horas haciendo clic en cada una</small>
                        </div>
                        <div id="available-hours"></div>
                    </div>

                    <div id="day-range-container" style="display: none;">
                        <div class="alert alert-info py-2 px-3 mb-3" style="font-size: 0.9rem;">
                            <i class="fas fa-calendar-alt me-2"></i>
                            <small><strong>Selecciona el rango de días:</strong><br>
                            1. Haz clic en la <strong>fecha de inicio</strong><br>
                            2. Haz clic en la <strong>fecha de fin</strong><br>
                            <em class="text-muted">* Solo se contarán días laborables (L-V)</em></small>
                        </div>
                        <div id="day-range-selection" class="mb-3">
                            <div class="d-flex flex-column gap-2">
                                <div class="p-2 bg-light rounded">
                                    <small class="text-muted">Fecha inicio:</small>
                                    <strong id="day-range-start-display">-</strong>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <small class="text-muted">Fecha fin:</small>
                                    <strong id="day-range-end-display">-</strong>
                                </div>
                                <div class="p-2 bg-primary text-white rounded" id="day-range-total" style="display: none;">
                                    <small>Total días laborables:</small>
                                    <strong id="day-range-days-count">0</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <?php slot('after_available_hours'); ?>
                </div>
            </div>
        </div>
    </div>

    <div class="command-buttons">
        <button type="button" id="button-back-2" class="btn button-back btn-outline-secondary"
                data-step_index="2">
            <i class="fas fa-chevron-left me-2"></i>
            <?= lang('back') ?>
        </button>
        <button type="button" id="button-next-2" class="btn button-next btn-dark"
                data-step_index="2">
            <?= lang('next') ?>
            <i class="fas fa-chevron-right ms-2"></i>
        </button>
    </div>
</div>
