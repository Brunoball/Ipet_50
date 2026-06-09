<?php
// backend/db.php
$host = 'localhost';
$dbname = 'web_ipet50';
$user = 'root';
$pass = 'brunoball516';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  die('DB error: '.htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8'));
}
