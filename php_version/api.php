<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-API-Key");

$API_KEY = "BPAC_SECRET_KEY_2026";
$UPLOADS_DIR = __DIR__ . "/uploads";

if (!file_exists($UPLOADS_DIR)) {
    mkdir($UPLOADS_DIR, 0777, true);
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. Health check & Ping
if ($action === 'ping' || (empty($action) && $_SERVER['REQUEST_METHOD'] === 'GET')) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "ok", "serverTime" => date('c')]);
    exit;
}

// 2. Upload file
if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $clientKey = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : (isset($_REQUEST['apiKey']) ? $_REQUEST['apiKey'] : '');
    if ($clientKey !== $API_KEY) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Invalid API Key"]);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["error" => "No file uploaded"]);
        exit;
    }

    $station = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_POST['station']) ? $_POST['station'] : 'BPAC_Tram_01');
    $folder = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_POST['folder']) ? $_POST['folder'] : 'root');
    $originalName = basename($_FILES['file']['name']);

    $targetDir = "$UPLOADS_DIR/$station/$folder";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $targetPath = "$targetDir/$originalName";
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        echo json_encode([
            "success" => true,
            "station" => $station,
            "folder" => $folder,
            "fileName" => $originalName,
            "size" => filesize($targetPath)
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save file"]);
    }
    exit;
}

// 3. Danh sách ngày
if ($action === 'dates') {
    header('Content-Type: application/json');
    $station = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_GET['station']) ? $_GET['station'] : 'BPAC_Tram_01');
    $stationDir = "$UPLOADS_DIR/$station";

    $dates = [];
    if (file_exists($stationDir) && is_dir($stationDir)) {
        $files = scandir($stationDir);
        foreach ($files as $f) {
            if ($f !== '.' && $f !== '..' && is_dir("$stationDir/$f")) {
                $dates[] = $f;
            }
        }
        rsort($dates);
    }
    echo json_encode(["dates" => $dates, "station" => $station]);
    exit;
}

// 4. Chi tiết ngày
if ($action === 'day-data') {
    header('Content-Type: application/json');
    $station = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_GET['station']) ? $_GET['station'] : 'BPAC_Tram_01');
    $date = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_GET['date']) ? $_GET['date'] : '');

    $dayDir = "$UPLOADS_DIR/$station/$date";
    if (!file_exists($dayDir) || !is_dir($dayDir)) {
        echo json_encode(["date" => $date, "station" => $station, "totalTrips" => 0, "summaryReports" => new stdClass(), "trips" => []]);
        exit;
    }

    $files = scandir($dayDir);
    $summaryReports = [];
    $tripMap = [];
    $lastUpdated = 0;

    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $fullPath = "$dayDir/$f";
        $mtime = filemtime($fullPath);
        if ($mtime > $lastUpdated) $lastUpdated = $mtime;
        $size = filesize($fullPath);
        $lower = strtolower($f);

        if (strpos($lower, 'in_ct ngày') === 0 || strpos($lower, 'in_ct ngay') === 0) {
            $summaryReports['pdfDailySummary'] = ["name" => $f, "size" => $size, "mtime" => $mtime];
        } else if (strpos($lower, 'ghi_ct ngày') === 0 || strpos($lower, 'ghi_ct ngay') === 0) {
            $summaryReports['xlsDailySummary'] = ["name" => $f, "size" => $size, "mtime" => $mtime];
        } else if (strpos($lower, 'in_ctxe') === 0 || strpos($lower, 'in_ct_xe') === 0) {
            $summaryReports['pdfDailyVehicle'] = ["name" => $f, "size" => $size, "mtime" => $mtime];
        } else if (strpos($lower, 'ghi_ctxe') === 0 || strpos($lower, 'ghi_ct_xe') === 0) {
            $summaryReports['xlsDailyVehicle'] = ["name" => $f, "size" => $size, "mtime" => $mtime];
        } else if (strpos($lower, 'in_caxe_') === 0 || strpos($lower, 'ghi_caxe_') === 0) {
            if (preg_match('/CaXe_(\d+h_\d+m_\d+s)/i', $f, $matches)) {
                $timeKey = $matches[1];
            } else {
                $timeKey = $f;
            }

            if (!isset($tripMap[$timeKey])) {
                $displayTime = $timeKey;
                if (preg_match('/(\d+)h_(\d+)m_(\d+)s/', $timeKey, $tm)) {
                    $displayTime = sprintf('%02d:%02d:%02d', $tm[1], $tm[2], $tm[3]);
                }
                $tripMap[$timeKey] = [
                    "id" => $timeKey,
                    "time" => $displayTime,
                    "pdfFile" => null,
                    "xlsFile" => null,
                    "updatedAt" => $mtime
                ];
            }

            if (substr($lower, -4) === '.pdf') {
                $tripMap[$timeKey]['pdfFile'] = ["name" => $f, "size" => $size, "mtime" => $mtime];
            } else if (substr($lower, -4) === '.xls') {
                $tripMap[$timeKey]['xlsFile'] = ["name" => $f, "size" => $size, "mtime" => $mtime];
            }
        }
    }

    $trips = array_values($tripMap);
    usort($trips, function($a, $b) {
        return strcmp($b['time'], $a['time']);
    });

    echo json_encode([
        "date" => $date,
        "station" => $station,
        "lastUpdated" => $lastUpdated > 0 ? date('c', $lastUpdated) : null,
        "totalTrips" => count($trips),
        "summaryReports" => (object)$summaryReports,
        "trips" => $trips
    ]);
    exit;
}

// 5. Download / View file
if ($action === 'file') {
    $station = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_GET['station']) ? $_GET['station'] : 'BPAC_Tram_01');
    $date = preg_replace('/[^a-zA-Z0-9_-]/', '_', isset($_GET['date']) ? $_GET['date'] : '');
    $filename = basename(isset($_GET['file']) ? $_GET['file'] : '');
    $download = isset($_GET['download']) && $_GET['download'] === 'true';

    $filePath = "$UPLOADS_DIR/$station/$date/$filename";
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo "File not found";
        exit;
    }

    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    if ($ext === 'pdf' && !$download) {
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . rawurlencode($filename) . '"');
    } else if ($ext === 'xls') {
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="' . rawurlencode($filename) . '"');
    }
    readfile($filePath);
    exit;
}

echo "BPAC API Ready";
