import Reminder from "../models/reminder.model.js";

// Create reminder
export const createReminder = async (req, res) => {
  const { text, scheduledFor } = req.body;
  const userId = req.user._id;

  try {
    const reminder = await Reminder.create({ text, scheduledFor, userId });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: "Failed to create reminder" });
  }
};

// Get all reminders for user
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id });
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    res.status(200).json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reminder" });
  }
};

// Update reminder (edit text or time)
export const updateReminder = async (req, res) => {
  const { text, scheduledFor } = req.body;

  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { text, scheduledFor, isSent: false }, // reset isSent if rescheduled
      { new: true }
    );

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    res.status(200).json(reminder);
  } catch (err) {
    res.status(500).json({ message: "Failed to update reminder" });
  }
};
