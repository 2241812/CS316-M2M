<?php
// api/driver/get_profile.php
header('Content-Type: application/json');
// FIX: Changed path from ../../../ to ../
require_once '../db_connect.php'; 

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing or invalid driver ID."]);
    exit();
}

$driverId = $conn->real_escape_string($_GET['id']);

// Query to get account info, driver details, and assigned shuttle details (LEFT JOIN handles unassigned shuttles)
$sql = "
    SELECT
        a.name, 
        a.email,
        d.license_number,
        d.contact_number,
        s.plate_number,
        s.capacity,
        s.model_type
    FROM 
        accounts a
    JOIN 
        drivers d ON a.id = d.account_id
    LEFT JOIN 
        shuttles s ON d.shuttle_id = s.id
    WHERE 
        a.id = '$driverId' AND a.role = 'driver'
";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();

    // The query returns NULL for shuttle fields if shuttle_id is NULL
    $vehicleInfo = [
        'plate_number' => $row['plate_number'] ?? 'N/A',
        'capacity' => $row['capacity'] ?? 'N/A',
        'model_type' => $row['model_type'] ?? 'N/A'
    ];
    
    $driverInfo = [
        'name' => $row['name'],
        'email' => $row['email'],
        'license_number' => $row['license_number'],
        'contact_number' => $row['contact_number'],
    ];

    echo json_encode([
        "success" => true,
        "driver_info" => $driverInfo,
        "vehicle_info" => $vehicleInfo
    ]);

} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Driver account not found or role is incorrect."]);
}

$conn->close();
?>