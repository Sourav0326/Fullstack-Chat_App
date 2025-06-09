import Status from "../models/status.model.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js"; // ✅ to fetch users for visibility

// Upload new status (image/video)
export const createStatus = async (req, res) => {
  const { file, caption, mediaType } = req.body;
  const userId = req.user._id;

  try {
    // ✅ Upload to Cloudinary
    const upload = await cloudinary.uploader.upload(file, {
      resource_type: mediaType === "video" ? "video" : "image",
    });

    // ✅ Fetch all user IDs except current user
    const allUsers = await User.find({ _id: { $ne: userId } }).select("_id");
    const visibleTo = allUsers.map((u) => u._id.toString());
    visibleTo.push(userId.toString()); // ✅ show to self too

    // ✅ Save status
    const newStatus = await Status.create({
      userId,
      mediaUrl: upload.secure_url,
      mediaType,
      caption,
      visibleTo,
    });

    res.status(201).json(newStatus);
  } catch (error) {
    console.error("❌ Error uploading status:", error);
    res.status(500).json({ message: "Failed to upload status" });
  }
};

// Get all statuses visible to the logged-in user
export const getStatuses = async (req, res) => {
  try {
    const userId = req.user._id;

    const statuses = await Status.find({
      visibleTo: { $in: userId },
    })
      .populate("userId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(statuses);
  } catch (error) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch statuses" });
  }
};

// Mark a status as viewed by the current user
export const markStatusViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Status.findByIdAndUpdate(id, {
      $addToSet: { viewers: userId },
    });

    res.status(200).json({ message: "Viewed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark viewed" });
  }
};

// ✅ Delete own status
export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const status = await Status.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!status) {
      return res
        .status(404)
        .json({ message: "Status not found or unauthorized" });
    }

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete status" });
  }
};
