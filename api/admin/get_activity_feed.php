<?php
header('Content-Type: application/json');

if (file_exists('../db_connect.php')) {
    require_once '../db_connect.php';
} elseif (file_exists('../../db_connect.php')) {
    require_once '../../db_connect.php'; 
} else {
    echo json_encode(["success" => false, "message" => "Database file not found"]);
    exit;
}

$sql = "SELECT description, icon, DATE_FORMAT(created_at, '%h:%i %p') as time_display 
        FROM activity_logs 
        ORDER BY created_at DESC 
        LIMIT 10";

$result = $conn->query($sql);

$data = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'text' => $row['description'],
            'icon' => $row['icon'],
            'time' => $row['time_display']
        ];
    }
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'Query Failed']);
}

$conn->close();
?>