<?php
// api/user/update_payment.php
header('Content-Type: application/json');
require_once '../db_connect.php'; 

try {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->booking_id) || empty($data->payment_method)) {
        throw new Exception("Missing required booking ID or payment method.");
    }

    $booking_id = $conn->real_escape_string($data->booking_id);
    $method = $conn->real_escape_string($data->payment_method); // Not strictly needed for the update, but good practice

    // 1. UPDATE the status in the 'bookings' table
    $updateSql = "UPDATE bookings SET 
                    status = 'accepted', 
                    payment_status = 'paid' 
                  WHERE id = '$booking_id' 
                  AND payment_status = 'unpaid'";

    if ($conn->query($updateSql) === TRUE) {
        if ($conn->affected_rows > 0) {
            // Optional: Insert a payment record for history/logging
            $amount = 25.00; // Use a default amount if not passed
            $paySql = "INSERT INTO payments (booking_id, amount, payment_method) VALUES ('$booking_id', '$amount', '$method')";
            $conn->query($paySql); 

            echo json_encode([
                "success" => true, 
                "message" => "Booking {$booking_id} status updated to Paid/Accepted."
            ]);
        } else {
            throw new Exception("Booking already paid or not found.");
        }
    } else {
        throw new Exception("Database Error: " . $conn->error);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>