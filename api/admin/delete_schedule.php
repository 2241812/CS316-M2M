<?php
// api/admin/delete_schedule.php
header('Content-Type: application/json');

// NOTE: Adjust the path to db_connect.php if necessary (it should be relative to this file)
require_once '../db_connect.php'; 

// Check for POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

try {
    // 1. Get and decode the JSON payload
    $input = file_get_contents('php://input');
    $data = json_decode($input);

    // 2. Validate input
    if (!isset($data->id) || !is_numeric($data->id)) {
        throw new Exception("Invalid or missing schedule ID.");
    }
    
    $schedule_id = (int)$data->id;

    // 3. Prepare the DELETE statement
    // Using prepared statements is the safest way to prevent SQL injection.
    $sql = "DELETE FROM driver_schedule WHERE id = ?";
    
    // Prepare statement
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }
    
    // Bind the schedule ID parameter (i = integer)
    $stmt->bind_param("i", $schedule_id);
    
    // 4. Execute the statement
    if ($stmt->execute()) {
        
        // 5. Check if a row was actually deleted
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true, 
                "message" => "Schedule ID: {$schedule_id} successfully deleted."
            ]);
        } else {
            // This happens if the ID exists but the record was already deleted, or ID is invalid.
            http_response_code(404); // Not Found
            throw new Exception("No schedule found with ID: {$schedule_id} to delete.");
        }
        
    } else {
        throw new Exception("Database execution error: " . $stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    // Return error message
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>