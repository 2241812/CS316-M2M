<?php
require_once __DIR__ . '../db_connect.php'; 

$tomorrow_date = date('Y-m-d', strtotime('+1 day'));
$today_datetime = date('Y-m-d H:i:s');

$sql = "
    SELECT 
        b.id AS booking_id,
        b.user_id, 
        r.name AS route_name,
        TIME_FORMAT(ds.start_time, '%h:%i %p') AS formatted_time
    FROM 
        bookings b
    JOIN 
        driver_schedule ds ON b.driver_schedule_id = ds.id
    JOIN 
        routes r ON ds.route_id = r.id
    WHERE 
        ds.shift_date = ?
        AND b.reminder_sent = 0 
        AND b.status = 'accepted' 
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tomorrow_date);
$stmt->execute();
$result = $stmt->get_result();

$reminder_messages = [];
$booking_ids_to_update = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $user_id = $row['user_id'];
        $message = "🔔 Reminder! Your ride on the '{$row['route_name']}' route departs tomorrow at {$row['formatted_time']}.";
        $type = 'booking_reminder';
        
        $reminder_messages[] = "({$user_id}, '" . $conn->real_escape_string($message) . "', '{$type}', 0, '{$today_datetime}')";
        $booking_ids_to_update[] = $row['booking_id'];
    }
}
$stmt->close();

if (!empty($reminder_messages)) {
    $values = implode(', ', $reminder_messages);
    
    $insert_sql = "
        INSERT INTO notifications (user_id, message, type, is_read, created_at) 
        VALUES {$values}
    ";
    
    if ($conn->query($insert_sql)) {
        $update_ids = implode(',', $booking_ids_to_update);
        $conn->query("UPDATE bookings SET reminder_sent = 1 WHERE id IN ({$update_ids})");
        echo "Successfully sent " . count($booking_ids_to_update) . " reminders.";
    } else {
        error_log("Failed to insert reminders: " . $conn->error);
    }
} else {
    echo "No reminders to send for {$tomorrow_date}.";
}

$conn->close();
?>