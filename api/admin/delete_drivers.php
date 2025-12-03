<?php
// api/admin/delete_driver.php
header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) {
    echo json_encode(["success" => false, "message" => "No ID provided."]);
    exit();
}

$id = $conn->real_escape_string($data->id);

// Delete the account (Only if role is driver, just to be safe)
$sql = "DELETE FROM accounts WHERE id = '$id' AND role = 'driver'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Driver account deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>