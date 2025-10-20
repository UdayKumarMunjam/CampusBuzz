import { LostFound } from "../models/lostFoundSchema.js";
import cloudinary from "../config/cloudinary.js";
import transporter from "../config/nodemailer.js"; // ✅ email config
// Create Lost/Found Post
export const createLostFound = async (req, res) => {
  try {
    const { type, title, description, location } = req.body;
    const reporterEmail = req.user.email; // from JWT
    const file = req.file;
    let mediaUrl = "";
    if (file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: file.mimetype.startsWith("video") ? "video" : "image" },
          (error, result) => error ? reject(error) : resolve(result)
        );
        uploadStream.end(file.buffer);
      });
      mediaUrl = result.secure_url;
    }

    const lostFound = await LostFound.create({
      type,
      title,
      description,
      location,
      image: mediaUrl,
      reporterEmail,
      createdBy: req.user._id
    });

    // ✅ Auto email on post creation
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: reporterEmail,
        subject: `Thank you for reporting ${type} item on CampusBuzz`,
        html: `
          <p>Hi,</p>
          <p>Thank you for reporting your <b>${type}</b> item: ${title}.</p>
          <p>You will be contacted if a match is found.</p>
          <p>If resolved, click here: <a href="http://localhost:8080/api/lostfound/resolve/${lostFound._id}">Mark as Resolved</a></p>
        `
      });
      console.log(`✅ Email sent successfully to ${reporterEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to ${reporterEmail}:`, emailError.message);
      // Don't fail the main operation, but log the email error
    }

    return res.status(201).json({ message: `${type} item created successfully`, lostFound, success: true });
  } catch (error) {
    console.error("Create LostFound Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get all lost & found posts with pagination
export const getLostFound = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const items = await LostFound.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await LostFound.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      success: true
    });
  } catch (error) {
    console.error("Get LostFound Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Mark as resolved
export const markResolved = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFound.findById(id);

    if (!item) {
      if (req.method === 'GET') {
        return res.send(`
          <html>
            <body>
              <h1>Item not found</h1>
              <p>The item you're trying to resolve does not exist.</p>
              <a href="http://localhost:5173/lost-found">Go back to Lost & Found</a>
            </body>
          </html>
        `);
      }
      return res.status(404).json({ message: "Item not found", success: false });
    }
    if (item.status === "resolved") {
      if (req.method === 'GET') {
        return res.send(`
          <html>
            <body>
              <h1>Item already resolved</h1>
              <p>This item has already been marked as resolved.</p>
              <a href="http://localhost:5173/lost-found">Go back to Lost & Found</a>
            </body>
          </html>
        `);
      }
      return res.status(400).json({ message: "Already resolved", success: false });
    }

    item.status = "resolved";
    await item.save();

    if (req.method === 'GET') {
      return res.send(`
        <html>
          <body>
            <h1>Item marked as resolved!</h1>
            <p>Thank you for updating the status.</p>
            <a href="http://localhost:5173/lost-found">Go back to Lost & Found</a>
          </body>
        </html>
      `);
    }

    return res.status(200).json({ message: "Item marked as resolved", success: true });
  } catch (error) {
    console.error("Mark Resolved Error:", error);
    if (req.method === 'GET') {
      return res.status(500).send(`
        <html>
          <body>
            <h1>Error</h1>
            <p>Something went wrong. Please try again later.</p>
            <a href="http://localhost:5173/lost-found">Go back to Lost & Found</a>
          </body>
        </html>
      `);
    }
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Finder sends custom email to owner
export const sendMessage = async (req, res) => {
  try {
    const { itemId, message } = req.body;
    const item = await LostFound.findById(itemId);

    if (!item) return res.status(404).json({ message: "Item not found", success: false });
    if (item.status === "resolved") return res.status(400).json({ message: "Item already resolved", success: false });

    // Only allow "found" reporter to message lost owner
    if (req.user._id.toString() === item.createdBy.toString()) {
      return res.status(403).json({ message: "You cannot message yourself", success: false });
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: item.reporterEmail,
        subject: `Someone has information about your lost item: ${item.title}`,
        html: `<p>${message}</p>`
      });
      console.log(`✅ Message email sent successfully to ${item.reporterEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send message email to ${item.reporterEmail}:`, emailError.message);
      return res.status(500).json({ message: "Failed to send email, but message recorded", success: false });
    }

    return res.status(200).json({ message: "Email sent successfully", success: true });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Delete Lost/Found Item
export const deleteLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFound.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found", success: false });
    }

    // Check if user is authorized to delete (creator or admin)
    if (req.user._id.toString() !== item.createdBy.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this item", success: false });
    }

    // Delete associated image from cloudinary if exists
    if (item.image) {
      try {
        const publicId = item.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from cloudinary:", cloudinaryError);
        // Don't fail the operation if image deletion fails
      }
    }

    await LostFound.findByIdAndDelete(id);

    return res.status(200).json({ message: "Item deleted successfully", success: true });
  } catch (error) {
    console.error("Delete LostFound Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
