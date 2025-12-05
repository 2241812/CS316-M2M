<?php
header('Content-Type: application/json');
error_reporting(0); // Suppress HTML errors to ensure JSON output
require_once '../db_connect.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->user_id) || empty($data->schedule_id) || empty($data->payment_method)) {
        throw new Exception("Missing required fields");
    }

    $user_id = $conn->real_escape_string($data->user_id);
    $schedule_id = $conn->real_escape_string($data->schedule_id);
    $passengers = intval($data->passengers ?? 1);
    $method = $conn->real_escape_string($data->payment_method);
    $amount = 25.00 * $passengers; 

    // --- NEW LOGIC: Prevent Double Booking ---
    $activeCheck = "SELECT id FROM bookings 
                    WHERE user_id = '$user_id' 
                    AND status IN ('pending', 'accepted')";
    $activeResult = $conn->query($activeCheck);
    
    if ($activeResult && $activeResult->num_rows > 0) {
        throw new Exception("You currently have an active ride. Please complete or cancel it before booking a new one.");
    }

    // --- Check Schedule Availability ---
    $checkSql = "SELECT 
                    s.capacity,
                    (SELECT COUNT(*) FROM bookings b WHERE b.driver_schedule_id = ds.id AND b.status != 'cancelled') as current_bookings
                 FROM driver_schedule ds
                 JOIN shuttles s ON ds.shuttle_id = s.id
                 WHERE ds.id = '$schedule_id'";

    $checkResult = $conn->query($checkSql);

    if (!$checkResult || $checkResult->num_rows === 0) {
        throw new Exception("Schedule not found or unavailable.");
    }

    $row = $checkResult->fetch_assoc();
    $available = $row['capacity'] - $row['current_bookings'];

    if ($available < $passengers) {
        throw new Exception("Not enough seats available.");
    }

    // --- Insert Booking ---
    $payment_status = ($method === 'cash') ? 'unpaid' : 'paid';
    $booking_status = ($method === 'cash') ? 'pending' : 'accepted';

 $sql = "INSERT INTO bookings (user_id, driver_schedule_id, pickup_location, dropoff_location, status, payment_status)
            SELECT '$user_id', '$schedule_id', r.start_location, r.end_location, '$booking_status', '$payment_status'
            FROM driver_schedule ds
            JOIN shuttles s ON ds.shuttle_id = s.id
            JOIN routes r ON ds.route_id = r.id  /* <--- CHANGED THIS LINE */
            WHERE ds.id = '$schedule_id'";

    if ($conn->query($sql) === TRUE) {
        $booking_id = $conn->insert_id;

        // Record Payment
        $paySql = "INSERT INTO payments (booking_id, amount, payment_method) VALUES ('$booking_id', '$amount', '$method')";
        $conn->query($paySql);

        echo json_encode([
            "success" => true, 
            "booking_id" => $booking_id,
            "ticket_status" => $booking_status
        ]);
    } else {
        throw new Exception("Database Error: " . $conn->error);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>