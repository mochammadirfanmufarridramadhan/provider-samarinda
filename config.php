<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_NAME = 'provider_samarinda';
const DB_USER = 'root';
const DB_PASSWORD = '';
const SYNC_SECRET = 'ganti-secret-sinkronisasi-ini';

function database(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASSWORD,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    return $pdo;
}

function jsonResponse(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function normalized(string $value): string { return mb_strtolower(trim($value)); }

function findValue(array $payload, string $needle): string
{
    foreach ($payload as $key => $value) {
        if (str_contains(normalized((string) $key), normalized($needle))) return trim((string) $value);
    }
    return '';
}

function scaleValue(string $value): ?int
{
    $map = ['sangat tidak puas' => 1, 'tidak puas' => 2, 'cukup puas' => 3, 'puas' => 4, 'sangat puas' => 5];
    $value = normalized($value);
    if (isset($map[$value])) return $map[$value];
    if (is_numeric($value) && (int) $value >= 1 && (int) $value <= 5) return (int) $value;
    return null;
}

function countValue(array &$counts, string $value): void
{
    if ($value !== '') $counts[$value] = ($counts[$value] ?? 0) + 1;
}

function topValue(array $counts): ?string
{
    if (!$counts) return null;
    arsort($counts);
    return (string) array_key_first($counts);
}
