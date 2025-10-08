# Sistema de Redirección por Rol de Usuario

## Cambios Implementados

### Problema Resuelto
Los usuarios con rol de cliente (id_roles = 3, slug = 'customer') ahora son redirigidos automáticamente al **booking** en lugar del **calendar** después de iniciar sesión.

### Archivos Modificados

#### 1. **Login.php** (`application/controllers/Login.php`)

##### Constructor:
- Detecta si el usuario ya tiene sesión activa
- Si es cliente (customer), establece `booking` como URL de destino por defecto
- Si no es cliente, usa `calendar` como URL por defecto

##### Método `index()`:
- Verifica el rol del usuario al cargar la página de login
- Si ya está autenticado:
  - **Cliente** → Redirige a `/booking`
  - **Otros roles** → Redirige a `/calendar`

##### Método `validate()`:
- Después de validar credenciales exitosamente:
  - Determina la URL de redirección según el rol
  - **Cliente** → `site_url('booking')`
  - **Otros roles** → `site_url('calendar')` o la URL guardada en sesión
- Devuelve la URL en la respuesta JSON: `dest_url`

#### 2. **login.js** (`assets/js/pages/login.js`)

##### Función `onLoginFormSubmit()`:
- Modificada para usar la URL proporcionada por el servidor en la respuesta
- Si el servidor envía `response.dest_url`, usa esa URL
- Si no, usa la URL por defecto de `vars('dest_url')`

### Flujo de Redirección

```
┌─────────────────────────────────────────┐
│ Usuario inicia sesión                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Sistema valida credenciales             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Sistema verifica role_slug              │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│ role_slug = │  │ role_slug =  │
│ "customer"  │  │ otros roles  │
└──────┬──────┘  └──────┬───────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│ Redirige a  │  │ Redirige a   │
│ /booking    │  │ /calendar    │
└─────────────┘  └──────────────┘
```

### Roles en el Sistema

| ID | Slug | Nombre | Redirección |
|----|------|--------|-------------|
| 1 | admin | Administrador | `/calendar` |
| 2 | provider | Proveedor | `/calendar` |
| 3 | customer | Cliente | `/booking` |
| 4 | secretary | Secretaria | `/calendar` |

### Casos de Uso

#### Caso 1: Cliente se registra
1. Usuario completa formulario de registro
2. Sistema crea cuenta con `id_roles = 3` (customer)
3. Usuario es redirigido al login
4. Usuario inicia sesión
5. **Sistema redirige automáticamente a `/booking`**

#### Caso 2: Cliente intenta acceder a /calendar
1. Cliente autenticado intenta ir a `/calendar`
2. Calendar verifica permisos
3. Si no tiene permisos, muestra error "Forbidden"

#### Caso 3: Cliente vuelve a abrir la aplicación
1. Cliente abre `http://localhost/easyappointments`
2. Sistema detecta sesión activa
3. Sistema verifica `role_slug = 'customer'`
4. **Redirige automáticamente a `/booking`**

#### Caso 4: Admin/Provider/Secretary inicia sesión
1. Usuario con rol diferente a customer inicia sesión
2. Sistema detecta rol
3. **Redirige automáticamente a `/calendar`**

### Seguridad

- ✅ Solo usuarios autenticados pueden acceder al booking
- ✅ Si un usuario no autenticado intenta acceder a `/booking`, es redirigido a login
- ✅ La URL destino se guarda en sesión para redirigir después del login
- ✅ El sistema valida el rol en cada redirección

### Pruebas

#### Test 1: Registro y Login como Cliente
```
1. Ir a /register
2. Registrar usuario:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan@test.com
   - Password: password123
3. Hacer login con: juanperez / password123
4. ✅ Verificar redirección a /booking
```

#### Test 2: Acceso Directo al Booking
```
1. Cerrar sesión
2. Intentar acceder a /booking
3. ✅ Verificar redirección a /login
4. Iniciar sesión como cliente
5. ✅ Verificar redirección automática a /booking
```

#### Test 3: Cliente ya Autenticado
```
1. Iniciar sesión como cliente
2. Cerrar navegador
3. Abrir navegador y volver a /easyappointments
4. ✅ Verificar redirección automática a /booking (sin pasar por login)
```

#### Test 4: Admin/Provider Login
```
1. Iniciar sesión como admin o provider
2. ✅ Verificar redirección a /calendar
3. ✅ Verificar que NO va a /booking
```

### Código Relevante

#### Login.php - Validación
```php
// Determinar la URL de redirección según el rol
$dest_url = session('dest_url');

// Si es un cliente, redirigir al booking en lugar del calendar
if ($user_data['role_slug'] === DB_SLUG_CUSTOMER) {
    $dest_url = site_url('booking');
} elseif (empty($dest_url)) {
    // Para otros roles, usar calendar por defecto
    $dest_url = site_url('calendar');
}

json_response([
    'success' => true,
    'dest_url' => $dest_url,
]);
```

#### login.js - Redirección
```javascript
App.Http.Login.validate(username, password).done((response) => {
    if (response.success) {
        // Usar la URL proporcionada por el servidor
        const destUrl = response.dest_url || vars('dest_url');
        window.location.href = destUrl;
    }
});
```

### Notas Importantes

- La constante `DB_SLUG_CUSTOMER = 'customer'` está definida en `application/config/constants.php`
- El rol de cliente siempre tiene `id_roles = 3` en la base de datos
- Los usuarios registrados desde el formulario de registro siempre obtienen el rol de cliente
- El sistema mantiene compatibilidad con otros roles (admin, provider, secretary)
