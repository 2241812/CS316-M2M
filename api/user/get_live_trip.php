<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false]);
    exit;
}

$sql = "SELECT 
            ds.status as trip_status,
            r.name as route_name,
            s.plate_number,
            ds.id as schedule_id
        FROM bookings b
        JOIN driver_schedule ds ON b.driver_schedule_id = ds.id
        JOIN shuttles s ON ds.shuttle_id = s.id
        LEFT JOIN routes r ON s.route_id = r.id
        WHERE b.user_id = ? 
        AND b.status = 'accepted'
        AND ds.status = 'in_progress'
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'No active trips']);
}

$stmt->close();
$conn->close();
?>