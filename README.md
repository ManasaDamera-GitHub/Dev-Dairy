Below is the complete full-stack implementation for the Event RSVP App as per the assignment. I've kept it simple, focusing on core functionality without authentication (as it's optional and time-permitting). For RSVP, I'm using simple count increments (yesCount, noCount, maybeCount) without tracking individual users, since auth is optional. This allows showing summary counts. Delete is available for any event (without creator restriction, as auth is skipped).

The optional stretches (edit event, filter upcoming/past, list of responders) are not implemented to keep it minimal, but I've noted where they could be added.

I've structured the code with file paths for clarity. You can copy-paste into respective files.

Assume you have Node.js, MongoDB (running locally on port 27017), and npm installed. For backend, run npm init -y, install dependencies, then node server.js. For frontend, use npx create-react-app frontend, install dependencies, replace files, then npm start.

---

### Backend (Node.js with Express and MongoDB)

#### package.json (run npm init -y then add dependencies)
{
  "name": "event-rsvp-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5"
  }
}

Run npm install to install dependencies.

#### server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/rsvpdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use('/api/events', eventRoutes);

app.listen(PORT, () => console.log(Server running on port ${PORT}));

#### models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  yesCount: { type: Number, default: 0 },
  noCount: { type: Number, default: 0 },
  maybeCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Event', eventSchema);

#### routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /api/events - Create event
router.post('/', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const newEvent = new Event({ title, date, description });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events - List events (sorted by date ascending for upcoming first)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events/:id/rsvp - RSVP to an event
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { response } = req.body; // 'yes', 'no', 'maybe'
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (response === 'yes') event.yesCount += 1;
    else if (response === 'no') event.noCount += 1;
    else if (response === 'maybe') event.maybeCount += 1;
    else return res.status(400).json({ message: 'Invalid response' });

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

---

### Frontend (React)

Create the app with npx create-react-app frontend, then cd frontend and run npm install axios react-router-dom.

Replace the contents of the following files.

#### package.json (auto-generated, but ensure dependencies)
"dependencies": {
  "axios": "^1.4.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.10.0",
  "@testing-library/jest-dom": "^5.16.5",
  "@testing-library/react": "^13.4.0",
  "@testing-library/user-event": "^14.4.3",
  "web-vitals": "^3.1.1"
}

#### src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Event RSVP App</h1>
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/create" element={<CreateEvent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

#### src/components/CreateEvent.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', { title, date, description });
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit">Create Event</button>
      </form>
      <button onClick={() => navigate('/')}>Back to List</button>
    </div>
  );
};

export default CreateEvent;

#### src/components/EventList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRSVP = async (id, response) => {
    try {
      await axios.post(http://localhost:5000/api/events/${id}/rsvp, { response });
      fetchEvents(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(http://localhost:5000/api/events/${id});
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Upcoming Events</h2>
      <Link to="/create"><button>Create New Event</button></Link>
      <ul>
        {events.map(event => (
          <li key={event._id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>{event.title}</h3>
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
            <p>{event.description}</p>
            <p>RSVP Summary: Yes: {event.yesCount}, No: {event.noCount}, Maybe: {event.maybeCount}</p>
            <button onClick={() => handleRSVP(event._id, 'yes')}>RSVP Yes</button>
            <button onClick={() => handleRSVP(event._id, 'no')}>RSVP No</button>
            <button onClick={() => handleRSVP(event._id, 'maybe')}>RSVP Maybe</button>
            <button onClick={() => handleDelete(event._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;

#### src/index.js (default, no changes needed)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

---

### How to Run
1. Start MongoDB (e.g., mongod if installed locally).
2. Backend: cd backend, npm start (runs on http://localhost:5000).
3. Frontend: cd frontend, npm start (runs on http://localhost:3000).
4. Navigate to http://localhost:3000 to use the app.

### Notes on Optionals
- *Auth*: To add, use JWT or passport.js in backend. Add User model, login/signup endpoints. Protect routes with middleware. In frontend, add Login/Signup pages.
- *Creator-only delete*: With auth, add creatorId to Event model, check req.user.id === event.creatorId in delete route.
- *Edit event*: Add PUT /events/:id endpoint, and an Edit form in frontend.
- *Filter upcoming/past*: In GET /events, add query params (e.g., ?type=upcoming), filter based on date > new Date().
- *List of responders*: With auth, replace counts with rsvps: [{userId, response}], populate users, and display names.

This covers the core requirements with functional CRUD and RSVP.
