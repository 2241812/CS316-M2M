<?php
// api/admin/get_pending_count.php
header('Content-Type: application/json');
require_once '../../db_connect.php'; // Adjust path if necessary

// Check for valid connection
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failure."]);
    exit();
}

// SQL to count all pending cancellation requests
$sql = "
    SELECT COUNT(id) AS pending_count
    FROM schedule_cancellation_requests
    WHERE status = 'pending'
";

$result = $conn->query($sql);

if ($result === FALSE) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "SQL Error: " . $conn->error]);
    exit();
}

$row = $result->fetch_assoc();
$pending_count = (int)$row['pending_count'];

echo json_encode([
    "success" => true,
    "pending_count" => $pending_count
]);

$conn->close();
?>