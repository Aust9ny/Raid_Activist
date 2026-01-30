# 🛡️ Raid Activist

**Raid Activist** is a community-driven web application designed to help people organize, discover, and join local or online activities. Whether it's a sports match, a gaming session, or a volunteer event, Raid Activist makes "raiding" real-world activities seamless.

---

## 🚀 Features

* **Dynamic Activity Feed:** Filter and search for "raids" (activities) based on your interests.
* **Interactive Activity Cards:** Real-time countdowns for event starts, plus easy "Join/Leave" functionality.
* **Raffle System:** An integrated raffle modal to fairly select participants when slots are limited.
* **Engagement:** Full comment sections on every activity to coordinate details.
* **User Profiles:** Showcase your past activities and participation history.

---

## 🛠️ Tech Stack

* **Frontend:** [Nuxt.js 3](https://nuxt.com/) (Vue.js Framework)
* **Database:** PostgreSQL (Relational integrity for participants and activities)

---

## 📊 Database Architecture

The project utilizes a relational schema to handle complex interactions:

* **Users:** Profiles and authentication.
* **Activities:** The core event data.
* **Activity_Participants:** A junction table managing the many-to-many relationship between users and events.

* **Comments & Statuses:** Managing real-time feedback and event lifecycle.

---

## 🧠 Technical Challenges & Lessons Learned

During the development of Raid Activist, I tackled several core engineering concepts:

* **Logic Waterfall Implementation:** Refactored complex scoring and grading logic from "gapped" ranges to a waterfall structure, ensuring 100% accuracy for decimal values and boundary cases.

* **String Reconstruction Pattern:** Solved UI formatting issues by mastering string immutability in JavaScript—moving from attempting direct mutations to using `.slice()` and concatenation for cleaner data handling.
* **Type Safety Advocacy:** Identified "silent bugs" caused by type mismatches in JavaScript, which led me to explore **Rust** for building more predictable and memory-safe backend services.

---

## 🏗️ Getting Started

### Prerequisites
* **Node.js** (v18.x or later)
* **npm** or **yarn**

### Installation

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/your-username/raid-activist.git](https://github.com/your-username/raid-activist.git)
