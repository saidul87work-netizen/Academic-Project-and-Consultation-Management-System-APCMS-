# Consultation Management Phase 1

This repository contains the completely extracted **Consultation Features** module from the main project. 
It has been fully implemented with the 5 required features, ready for Phase 1 submission.

### Features Completed
1. **Request Consultations**: Students can request sessions from available Faculty based on time.
2. **Accept/Decline**: Faculty can review incoming requests and approve/decline them.
3. **Assign STs**: Faculty can now assign Student Tutors (STs) dynamically to consultation sessions using the dropdown.
4. **Student Feedback**: Students can leave a 1-5 star rating and comment on the assigned ST after a session is accepted.
5. **Interactive Calendar**: The Faculty Schedule page features an integrated Calendar view via `react-big-calendar`.

##  How to Run

### Backend
```
cd server
npm i
node server.js
```

### Frontend
```
cd client
npm i
npm run dev
```

The database connection defaults to `mongodb://localhost:27017/consultation_management`. You should start Mongo locally or modify the `.env` variable.
