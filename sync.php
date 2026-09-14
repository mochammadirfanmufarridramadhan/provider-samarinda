<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Gunakan POST'], 405);
if (($_SERVER['HTTP_X_SYNC_SECRET'] ?? '') !== SYNC_SECRET) jsonResponse(['error' => 'Unauthorized'], 401);
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body) || !isset($body['responses']) || !is_array($body['responses'])) jsonResponse(['error' => 'Payload tidak valid'], 400);

try {
    $pdo = database();
    $statement = $pdo->prepare('INSERT INTO survey_responses (response_hash, submitted_at, payload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE submitted_at = VALUES(submitted_at), payload = VALUES(payload)');
    foreach ($body['responses'] as $response) {
        if (!is_array($response)) continue;
        $json = json_encode($response, JSON_UNESCAPED_UNICODE);
        $submitted = $response['Timestamp'] ?? $response['timestamp'] ?? null;
        $submittedAt = $submitted ? date('Y-m-d H:i:s', strtotime((string) $submitted)) : null;
        $statement->execute([hash('sha256', $json), $submittedAt, $json]);
    }
    jsonResponse(['ok' => true, 'synced' => count($body['responses'])]);
} catch (Throwable $error) {
    jsonResponse(['error' => $error->getMessage()], 500);
}