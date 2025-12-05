<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->driver_id) || empty($data->shuttle_id) || empty($data->route_id) || empty($data->date) || empty($data->time)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit();
}

$driver_id = $conn->real_escape_string($data->driver_id);
$shuttle_id = $conn->real_escape_string($data->shuttle_id);
$route_id = $conn->real_escape_string($data->route_id); // NEW: Get Route ID
$date = $conn->real_escape_string($data->date);
$time = $conn->real_escape_string($data->time);

// Validate: Driver cannot have two shifts at the exact same time
$check = $conn->query("SELECT id FROM driver_schedule WHERE driver_id = '$driver_id' AND shift_date = '$date' AND start_time = '$time'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Driver is already scheduled for this time."]);
    exit();
}

// Insert with route_id
$sql = "INSERT INTO driver_schedule (driver_id, shuttle_id, route_id, shift_date, start_time, status) 
        VALUES ('$driver_id', '$shuttle_id', '$route_id', '$date', '$time', 'scheduled')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Schedule created successfully."]);
    
    // Log it
    $log_desc = "Created schedule for Driver #$driver_id on $date";
    $conn->query("INSERT INTO activity_logs (description, icon) VALUES ('$log_desc', 'fa-calendar-plus')");
} else {
    echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
}

$conn->close();
?>