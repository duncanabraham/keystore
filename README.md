### README.md for Keystore Command Line Tool

---

#### Keystore CLI Tool

The Keystore CLI Tool manages encryption keys and applications within a secure keystore. This tool allows you to list applications, add new applications, add or update keys for specific applications, and delete applications or keys from the command line.

---

### Features

- **List Applications**: Display all applications and their associated GUIDs.
- **Add Application**: Insert a new application with a unique identifier.
- **Add/Update Keys**: Securely add or update keys for a given application.
- **Delete Applications/Keys**: Remove an application or a specific key from an application.

---

### Installation

Follow these steps to install the Keystore CLI Tool:

1. **Clone the Repository:**
   ```bash
   git clone https://yourrepositoryurl.com/yourproject.git
   cd yourproject
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Copy the `.env-template` file to a new file named `.env`, and fill in the necessary values:
   ```bash
   cp .env-template .env
   ```
   Edit the `.env` file to include the appropriate values for keys such as `SECRET_KEY`, `IV_KEY`, and any other required configurations.

---

### Configuration

- **.env-template**: This file contains the keys without values. You must provide the actual values in a `.env` file created from this template.
  ```
  SECRET_KEY=
  IV_KEY=
  AUTH_KEY=
  ```

---

### Usage

After installation and configuration, use the following commands to interact with the Keystore:

- **List all applications**:
  ```bash
  ./keystore.js list
  ```

- **Add a new application**:
  ```bash
  ./keystore.js app "Application Name"
  ```

- **Add or update a key for an application**:
  ```bash
  ./keystore.js key "Application Name" "Key Name" "Value"
  ```

- **Delete an application**:
  ```bash
  ./keystore.js del app "Application Name"
  ```

- **Delete a key from an application**:
  ```bash
  ./keystore.js del key "Application Name" "Key Name"
  ```

### Help

For additional help with commands:
```bash
./keystore.js --help
```

---

### Notes

- Ensure the Node.js environment is properly configured on your machine.
- Keep your `.env` file secure and do not share its contents.
- Regularly update the dependencies to mitigate vulnerabilities.

---