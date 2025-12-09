<?php
// api/admin/handle_cancellation_request.php
header('Content-Type: application/json');
require_once '../db_connect.php'; 

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

// Check for valid connection
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failure."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// Input validation
if (!isset($data->request_id, $data->action, $data->admin_notes)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields (request_id, action, admin_notes)"]);
    exit();
}

$request_id = (int)$data->request_id;
$action = $conn->real_escape_string($data->action); // 'approve' or 'reject'
$admin_notes = $conn->real_escape_string($data->admin_notes);

if ($action !== 'approve' && $action !== 'reject') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid action specified."]);
    exit();
}

// Start Transaction
$conn->begin_transaction();

try {
    // 1. Update the request status
    $status = ($action === 'approve') ? 'approved' : 'rejected';
    $update_request_sql = "
        UPDATE schedule_cancellation_requests
        SET status = ?, admin_notes = ?
        WHERE id = ?
    ";
    $stmt_request = $conn->prepare($update_request_sql);
    $stmt_request->bind_param("ssi", $status, $admin_notes, $request_id);
    $stmt_request->execute();
    
    // 2. If APPROVED, update the driver_schedule status to 'cancelled'
    if ($action === 'approve') {
        // Fetch the schedule ID associated with the request
        $schedule_id_sql = "SELECT schedule_id FROM schedule_cancellation_requests WHERE id = ?";
        $stmt_fetch_schedule = $conn->prepare($schedule_id_sql);
        $stmt_fetch_schedule->bind_param("i", $request_id);
        $stmt_fetch_schedule->execute();
        $schedule_result = $stmt_fetch_schedule->get_result();
        $row = $schedule_result->fetch_assoc();
        $schedule_id = $row['schedule_id'];
        $stmt_fetch_schedule->close();

        // Update driver_schedule
        $update_schedule_sql = "
            UPDATE driver_schedule
            SET status = 'cancelled'
            WHERE id = ?
        ";
        $stmt_schedule = $conn->prepare($update_schedule_sql);
        $stmt_schedule->bind_param("i", $schedule_id);
        $stmt_schedule->execute();
    }
    
    // Commit transaction
    $conn->commit();

    $response_message = ($action === 'approve') 
        ? "Trip cancellation approved and schedule status updated to 'cancelled'."
        : "Trip cancellation request rejected.";

    echo json_encode(["success" => true, "message" => $response_message]);

} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Transaction Failed: " . $e->getMessage()]);
}

$conn->close();
?>