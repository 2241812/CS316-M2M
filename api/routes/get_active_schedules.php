<?php
header('Content-Type: application/json');

// FIX: Corrected path from '../../' to '../'
require_once '../db_connect.php';

// Fetch all schedules that are scheduled, in_progress, or delayed
// We join with shuttles and routes to get details
// We also use a subquery to count how many 'accepted' or 'pending' bookings exist for each schedule
$sql = "SELECT 
            ds.id as schedule_id,
            ds.start_time,
            ds.shift_date,
            s.plate_number,
            s.capacity,
            r.id as route_id,
            r.name as route_name,
            r.start_location,
            r.end_location,
            r.start_lat,
            r.start_lng,
            r.end_lat,
            r.end_lng,
            (SELECT COUNT(*) FROM bookings b WHERE b.driver_schedule_id = ds.id AND b.status IN ('pending', 'accepted')) as booked_seats
        FROM driver_schedule ds
        JOIN shuttles s ON ds.shuttle_id = s.id
        JOIN routes r ON s.route_id = r.id
        WHERE ds.status IN ('scheduled', 'in_progress', 'delayed')
        AND ds.shift_date >= CURDATE()
        ORDER BY ds.start_time ASC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
    exit();
}

$schedules = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        // Calculate available seats
        $row['available_seats'] = $row['capacity'] - $row['booked_seats'];
        
        // Format time
        $row['formatted_time'] = date('g:i A', strtotime($row['start_time']));
        
        $schedules[] = $row;
    }
}

echo json_encode(["success" => true, "data" => $schedules]);
$conn->close();
?>