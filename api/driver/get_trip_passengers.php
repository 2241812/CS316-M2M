<?php
header('Content-Type: application/json');
require_once '../db_connect.php'; // Adjust path if necessary

// Check for required ID parameter
if (!isset($_GET['schedule_id']) || !is_numeric($_GET['schedule_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing or invalid schedule ID."]);
    exit();
}

// Check for valid connection
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failure."]);
    exit();
}

$scheduleId = $conn->real_escape_string($_GET['schedule_id']);

// SQL to fetch passengers for a specific schedule
$sql = "
    SELECT
        b.id AS booking_id,
        a.name AS user_name,
        a.email AS user_email,
        b.booking_status
    FROM
        bookings b
    JOIN
        accounts a ON b.account_id = a.id
    WHERE
        -- *** FIX APPLIED HERE *** (Using schedule_id)
        b.schedule_id = ?
    ORDER BY
        b.booking_status DESC, a.name ASC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("i", $scheduleId);
$stmt->execute();
$result = $stmt->get_result();

$passengers = [];
while ($row = $result->fetch_assoc()) {
    $passengers[] = $row;
}

echo json_encode([
    "success" => true,
    "passengers" => $passengers
]);

$stmt->close();
$conn->close();
?>