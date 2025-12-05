<?php
header('Content-Type: application/json');
require_once '../../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id) || empty($data->name) || empty($data->email)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

$id = $conn->real_escape_string($data->id);
$name = $conn->real_escape_string($data->name);
$email = $conn->real_escape_string($data->email);

// Check if email is taken by another user
$check = $conn->query("SELECT id FROM accounts WHERE email = '$email' AND id != '$id'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already in use"]);
    exit();
}

$sql = "UPDATE accounts SET name = '$name', email = '$email' WHERE id = '$id'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Profile updated"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>