<?php
declare(strict_types=1);

/** Acepta tanto las fotografías nuevas con su extensión real como las antiguas .bin. */
function recuerdos_valid_filename(string $filename): bool
{
    return preg_match('/\A[a-f0-9]{32}\.(?:bin|jpg|png|webp)\z/', $filename) === 1;
}

/** GET: ?sesion=1, ?imagen=N, ?pagina=N. POST: envío del formulario existente. */
function recuerdos(): never
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') recuerdos_submit();
    only('GET');
    if (isset($_GET['sesion'])) output_json(['ok' => true, 'csrf' => token()]);
    if (isset($_GET['imagen'])) recuerdos_image(false);
    recuerdos_list();
}

function recuerdos_list(): never
{
    $page = filter_var($_GET['pagina'] ?? 1, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 100000]]);
    if (!$page) throw new ApiError('Página inválida.');
    $limit = 12;
    $db = db();
    $stmt = $db->prepare('SELECT id, nombre, vinculo, anio, titulo, relato FROM web_recuerdos WHERE estado = :estado ORDER BY publicado_en DESC, id DESC LIMIT :limit OFFSET :offset');
    $stmt->bindValue(':estado', 'aprobado');
    $stmt->bindValue(':limit', $limit + 1, PDO::PARAM_INT);
    $stmt->bindValue(':offset', ($page - 1) * $limit, PDO::PARAM_INT);
    $stmt->execute();
    $items = $stmt->fetchAll();
    $more = count($items) > $limit;
    $items = array_slice($items, 0, $limit);
    foreach ($items as &$item) {
        $item['id'] = (int)$item['id'];
        $item['anio'] = $item['anio'] !== null ? (int)$item['anio'] : null;
    }
    unset($item);
    output_json(['ok' => true, 'recuerdos' => $items, 'mas' => $more, 'pagina' => $page]);
}

function recuerdos_image(bool $admin): never
{
    only('GET');
    if ($admin) {
        start_web_session();
        if (empty($_SESSION['recuerdos_admin'])) throw new ApiError('Acceso denegado.', 403);
    }
    $id = filter_var($_GET['imagen'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!$id) throw new ApiError('Imagen no encontrada.', 404);
    $sql = 'SELECT archivo, foto_mime FROM web_recuerdos WHERE id = :id';
    if (!$admin) $sql .= " AND estado = 'aprobado'";
    $stmt = db()->prepare($sql);
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if (!$row || !recuerdos_valid_filename((string)$row['archivo'])) throw new ApiError('Imagen no encontrada.', 404);
    $file = dirname(__DIR__, 2) . '/storage/recuerdos/' . $row['archivo'];
    if (!is_file($file)) throw new ApiError('Imagen no encontrada.', 404);
    $mime = (string)$row['foto_mime'];
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) throw new ApiError('Imagen no encontrada.', 404);
    $extension = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime];
    header('Content-Type: ' . $mime);
    header('X-Content-Type-Options: nosniff');
    header('Content-Disposition: inline; filename="recuerdo-' . (int)$id . '.' . $extension . '"');
    header('Cache-Control: private, max-age=300');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

function recuerdos_submit(): never
{
    only('POST');
    start_web_session();
    check_token(is_string($_POST['csrf'] ?? null) ? $_POST['csrf'] : null);
    if (!empty($_POST['sitio_web'])) throw new ApiError('No se pudo procesar el formulario.');
    if (($_POST['consentimiento'] ?? '') !== '1') throw new ApiError('Necesitamos tu autorización para publicar el recuerdo.');

    $nombre = field('nombre', 2, 100);
    $email = field('email', 5, 254);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new ApiError('Ingresá un correo válido.');
    $vinculo = field('vinculo', 1, 40);
    if (!in_array($vinculo, ['Estudiante', 'Egresado/a', 'Docente', 'Familia', 'Personal de la escuela', 'Otro'], true)) throw new ApiError('Seleccioná un vínculo válido.');
    $titulo = field('titulo', 3, 140);
    $relato = field('relato', 20, 3000);
    $anioText = field('anio', 4, 4, false);
    $anio = null;
    if ($anioText !== '') {
        if (!ctype_digit($anioText) || (int)$anioText < 1900 || (int)$anioText > (int)date('Y')) throw new ApiError('El año del recuerdo no es válido.');
        $anio = (int)$anioText;
    }
    $photo = $_FILES['foto'] ?? null;
    if (!is_array($photo) || ($photo['error'] ?? null) !== UPLOAD_ERR_OK || !is_string($photo['tmp_name'] ?? null)) {
        throw new ApiError('Seleccioná una fotografía válida, de hasta 3 MB.');
    }
    if (($photo['size'] ?? 0) < 1 || ($photo['size'] ?? 0) > 3 * 1024 * 1024) throw new ApiError('La fotografía no puede superar los 3 MB.');
    if (!is_uploaded_file($photo['tmp_name'])) throw new ApiError('No se pudo comprobar la fotografía.');
    $info = @getimagesize($photo['tmp_name']);
    if (!is_array($info) || $info[0] < 1 || $info[1] < 1 || $info[0] > 8000 || $info[1] > 8000) throw new ApiError('La fotografía debe tener como máximo 8000 píxeles por lado.');
    if (!class_exists('finfo')) {
        throw new ApiError('El servidor PHP necesita tener habilitada la extensión fileinfo.', 503);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($photo['tmp_name']);
    $supported = ['image/jpeg' => IMAGETYPE_JPEG, 'image/png' => IMAGETYPE_PNG, 'image/webp' => IMAGETYPE_WEBP];
    if (!is_string($mime) || !isset($supported[$mime]) || $info[2] !== $supported[$mime]) throw new ApiError('El formato de la fotografía debe ser JPG, PNG o WebP.');

    // Verificar primero la conexión y la tabla: si falla MySQL, no mover la foto.
    // PDO sin emulación valida nombres de tabla/columnas al preparar la consulta.
    $stmt = db()->prepare("INSERT INTO web_recuerdos (nombre, email, vinculo, anio, titulo, relato, archivo, foto_mime, estado, creado_en) VALUES (:nombre, :email, :vinculo, :anio, :titulo, :relato, :archivo, :mime, 'pendiente', NOW())");

    $folder = dirname(__DIR__, 2) . '/storage/recuerdos';
    if (!is_dir($folder) && !@mkdir($folder, 0750, true) && !is_dir($folder)) {
        throw new ApiError('No se pudo preparar la carpeta de fotografías en el servidor.', 503);
    }
    if (!is_writable($folder)) {
        throw new ApiError('La carpeta de fotografías no tiene permisos de escritura.', 503);
    }
    // Evitar consumir el cupo durante pruebas locales que están fallando por configuración.
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    $localDev = setting('APP_ENV') === 'development'
        && in_array((string)($_SERVER['REMOTE_ADDR'] ?? ''), ['127.0.0.1', '::1'], true)
        && preg_match('/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/D', $host) === 1;
    if (!$localDev) limit_requests('recuerdo-submit', 3, 3600);

    // La extensión se determina a partir del contenido real validado por fileinfo,
    // nunca a partir del nombre proporcionado por quien envía la fotografía.
    $extension = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime];
    $basename = bin2hex(random_bytes(16)) . '.' . $extension;
    $target = $folder . '/' . $basename;
    if (!move_uploaded_file($photo['tmp_name'], $target)) {
        throw new ApiError('No se pudo guardar la fotografía. Revisá los permisos de storage/recuerdos.', 503);
    }
    try {
        $stmt->execute([
            'nombre' => $nombre, 'email' => $email, 'vinculo' => $vinculo, 'anio' => $anio,
            'titulo' => $titulo, 'relato' => $relato, 'archivo' => $basename, 'mime' => $mime,
        ]);
    } catch (Throwable $exception) {
        @unlink($target);
        throw $exception;
    }
    output_json(['ok' => true, 'mensaje' => '¡Gracias! Recibimos tu recuerdo. Se publicará una vez que lo revise la escuela.'], 201);
}
