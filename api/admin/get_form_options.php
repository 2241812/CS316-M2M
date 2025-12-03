<?php
// api/admin/get_form_options.php
header('Content-Type: application/json');
require_once '../db_connect.php';

$response = [
    "routes" => [],
    "drivers" => [],
    "shuttles" => []
];

// 1. Get Routes
$route_sql = "SELECT id, name FROM routes";
$result = $conn->query($route_sql);
while($row = $result->fetch_assoc()) {
    $response['routes'][] = $row;
}

// 2. Get Drivers (Users with role 'driver')
$driver_sql = "SELECT id, name FROM accounts WHERE role = 'driver'";
$result = $conn->query($driver_sql);
while($row = $result->fetch_assoc()) {
    $response['drivers'][] = $row;
}

// 3. Get Shuttles
$shuttle_sql = "SELECT id, plate_number, capacity FROM shuttles";
$result = $conn->query($shuttle_sql);
while($row = $result->fetch_assoc()) {
    $response['shuttles'][] = $row;
}
echo json_encode(["success" => true, "data" => $response]);
$conn->close();
?>