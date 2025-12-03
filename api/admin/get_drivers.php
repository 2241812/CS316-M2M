<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$drivers = [];
// Select all accounts that are drivers
$sql = "SELECT id, name, email FROM accounts WHERE role = 'driver' ORDER BY id DESC";
$result = $conn->query($sql);

while($row = $result->fetch_assoc()) {
    $drivers[] = $row;
}

echo json_encode(["success" => true, "data" => $drivers]);
$conn->close();
?>