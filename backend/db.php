<?php
declare(strict_types=1);
// Configuración y conexión PDO (sin librerías ni dependencias externas).
function setting(string $name, string $default = ''): string {
    static $env = null;
    if ($env === null) {
        $env = [];
        $file = __DIR__ . '/.env';
        if (is_readable($file)) {
            foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                if (!preg_match('/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/', $line, $m)) continue;
                $value = trim($m[2]);
                if (strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && substr($value, -1) === $value[0]) {
                    $value = substr($value, 1, -1);
                } else {
                    $value = (string)preg_replace('/\s+#.*$/', '', $value);
                }
                $env[$m[1]] = $value;
            }
        }
        date_default_timezone_set($env['APP_TIMEZONE'] ?? 'America/Argentina/Cordoba');
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');
    }
    $server = getenv($name);
    return $server !== false ? (string)$server : ($env[$name] ?? $default);
}

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $name = setting('DB_NAME');
    $user = setting('DB_USER');
    $port = setting('DB_PORT', '3306');
    if ($name === '' || $user === '' || !ctype_digit($port) || (int)$port < 1 || (int)$port > 65535) {
        throw new RuntimeException('Configuración de base de datos incompleta');
    }
    $dsn = 'mysql:host=' . setting('DB_HOST', 'localhost') . ';port=' . (int)$port . ';dbname=' . $name . ';charset=utf8mb4';
    $pdo = new PDO($dsn, $user, setting('DB_PASSWORD'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
