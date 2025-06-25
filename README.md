# 📖 Govel
**Govel** is a website for an **e-novel platform**, where users can register, read novels, and manage their profiles, while admins control the content. The API is designed to support both free and premium content, enabling a scalable digital novel experience.

Govel is also **integrated with Xendit**, a payment gateway that allows users to unlock premium (locked) chapters instantly, giving **monetization opportunities** and **flexibility** for readers who want immediate access.

---

## 🚀 Features
- ✅ User registration, login, and email activation
- 🔐 JWT-based authentication with token versioning
- 👤 Profile update and secure password change
- 🔄 Forgot & reset password flow via token
- 📚 Admin-only CRUD operations for novels
- 🖼️ Cloudinary integration for novel cover images
- 📖 Fetch all chapters of a novel, including lock status
- 💳 **Xendit payment integration**
  - Users can **pay to unlock locked chapters instantly**
  - Admin can **monetize premium content**

---

## ⚙️ Prerequisites
- [Golang](https://golang.org/doc/install) v1.18 or higher
- [React js (vite)](https://vite.dev/guide/) v1.19 or higher
- [pgx](https://github.com/jackc/pgx) or any other postgres connection pool
- [chi](github.com/go-chi/chi/v5) v5 or higher
- [swag](https://github.com/swaggo/swag) for documentation
- [xendit](https://github.com/xendit/xendit-go) or any other payment gateway integration
- [cloudinary](https://github.com/cloudinary/cloudinary-go) for image upload and management

---

## 📦 Instalation
1. Clone the repository:
    ```bash
    git clone https://github.com/AlfanDutaPamungkas/Govel.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Govel
    ```
3. Install dependencies:
    ```bash
    go mod download
    ```
4. Set up your backend environment variables:
    
    Create a `.env` file in the project root and specify the following variables:
    ```env
    DB_ADDR=
    SMTP_USERNAME=
    SMTP_HOST=
    SMTP_PASSWORD=
    AUTH_TOKEN_SECRET=
    CLOUD_NAME=
    API_KEY=
    API_SECRET=
    XENDIT_SECRET_KEY=
    EXTERNAL_URL=
    ```
5. Start the backend server:
    ```bash
    go run cmd/api
    ```
    The API will be running at `http://localhost:3000`.

---

6.  Navigate to the frontend directory:
    ```bash
    cd web
    ```

7. Install dependencies:
    ```bash
    npm install
    ```

8. Set up your frontend environment variables:
   
    Create a `.env` file in the directory fronend (web) and specify this variable:
    ```
    VITE_API_URL=
    ```

9. Start the frontend server:
    ```bash
    npm run dev
    ```
    The website will be running at `http://localhost:5173`.

---

## 📚 API Documentation (OpenAPI 3.0)

The API is fully documented using the OpenAPI 3.0 specification. You can view the  `http://localhost:3000/v1/swagger/index.html`

---

## 🤝 Contributing
Feel free to open issues or submit pull requests if you want to contribute to this project.
