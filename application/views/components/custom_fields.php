<?php
/**
 * Local variables.
 *
 * @var bool $disabled (false)
 */

$disabled = $disabled ?? false; ?>

<?php for ($i = 1; $i <= 5; $i++): ?>
    <?php if (setting('display_custom_field_' . $i)): ?>
        <div class="mb-3">
            <label for="custom-field-<?= $i ?>" class="form-label">
                <?php
                    if ($i === 1) {
                        echo setting('label_custom_field_' . $i) ?: 'Indica qué objetos son requeridos de tener preparados';
                    } else {
                        echo setting('label_custom_field_' . $i) ?: lang('custom_field') . ' #' . $i;
                    }
                ?>
                <?php if (setting('require_custom_field_' . $i)): ?>
                    <span class="text-danger" <?= $disabled ? 'hidden' : '' ?>>*</span>
                <?php endif; ?>
            </label>
            
            <?php if ($i === 1): ?>
                <!-- BOTÓN DESPLEGABLE "ARTÍCULOS NECESARIOS" -->
                <div class="position-relative mb-3">
                    <button type="button" class="btn btn-outline-secondary w-100 text-start" 
                            id="articles-dropdown-btn" 
                            <?= $disabled ? 'disabled' : '' ?>>
                        <i class="fa fa-chevron-down float-end"></i>
                        Artículos necesarios
                    </button>
                    
                    <div id="articles-dropdown-menu" class="dropdown-content border border-1 p-3 mt-1" 
                         style="display: none; background: #f9f9f9; border-radius: 0.25rem; max-height: 300px; overflow-y: auto;">
                        
                        <!-- Opciones predefinidas -->
                        <div class="form-check mb-2">
                            <input type="checkbox" class="form-check-input article-checkbox" 
                                   id="article-portatil" value="portatil" <?= $disabled ? 'disabled' : '' ?>>
                            <label class="form-check-label" for="article-portatil">Portátil</label>
                        </div>
                        <div class="form-check mb-2">
                            <input type="checkbox" class="form-check-input article-checkbox" 
                                   id="article-proyector" value="proyector" <?= $disabled ? 'disabled' : '' ?>>
                            <label class="form-check-label" for="article-proyector">Proyector</label>
                        </div>
                        <div class="form-check mb-2">
                            <input type="checkbox" class="form-check-input article-checkbox" 
                                   id="article-altavoces" value="altavoces" <?= $disabled ? 'disabled' : '' ?>>
                            <label class="form-check-label" for="article-altavoces">Altavoces</label>
                        </div>
                        
                        <hr class="my-2">
                        
                        <!-- Input para agregar artículos personalizados -->
                        <div class="mb-2">
                            <label for="custom-article-input" class="form-label small">Agregar otro artículo:</label>
                            <div class="input-group input-group-sm">
                                <input type="text" id="custom-article-input" class="form-control" 
                                       placeholder="Ej: Micrófono, Cable..." <?= $disabled ? 'disabled' : '' ?>>
                                <button type="button" class="btn btn-primary" id="add-custom-article-btn"
                                        <?= $disabled ? 'disabled' : '' ?>>
                                    <i class="fa fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <hr class="my-2">
                        
                        <!-- Lista de artículos personalizados agregados -->
                        <div id="custom-articles-list" style="display: none;">
                            <label class="form-label small">Tus artículos:</label>
                        </div>
                    </div>
                </div>
                
                <!-- INPUTS DE CANTIDAD -->
                <div id="quantities-container" class="mt-4 p-3 bg-light rounded" style="display: none;">
                    <h6 class="mb-3"><i class="fa fa-info-circle"></i> Cantidad de cada artículo:</h6>
                    
                    <div id="portatil-qty" class="mb-3" style="display: none;">
                        <label for="qty-portatil" class="form-label">Cantidad de Portátiles:</label>
                        <input type="number" id="qty-portatil" name="qty-portatil" class="form-control" 
                               min="1" value="1" <?= $disabled ? 'disabled' : '' ?>/>
                    </div>
                    <div id="proyector-qty" class="mb-3" style="display: none;">
                        <label for="qty-proyector" class="form-label">Cantidad de Proyectores:</label>
                        <input type="number" id="qty-proyector" name="qty-proyector" class="form-control" 
                               min="1" value="1" <?= $disabled ? 'disabled' : '' ?>/>
                    </div>
                    <div id="altavoces-qty" class="mb-3" style="display: none;">
                        <label for="qty-altavoces" class="form-label">Cantidad de Altavoces:</label>
                        <input type="number" id="qty-altavoces" name="qty-altavoces" class="form-control" 
                               min="1" value="1" <?= $disabled ? 'disabled' : '' ?>/>
                    </div>
                    
                    <div id="custom-quantities-container"></div>
                </div>
                
                <!-- Campo oculto para guardar los datos -->
                <input type="hidden" id="articles-data" name="custom-field-1-data">

            <?php else: ?>
                <input type="text" id="custom-field-<?= $i ?>"
                       class="<?= setting('require_custom_field_' . $i) ? 'required' : '' ?> form-control"
                       maxlength="120" <?= $disabled ? 'disabled' : '' ?>/>
            <?php endif; ?>
        </div>
    <?php endif; ?>
<?php endfor; ?>
