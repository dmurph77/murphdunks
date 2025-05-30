# MurphDunks

**Will Murph dunk a basketball or run a sub-3:10 marathon by the end of 2025?**  
This is a public accountability + charity donation challenge with friendly predictions and trash talk.

🔗 Live site: [murphdunks.com](https://murphdunks.com)

## 🏀 Project Overview

**MurphDunks** lets users donate to charity while showing public support **for or against** two personal challenges:

- **Dunking a basketball**
- **Running a sub-3:10 marathon**

You can choose to support either outcome — all donations are routed through Stripe and go 100% to charity.  
There's no payout, no gambling — just public accountability, motivation, and good fun.

## 💻 Tech Stack

| Area         | Stack                        |
|--------------|-----------------------------|
| Frontend     | HTML, CSS, vanilla JS       |
| Backend      | Node.js + Express           |
| Hosting      | AWS EC2 (Ubuntu)            |
| Web Server   | Nginx                       |
| Process Mgr  | PM2                         |
| Payments     | Stripe Checkout             |
| Deployment   | GitHub Actions (CI/CD)      |
| Database     | MongoDB (Atlas)             |

## 🚀 Deployment

Frontend files (`index.html`, `style.css`, etc.) are served by **Nginx** from `/var/www/html`.  
The backend runs via **PM2**, serving Express routes and the Stripe payment flow.

### GitHub Actions CI/CD
On every push to `main`, GitHub Actions:
- Pulls the latest repo to EC2
- Copies updated frontend files to Nginx's web root
- Restarts the backend via PM2

## 🧪 Local Development

### Backend
```bash
cd backend
npm install
npm run dev

