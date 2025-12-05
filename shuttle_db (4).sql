-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 05, 2025 at 05:18 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shuttle_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','driver','admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(5, 'renzo', 'renzoj156@gmail.com', '$2y$10$S4yzI73Lry4PEmpH4xu.au4su1Uw/YacziPloXqpZDG6ClI/ywEge', 'admin', '2025-12-03 13:31:35', '2025-12-03 14:43:11'),
(8, 'Lmao', 'lmao@lmao.com', '$2y$10$2yL5xIC5cEjbanPYOIU.fO5pMqh4RTkTfMuOkSp4xZSR/4rUlcWFm', 'user', '2025-12-05 12:22:00', '2025-12-05 12:22:00'),
(4, 'asd', 'asd@asd.com', '123123123', 'admin', '2025-12-03 13:00:10', '2025-12-03 17:16:14'),
(6, 'Driver Michael', 'driver.mike@gmail.com', 'password123', 'driver', '2025-12-03 15:00:18', '2025-12-03 15:00:18'),
(7, 'Rezo', 'wawt@wawt.com', '$2y$10$BR02pAo1iWqUCCjV/blkLubKAIR.RdsTM1Y1hBUShUoGnhpazS1z2', 'user', '2025-12-03 16:04:58', '2025-12-03 16:04:58');

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `icon` varchar(50) DEFAULT 'fa-info-circle',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `description`, `icon`, `created_at`) VALUES
(1, 'New schedule created', 'fa-calendar-plus', '2025-12-06 00:33:12'),
(2, 'New schedule created', 'fa-calendar-plus', '2025-12-06 00:33:53'),
(3, 'New Announcement created', 'fa-bullhorn', '2025-12-06 00:37:44'),
(4, 'Created schedule for Driver #6 on 2025-12-12', 'fa-calendar-plus', '2025-12-06 00:52:42'),
(5, 'Created schedule for Driver #6 on 2025-12-06', 'fa-calendar-plus', '2025-12-06 00:53:51'),
(6, 'Created schedule for Driver #6 on 2025-12-06', 'fa-calendar-plus', '2025-12-06 00:59:47'),
(7, 'Payement Verified', 'fa-calendar-plus', '2025-12-06 01:02:12'),
(8, 'Created schedule for Driver #6 on 2025-12-06', 'fa-calendar-plus', '2025-12-06 01:02:45'),
(9, 'Created schedule for Driver #6 on 2025-12-06', 'fa-calendar-plus', '2025-12-06 01:05:09'),
(10, 'Created schedule for Driver #6 on 2025-12-06', 'fa-calendar-plus', '2025-12-06 01:06:05');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `message`, `created_at`) VALUES
(1, 'wawaw', '2025-12-06 00:26:39'),
(2, 'wawawawa', '2025-12-06 00:29:57'),
(3, 'wawaw', '2025-12-06 00:33:53'),
(4, 'waw', '2025-12-06 00:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `driver_schedule_id` int NOT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `dropoff_location` varchar(255) NOT NULL,
  `status` enum('pending','accepted','cancelled','completed') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`driver_schedule_id`),
  KEY `driver_schedule_id` (`driver_schedule_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `driver_schedule_id`, `pickup_location`, `dropoff_location`, `status`, `payment_status`, `created_at`, `updated_at`) VALUES
(15, 7, 35, 'SLU Main', 'SLU Maryheights', 'accepted', 'paid', '2025-12-05 17:05:24', '2025-12-05 17:05:24');

-- --------------------------------------------------------

--
-- Table structure for table `driver_schedule`
--

DROP TABLE IF EXISTS `driver_schedule`;
CREATE TABLE IF NOT EXISTS `driver_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int NOT NULL,
  `shuttle_id` int NOT NULL,
  `route_id` int NOT NULL,
  `shift_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_capacity` int NOT NULL DEFAULT '0',
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `driver_id` (`driver_id`,`shift_date`,`start_time`),
  KEY `shuttle_id` (`shuttle_id`)
) ENGINE=MyISAM AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `driver_schedule`
--

INSERT INTO `driver_schedule` (`id`, `driver_id`, `shuttle_id`, `route_id`, `shift_date`, `start_time`, `end_time`, `max_capacity`, `status`, `created_at`, `updated_at`) VALUES
(36, 6, 2, 8, '2025-12-06', '01:09:00', '00:00:00', 0, 'completed', '2025-12-05 17:06:05', '2025-12-05 17:11:21'),
(35, 6, 1, 7, '2025-12-06', '01:06:00', '00:00:00', 0, 'completed', '2025-12-05 17:05:09', '2025-12-05 17:05:41');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `message`, `type`, `is_read`, `created_at`) VALUES
(51, 'Trip completed by Driver Michael', 'info', 0, '2025-12-05 17:11:21'),
(50, 'Trip started by Driver Michael', 'info', 0, '2025-12-05 17:11:20'),
(49, 'Trip completed by Driver Michael', 'info', 0, '2025-12-05 17:05:41'),
(48, 'Trip started by Driver Michael', 'info', 0, '2025-12-05 17:05:33');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `amount`, `payment_date`, `payment_method`, `created_at`) VALUES
(12, 15, 25.00, '2025-12-05 17:05:24', 'online', '2025-12-05 17:05:24');

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
CREATE TABLE IF NOT EXISTS `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `start_location` varchar(255) NOT NULL,
  `end_location` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `start_lat` decimal(10,8) DEFAULT '16.41639000',
  `start_lng` decimal(11,8) DEFAULT '120.59333000',
  `end_lat` decimal(10,8) DEFAULT '16.35777000',
  `end_lng` decimal(11,8) DEFAULT '120.61111000',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `routes`
--

INSERT INTO `routes` (`id`, `name`, `start_location`, `end_location`, `created_at`, `updated_at`, `start_lat`, `start_lng`, `end_lat`, `end_lng`) VALUES
(8, 'Maryheights to Main', 'SLU Maryheights', 'SLU Main Campus', '2025-12-05 16:50:54', '2025-12-05 17:17:05', 16.41902033, 120.59711843, 16.38352089, 120.59243251),
(7, 'Main to Maryheights', 'SLU Main Campus', 'SLU Maryheights', '2025-12-05 15:33:54', '2025-12-05 17:16:48', 16.38352089, 120.59243251, 16.41902033, 120.59711843);

-- --------------------------------------------------------

--
-- Table structure for table `shuttles`
--

DROP TABLE IF EXISTS `shuttles`;
CREATE TABLE IF NOT EXISTS `shuttles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plate_number` varchar(20) NOT NULL,
  `capacity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `current_lat` decimal(10,8) DEFAULT '16.41639000',
  `current_lng` decimal(11,8) DEFAULT '120.59333000',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate_number` (`plate_number`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shuttles`
--

INSERT INTO `shuttles` (`id`, `plate_number`, `capacity`, `created_at`, `updated_at`, `current_lat`, `current_lng`, `last_updated`) VALUES
(1, 'M2M-007', 20, '2025-12-03 15:59:05', '2025-12-05 15:46:29', 16.41639000, 120.59333000, '2025-12-03 15:59:05'),
(2, 'M2M-008', 30, '2025-12-03 15:59:05', '2025-12-05 15:46:27', 16.41639000, 120.59333000, '2025-12-03 15:59:05'),
(3, 'BRAVO-101', 25, '2025-12-03 15:59:05', '2025-12-05 15:57:21', 16.41639000, 120.59333000, '2025-12-03 15:59:05');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
