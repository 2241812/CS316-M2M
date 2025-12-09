<?php
// api/driver/request_cancellation.php
header('Content-Type: application/json'); // Ensure this is set for all responses
require_once '../db_connect.php'; 

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if the connection failed (optional, as db_connect.php should handle it)
if ($conn->connect_error) {
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Internal database connection error.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// 3. Get the raw POST data and decode
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Basic input validation
if (!isset($data['driver_id'], $data['reason']) || !is_numeric($data['driver_id']) || empty($data['reason'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing or invalid driver ID or cancellation reason.']);
    exit;
}

$driverId = (int)$data['driver_id'];
$reason = trim($data['reason']);

// Use transaction for reliable database operation
$conn->begin_transaction();

try {
    // 4. Find the next upcoming *scheduled* trip for the driver
    $sql_find_schedule = "
        SELECT id
        FROM driver_schedule
        WHERE driver_id = ?
        AND shift_date >= CURDATE()
        AND status = 'scheduled'
        ORDER BY shift_date ASC, start_time ASC
        LIMIT 1
    ";
    
    $stmt_find_schedule = $conn->prepare($sql_find_schedule);
    if (!$stmt_find_schedule) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt_find_schedule->bind_param('i', $driverId);
    $stmt_find_schedule->execute();
    $result_schedule = $stmt_find_schedule->get_result();
    $schedule = $result_schedule->fetch_assoc();
    $stmt_find_schedule->close();

    if (!$schedule) {
        $conn->rollback();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No future scheduled trip found for this driver to cancel.']);
        exit;
    }

    $scheduleId = $schedule['id'];

    // 5. Check for existing pending cancellation request for this trip
    // *** CORRECTED COLUMN NAME: schedule_id ***
    $sql_check_existing = "
        SELECT id
        FROM schedule_cancellation_requests
        WHERE schedule_id = ? 
        AND status = 'pending'
    ";
    $stmt_check_existing = $conn->prepare($sql_check_existing);
    if (!$stmt_check_existing) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt_check_existing->bind_param('i', $scheduleId);
    $stmt_check_existing->execute();
    $result_existing = $stmt_check_existing->get_result();
    
    if ($result_existing->num_rows > 0) {
        $stmt_check_existing->close();
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'A pending cancellation request for this trip already exists.']);
        exit;
    }
    $stmt_check_existing->close();


    // 6. Insert the new cancellation request into the dedicated table
    // *** CORRECTED COLUMN NAME: schedule_id ***
    $sql_insert_request = "
        INSERT INTO schedule_cancellation_requests
        (schedule_id, driver_id, reason, status)
        VALUES (?, ?, ?, 'pending')
    ";

    $stmt_insert = $conn->prepare($sql_insert_request);
    if (!$stmt_insert) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    // Bind parameters match the (schedule_id, driver_id, reason) order: (INT, INT, STRING)
    $stmt_insert->bind_param('iis', $scheduleId, $driverId, $reason); 
    $stmt_insert->execute();
    $stmt_insert->close();

    // 7. Commit the transaction
    $conn->commit();

    // 8. Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Cancellation request for Schedule ID ' . $scheduleId . ' submitted successfully. Awaiting admin approval.',
        'schedule_id' => $scheduleId
    ]);

} catch (Exception $e) {
    // 9. Rollback the transaction on error
    $conn->rollback();
    
    // Use the error message for debugging
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'An internal server error occurred: ' . $e->getMessage()]);
}

// Close the connection
$conn->close();
?>