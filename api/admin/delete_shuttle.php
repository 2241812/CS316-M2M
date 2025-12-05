<?php
// api/admin/delete_shuttle.php
header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) {
    echo json_encode(["success" => false, "message" => "No ID provided."]);
    exit();
}

$id = $conn->real_escape_string($data->id);

// Optional: Check if this shuttle is currently scheduled?
// For now, we just delete it. 
$sql = "DELETE FROM shuttles WHERE id = '$id'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Shuttle deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}
$log_sql = "INSERT INTO activity_logs (description, icon) VALUES ('Shuttle Deleted, 'fa-bus')";
$conn->query($log_sql);
$conn->close();
?>