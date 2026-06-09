<?php
// backend/counter.php
declare(strict_types=1);
require_once __DIR__ . '/db.php';

function an_client_ip(): ?string {
  foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','HTTP_X_REAL_IP','REMOTE_ADDR'] as $h) {
    if (!empty($_SERVER[$h])) {
      $ip = trim(explode(',', $_SERVER[$h])[0]);
      return $ip ?: null;
    }
  }
  return null;
}

function an_get_total(string $path = '/'): int {
  /** @var PDO $pdo */
  global $pdo;
  $st = $pdo->prepare("SELECT views FROM analytics_counters WHERE path=:p");
  $st->execute([':p'=>$path]);
  $row = $st->fetch();
  return (int)($row['views'] ?? 0);
}

/**
 * $unique_per_session=true => 1 vista por sesión (visita real).
 * false => suma en cada refresh.
 */
function increment_and_get(string $path='/', bool $unique_per_session=true): int {
  if (session_status() !== PHP_SESSION_ACTIVE) {
    if (PHP_VERSION_ID >= 70300) @session_set_cookie_params(['samesite'=>'Lax']);
    @session_start();
  }

  $key = 'an_viewed_' . md5($path);
  if ($unique_per_session && !empty($_SESSION[$key])) {
    return an_get_total($path);
  }

  /** @var PDO $pdo */
  global $pdo;

  try {
    $pdo->beginTransaction();

    $st = $pdo->prepare("
      INSERT INTO analytics_counters (path, views)
      VALUES (:p, 1)
      ON DUPLICATE KEY UPDATE views = views + 1
    ");
    $st->execute([':p'=>$path]);

    $ip  = an_client_ip();
    $ua  = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
    $ref = substr($_SERVER['HTTP_REFERER'] ?? '', 0, 255);
    $sid = session_id();

    $st2 = $pdo->prepare("
      INSERT INTO analytics_page_views (path, ip, user_agent, referrer, session_id)
      VALUES (:p, :ip, :ua, :ref, :sid)
    ");
    $st2->execute([
      ':p'=>$path,
      ':ip'=>$ip ? @inet_pton($ip) : null,
      ':ua'=>$ua ?: null,
      ':ref'=>$ref ?: null,
      ':sid'=>$sid ?: null,
    ]);

    $pdo->commit();
  } catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    // No romper: devolvemos el total actual
    return an_get_total($path);
  }

  $_SESSION[$key] = 1;
  return an_get_total($path);
}
