<?php
// api/admin/get_notifications.php

header('Content-Type: application/json');

// 1. Enable error reporting locally to see issues (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. Include the database connection
// Based on your folder structure, if this file is in api/admin/, 
// and db_connect.php is in api/, use ../db_connect.php
if (file_exists('../db_connect.php')) {
    require_once '../db_connect.php';
} elseif (file_exists('../../db_connect.php')) {
    require_once '../../db_connect.php'; // Fallback just in case
} else {
    echo json_encode(["success" => false, "message" => "Database file not found"]);
    exit;
}

// 3. Fetch Notifications
$sql = "SELECT id, message, type, is_read, DATE_FORMAT(created_at, '%b %d, %h:%i %p') as formatted_date 
        FROM notifications 
        ORDER BY created_at DESC 
        LIMIT 10";

$result = $conn->query($sql);

$data = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['id'],
            'message' => $row['message'],
            'type' => $row['type'],
            'is_read' => $row['is_read'],
            'created_at' => $row['formatted_date']
        ];
    }
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'Query Failed: ' . $conn->error]);
}

$conn->close();
?>