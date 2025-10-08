<?php
/**
 * Local variables.
 *
 * @var array $available_services
 */
?>

<div id="wizard-frame-1" class="wizard-frame" style="visibility: hidden;">
    <div class="frame-container">
        <h2 class="frame-title mt-md-5"><?= lang('service_and_provider') ?></h2>

        <div class="row frame-content">
            <div class="col col-md-8 offset-md-2">
                <div class="mb-3">
                    <label for="select-service">
                        <strong><?= lang('service') ?></strong>
                    </label>

                    <select id="select-service" class="form-select">
                        <option value="">
                            <?= lang('please_select') ?>
                        </option>
                        <?php
                        // Group services by category, only if there is at least one service with a parent category.
                        $has_category = false;
                        foreach ($available_services as $service) {
                            if (!empty($service['service_category_id'])) {
                                $has_category = true;
                                break;
                            }
                        }

                        if ($has_category) {
                            $grouped_services = [];

                            foreach ($available_services as $service) {
                                if (!empty($service['service_category_id'])) {
                                    if (!isset($grouped_services[$service['service_category_name']])) {
                                        $grouped_services[$service['service_category_name']] = [];
                                    }

                                    $grouped_services[$service['service_category_name']][] = $service;
                                }
                            }

                            // We need the uncategorized services at the end of the list, so we will use another
                            // iteration only for the uncategorized services.
                            $grouped_services['uncategorized'] = [];
                            foreach ($available_services as $service) {
                                if ($service['service_category_id'] == null) {
                                    $grouped_services['uncategorized'][] = $service;
                                }
                            }

                            foreach ($grouped_services as $key => $group) {
                                $group_label =
                                    $key !== 'uncategorized' ? $group[0]['service_category_name'] : 'Uncategorized';

                                if (count($group) > 0) {
                                    echo '<optgroup label="' . e($group_label) . '">';
                                    foreach ($group as $service) {
                                        echo '<option value="' .
                                            $service['id'] .
                                            '" data-group="' . e($group_label) . 
                                            '" data-service-name="' . e($service['name']) . '">' .
                                            e($service['name']) .
                                            '</option>';
                                    }
                                    echo '</optgroup>';
                                }
                            }
                        } else {
                            foreach ($available_services as $service) {
                                echo '<option value="' . $service['id'] . '">' . e($service['name']) . '</option>';
                            }
                        }
                        ?>
                    </select>
                </div>

                <?php slot('after_select_service'); ?>

                <div class="mb-3" hidden>
                    <label for="select-provider">
                        <strong><?= lang('provider') ?></strong>
                    </label>

                    <select id="select-provider" class="form-select">
                        <option value="">
                            <?= lang('please_select') ?>
                        </option>
                    </select>
                </div>

                <?php slot('after_select_provider'); ?>

                <div id="service-description" class="small">
                    <!-- JS -->
                </div>

                <?php slot('after_service_description'); ?>

                <!-- Floor Plans Section -->
                <div id="floor-plans-section" class="mt-4" style="display: none;">
                    <div class="card border-primary">
                        <div class="card-header bg-primary bg-opacity-10 border-primary">
                            <h5 class="text-center mb-0 text-primary">
                                <i class="fas fa-map-marked-alt me-2"></i>
                                <span id="floor-plan-title">Ubicación del servicio</span>
                            </h5>
                        </div>
                        <div class="card-body p-3">
                            <!-- All floor plan images pre-loaded, hidden by default -->
                            
                            <!-- Planta 1 - Audiovisual -->
                            <div class="floor-plan-item" data-service="Audiovisual" style="display: none;">
                                <div class="position-relative">
                                    <img src="<?= base_url('assets/img/floors/floor1/Audiovisual.jpg') ?>" 
                                         alt="Audiovisual - Planta 1" 
                                         class="img-fluid rounded border floor-plan-img" 
                                         style="width: 100%; height: auto; cursor: pointer; transition: transform 0.2s;"
                                         onclick="this.requestFullscreen()"
                                         onmouseover="this.style.transform='scale(1.02)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                            </div>

                            <!-- Planta 1 - Sala Verde -->
                            <div class="floor-plan-item" data-service="Sala Verde" style="display: none;">
                                <div class="position-relative">
                                    <img src="<?= base_url('assets/img/floors/floor1/Sala verde.jpg') ?>" 
                                         alt="Sala Verde - Planta 1" 
                                         class="img-fluid rounded border floor-plan-img" 
                                         style="width: 100%; height: auto; cursor: pointer; transition: transform 0.2s;"
                                         onclick="this.requestFullscreen()"
                                         onmouseover="this.style.transform='scale(1.02)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                            </div>

                            <!-- Planta 2 - Agricultura -->
                            <div class="floor-plan-item" data-service="Agricultura" style="display: none;">
                                <div class="position-relative">
                                    <img src="<?= base_url('assets/img/floors/floor2/Agricultura.jpg') ?>" 
                                         alt="Agricultura - Planta 2" 
                                         class="img-fluid rounded border floor-plan-img" 
                                         style="width: 100%; height: auto; cursor: pointer; transition: transform 0.2s;"
                                         onclick="this.requestFullscreen()"
                                         onmouseover="this.style.transform='scale(1.02)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                            </div>

                            <!-- Planta 2 - Fuelle -->
                            <div class="floor-plan-item" data-service="Fuelle" style="display: none;">
                                <div class="position-relative">
                                    <img src="<?= base_url('assets/img/floors/floor2/Fuelle.jpg') ?>" 
                                         alt="Fuelle - Planta 2" 
                                         class="img-fluid rounded border floor-plan-img" 
                                         style="width: 100%; height: auto; cursor: pointer; transition: transform 0.2s;"
                                         onclick="this.requestFullscreen()"
                                         onmouseover="this.style.transform='scale(1.02)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                            </div>

                            <!-- Planta 2 - Informática -->
                            <div class="floor-plan-item" data-service="Informática" style="display: none;">
                                <div class="position-relative">
                                    <img src="<?= base_url('assets/img/floors/floor2/Informática.jpg') ?>" 
                                         alt="Informática - Planta 2" 
                                         class="img-fluid rounded border floor-plan-img" 
                                         style="width: 100%; height: auto; cursor: pointer; transition: transform 0.2s;"
                                         onclick="this.requestFullscreen()"
                                         onmouseover="this.style.transform='scale(1.02)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                            </div>

                            <!-- Planta 2 - Sala 2-3 -->
                            <div class="floor-plan-item" data-service="Sala 2-3" style="display: none;">
                                <div class="position-relative">
                                    <img src="<?= base_url('assets/img/floors/floor2/Sala 2-3.jpg') ?>" 
                                         alt="Sala 2-3 - Planta 2" 
                                         class="img-fluid rounded border floor-plan-img" 
                                         style="width: 100%; height: auto; cursor: pointer; transition: transform 0.2s;"
                                         onclick="this.requestFullscreen()"
                                         onmouseover="this.style.transform='scale(1.02)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                            </div>

                            <div class="alert alert-info py-2 px-3 mt-3 mb-0" style="font-size: 0.85rem;">
                                <i class="fas fa-info-circle me-1"></i>
                                <small>Haz clic en la imagen para verla en pantalla completa</small>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <div class="command-buttons">
        <span>&nbsp;</span>

        <button type="button" id="button-next-1" class="btn button-next btn-dark"
                data-step_index="1">
            <?= lang('next') ?>
            <i class="fas fa-chevron-right ms-2"></i>
        </button>
    </div>
</div>
