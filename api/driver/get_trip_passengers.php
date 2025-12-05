<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

if (!isset($_GET['schedule_id'])) {
    echo json_encode(["success" => false, "message" => "Schedule ID missing"]);
    exit;
}

$schedule_id = $conn->real_escape_string($_GET['schedule_id']);

// JOIN with 'payments' table to get Amount and Method
$sql = "SELECT 
            b.id as booking_id,
            b.status,
            b.payment_status,
            b.pickup_location,
            b.dropoff_location,
            a.name as passenger_name,
            p.amount,
            p.payment_method
        FROM bookings b
        JOIN accounts a ON b.user_id = a.id
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.driver_schedule_id = '$schedule_id'
        AND b.status != 'cancelled'";

$result = $conn->query($sql);

$passengers = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Fallback defaults if payment record is missing
        if(empty($row['payment_method'])) $row['payment_method'] = 'cash'; 
        if(empty($row['amount'])) $row['amount'] = '0.00'; 
        
        $passengers[] = $row;
    }
}

echo json_encode(["success" => true, "data" => $passengers]);
$conn->close();
?>