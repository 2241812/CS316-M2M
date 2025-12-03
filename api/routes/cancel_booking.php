<?php
// api/routes/cancel_booking.php
header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->booking_id)) {
    echo json_encode(["success" => false, "message" => "No booking ID provided."]);
    exit();
}

$booking_id = $conn->real_escape_string($data->booking_id);

// Update status to 'cancelled'
$sql = "UPDATE bookings SET status = 'cancelled' WHERE id = '$booking_id'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Booking cancelled."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>