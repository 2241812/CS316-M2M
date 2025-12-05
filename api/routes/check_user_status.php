<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$user_id = $_GET['user_id'] ?? 0;

if(!$user_id) {
    echo json_encode(['has_active' => false]);
    exit;
}

$user_id = $conn->real_escape_string($user_id);

$sql = "SELECT b.id, b.status, r.name as route_name, ds.status as trip_status 
        FROM bookings b
        JOIN driver_schedule ds ON b.driver_schedule_id = ds.id
        JOIN shuttles s ON ds.shuttle_id = s.id
        JOIN routes r ON s.route_id = r.id
        WHERE b.user_id = '$user_id' 
        AND b.status IN ('pending', 'accepted')
        AND ds.status IN ('scheduled', 'in_progress')
        LIMIT 1";

$result = $conn->query($sql);

if($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'has_active' => true,
        'data' => $row
    ]);
} else {
    echo json_encode([
        'success' => true,
        'has_active' => false
    ]);
}

$conn->close();
?>