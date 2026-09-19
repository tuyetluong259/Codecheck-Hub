# Codecheck-Hub
Automated Code Grading & Quality Assessment System (CodeCheck Hub) - Graduation Thesis.

# 🚀 CodeCheck Hub - Automated Code Grading & Quality Assessment System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.x%20Microservices-brightgreen)]()
[![Frontend](https://img.shields.io/badge/Frontend-React.js%20+%20Vite-blue)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)]()
[![Engine](https://img.shields.io/badge/Sandbox-Docker-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

> **Graduation Thesis Project** - Automatic Online Judge with Static Code Analysis for Programming Courses.

---

## 📌 Introduction

**CodeCheck Hub** là hệ thống chấm điểm mã nguồn tự động và đánh giá chất lượng phần mềm (Clean Code) theo thời gian thực. Hệ thống giúp Giảng viên dễ dàng khởi tạo lớp học, ra bài tập lập trình, cấu hình bộ Test Case và tự động chấm điểm bài nộp của Sinh viên trong môi trường Sandbox cách ly an toàn.

---

## ✨ Key Features

### 👨‍🏫 For Instructors (Giảng viên)
* **Classroom Management:** Khởi tạo và quản lý lớp học, khóa học.
* **Problem Creation:** Tạo bài tập lập trình với các tùy chỉnh giới hạn tài nguyên (RAM, Execution Time).
* **Test Case Management:** Cấu hình linh hoạt bộ Test Case công khai (Public) và ẩn (Hidden).
* **Analytics & Gradebook:** Xem bảng điểm tổng quan và lịch sử thử sai của sinh viên.

### 👨‍🎓 For Students (Sinh viên)
* **Online Code Editor:** Trải nghiệm gõ code mượt mà trực tiếp trên web với Monaco Editor (tương tự VS Code).
* **Real-time Feedback:** Nhận kết quả chấm điểm tức thì qua WebSocket mà không cần tải lại trang.
* **Code Quality Report:** Xem báo cáo đánh giá Clean Code chi tiết từ SonarQube.

### ⚙️ Core Engine & DevOps (Hệ thống ngầm)
* **Microservices Architecture:** Tách biệt các domain logic (Identity, Course, Submission, Judge, Notification) đảm bảo tính mở rộng.
* **Asynchronous Queue:** Sử dụng RabbitMQ xử lý hàng đợi bài nộp, chống nghẽn hệ thống.
* **Docker Sandbox:** Môi trường thực thi code cách ly bằng Docker-out-of-Docker API (DooD), đảm bảo an toàn tuyệt đối.
* **SonarQube Integration:** Phân tích tĩnh chất lượng mã nguồn tự động.

---

## 🏗 System Architecture

```text
[ React.js + Vite Frontend ] 
        │ (HTTP REST / WebSocket)
        ▼
[ API Gateway / Microservices (Identity, Course, Submission, Notification) ] ──► [ PostgreSQL Database ]
        │
        ▼ (Publish Event)
[ RabbitMQ Message Broker ]
        │
        ▼ (Consume Task)
[ Judge Service (Execution Engine) ]
        ├──► [ Docker Sandbox Containers ] (Code Compilation & Execution)
        └──► [ SonarQube Server ] (Clean Code Analysis)
```

## 🛠 Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | React.js, Vite, Tailwind CSS, Monaco Editor, Axios |
| **Backend Microservices**| Java 17, Spring Boot 3, Spring Security (JWT), WebSocket, Spring Cloud Gateway |
| **Database** | PostgreSQL, Redis |
| **Message Queue** | RabbitMQ |
| **Execution Engine** | Docker API (Docker-java) |
| **Code Quality** | SonarQube |

---

## 🚀 Getting Started

### Prerequisites

* Java JDK 17+
* Node.js v18+
* Docker & Docker Compose
* Maven

### Installation & Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/tuyetluong259/Codecheck-Hub.git
cd Codecheck-Hub
```

2. **Start Infrastructure and Microservices:**
Hệ thống được đóng gói hoàn chỉnh bằng Docker Compose (Bao gồm PostgreSQL, RabbitMQ, SonarQube và toàn bộ các Microservices của Backend).
```bash
docker-compose up -d --build
```
*(Đợi khoảng 2-3 phút để các service khởi động hoàn toàn).*

3. **Run Frontend (React/Vite):**
Mở một terminal mới, chuyển vào thư mục `client` và chạy frontend:
```bash
cd client
npm install
npm run dev
```

4. **Access Application:**
* Frontend: `http://localhost:5173`
* Swagger UI (API Docs): Truy cập theo port của từng service tương ứng (Ví dụ: `http://localhost:8082/swagger-ui.html` cho Course Service).
* RabbitMQ Management: `http://localhost:15672` (guest / guest)
* SonarQube: `http://localhost:9000` (admin / admin)

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

* **Author:** Lương Thị Ánh Tuyết
* **University:** Trường Đại học Giao thông Vận tải TP.HCM (UTH)

