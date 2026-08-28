fetch("http://localhost:8081/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    fullName: "System Admin",
    username: "admin",
    email: "admin@codecheckhub.com",
    password: "adminpassword123",
    role: "ADMIN",
    studentId: ""
  })
}).then(res => res.json()).then(console.log).catch(console.error);
