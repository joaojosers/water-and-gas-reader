import express from 'express';
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the POST route for /upload
app.post('/upload', (req, res) => {
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  // Validate the request body
  if (!image || !customer_code || !measure_datetime || !measure_type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Process the request (for example, save the data or perform some action)
  // Here we just send a success response for demonstration purposes
  res.status(200).json({ message: 'Upload successful', data: req.body });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
