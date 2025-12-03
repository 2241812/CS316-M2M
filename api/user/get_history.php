<?php
// api/user/get_history.php
header('Content-Type: application/json');
require_once '../db_connect.php';

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit();
}

$user_id = $conn->real_escape_string($_GET['user_id']);

// UPDATED SQL: Joins with driver_schedule to get the REAL bus time
$sql = "SELECT 
            b.id, 
            b.pickup_location, 
            b.dropoff_location, 
            b.status, 
            b.created_at,
            s.shift_date, 
            s.start_time 
        FROM bookings b
        JOIN driver_schedule s ON b.driver_schedule_id = s.id
        WHERE b.user_id = '$user_id'
        ORDER BY s.shift_date DESC, s.start_time DESC";

$result = $conn->query($sql);

$upcoming = [];
$past = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Format the date and time nicely for the frontend
        $row['formatted_date'] = date('M d, Y', strtotime($row['shift_date']));
        $row['formatted_time'] = date('g:i A', strtotime($row['start_time']));

        if ($row['status'] == 'pending' || $row['status'] == 'accepted') {
            $upcoming[] = $row;
        } else {
            $past[] = $row;
        }
    }
}

echo json_encode([
    "success" => true,
    "upcoming" => $upcoming,
    "past" => $past
]);

$conn->close();
?>