<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

try {
    $rows = database()->query('SELECT submitted_at, payload FROM survey_responses ORDER BY id ASC')->fetchAll();
    $providers = $usedProviders = $satisfaction = $areas = $aspects = [];
    $aspectNames = ['Kualitas jaringan', 'Kecepatan internet', 'Kestabilan koneksi', 'Jangkauan jaringan', 'Harga paket internet', 'Pilihan paket internet', 'Kemudahan membeli paket', 'Promo dan bonus', 'Pelayanan pelanggan'];
    $aspectTotals = [];
    $satTotal = $satCount = 0;

    foreach ($rows as $row) {
        $payload = json_decode((string) $row['payload'], true) ?: [];
        $best = findValue($payload, 'Provider mana yang menurut Anda paling baik');
        $used = findValue($payload, 'Provider internet seluler yang paling sering Anda gunakan');
        $satisfactionValue = findValue($payload, 'Secara keseluruhan, seberapa puas');
        $area = findValue($payload, 'Kecamatan tempat Anda tinggal');
        countValue($providers, $best !== '' ? $best : $used);
        countValue($usedProviders, $used);
        countValue($satisfaction, $satisfactionValue);
        countValue($areas, $area);
        $score = scaleValue($satisfactionValue);
        if ($score !== null) { $satTotal += $score; $satCount++; }
        foreach ($aspectNames as $aspect) {
            $score = scaleValue(findValue($payload, $aspect));
            if ($score !== null) { $aspectTotals[$aspect]['sum'] = ($aspectTotals[$aspect]['sum'] ?? 0) + $score; $aspectTotals[$aspect]['count'] = ($aspectTotals[$aspect]['count'] ?? 0) + 1; }
        }
    }
    foreach ($aspectTotals as $name => $total) $aspects[$name] = round($total['sum'] / $total['count'], 2);
    $topProvider = topValue($providers);
    $topArea = topValue($areas);
    $latest = database()->query('SELECT submitted_at FROM survey_responses ORDER BY submitted_at DESC, id DESC LIMIT 1')->fetchColumn();
    jsonResponse([
        'updatedAt' => $latest ?: null,
        'totalResponses' => count($rows),
        'providers' => $providers,
        'usedProviders' => $usedProviders,
        'satisfaction' => $satisfaction,
        'aspects' => $aspects,
        'topProvider' => $topProvider,
        'topShare' => $topProvider && $rows ? round($providers[$topProvider] / count($rows) * 100, 1) : 0,
        'avgSatisfaction' => $satCount ? round($satTotal / $satCount, 2) : null,
        'topArea' => $topArea,
        'areaShare' => $topArea && $rows ? round($areas[$topArea] / count($rows) * 100, 1) : 0
    ]);
} catch (Throwable $error) {
    jsonResponse(['error' => 'Database belum siap: ' . $error->getMessage()], 500);
}