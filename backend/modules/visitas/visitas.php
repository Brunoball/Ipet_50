<?php
declare(strict_types=1);

/**
 * Contador de visitas.
 *
 * Solo suma +1 al total de la ruta. NO guarda datos de las personas
 * (ni IP, ni navegador, ni página de origen, ni ID de sesión).
 * La cookie de sesión se usa únicamente para no contar dos veces
 * la misma visita y se borra al cerrar el navegador.
 */
function visitas(): never
{
    only('GET');
    start_web_session();
    $path = $_GET['path'] ?? '/';
    if (!is_string($path) || strlen($path) > 255 || !preg_match('~^/[a-zA-Z0-9/_-]*$~D', $path)) {
        throw new ApiError('Ruta inválida.');
    }
    $key = 'visit_' . hash('sha256', $path);
    $pdo = db();
    if (empty($_SESSION[$key])) {
        try {
            $stmt = $pdo->prepare('INSERT INTO analytics_counters (path, views) VALUES (:path, 1) ON DUPLICATE KEY UPDATE views = views + 1');
            $stmt->execute(['path' => $path]);
            $_SESSION[$key] = true;
        } catch (Throwable $exception) {
            error_log('IPET50 contador: ' . $exception->getMessage());
            // Sigue mostrando el total guardado sin confirmar falsamente una visita.
        }
    }
    $stmt = $pdo->prepare('SELECT views FROM analytics_counters WHERE path = :path');
    $stmt->execute(['path' => $path]);
    output_json(['ok' => true, 'total' => (int)($stmt->fetchColumn() ?: 0)]);
}
