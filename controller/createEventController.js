const Event = require('../model/eventModel');
const uploadImageToImgBB = require('../utils/imageUpload');

const createEvents = async (req, res) => {
  const { title, description, location, startDate, endDate, capacity } = req.body;
  const imagePath = req.file ? req.file.path : null;
  try {
    let imageUrl = null;
    if (imagePath) {
      const uploadResponse = await uploadImageToImgBB(imagePath);
      imageUrl = uploadResponse.data.display_url;
    }
    const newEvent = new Event({
      title,
      description,
      location,
      startDate,
      endDate,
      image: imageUrl,
      capacity: parseInt(capacity, 10),
      bookedSeats: 0,
      bookings: []
    });
    await newEvent.save();
    res.status(201).json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



const listEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({createdAt: -1});
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, location, startDate, endDate } = req.body;

  try {
    const image = req.file ? req.file.path : null;
    let imageUrl = null;

    if (image) {
      const uploadResponse = await uploadImageToImgBB(image);
      if (uploadResponse && uploadResponse.data) {
        imageUrl = uploadResponse.data.display_url; // Get the uploaded image URL
      } else {
        throw new Error('Image upload failed'); // Handle the error if the upload fails
      }
    }
    
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    existingEvent.title = title;
    existingEvent.description = description;
    existingEvent.location = location;
    existingEvent.startDate = startDate;
    existingEvent.endDate = endDate;
    if (imageUrl) {
      existingEvent.image = imageUrl;
    }
    const updatedEvent = await existingEvent.save();
    res.status(200).json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {createEvents , listEvents , updateEvent , deleteEvent};
