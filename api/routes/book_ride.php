<?php
// api/routes/book_ride.php

header('Content-Type: application/json');
require_once '../db_connect.php';

// 1. Get the POST data from JavaScript
$data = json_decode(file_get_contents("php://input"));

// 2. Validate Inputs
if (empty($data->user_id) || empty($data->route_start) || empty($data->route_end)) {
    echo json_encode(["success" => false, "message" => "Missing booking details."]);
    exit();
}

$user_id = $conn->real_escape_string($data->user_id);
$pickup = $conn->real_escape_string($data->route_start);
$dropoff = $conn->real_escape_string($data->route_end);
// Passenger count is not in your current SQL 'bookings' table, so we skip saving it for now
// or you can add a column 'passengers' to the table later.

// 3. Find an Active Schedule to link this booking to
// We grab the first available schedule for today or future
$schedule_query = "SELECT id FROM driver_schedule WHERE status = 'scheduled' OR status = 'in_progress' LIMIT 1";
$schedule_result = $conn->query($schedule_query);

if ($schedule_result && $schedule_result->num_rows > 0) {
    $schedule = $schedule_result->fetch_assoc();
    $schedule_id = $schedule['id'];
} else {
    // Fallback: If no schedule exists, we can't book
    echo json_encode(["success" => false, "message" => "No shuttles are currently scheduled."]);
    exit();
}

// 4. Insert the Booking
$sql = "INSERT INTO bookings (user_id, driver_schedule_id, pickup_location, dropoff_location, status, payment_status) 
        VALUES ('$user_id', '$schedule_id', '$pickup', '$dropoff', 'pending', 'unpaid')";

if ($conn->query($sql) === TRUE) {
    echo json_encode([
        "success" => true, 
        "message" => "Booking confirmed!",
        "booking_id" => $conn->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Database Error: " . $conn->error
    ]);
}

$conn->close();
?>