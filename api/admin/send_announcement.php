<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

// Ensure the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}

// 1. Get the message from $_POST (sent via FormData in JS)
if (!isset($_POST['message']) || trim($_POST['message']) === '') {
    echo json_encode(["success" => false, "message" => "Message cannot be empty."]);
    exit();
}

$message = $conn->real_escape_string(trim($_POST['message']));

// 2. Insert into the database
// We use NOW() for the created_at timestamp
$sql = "INSERT INTO announcements (message, created_at) VALUES ('$message', NOW())";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Announcement posted."]);
} else {
    echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
}
$log_sql = "INSERT INTO activity_logs (description, icon) VALUES ('New Announcement created', 'fa-bullhorn')";
$conn->query($log_sql);

$conn->close();
?>