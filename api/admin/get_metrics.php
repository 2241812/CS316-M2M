<?php
// api/admin/get_metrics.php
header('Content-Type: application/json');
require_once '../db_connect.php';

$response = [
    "bookings_today" => 0,
    "active_shuttles" => 0,
    "total_shuttles" => 0,
    "priority_count" => 0
];

// 1. Count Bookings Created Today
$sql = "SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE()";
$result = $conn->query($sql);
if ($row = $result->fetch_assoc()) {
    $response['bookings_today'] = $row['count'];
}

// 2. Count Active Shuttles (Status = 'in_progress')
$sql = "SELECT COUNT(*) as count FROM driver_schedule WHERE status = 'in_progress'";
$result = $conn->query($sql);
if ($row = $result->fetch_assoc()) {
    $response['active_shuttles'] = $row['count'];
}

// 3. Count Total Shuttles Registered
$sql = "SELECT COUNT(*) as count FROM shuttles";
$result = $conn->query($sql);
if ($row = $result->fetch_assoc()) {
    $response['total_shuttles'] = $row['count'];
}

// 4. Count 'Priority' Bookings
// (Currently using 'Pending' bookings as a proxy since we don't have a 'Faculty' role yet)
$sql = "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'";
$result = $conn->query($sql);
if ($row = $result->fetch_assoc()) {
    $response['priority_count'] = $row['count'];
}

echo json_encode(["success" => true, "data" => $response]);
$conn->close();
?>