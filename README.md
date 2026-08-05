# Codecheck-Hub
Automated Code Grading &amp; Quality Assessment System (CodeCheck Hub) - Graduation Thesis.

# 🚀 CodeCheck Hub - Automated Code Grading & Quality Assessment System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.x-brightgreen)]()
[![Frontend](https://img.shields.io/badge/Frontend-React.js-blue)]()
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
* **Classroom Management:** Khởi tạo và quản lý lớp học bằng mã Code tham gia tiện lợi.
* **Problem Creation:** Tạo bài tập lập trình với các tùy chỉnh giới hạn tài nguyên (RAM, Execution Time).
* **Test Case Management:** Cấu hình linh hoạt bộ Test Case công khai (Public) và Test Case ẩn (Hidden).
* **Analytics & Gradebook:** Xem bảng điểm tổng quan, lịch sử thử sai và chi tiết bài nộp của từng sinh viên.

### 👨‍🎓 For Students (Sinh viên)
* **Online Code Editor:** Trải nghiệm gõ code mượt mà trực tiếp trên web với Monaco Editor (tương tự VS Code).
* **Real-time Feedback:** Nhận kết quả chấm điểm tức thì qua WebSocket mà không cần tải lại trang.
* **Code Quality Report:** Xem báo cáo đánh giá Clean Code chi tiết (Bugs, Code Smells, Security Vulnerabilities) từ SonarQube sau khi làm đúng bài.

### ⚙️ Core Engine & DevOps (Hệ thống ngầm)
* **Asynchronous Queue:** Sử dụng RabbitMQ xử lý hàng đợi bài nộp, chống nghẽn hệ thống khi lượng lớn sinh viên cùng nộp bài.
* **Docker Sandbox:** Môi trường thực thi code cách ly hoàn toàn, đảm bảo an toàn tuyệt đối cho Server chủ.
* **SonarQube Integration:** Phân tích tĩnh chất lượng mã nguồn tự động.

---

## 🏗 System Architecture

```text
[ React.js Frontend ] 
        │ (HTTP REST / WebSocket)
        ▼
[ Spring Boot API Gateway / Backend ] ──► [ PostgreSQL Database ]
        │
        ▼ (Publish Event)
[ RabbitMQ Message Broker ]
        │
        ▼ (Consume Task)
[ Worker Execution Service ]
        ├──► [ Docker Containers (Sandbox Engine) ]
        └──► [ SonarQube Server (Clean Code Analysis) ]

```

## 🛠 Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | React.js, Tailwind CSS, Monaco Editor, Axios |
| **Backend API** | Java 17, Spring Boot 3, Spring Security (JWT), WebSocket |
| **Database** | PostgreSQL, Redis |
| **Message Queue** | RabbitMQ |
| **Execution Engine** | Docker Engine API |
| **Code Quality** | SonarQube API |

---

## 🚀 Getting Started

### Prerequisites

* Java JDK 17+
* Node.js v18+ & npm
* Docker & Docker Compose
* PostgreSQL 15+

### Installation & Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/tuyetluong259/Codecheck-Hub.git
cd codecheck-hub

```


2. **Start Infrastructure Services (PostgreSQL, RabbitMQ, SonarQube):**
```bash
docker-compose up -d

```


3. **Run Backend (Spring Boot):**
```bash
cd backend
./mvnw spring-boot:run

```


4. **Run Frontend (React):**
```bash
cd frontend
npm install
npm start

```


5. **Access Application:**
* Frontend: `http://localhost:3000`
* Backend API Docs: `http://localhost:8080/swagger-ui.html`



---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

* **Author:** Lương Thị Ánh Tuyết
* **University:** Trường Đại học Giao thông Vận tải TP.HCM (UTH)
* **Mail:** luongtuyet.peter@gmail.com

```
