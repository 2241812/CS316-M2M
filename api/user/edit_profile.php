<?php
// api/user/edit_profile.php
header('Content-Type: application/json');
require_once '../db_connect.php'; 

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

// Ensure the connection is actually valid after require_once
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    // This message is helpful if the connection parameters are wrong
    echo json_encode(["success" => false, "message" => "Database connection failure: " . $conn->connect_error]);
    exit();
}


$data = json_decode(file_get_contents("php://input"));

// Input validation
if (!isset($data->id, $data->name, $data->email)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields (id, name, email)"]);
    exit();
}

$id = $conn->real_escape_string($data->id);
$name = $conn->real_escape_string($data->name);
$email = $conn->real_escape_string($data->email);

// Basic email format validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit();
}

// 1. Check if the new email already exists for a *different* user
$check_email_sql = "SELECT id FROM accounts WHERE email = '$email' AND id != '$id'";
$email_result = $conn->query($check_email_sql);

if ($email_result === FALSE) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error during email check: " . $conn->error]);
    exit();
}

if ($email_result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "This email is already registered."]);
    exit();
}

// 2. Update the account
$update_sql = "
    UPDATE accounts 
    SET name = '$name', email = '$email'
    WHERE id = '$id'
";

if ($conn->query($update_sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Profile updated successfully."]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database update failed: " . $conn->error]);
}

$conn->close();
?>