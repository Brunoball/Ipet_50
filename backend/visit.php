<?php
// backend/visit.php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

/* Ajustá el origen si en dev usás Live Server (5500) y PHP (3001). 
   En producción, si es el mismo dominio, podés comentar esta línea. */
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');

require_once __DIR__ . '/counter.php';

$path   = isset($_GET['path']) && is_string($_GET['path']) ? $_GET['path'] : '/';
$unique = !isset($_GET['all']); // ?all=1 para contar cada refresh

$total = increment_and_get($path, $unique);

echo json_encode(['ok'=>true, 'total'=>$total], JSON_UNESCAPED_UNICODE);
