<?php
header('Content-Type: application/json');
error_reporting(0);
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

    $activeCheck = "SELECT id FROM bookings 
                    WHERE user_id = '$user_id' 
                    AND status IN ('pending', 'accepted')";
    $activeResult = $conn->query($activeCheck);
    
    if ($activeResult && $activeResult->num_rows > 0) {
        throw new Exception("You currently have an active ride. Please complete or cancel it before booking a new one.");
    }

    $checkSql = "SELECT 
                    s.capacity,
                    ds.route_id, 
                    ds.shift_date, 
                    ds.start_time, 
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
    
    $route_id = $row['route_id'];
    $shift_date = $row['shift_date'];
    $start_time = $row['start_time'];

    // --- Determine Status and Payment ---
    $payment_status = ($method === 'cash') ? 'unpaid' : 'paid';
    $booking_status = ($method === 'cash') ? 'pending' : 'accepted';

    // --- Insert Booking ---
    $sql = "INSERT INTO bookings (user_id, driver_schedule_id, pickup_location, dropoff_location, status, payment_status)
            SELECT '$user_id', '$schedule_id', r.start_location, r.end_location, '$booking_status', '$payment_status'
            FROM driver_schedule ds
            JOIN shuttles s ON ds.shuttle_id = s.id
            JOIN routes r ON ds.route_id = r.id
            WHERE ds.id = '$schedule_id'";

    if ($conn->query($sql) === TRUE) {
        $booking_id = $conn->insert_id;

        // Record Payment
        $paySql = "INSERT INTO payments (booking_id, amount, payment_method) VALUES ('$booking_id', '$amount', '$method')";
        $conn->query($paySql);

        // --- Insert Booking Confirmation Notification ---
        $route_name_query = "SELECT name FROM routes WHERE id = '$route_id'";
        $route_result = $conn->query($route_name_query);
        $route_name = $route_result->fetch_assoc()['name'] ?? 'Your Booked Route';
        
        $formatted_time = date('h:i A', strtotime($start_time));
        $formatted_date = date('M d, Y', strtotime($shift_date));
        
        $notification_type = '';
        $message = '';

        if ($booking_status === 'accepted') {
            $message = "Booking Accepted! Your ride on the '{$route_name}' route on {$formatted_date} departing at {$formatted_time} is confirmed.";
            $notification_type = 'booking_accepted';
        } else { // status === 'pending' (Cash)
            $message = "Booking Pending! Your ride on the '{$route_name}' route on {$formatted_date} is pending payment. Please pay the driver upon boarding.";
            $notification_type = 'booking_pending';
        }

        $stmt_notif = $conn->prepare("INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, ?, 0)");
        $stmt_notif->bind_param("iss", $user_id, $message, $notification_type);
        $stmt_notif->execute();
        $stmt_notif->close();
        // --- END Notification Insertion ---

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