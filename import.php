<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$message = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['responses']) || $_FILES['responses']['error'] !== UPLOAD_ERR_OK) {
        $error = 'Pilih file CSV hasil download dari Google Sheet.';
    } else {
        try {
            $handle = fopen($_FILES['responses']['tmp_name'], 'rb');
            $headers = fgetcsv($handle);
            if (!$headers) throw new RuntimeException('Header CSV tidak ditemukan.');
            $headers = array_map(static fn($value) => trim((string) $value), $headers);
            $statement = database()->prepare('INSERT INTO survey_responses (response_hash, submitted_at, payload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE submitted_at = VALUES(submitted_at), payload = VALUES(payload)');
            $count = 0;
            while (($row = fgetcsv($handle)) !== false) {
                if (count(array_filter($row, static fn($value) => trim((string) $value) !== '')) === 0) continue;
                $payload = [];
                foreach ($headers as $index => $header) $payload[$header] = $row[$index] ?? '';
                $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
                $timestamp = $payload['Timestamp'] ?? $payload['timestamp'] ?? null;
                $submittedAt = $timestamp ? date('Y-m-d H:i:s', strtotime((string) $timestamp)) : null;
                $statement->execute([hash('sha256', $json), $submittedAt, $json]);
                $count++;
            }
            fclose($handle);
            $message = $count . ' respons berhasil diimpor atau diperbarui.';
        } catch (Throwable $exception) {
            $error = 'Import gagal: ' . $exception->getMessage();
        }
    }
}
?><!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Import Respons Survei</title></head>
<body style="font-family:Arial,sans-serif;max-width:640px;margin:48px auto;padding:24px;line-height:1.6">
<h1>Import Respons Google Sheet</h1>
<p>Download data Google Sheet sebagai CSV, lalu upload di sini untuk mengisi database MySQL lokal.</p>
<?php if ($message): ?><p style="color:green"><?= htmlspecialchars($message) ?></p><?php endif; ?>
<?php if ($error): ?><p style="color:#b00020"><?= htmlspecialchars($error) ?></p><?php endif; ?>
<form method="post" enctype="multipart/form-data"><input type="file" name="responses" accept=".csv,text/csv" required><button type="submit">Import ke Database</button></form>
<p><a href="index.html">Kembali ke dashboard</a></p>
</body>
</html>