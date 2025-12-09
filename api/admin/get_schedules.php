<?php
// api/admin/get_schedules.php
header('Content-Type: application/json');
require_once '../db_connect.php'; // Path to db_connect.php

$schedules = [];

// Ensure 'driver_schedule' is used for the table name
$sql = "SELECT 
            s.id, 
            s.shift_date AS schedule_date,    
            s.start_time AS departure_time,  
            IFNULL(s.status, 'scheduled') AS status,
            IFNULL(r.name, 'N/A Route') as route_name,
            IFNULL(sh.plate_number, 'N/A Shuttle') as shuttle_plate,
            s.max_capacity as capacity,      
            IFNULL(a.name, 'N/A Driver') as driver_name
        FROM driver_schedule s           
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN shuttles sh ON s.shuttle_id = sh.id
        LEFT JOIN accounts a ON s.driver_id = a.id
        /* FIX: Removed 'AND a.role = 'driver'' to ensure matching drivers are returned. */
        ORDER BY s.shift_date DESC, s.start_time DESC";

$result = $conn->query($sql);

if ($result) {
    while($row = $result->fetch_assoc()) {
        $schedules[] = $row;
    }
    echo json_encode(["success" => true, "data" => $schedules]);
} else {
    http_response_code(500); 
    echo json_encode(["success" => false, "message" => "Schedule Query Error: " . $conn->error]);
}

$conn->close();
?>  