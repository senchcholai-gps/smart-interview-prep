import express from 'express';
import UserData from '../models/user'; // make sure path is correct

const router = express.Router();

// ==============================
// GET route for sync
// ==============================
router.get('/', (req, res) => {
    res.json({ message: 'Sync route is working!' });
});

// ==============================
// POST route for sync
// ==============================
router.post('/', (req, res) => {
    try {
        const { data } = req.body;

        res.json({
            message: 'Sync completed successfully',
            receivedData: data
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});

// ==============================
// ADD FEEDBACK TO INTERVIEW
// ==============================
router.post('/add-feedback', async (req, res) => {
    try {
        const { username, interviewId, comments, suggestions, rating } = req.body;

        const user = await UserData.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const interview = user.interviews.find(
            (i: any) => i.id === interviewId
        );

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.feedback = {
            comments,
            suggestions,
            rating
        };

        await user.save();

        res.status(200).json({
            message: 'Feedback added successfully',
            interview
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

export default router;