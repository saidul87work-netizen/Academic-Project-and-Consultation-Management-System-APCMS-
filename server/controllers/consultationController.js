import { ConsultationRequest } from '../models/model.js';

// Feature 1: Students can request consultation sessions based on faculty availability
export const requestConsultation = async (req, res) => {
  const { faculty, reason, preferredStart, preferredEnd } = req.body;
  try {
    const newRequest = await ConsultationRequest.create({
      requester: req.user._id,
      faculty,
      reason,
      preferredStart,
      preferredEnd,
      status: 'requested'
    });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create consultation request.' });
  }
};

export const getMyConsultations = async (req, res) => {
  try {
    const isFaculty = req.user.roles.includes('faculty');
    const query = isFaculty ? { faculty: req.user._id } : { requester: req.user._id };
    
    const consultations = await ConsultationRequest.find(query)
      .populate('requester', 'name universityId email')
      .populate('faculty', 'name email')
      .populate('assignedSTs', 'name email')
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch consultations.' });
  }
};

// Feature 2: Faculty can accept or decline consultation requests
// Feature 3: Faculty can assign student tutors (STs) to consultation sessions
export const updateConsultationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignedSTs } = req.body; // Expecting assignedSTs as an array of IDs

  try {
    const consultation = await ConsultationRequest.findById(id);
    if (!consultation || consultation.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized or consultation not found.' });
    }

    consultation.status = status;

    if (status === 'accepted') {
      consultation.confirmedStart = consultation.preferredStart;
      if (assignedSTs && Array.isArray(assignedSTs)) {
        consultation.assignedSTs = assignedSTs;
      }
    }

    await consultation.save();
    
    // send back fully populated doc
    const updatedDoc = await ConsultationRequest.findById(id)
      .populate('requester', 'name')
      .populate('faculty', 'name')
      .populate('assignedSTs', 'name');
      
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update consultation.' });
  }
};

// Feature 4: Students can provide feedback on assigned STs
export const submitFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const consultation = await ConsultationRequest.findById(id);

    if (!consultation || consultation.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized or not found.' });
    }

    consultation.feedbackForST = {
      rating,
      comment,
      submittedBy: req.user._id,
      submittedAt: new Date()
    };

    await consultation.save();
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback.' });
  }
};

// Feature 5: Calendar Schedule integration endpoint (all accepted sessions)
export const getFacultySchedule = async (req, res) => {
  try {
    const sessions = await ConsultationRequest.find({
      faculty: req.user._id,
      status: 'accepted'
    }).populate('requester', 'name universityId')
      .populate('assignedSTs', 'name')
      .sort({ confirmedStart: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedule.' });
  }
};
