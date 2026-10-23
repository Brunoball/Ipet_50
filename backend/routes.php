<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';

final class ApiError extends RuntimeException {
    public function __construct(string $message, public int $status = 400) { parent::__construct($message); }
}
function output_json(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function only(string $method): void {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $method) {
        header('Allow: ' . $method);
        throw new ApiError('Método no permitido.', 405);
    }
}
/** Solo el servidor PHP abierto desde la propia PC, nunca un visitante remoto. */
function local_php_server(): bool {
    $remote = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    return in_array($remote, ['127.0.0.1', '::1'], true)
        && preg_match('/\A(?:localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?\z/D', $host) === 1;
}
function start_web_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('IPET50SESSID');
    $https = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') === '443');
    // En localhost:3001 por HTTP se requieren cookies de sesión sin Secure.
    // En producción, conservar Secure incluso si un proxy recibe HTTP.
    $secure = $https || (setting('APP_ENV', 'production') === 'production' && !local_php_server());
    session_set_cookie_params(['lifetime'=>0, 'path'=>'/', 'secure'=>$secure, 'httponly'=>true, 'samesite'=>'Lax']);
    if (!session_start()) throw new RuntimeException('Error al iniciar sesión');
}
function token(): string {
    start_web_session();
    if (empty($_SESSION['ipet50_csrf'])) $_SESSION['ipet50_csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['ipet50_csrf'];
}
function check_token(?string $value): void {
    if ($value === null || !hash_equals(token(), $value)) throw new ApiError('Sesión vencida. Actualizá la página.', 419);
}
function field(string $name, int $min, int $max, bool $required = true): string {
    $value = $_POST[$name] ?? '';
    if (!is_string($value)) throw new ApiError('Campo inválido: ' . $name);
    $value = trim($value);
    if ($value === '' && !$required) return '';
    $size = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : (preg_match_all('/./us', $value) ?: strlen($value));
    if ($size < $min || $size > $max) throw new ApiError('Revisá el campo ' . $name . '.');
    return $value;
}
function limit_requests(string $action, int $maximum, int $seconds): void {
    $key = hash('sha256', $action . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $file = __DIR__ . '/storage/ratelimit/' . $key . '.json';
    $fp = @fopen($file, 'c+');
    if (!$fp) throw new ApiError('Servicio temporalmente no disponible.', 503);
    try {
        if (!flock($fp, LOCK_EX)) throw new ApiError('Servicio temporalmente no disponible.', 503);
        $items = json_decode(stream_get_contents($fp) ?: '[]', true);
        if (!is_array($items)) $items = [];
        $now = time();
        $items = array_values(array_filter($items, static fn($x) => is_int($x) && $x > $now - $seconds));
        if (count($items) >= $maximum) throw new ApiError('Demasiados intentos. Probá más tarde.', 429);
        $items[] = $now;
        rewind($fp); ftruncate($fp, 0); fwrite($fp, json_encode($items)); fflush($fp);
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}
function apply_cors(): void {
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    $allow = array_values(array_filter(array_map('trim', explode(',', setting('CORS_ALLOWED_ORIGINS')))));
    // Live Server (3000) + PHP (3001), únicamente desde la PC local.
    // No abre CORS a Internet ni depende de recordar esta opción en el .env.
    if (local_php_server() && (int)($_SERVER['SERVER_PORT'] ?? 0) === 3001) {
        $allow[] = 'http://localhost:3000';
        $allow[] = 'http://127.0.0.1:3000';
    }
    $allowed = $origin !== '' && in_array($origin, $allow, true);
    if ($allowed) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        if (!$allowed) output_json(['ok'=>false, 'error'=>'Origen no permitido.'], 403);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        http_response_code(204); exit;
    }
}

try {
    apply_cors();
    $route = $_GET['route'] ?? '';
    if (!is_string($route)) throw new ApiError('Ruta inválida.');
    switch ($route) {
        case 'health':
            only('GET'); output_json(['ok'=>true,'servicio'=>'web-ipet50']);
        case 'visitas':
            require __DIR__ . '/modules/visitas/visitas.php'; visitas();
        case 'mesas/estado':
            require __DIR__ . '/modules/mesas/mesas.php'; mesas_estado();
        case 'recuerdos':
            require __DIR__ . '/modules/recuerdos/recuerdos.php'; recuerdos();
        case 'recuerdos/admin':
            require __DIR__ . '/modules/recuerdos/recuerdos.php';
            require __DIR__ . '/modules/recuerdos/admin.php'; recuerdos_admin();
        default: throw new ApiError('Ruta no encontrada.', 404);
    }
} catch (ApiError $exception) {
    output_json(['ok'=>false,'error'=>$exception->getMessage()], $exception->status);
} catch (Throwable $exception) {
    // Guardar el error real en la terminal/log de PHP sin exponerlo en producción.
    error_log('IPET50 [' . get_class($exception) . '] '
        . basename($exception->getFile()) . ':' . $exception->getLine() . ' - ' . $exception->getMessage());

    // Solo se muestran detalles cuando PHP está ejecutándose en la propia PC.
    // APP_ENV=development por sí solo NO alcanza para revelar errores por Internet.
    $remote = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    $localHost = preg_match('/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/D', $host) === 1;
    $localDev = setting('APP_ENV') === 'development'
        && in_array($remote, ['127.0.0.1', '::1'], true)
        && $localHost;
    if ($localDev) {
        output_json([
            'ok' => false,
            'error' => 'No se pudo completar la operación: ' . $exception->getMessage(),
            'tipo' => get_class($exception),
            'origen' => basename($exception->getFile()) . ':' . $exception->getLine(),
        ], 500);
    }
    output_json(['ok'=>false,'error'=>'No se pudo completar la operación. Intentá nuevamente.'], 500);
}
