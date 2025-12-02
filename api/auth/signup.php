<?php
// api/auth/signup.php

// Include the database connection (Go up one folder level to find it)
require_once '../db_connect.php';

// 1. Get the raw POST data (JSON) from JavaScript
$data = json_decode(file_get_contents("php://input"));

// 2. Validate input
if (empty($data->name) || empty($data->email) || empty($data->password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
    exit();
}

// Sanitize inputs
$name = $conn->real_escape_string($data->name);
$email = $conn->real_escape_string($data->email);
$password = $data->password;
$role = 'user'; // Default role for new signups

// 3. Check if email already exists
$checkQuery = "SELECT id FROM accounts WHERE email = '$email'";
$result = $conn->query($checkQuery);

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered."]);
    exit();
}

// 4. Hash the password for security
// Note: We use password_hash() so we never store plain text passwords
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 5. Insert into Database
$sql = "INSERT INTO accounts (name, email, password, role) VALUES ('$name', '$email', '$hashed_password', '$role')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Account created successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>