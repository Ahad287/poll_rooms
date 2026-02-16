
---

# Poll Rooms | Real-Time Voting App

**Poll Rooms** is a full-stack web application that allows users to create polls, share them instantly via link, and watch votes update in real-time across all devices. Built with the MERN stack and Socket.io.

🔗 **Live Demo:** https://poll-rooms-iota.vercel.app/


---

##  Fairness & Anti-Abuse Mechanisms

To satisfy the requirement of preventing abusive/repeat voting, this application implements a "Defense in Depth" strategy with two distinct layers:

### 1. LocalStorage Flagging

When a user votes, the app saves a specific key in the browser's LocalStorage.Then the UI immediately locks the voting buttons for that user. Even if they refresh the page or close the tab, the browser remembers they have already voted.

### 2. IP Address Tracking

The backend records the IP address of every vote in a dedicated `Vote` collection. Before processing any new vote, the server queries the database for an existing record matching.If match is found, the server rejects the request.


---

## Edge Cases Handled

* Configured `vercel.json` rewrites to prevent 404 errors when a user refreshes a deep link.
* Used MongoDB atomic operators to increment vote counts. This prevents conditions where two votes arriving at same time might overwrite each other's data.
* The creation form disables the "Create" button until a question and at least two valid options are provided, preventing broken poll data.
* The socket connection initializes immediately upon joining a room, ensuring the user sees the current vote count instantly, not just future updates.


---

##  Known Limitations & Future Improvements

here are some planned next steps:

1. Currently, the strict IP check means multiple users on the same WiFi network might be blocked after the first person votes. To improve this,implementing cookie-based session system or browser fingerprinting would solve this.

2. Polls currently remain open indefinitely. so should add expiry timestamp to close old polls.

3. Results are shown as simple bars. Would add graphs or piecharts to show voting trends.


---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Socket.io-client
* **Backend:** node.js, express,js, Socket.io
* **Database:** MongoDB
* **Deployment:** Vercel (Frontend) + Render (Backend)
