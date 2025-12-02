<?php
// api/db_connect.php

// 1. Allow access from any origin (good for development)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2. Handle preflight requests (Browser checks)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Database Credentials
$servername = "localhost";
$username = "root";      // Default WAMP/XAMPP user
$password = "";          // Default is usually empty
$dbname = "shuttle_db";

// 4. Create Connection
$conn = new mysqli($servername, $username, $password, $dbname);

// 5. Check Connection
if ($conn->connect_error) {
    // Return JSON error if connection fails
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
}
?>