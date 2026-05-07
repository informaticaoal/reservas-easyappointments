/**
 * Custom Fields Component - Maneja artículos con cantidades
 */

document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.getElementById('articles-dropdown-btn');
    const dropdownMenu = document.getElementById('articles-dropdown-menu');
    const quantitiesContainer = document.getElementById('quantities-container');
    const customArticlesInput = document.getElementById('custom-article-input');
    const addCustomArticleBtn = document.getElementById('add-custom-article-btn');
    const customArticlesList = document.getElementById('custom-articles-list');
    const customQuantitiesContainer = document.getElementById('custom-quantities-container');
    const articlesData = document.getElementById('articles-data');
    
    if (!dropdownBtn) return;

    // Toggle dropdown
    dropdownBtn.addEventListener('click', function(e) {
        e.preventDefault();
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.position-relative')) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Escuchar cambios en checkboxes predefinidos
    document.querySelectorAll('.article-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', updateQuantityInputs);
    });

    // Agregar artículo personalizado
    addCustomArticleBtn.addEventListener('click', function() {
        const articleName = customArticlesInput.value.trim();
        if (articleName === '') {
            alert('Por favor ingresa un nombre de artículo');
            return;
        }

        // Verificar si ya existe
        const existingCheckbox = document.querySelector('.article-checkbox[value="' + articleName.replace(/"/g, '&quot;') + '"]');
        if (existingCheckbox) {
            alert('Este artículo ya está en la lista');
            customArticlesInput.value = '';
            return;
        }

        const checkboxId = 'article-custom-' + Date.now();
        const div = document.createElement('div');
        div.className = 'form-check mb-2';
        div.innerHTML = 
            '<input type="checkbox" class="form-check-input article-checkbox" ' +
            'id="' + checkboxId + '" value="' + articleName.replace(/"/g, '&quot;') + '" checked> ' +
            '<label class="form-check-label" for="' + checkboxId + '">' +
            articleName.replace(/</g, '&lt;') +
            ' <button type="button" class="btn btn-sm btn-outline-danger py-0 px-1" ' +
            'onclick="this.closest(\'.form-check\').remove(); window.updateQuantityInputs();">' +
            '<i class="fa fa-times"></i></button></label>';
        
        customArticlesList.appendChild(div);
        customArticlesList.style.display = 'block';
        
        // Escuchar cambio en este nuevo checkbox
        div.querySelector('.article-checkbox').addEventListener('change', updateQuantityInputs);
        
        customArticlesInput.value = '';
        customArticlesInput.focus();
        updateQuantityInputs();
    });

    // Enter para agregar
    customArticlesInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomArticleBtn.click();
        }
    });

    // Actualizar inputs de cantidad
    function updateQuantityInputs() {
        const selectedArticles = Array.from(document.querySelectorAll('.article-checkbox:checked'))
            .map(function(cb) { return cb.value; });

        if (selectedArticles.length === 0) {
            quantitiesContainer.style.display = 'none';
            customQuantitiesContainer.innerHTML = '';
            saveArticlesData();
            return;
        }

        quantitiesContainer.style.display = 'block';

        // Mostrar/ocultar predefinidos
        document.getElementById('portatil-qty').style.display = 
            selectedArticles.indexOf('portatil') !== -1 ? 'block' : 'none';
        document.getElementById('proyector-qty').style.display = 
            selectedArticles.indexOf('proyector') !== -1 ? 'block' : 'none';
        document.getElementById('altavoces-qty').style.display = 
            selectedArticles.indexOf('altavoces') !== -1 ? 'block' : 'none';

        // Limpiar contenedor de artículos personalizados
        customQuantitiesContainer.innerHTML = '';
        
        // Crear inputs para artículos personalizados seleccionados
        selectedArticles.forEach(function(article) {
            if (['portatil', 'proyector', 'altavoces'].indexOf(article) === -1) {
                const inputId = 'qty-' + article.replace(/\s+/g, '-').toLowerCase();
                const div = document.createElement('div');
                div.className = 'mb-3';
                div.innerHTML = 
                    '<label for="' + inputId + '" class="form-label">Cantidad de ' + article + ':</label>' +
                    '<input type="number" id="' + inputId + '" class="form-control" min="1" value="1">';
                customQuantitiesContainer.appendChild(div);
            }
        });

        saveArticlesData();
    }

    // Exponer función globalmente para botones inline
    window.updateQuantityInputs = updateQuantityInputs;

    // Guardar datos en campo oculto
    function saveArticlesData() {
        const selected = Array.from(document.querySelectorAll('.article-checkbox:checked'))
            .map(function(cb) {
                var article = cb.value;
                var qty = 1;
                if (article === 'portatil') {
                    var el = document.getElementById('qty-portatil');
                    if (el) qty = parseInt(el.value) || 1;
                } else if (article === 'proyector') {
                    var el = document.getElementById('qty-proyector');
                    if (el) qty = parseInt(el.value) || 1;
                } else if (article === 'altavoces') {
                    var el = document.getElementById('qty-altavoces');
                    if (el) qty = parseInt(el.value) || 1;
                } else {
                    var inputId = 'qty-' + article.replace(/\s+/g, '-').toLowerCase();
                    var el = document.getElementById(inputId);
                    if (el) qty = parseInt(el.value) || 1;
                }
                return { article: article, quantity: qty };
            });
        articlesData.value = JSON.stringify(selected);
    }

    // Escuchar cambios en inputs de cantidad
    document.addEventListener('change', function(e) {
        if (e.target.type === 'number' && e.target.id.indexOf('qty-') === 0) {
            saveArticlesData();
        }
    });
});
