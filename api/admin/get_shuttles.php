<?php
// api/admin/get_shuttles.php
header('Content-Type: application/json');
require_once '../db_connect.php';

$shuttles = [];

// We use a LEFT JOIN so we still get the shuttle even if it hasn't been assigned a route yet.
$sql = "SELECT s.id, s.plate_number, s.capacity, r.name as route_name 
        FROM shuttles s 
        LEFT JOIN routes r ON s.route_id = r.id 
        ORDER BY s.id DESC";

$result = $conn->query($sql);

if ($result) {
    while($row = $result->fetch_assoc()) {
        $shuttles[] = $row;
    }
    echo json_encode(["success" => true, "data" => $shuttles]);
} else {
    echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
}

$conn->close();
?>