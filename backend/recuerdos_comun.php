<?php
ini_set('display_errors', '0');
ini_set('session.use_strict_mode', '1');
session_set_cookie_params(['httponly'=>true, 'samesite'=>'Lax', 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
$config = require __DIR__.'/recuerdos_config.php';
if (empty($_SESSION['recuerdos_csrf'])) $_SESSION['recuerdos_csrf'] = bin2hex(random_bytes(32));
function respuesta($datos, $codigo=200) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE); exit;
}
function conexion() {
    global $pdo;
    if (!isset($pdo)) require __DIR__.'/db.php';
    return $pdo;
}
function csrf() {
    if (!is_string($_POST['csrf'] ?? null) || !hash_equals($_SESSION['recuerdos_csrf'], $_POST['csrf'])) respuesta(['error'=>'La sesión venció. Recargá la página.'],403);
}
function administrador() {
    return !empty($_SESSION['recuerdos_admin']) && ($_SESSION['recuerdos_admin_hasta'] ?? 0) > time();
}
function limitar($tipo, $maximo, $segundos) {
    $db=conexion();
    $clave=hash('sha256', $tipo.'|'.($_SERVER['REMOTE_ADDR'] ?? 'local'));
    $ahora=time();
    $q=$db->prepare('INSERT INTO recuerdos_limites (clave,intentos,inicio) VALUES (?,1,?) ON DUPLICATE KEY UPDATE intentos=IF(inicio < ?,1,intentos+1), inicio=IF(inicio < ?,?,inicio)');
    $q->execute([$clave,$ahora,$ahora-$segundos,$ahora-$segundos,$ahora]);
    $q=$db->prepare('SELECT intentos FROM recuerdos_limites WHERE clave=?'); $q->execute([$clave]);
    if ((int)$q->fetchColumn()>$maximo) respuesta(['error'=>'Demasiados intentos. Volvé a intentarlo más tarde.'],429);
}
function campo($nombre,$min,$max) {
    $v=$_POST[$nombre] ?? '';
    if (!is_string($v)) respuesta(['error'=>'Campo inválido: '.$nombre],422);
    $v=trim($v); $n=preg_match_all('/./us',$v);
    if ($n===false || $n<$min || $n>$max) respuesta(['error'=>'Revisá el campo '.$nombre.'.'],422);
    return $v;
}
function escapar($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
