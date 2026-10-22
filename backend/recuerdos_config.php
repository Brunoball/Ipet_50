<?php
// Generar hash: php -r "echo password_hash('TU_CLAVE_LARGA', PASSWORD_DEFAULT), PHP_EOL;"
// Pegar únicamente el hash, nunca la contraseña en texto plano.
return [
    'clave_hash' => getenv('RECUERDOS_CLAVE_HASH') ?: '',
    'correo_revision' => getenv('RECUERDOS_CORREO_REVISION') ?: '',
    // URL absoluta HTTPS al panel, por ejemplo https://tu-dominio/backend/recuerdos_admin.php
    'url_panel' => getenv('RECUERDOS_URL_PANEL') ?: '',
];
