# Student Profile Management System

The **Student Profile Management System** is a web-based application designed to streamline and digitize the management of academic data for educational institutions. The system replaces manual Excel-based data entry and update processes, enabling administrators to efficiently enter and update student information, and providing students with easy access to their academic records, including semester-wise transcripts and performance analytics.

## Features

- **Centralized Database:** Manage academic records and personal details for 800+ students in a secure, centralized database.
- **Role-Based Access Control:** Authentication and Authorisation module uses Next Auth to authenticate and authorise Admins and Students.
- **Student Analytics:** Students can view performance analytics, helping them to understand and track their academic progress.

## Technology Stack

- **Framework :** Next.js
- **Database:** PostgreSQL
- **Authentication:** NextAuth with OAuth (Google, GitHub) and custom credential-based login
- **Data Processing:** ExcelJS for parsing Excel files

## Installation

### Prerequisites
- Node.js (v14 or above)
- PostgreSQL
- AWS account for deployment (optional)

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo-link.git
    cd student-profile-manager
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the environment variables:
    Create a `.env` file in the root directory with the following variables:
    ```plaintext
    PG_USER=your_db_username
    PG_PASSWORD=your_db_password
    PG_DATABASE=your_db_name
    PG_HOST=your_db_host
    PG_PORT=your_db_port
    NEXT_AUTH_SECRET=your_secret_key
    GITHUB_ID=your_github_oauth_id
    GITHUB_SECRET=your_github_oauth_secret
    GOOGLE_ID=your_google_oauth_id
    GOOGLE_SECRET=your_google_oauth_secret
    ```

4. Run the application:
    ```bash
    npm run dev
    ```

5. Access the application at `http://localhost:3000`.

## Usage

### For Admins:
1. Log in via the **Admin** portal on the home page.
   
   ![Auth1](https://github.com/user-attachments/assets/a07113f4-2706-4958-a456-c5db9e6ceece)
   ![Auth2](https://github.com/user-attachments/assets/5d518841-a25e-4c81-88a5-9d18a5bd183e)
   
2. Navigate to the dashboard to enter/update student details.

   ![Admin1](https://github.com/user-attachments/assets/8d59dfc4-3c93-401a-8cc0-bc3b527a68de)
   ![image](https://github.com/user-attachments/assets/12227513-333c-47ba-9587-4e323f91e146)
   ![UserLog](https://github.com/user-attachments/assets/65410642-246d-4813-b6ce-9967d04b54f1)

3. Upload existing Excel files to migrate data to the database.
   - Offline files can be drag and dropped into the required field.
   - Online files can also be directly mapped using a sheet ID for a Google Sheets account which belongs to the Admin.
   
   ![Admin2](https://github.com/user-attachments/assets/119480da-5a17-4d94-ba76-3a298a877ef8)

### For Students:
1. Log in via the **Student** button on the home page.
2. View personal academic records, including semester-wise transcripts and performance analytics graphs and keep track of tasks with task tracker.
   
   ![Student1](https://github.com/user-attachments/assets/1a3fd8f2-4575-472c-9493-4bf2132f8b56)
   ![image](https://github.com/user-attachments/assets/42207757-8ad1-4fc6-86f9-b0e32ffc41fb)
   ![Student3](https://github.com/user-attachments/assets/167c08f4-762c-4d59-b997-02f40deadb59)

## Note
If you liked this project please give it a star :)
