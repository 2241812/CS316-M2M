<?php
header('Content-Type: application/json');
require_once '../../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id) || empty($data->current_password) || empty($data->new_password)) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit();
}

$id = $conn->real_escape_string($data->id);
$current_pass = $data->current_password;
$new_pass = $data->new_password;

// 1. Get current password hash
$result = $conn->query("SELECT password FROM accounts WHERE id = '$id'");
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
}

$row = $result->fetch_assoc();
$hash = $row['password'];

// 2. Verify current password
// Note: Checks hash OR plain text (for legacy/demo support)
if (password_verify($current_pass, $hash) || $current_pass === $hash) {
    
    // 3. Update with NEW HASH
    $new_hash = password_hash($new_pass, PASSWORD_DEFAULT);
    $update = "UPDATE accounts SET password = '$new_hash' WHERE id = '$id'";
    
    if ($conn->query($update) === TRUE) {
        echo json_encode(["success" => true, "message" => "Password changed"]);
    } else {
        echo json_encode(["success" => false, "message" => "DB Error"]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Incorrect current password"]);
}

$conn->close();
?>