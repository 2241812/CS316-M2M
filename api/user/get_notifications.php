<?php
header('Content-Type: application/json');

// 1. Include the database connection - Robust Path Check
$db_connect_path = '../db_connect.php'; 
if (!file_exists($db_connect_path)) {
    $db_connect_path = '../../db_connect.php'; 
}

if (file_exists($db_connect_path)) {
    require_once $db_connect_path;
} else {
    echo json_encode(["success" => false, "message" => "FATAL: Database connection file not found."]);
    exit;
}

// 2. Get the user ID from the request
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID is required.']);
    $conn->close();
    exit;
}

$sql = "
    SELECT 
        id, message, type, is_read, created_at 
    FROM notifications 
    WHERE user_id = ?
    ORDER BY created_at DESC 
    LIMIT 10
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    // Report SQL syntax/schema errors
    echo json_encode(['success' => false, 'message' => 'SQL Prepare failed: ' . $conn->error]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    // Report execution errors
    echo json_encode(['success' => false, 'message' => 'SQL Execute failed: ' . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();
$data = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['id'],
            'message' => $row['message'],
            'type' => $row['type'] ?? 'info',
            'is_read' => (int)($row['is_read'] ?? 0), 
            'created_at' => date('M d, h:i A', strtotime($row['created_at']))
        ];
    }
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'No results found.']);
}

$stmt->close();
$conn->close();
?>