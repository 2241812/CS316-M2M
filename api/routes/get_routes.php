<?php
// api/routes/get_routes.php

header('Content-Type: application/json');
require_once '../db_connect.php';

// 1. Get the first active route
// We select specific columns including the new coordinates we added
$sql = "SELECT id, name, start_location, end_location, start_lat, start_lng, end_lat, end_lng FROM routes LIMIT 1";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $route = $result->fetch_assoc();
    
    // 2. Return data as JSON
    echo json_encode([
        "success" => true,
        "data" => $route
    ]);
} else {
    // If table is empty
    echo json_encode([
        "success" => false,
        "message" => "No routes found. Please check database."
    ]);
}

$conn->close();
?>