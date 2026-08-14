-- CodeCheckHub — Database Initialization Script
-- Chạy khi PostgreSQL container khởi động lần đầu

-- Tạo các database cho từng service
CREATE DATABASE db_identity;
CREATE DATABASE db_course;
CREATE DATABASE db_submission;
CREATE DATABASE db_judge;
CREATE DATABASE db_notification;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE db_identity TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_course TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_submission TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_judge TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_notification TO postgres;
