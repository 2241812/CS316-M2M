<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->booking_id)) {
    echo json_encode(["success" => false, "message" => "Booking ID missing"]);
    exit;
}

$booking_id = $conn->real_escape_string($data->booking_id);

// Update status to accepted (confirmed) and payment to paid
$sql = "UPDATE bookings SET payment_status = 'paid', status = 'accepted' WHERE id = '$booking_id'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Payment verified successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
}
$log_sql = "INSERT INTO activity_logs (description, icon) VALUES ('Payement Verified', 'fa-calendar-plus')";
$conn->query($log_sql);
$conn->close();
?>