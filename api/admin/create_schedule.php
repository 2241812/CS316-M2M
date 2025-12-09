<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

require_once '../db_connect.php'; 

// 1. Get and decode the JSON payload
$input = file_get_contents('php://input');
$data = json_decode($input);

// 2. Define variables using the CORRECT keys from your JavaScript payload:
//    JS uses 'shift_date' and 'start_time', not 'date' and 'time'.
$driver_id = $data->driver_id ?? null;
$shuttle_id = $data->shuttle_id ?? null;
$route_id = $data->route_id ?? null;
$shift_date = $data->shift_date ?? null; 
$start_time = $data->start_time ?? null; 

// 3. Validation
if (empty($driver_id) || empty($shuttle_id) || empty($route_id) || empty($shift_date) || empty($start_time)) {
    echo json_encode(["success" => false, "message" => "All fields (Driver, Shuttle, Route, Date, Time) are required."]);
    $conn->close();
    exit();
}

try {
    // --- 4. SECURELY Check for existing schedule using PREPARED STATEMENT ---
    $check_sql = "SELECT id FROM driver_schedule WHERE driver_id = ? AND shift_date = ? AND start_time = ?";
    $check_stmt = $conn->prepare($check_sql);
    
    // Bind parameters: i=integer (driver_id), s=string (shift_date), s=string (start_time)
    $check_stmt->bind_param("iss", $driver_id, $shift_date, $start_time); 
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows > 0) {
        $check_stmt->close();
        throw new Exception("Driver is already scheduled for this exact time and date.");
    }
    $check_stmt->close();

    // --- 5. SECURELY Insert new schedule using PREPARED STATEMENT ---
    $insert_sql = "INSERT INTO driver_schedule (driver_id, shuttle_id, route_id, shift_date, start_time, status) 
                   VALUES (?, ?, ?, ?, ?, 'scheduled')";
    $insert_stmt = $conn->prepare($insert_sql);
    $status = 'scheduled';

    // Bind parameters: i=int, i=int, i=int, s=string, s=string
    $insert_stmt->bind_param("iiiss", $driver_id, $shuttle_id, $route_id, $shift_date, $start_time);

    if (!$insert_stmt->execute()) {
        throw new Exception("Database Error on Insertion: " . $insert_stmt->error);
    }
    $insert_stmt->close();
    
    // 6. Schedule Insertion SUCCESS - Run Log and Notification

    // Log the activity (using prepared statement for safety)
    $log_desc = "Created schedule for Driver #{$driver_id} on {$shift_date} at {$start_time}";
    $log_icon = 'fa-calendar-plus';
    $log_sql = "INSERT INTO activity_logs (description, icon) VALUES (?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    if ($log_stmt) {
        $log_stmt->bind_param("ss", $log_desc, $log_icon);
        $log_stmt->execute();
        $log_stmt->close();
    }
    
    // Notification Logic (No longer causes error as $shift_date and $start_time are defined)
    $formatted_date = date('M d', strtotime($shift_date));
    $formatted_time = date('h:i A', strtotime($start_time));
    $notification_message = "You have been assigned a new schedule on {$formatted_date} at {$formatted_time}.";

    $notification_sql = "INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, 'new_schedule', 0)";
    $notif_stmt = $conn->prepare($notification_sql);
    if ($notif_stmt) {
        $notif_stmt->bind_param("is", $driver_id, $notification_message);
        $notif_stmt->execute();
        $notif_stmt->close();
    }
    
    // Final Success Response
    echo json_encode(["success" => true, "message" => "Schedule created successfully."]);

} catch (Exception $e) {
    // Return error message on failure
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>