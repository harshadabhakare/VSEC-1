require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bloodconnect";
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const donorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  age: { type: Number, required: true, min: 18, max: 65 },
  bloodGroup: { type: String, required: true, enum: bloodGroups },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  available: { type: Boolean, default: true },
  lastDonation: { type: String, default: "", maxlength: 20 }
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  patient: { type: String, required: true, trim: true, maxlength: 100 },
  bloodGroup: { type: String, required: true, enum: bloodGroups },
  units: { type: Number, required: true, min: 1, max: 20 },
  hospital: { type: String, required: true, trim: true, maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  contact: { type: String, required: true, trim: true, maxlength: 20 },
  urgency: { type: String, enum: ["Critical", "Urgent", "Normal"], default: "Urgent" },
  notes: { type: String, default: "", maxlength: 500 },
  status: { type: String, enum: ["Open", "Fulfilled"], default: "Open" }
}, { timestamps: true });

const Donor = mongoose.model("Donor", donorSchema);
const BloodRequest = mongoose.model("BloodRequest", requestSchema);

app.get("/api/health", (req, res) => res.json({
  ok: true, service: "BloodConnect API",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
}));

app.get("/api/donors", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.bloodGroup && bloodGroups.includes(req.query.bloodGroup)) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.city) filter.city = { $regex: String(req.query.city).slice(0, 80), $options: "i" };
    const donors = await Donor.find(filter).sort({ createdAt: -1 }).lean();
    res.json(donors.map(d => ({ ...d, id: String(d._id) })));
  } catch (err) { next(err); }
});

app.post("/api/donors", async (req, res, next) => {
  try {
    const { name, age, bloodGroup, city, phone, available, lastDonation } = req.body || {};
    const donor = await Donor.create({ name, age: Number(age), bloodGroup, city, phone, available: available !== false && available !== "false", lastDonation });
    res.status(201).json({ ...donor.toObject(), id: String(donor._id) });
  } catch (err) { next(err); }
});

app.get("/api/requests", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && ["Open", "Fulfilled"].includes(req.query.status)) filter.status = req.query.status;
    const requests = await BloodRequest.find(filter).sort({ createdAt: -1 }).lean();
    res.json(requests.map(r => ({ ...r, id: String(r._id) })));
  } catch (err) { next(err); }
});

app.post("/api/requests", async (req, res, next) => {
  try {
    const { patient, bloodGroup, units, hospital, city, contact, urgency, notes } = req.body || {};
    const request = await BloodRequest.create({
      patient, bloodGroup, units: Number(units), hospital, city, contact,
      urgency: urgency || "Urgent", notes, status: "Open"
    });
    res.status(201).json({ ...request.toObject(), id: String(request._id) });
  } catch (err) { next(err); }
});

app.patch("/api/requests/:id/status", async (req, res, next) => {
  try {
    if (!["Open", "Fulfilled"].includes(req.body.status)) return res.status(400).json({ message: "Status must be Open or Fulfilled." });
    const updated = await BloodRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Blood request not found." });
    res.json({ ...updated.toObject(), id: String(updated._id) });
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  if (err.name === "ValidationError" || err.name === "CastError") return res.status(400).json({ message: err.message || "Please check the submitted details." });
  console.error(err);
  res.status(500).json({ message: "Server error. Please try again." });
});

async function seedDemoData() {
  const dataDir = path.join(__dirname, "data");
  const readJson = name => { try { return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8")); } catch { return []; } };
  if (await Donor.countDocuments() === 0) {
    const donors = readJson("donors.json").map(({ id, ...d }) => ({ ...d, age: Number(d.age) }));
    if (donors.length) { await Donor.insertMany(donors); console.log(`Added ${donors.length} demo donors to MongoDB.`); }
  }
  if (await BloodRequest.countDocuments() === 0) {
    const requests = readJson("requests.json").filter(r => r.patient && r.hospital && r.contact)
      .map(({ id, createdAt, ...r }) => ({ ...r, units: Number(r.units || 1) }));
    if (requests.length) { await BloodRequest.insertMany(requests); console.log(`Added ${requests.length} demo requests to MongoDB.`); }
  }
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    await seedDemoData();
    app.listen(PORT, () => console.log(`BloodConnect API running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("Could not connect to MongoDB. Check that MongoDB is running and MONGODB_URI is correct.");
    console.error(err.message);
    process.exit(1);
  });
