# M2M Shuttle Navigation App
A comprehensive shuttle management and navigation system designed to streamline transport logistics. This full-stack application provides distinct interfaces for administrators, drivers, and passengers to manage schedules, track shuttles, and handle service requests.

# Description
This project (CS316-M2M) is a robust solution for organizational transport. It combines a web-based frontend with a PHP backend and a SQL database to create a real-time environment for shuttle coordination.

Admin Features: Manage drivers, shuttles, schedules, and cancellation requests.

Driver Features: Profile management and route/schedule viewing.

User Features: Real-time map navigation, scheduling, and profile tracking.

# Key Features
Role-Based Access Control: Separate dashboards for Admins, Drivers, and Users.

Real-Time Mapping: Integrated map.html for tracking and navigation.

Database Driven: Powered by a relational database (shuttle_db.sql) to ensure data persistence.

Notification System: Automated updates for schedule changes or cancellations.

History Tracking: View past trips and shuttle usage logs.

# Tech Stack
Frontend: HTML5, CSS3, JavaScript (AJAX for asynchronous data fetching).

Backend: PHP (located in the /api directory).

Database: MySQL / MariaDB.

Assets: Custom styling and icons located in the /assets folder.

# Project Structure
```Plaintext
/
├── api/                 # PHP Backend logic and API endpoints
├── assets/              # Images, CSS, and Frontend JavaScript libraries
├── admin.html           # Administrator dashboard
├── driver.html          # Driver interface
├── index.html           # Main landing/login page
├── map.html             # Navigation and tracking interface
├── shuttle_db.sql       # Database schema and initial data
└── signup.html          # User registration
```

# Installation & Setup
To run this project locally, you will need a local server environment like XAMPP, WAMP, or MAMP.

Clone the Repository:

Bash
git clone https://github.com/2241812/CS316-M2M.git
Database Setup:

Open phpMyAdmin.

Create a new database named shuttle_db.

Import the shuttle_db.sql file into your new database.

Deploy to Local Server:

Move the project folder into your server's root directory (e.g., C:/xampp/htdocs/).

Access the App:

Open your browser and go to http://localhost/CS316-M2M.

# Contributors
Project Lead: Javier III Narciso

Contributor: Brent Menos - 
