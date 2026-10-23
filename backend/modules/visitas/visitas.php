<?php
declare(strict_types=1);

function visitas(): never
{
    only('GET');
    start_web_session();
    $path = $_GET['path'] ?? '/';
    if (!is_string($path) || strlen($path) > 255 || !preg_match('~^/[a-zA-Z0-9/_-]*$~D', $path)) {
        throw new ApiError('Ruta inválida.');
    }
    $key = 'visit_' . hash('sha256', $path);
    $unique = true;
    $pdo = db();
    if (empty($_SESSION[$key])) {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO analytics_counters (path, views) VALUES (:path, 1) ON DUPLICATE KEY UPDATE views = views + 1');
            $stmt->execute(['path' => $path]);
            $stmt = $pdo->prepare('INSERT INTO analytics_page_views (path, ip, user_agent, referrer, session_id) VALUES (:path, :ip, :agent, :referrer, :session)');
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $stmt->execute([
                'path' => $path,
                'ip' => filter_var($ip, FILTER_VALIDATE_IP) ? inet_pton($ip) : null,
                'agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255) ?: null,
                'referrer' => substr($_SERVER['HTTP_REFERER'] ?? '', 0, 255) ?: null,
                'session' => session_id() ?: null,
            ]);
            $pdo->commit();
            $_SESSION[$key] = true;
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('IPET50 analytics: ' . $exception->getMessage());
            // Sigue mostrando el total persistido sin confirmar falsamente una visita.
        }
    }
    $stmt = $pdo->prepare('SELECT views FROM analytics_counters WHERE path = :path');
    $stmt->execute(['path' => $path]);
    output_json(['ok' => true, 'total' => (int)($stmt->fetchColumn() ?: 0)]);
}
