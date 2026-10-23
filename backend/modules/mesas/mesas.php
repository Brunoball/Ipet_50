<?php
declare(strict_types=1);

function mesas_estado(): never
{
    only('GET');
    $formUrl = rtrim(setting('MESAS_FORM_URL', 'https://inscripcion.ipet50.edu.ar/'), '/') . '/';
    $apiUrl = setting('MESAS_API_URL', 'https://lerna.3devsnet.com/api/routes/api.php?action=form_obtener_config_inscripcion');
    $fallback = ['visible' => false, 'abierta' => false, 'hay_config' => false];
    if (!function_exists('curl_init')) output_json($fallback);
    $handle = curl_init($apiUrl . (str_contains($apiUrl, '?') ? '&' : '?') . '_=' . time());
    if (!$handle) output_json($fallback);
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 2,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 9,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Origin: ' . rtrim($formUrl, '/'),
            'Referer: ' . $formUrl,
            'User-Agent: IPET50-WEB-MESAS-POPUP/2.0',
        ],
    ]);
    $response = curl_exec($handle);
    $http = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);
    if (!is_string($response) || $http < 200 || $http > 299) output_json($fallback);
    $data = json_decode($response, true);
    if (!is_array($data)) output_json($fallback);
    $exito = (bool)($data['exito'] ?? false);
    $hay = (bool)($data['hay_config'] ?? true);
    $abierta = (bool)($data['abierta'] ?? false);
    output_json([
        'visible' => $exito && $hay && $abierta,
        'abierta' => $abierta,
        'hay_config' => $hay,
        'url' => $formUrl,
        'nombre' => is_string($data['nombre'] ?? null) ? $data['nombre'] : 'Mesas de Examen',
        'fin' => $data['fin'] ?? null,
        'mensaje_cerrado' => $data['mensaje_cerrado'] ?? null,
    ]);
}
