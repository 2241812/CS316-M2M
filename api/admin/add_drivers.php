<?php
// api/admin/add_driver.php
header('Content-Type: application/json');

// Check for POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

// NOTE: Adjust the path to db_connect.php if necessary
require_once '../db_connect.php'; 

// Get and decode the JSON payload
$input = file_get_contents('php://input');
$data = json_decode($input);

$name = $data->name ?? '';
$email = $data->email ?? '';
$raw_password = $data->password ?? '';
$role = 'driver'; // Hardcoded role for drivers

// 1. Basic Validation
if (empty($name) || empty($email) || empty($raw_password)) {
    echo json_encode(["success" => false, "message" => "All fields (Name, Email, Password) are required."]);
    $conn->close();
    exit();
}

try {
    // 2. Hash the password for security
    $password_hash = password_hash($raw_password, PASSWORD_DEFAULT); 

    // 3. Check if email exists (using prepared statement)
    $check_sql = "SELECT id FROM accounts WHERE email = ? LIMIT 1";
    $check_stmt = $conn->prepare($check_sql);
    if (!$check_stmt) {
        throw new Exception("Email check preparation failed: " . $conn->error);
    }
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already used."]);
        $check_stmt->close();
        $conn->close();
        exit();
    }
    $check_stmt->close();

    // 4. Insert the new account (using prepared statement)
    $insert_sql = "INSERT INTO accounts (name, email, password, role) VALUES (?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);
    if (!$insert_stmt) {
        throw new Exception("Driver insert preparation failed: " . $conn->error);
    }
    
    // Bind parameters: ssss (4 strings)
    $insert_stmt->bind_param("ssss", $name, $email, $password_hash, $role);

    if ($insert_stmt->execute()) {
        $insert_stmt->close();
        
        // 5. Log the activity (optional, but good practice)
        $log_description = "New driver account created: " . $name . " (" . $email . ")";
        $log_icon = 'fa-user';
        $log_sql = "INSERT INTO activity_logs (description, icon) VALUES (?, ?)";
        $log_stmt = $conn->prepare($log_sql);
        if ($log_stmt) {
            $log_stmt->bind_param("ss", $log_description, $log_icon);
            $log_stmt->execute();
            $log_stmt->close();
        }
        
        echo json_encode(["success" => true, "message" => "Driver added successfully!"]);
    } else {
        $insert_stmt->close();
        throw new Exception("Error adding driver: " . $conn->error);
    }

} catch (Exception $e) {
    // Return error message on failure
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>