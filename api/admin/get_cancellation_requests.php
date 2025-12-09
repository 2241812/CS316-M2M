<?php
// api/admin/get_cancellation_requests.php
header('Content-Type: application/json');
require_once '../db_connect.php'; // Adjust path if necessary

// Check for valid connection
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failure."]);
    exit();
}

// SQL to fetch all pending cancellation requests, joining necessary details
$sql = "
    SELECT
        cr.id AS request_id,
        cr.reason,
        cr.request_date,
        cr.schedule_id,
        cr.driver_id,
        a.name AS driver_name,
        a.email AS driver_email,
        ds.shift_date,
        ds.start_time,
        s.plate_number
    FROM
        schedule_cancellation_requests cr
    JOIN
        accounts a ON cr.driver_id = a.id
    JOIN
        driver_schedule ds ON cr.schedule_id = ds.id
    JOIN
        shuttles s ON ds.shuttle_id = s.id
    WHERE
        cr.status = 'pending'
    ORDER BY
        cr.request_date ASC
";

$result = $conn->query($sql);

if ($result === FALSE) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "SQL Error: " . $conn->error]);
    exit();
}

$requests = [];
while ($row = $result->fetch_assoc()) {
    $requests[] = $row;
}

echo json_encode([
    "success" => true,
    "requests" => $requests
]);

$conn->close();
?>