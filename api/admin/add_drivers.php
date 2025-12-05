<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->name) || empty($data->email) || empty($data->password)) {
    echo json_encode(["success" => false, "message" => "All fields required."]);
    exit();
}

$name = $conn->real_escape_string($data->name);
$email = $conn->real_escape_string($data->email);
// Hash the password for security
$password = password_hash($data->password, PASSWORD_DEFAULT); 
$role = 'driver';

// Check if email exists
$check = $conn->query("SELECT id FROM accounts WHERE email='$email'");
if($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already used."]);
    exit();
}

$sql = "INSERT INTO accounts (name, email, password, role) VALUES ('$name', '$email', '$password', '$role')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Driver added successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}
$log_sql = "INSERT INTO activity_logs (description, icon) VALUES ('Driver created', 'fa-user')";
$conn->query($log_sql);
$conn->close();
?>