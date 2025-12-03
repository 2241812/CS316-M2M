<?php
// api/routes/book_ride.php

header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->user_id) || empty($data->route_start) || empty($data->route_end)) {
    echo json_encode(["success" => false, "message" => "Missing booking details."]);
    exit();
}

$user_id = $conn->real_escape_string($data->user_id);
$pickup = $conn->real_escape_string($data->route_start);
$dropoff = $conn->real_escape_string($data->route_end);

$target_route_id = (strpos($pickup, 'Main') !== false) ? 1 : 2;

$schedule_query = "
    SELECT ds.id 
    FROM driver_schedule ds
    JOIN shuttles s ON ds.shuttle_id = s.id
    WHERE s.route_id = '$target_route_id' 
    AND (ds.status = 'scheduled' OR ds.status = 'in_progress')
    LIMIT 1
";

$schedule_result = $conn->query($schedule_query);

if ($schedule_result && $schedule_result->num_rows > 0) {
    $schedule = $schedule_result->fetch_assoc();
    $schedule_id = $schedule['id'];
} else {
    echo json_encode(["success" => false, "message" => "No shuttles found for this direction."]);
    exit();
}

$sql = "INSERT INTO bookings (user_id, driver_schedule_id, pickup_location, dropoff_location, status, payment_status) 
        VALUES ('$user_id', '$schedule_id', '$pickup', '$dropoff', 'pending', 'unpaid')";

if ($conn->query($sql) === TRUE) {
    $booking_id = $conn->insert_id;

    $notif_msg = "New Booking #" . $booking_id . " from " . $pickup;
    $notif_sql = "INSERT INTO notifications (message, type) VALUES ('$notif_msg', 'booking')";
    $conn->query($notif_sql);

    echo json_encode([
        "success" => true, 
        "message" => "Booking confirmed!",
        "booking_id" => $booking_id
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Database Error: " . $conn->error
    ]);
}

$conn->close();
?>