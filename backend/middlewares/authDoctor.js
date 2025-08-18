import jwt from 'jsonwebtoken'

// user authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const dToken = req.headers.dtoken || req.headers.dToken;

    if (!dToken) {
      return res.json({ success: false, message: "Not authorised, login again" });
    }

    const decoded = jwt.verify(dToken, process.env.JWT_SECRET);

    // Attach doctor ID to request object (safe for all methods)
    req.docId = decoded.id;
    console.log(req.docId)
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;