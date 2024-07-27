# KeyStore System

The KeyStore system is designed to securely manage encryption keys and application secrets. This document provides comprehensive instructions on setting up and using the system.

## System Overview

KeyStore handles secure storage and retrieval of application secrets supported by cryptographic operations to ensure data confidentiality and integrity. The system uses JWT (JSON Web Tokens) for authentication and manages user access to different application keys based on configured permissions.

## Installation

Follow these steps to install and configure the KeyStore system:

### Prerequisites

- Node.js installed on your machine (v12.x or higher recommended).
- Access to a terminal or command line interface.

### Setup

1. **Clone the Repository**:
  ```bash
  git clone http://gitlab.buzzler.co.uk/duncan/keystore
  cd keystore
  ```

2. **Install Dependencies**:
  ```bash
  npm install
  ```

3. **Set Up Environment Variables**

Copy the `.env-template` file to a new file named `.env` and fill it with necessary values:

- `PORT`: The port number on which the server will run, e.g., 3000.
- `PEMPATH`: Path to your SSL certificate `.pem` file for HTTPS.
- `DATA_STORE`: Filename for the JSON database that stores application secrets and user data.
- `AUTH_KEY`: A secret key used internally for additional security layers.
- `JWT_SECRET`: Used to sign and verify JWTs, generate using `./keygen`.
- `REFRESH_TOKEN_SECRET`: Used to sign and verify Refresh Tokens, generate using `./keygen`.
- `SECRET_KEY`: Encryption key for securing application data, generate using `./keygen`.
- `IV_KEY`: Initialization vector for encryption processes, generate using `./keygen`.

Use the `keygen` script to generate the required cryptographic keys:

```bash
./keygen

```
Copy and paste the output values into your `.env` file.

4. **Prepare Data Store**:
  - Copy the `secrets-template.json` to a new file named `secrets.json`.
  - Ensure `secrets.json` is populated with `{ "_users": {} }` to start.

5. **Secure Configuration**:
  - Ensure your `.env` and `secrets.json` files are not accessible publicly or included in your version control system. Update your `.gitignore` file to exclude these files.

### Starting the Application

To start the application, run the following command in the root directory of the project:

```bash
npm start
```

This command will launch the HTTPS server and listen for requests.

## Usage

### User Management

- **Add Users**: Use the `./keystore` command-line utility to add new users and define their access to specific applications.
- **Manage Secrets**: Manage application secrets through the command line to ensure secure handling.

### API Endpoints

- **Login** (`POST /login`): Authenticate users and retrieve a JWT for accessing protected routes.
- **Refresh Token** (`POST /refresh_token`): Obtain a new access token using a refresh token when the access token is near expiration.
- **Get All Keys** (`GET /getallkeys`): Retrieve all keys for an application if authorized.

### Examples

- **Login**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"username": "user", "password": "password"}' https://<hostname>:<port>/login
  ```

- **Get All Keys**:
  ```bash
  curl -H "Authorization: Bearer your_access_token_here" https://<hostname>:<port>/getallkeys?appKey=app_id
  ```

## Using the Command-Line Utility

1. **Adding a New User**
   ```bash
   ./keystore adduser <username> <password> <app_ids...>
   ```
   - `username`: Username of the new user.
   - `password`: Password for the new user.
   - `app_ids`: Space-separated list of application IDs the user should have access to.

   Example:
   ```bash
   ./keystore adduser alice strongpassword123 app123 app456
   ```

2. **Deleting a User**
   ```bash
   ./keystore deluser <username>
   ```
   - `username`: Username of the user to delete.

   Example:
   ```bash
   ./keystore deluser alice
   ```

3. **Updating a User's Password**
   ```bash
   ./keystore userpwd <username> <newPassword>
   ```
   - `username`: Username for whom the password should be updated.
   - `newPassword`: The new password for the user.

   Example:
   ```bash
   ./keystore userpwd alice newpassword321
   ```

4. **Adding a New Application**
   ```bash
   ./keystore addapp <app_name>
   ```
   - `app_name`: Name of the new application.

   Example:
   ```bash
   ./keystore addapp "My New App"
   ```

5. **Deleting an Application**
   ```bash
   ./keystore delapp <app_name>
   ```
   - `app_name`: Name of the application to delete.

   Example:
   ```bash
   ./keystore delapp "My New App"
   ```

6. **Adding or Updating a Key for an Application**
   ```bash
   ./keystore addkey <app_name> <key_name> <value>
   ```
   - `app_name`: Name of the application.
   - `key_name`: The key to add or update.
   - `value`: The value of the key.

   Example:
   ```bash
   ./keystore addkey "My New App" "API Key" "abc123"
   ```

7. **Deleting a Key from an Application**
   ```bash
   ./keystore delkey <app_name> <key_name>
   ```
   - `app_name`: Name of the application.
   - `key_name`: The key to delete.

   Example:
   ```bash
   ./keystore delkey "My New App" "API Key"
   ```

#### Best Practices

- Ensure that all interactions with the `./keystore` utility are conducted in a secure environment.
- Regularly review user access and application permissions to ensure that they remain aligned with current security policies.
- Log all changes made using the `./keystore` utility to maintain an audit trail for security reviews and troubleshooting.

## Security Considerations

Ensure that all cryptographic materials are securely stored and managed. Regularly rotate secrets and audit access logs to detect and respond to unauthorized access attempts.

## Maintenance and Support

For maintenance and support, please contact the system administrator or developer responsible for managing the KeyStore system. Regular updates and backups are recommended to prevent data loss and ensure system integrity.

---
