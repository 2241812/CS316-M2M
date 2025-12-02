<?php
// api/auth/login.php

require_once '../db_connect.php';

// 1. Get POST data
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    echo json_encode(["success" => false, "message" => "Please enter email and password."]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$password = $data->password;

// 2. Fetch user by email
$sql = "SELECT id, name, email, password, role FROM accounts WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // 3. Verify Password
    // Check if password matches the hash OR matches plain text (for legacy/demo data support)
    if (password_verify($password, $user['password']) || $password === $user['password']) {
        
        // Remove password from response for security
        unset($user['password']);

        echo json_encode([
            "success" => true, 
            "message" => "Login successful",
            "user" => $user // Send user info back to JS
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$conn->close();
?>