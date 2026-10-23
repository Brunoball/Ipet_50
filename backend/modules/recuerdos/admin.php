<?php
declare(strict_types=1);

function admin_h(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function admin_page(string $inner, string $title = 'Moderación de recuerdos', int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store, private');
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    $safeTitle = admin_h($title);
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<title>' . $safeTitle . ' | IPET 50</title><style>body{font:16px system-ui,Arial,sans-serif;background:#f4f6fa;color:#223346;margin:0}.shell{max-width:1000px;margin:auto;padding:30px 18px}h1{font-size:1.75rem;margin:0 0 22px}h2{font-size:1.15rem}form{display:inline-block;margin:4px}input,button{font:inherit;padding:10px;border:1px solid #ced5df;border-radius:8px}input{max-width:100%}button{cursor:pointer;background:#174b78;color:white}button.warn{background:#a63239}article,.panel{border:1px solid #dce2e9;border-radius:13px;background:white;padding:20px;margin:16px 0;overflow-wrap:anywhere}article img{max-width:260px;max-height:190px;object-fit:contain;border-radius:6px}p{line-height:1.65;white-space:pre-wrap}.muted{color:#5b6773}.alert{color:#a52626}header{display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;align-items:center}a{color:#174b78}</style></head><body><main class="shell">';
    echo $inner . '</main></body></html>';
    exit;
}

function recuerdos_admin(): never
{
    start_web_session();
    $storedHash = setting('RECUERDOS_ADMIN_PASSWORD_HASH');
    if ($storedHash === '') admin_page('<h1>Panel sin configurar</h1><p>Configurá RECUERDOS_ADMIN_PASSWORD_HASH en el archivo .env antes de habilitar el acceso.</p>', status: 503);

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        check_token(is_string($_POST['csrf'] ?? null) ? $_POST['csrf'] : null);
        $action = is_string($_POST['accion'] ?? null) ? $_POST['accion'] : '';
        if ($action === 'ingresar') {
            limit_requests('recuerdo-admin-login', 8, 900);
            $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
            if ($password !== '' && password_verify($password, $storedHash)) {
                session_regenerate_id(true);
                $_SESSION['recuerdos_admin'] = true;
                header('Location: routes.php?route=recuerdos/admin', true, 303);
                exit;
            }
            $_SESSION['admin_login_error'] = 'Contraseña incorrecta.';
            header('Location: routes.php?route=recuerdos/admin', true, 303);
            exit;
        }
        if ($action === 'salir') {
            unset($_SESSION['recuerdos_admin']);
            session_regenerate_id(true);
            header('Location: routes.php?route=recuerdos/admin', true, 303);
            exit;
        }
        if (empty($_SESSION['recuerdos_admin'])) throw new ApiError('Acceso denegado.', 403);
        if (!in_array($action, ['aprobar', 'rechazar', 'eliminar'], true)) throw new ApiError('Acción desconocida.');
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$id) throw new ApiError('ID inválido.');
        $db = db();
        $select = $db->prepare('SELECT id, archivo, estado FROM web_recuerdos WHERE id = :id');
        $select->execute(['id' => $id]);
        $row = $select->fetch();
        if (!$row) throw new ApiError('El recuerdo ya no existe.', 404);
        if ($action === 'eliminar') {
            $delete = $db->prepare('DELETE FROM web_recuerdos WHERE id = :id');
            $delete->execute(['id' => $id]);
            if ($delete->rowCount() === 1 && recuerdos_valid_filename((string)$row['archivo'])) {
                @unlink(dirname(__DIR__, 2) . '/storage/recuerdos/' . $row['archivo']);
            }
        } else {
            $state = $action === 'aprobar' ? 'aprobado' : 'rechazado';
            $update = $db->prepare('UPDATE web_recuerdos SET estado = :estado, publicado_en = CASE WHEN :publicar = 1 THEN COALESCE(publicado_en, NOW()) ELSE NULL END WHERE id = :id');
            $update->bindValue(':estado', $state);
            $update->bindValue(':publicar', $action === 'aprobar' ? 1 : 0, PDO::PARAM_INT);
            $update->bindValue(':id', $id, PDO::PARAM_INT);
            $update->execute();
        }
        header('Location: routes.php?route=recuerdos/admin', true, 303);
        exit;
    }
    only('GET');
    if (isset($_GET['imagen'])) recuerdos_image(true);
    $csrf = admin_h(token());
    if (empty($_SESSION['recuerdos_admin'])) {
        $error = $_SESSION['admin_login_error'] ?? '';
        unset($_SESSION['admin_login_error']);
        admin_page('<h1>IPET 50 · Moderar recuerdos</h1><div class="panel"><form method="post"><input type="hidden" name="csrf" value="' . $csrf . '"><input type="hidden" name="accion" value="ingresar"><label>Contraseña de administración<br><input name="password" type="password" required autocomplete="current-password"></label> <button type="submit">Ingresar</button></form><p class="alert">' . admin_h($error) . '</p></div>');
    }
    $stmt = db()->query("SELECT id, nombre, email, vinculo, anio, titulo, relato, estado, creado_en FROM web_recuerdos ORDER BY FIELD(estado, 'pendiente', 'aprobado', 'rechazado'), creado_en DESC, id DESC LIMIT 100");
    $items = $stmt->fetchAll();
    $html = '<header><h1>Moderación de recuerdos</h1><form method="post"><input type="hidden" name="csrf" value="' . $csrf . '"><input type="hidden" name="accion" value="salir"><button type="submit">Cerrar sesión</button></form></header><p class="muted">Se muestran hasta 100 registros, priorizando los pendientes. No compartas el acceso al panel.</p>';
    if (!$items) $html .= '<div class="panel">Todavía no hay recuerdos.</div>';
    foreach ($items as $item) {
        $id = (int)$item['id'];
        $html .= '<article><img loading="lazy" src="routes.php?route=recuerdos/admin&amp;imagen=' . $id . '" alt="Imagen de recuerdo">';
        $html .= '<h2>#' . $id . ' · ' . admin_h($item['titulo']) . '</h2>';
        $html .= '<div class="muted">' . admin_h($item['estado']) . ' · ' . admin_h($item['nombre']) . ' · ' . admin_h($item['email']) . ' · ' . admin_h($item['vinculo']) . ' · ' . admin_h((string)($item['anio'] ?? '')) . '</div>';
        $html .= '<p>' . admin_h($item['relato']) . '</p>';
        foreach (['aprobar' => 'Aprobar', 'rechazar' => 'Rechazar', 'eliminar' => 'Eliminar definitivamente'] as $action => $label) {
            if ($action === 'aprobar' && $item['estado'] === 'aprobado') continue;
            if ($action === 'rechazar' && $item['estado'] === 'rechazado') continue;
            $html .= '<form method="post"><input type="hidden" name="csrf" value="' . $csrf . '"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="accion" value="' . $action . '"><button ' . ($action === 'eliminar' ? 'class="warn" onclick="return confirm(\'¿Eliminar definitivamente este recuerdo?\')"' : '') . ' type="submit">' . $label . '</button></form>';
        }
        $html .= '</article>';
    }
    admin_page($html);
}
