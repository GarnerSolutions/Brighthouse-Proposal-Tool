// 🌍 Load environment variables from .env FIRST
import "dotenv/config";

// ✅ Import dependencies
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import fetch from "node-fetch";
import fs from "fs";
// Removed problematic line: process.env.GOOGLE_CLOUD_CREDENTIALS = fs.readFileSync(".env").toString();
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDir = path.join(__dirname, "temp");

// ✅ Ensure the temp directory exists before saving files
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log("📂 Created missing temp directory:", tempDir);
}

console.log(tempDir);
// ✅ Initialize Express App First
const app = express();
app.use(express.json());

// ✅ Define Allowed Origins
const allowedOrigins = [
    "https://cool-yeot-0785e3.netlify.app", // ✅ Netlify Frontend
    "https://solar-calculator-zb73.onrender.com", // ✅ Render Backend
    "http://localhost:3000", // ✅ Allow local testing
    "http://127.0.0.1:5500", // ✅ Allow local front-end (Live Server port) 
    "http://127.0.0.1:5501",
    "http://localhost:5500", // ✅ Additional Live Server variants
    "http://localhost:5501"  // ✅ Additional Live Server variants
];

app.use(
    cors({
        origin: function (origin, callback)  {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.error("❌ CORS Blocked Request from:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
const googlePlacesApiKey = process.env.GOOGLE_MAPS_API_KEY;
const nrelApiKey = process.env.NREL_API_KEY;
const performanceRatio = 0.70;

console.log("🔑 GOOGLE_MAPS_API_KEY:", googleMapsApiKey ? "Loaded ✅" : "❌ NOT FOUND");
console.log("🔑 GOOGLE_PLACES_API_KEY:", googlePlacesApiKey ? "Loaded ✅" : "❌ NOT FOUND");
console.log("🔑 NREL_API_KEY:", nrelApiKey ? "Loaded ✅" : "❌ NOT FOUND");

// ✅ Provide the Google Maps API Key Securely to the Frontend (Kept for compatibility)
app.get("/api/getGoogleMapsApiKey", (req, res) => {
    if (!googleMapsApiKey) {
        return res.status(500).json({ error: "Google Maps API Key not found" });
    }
    res.json({ apiKey: googleMapsApiKey });
});

// ✅ Generate PowerPoint Function (Moved Before Endpoints)
async function generatePowerPoint(params, auth) {
    try {
        console.log("📊 Updating Google Slides with:", params);

        // ✅ Verify authentication
        const authClient = await auth.getClient();
        if (!authClient) {
            console.error("❌ Authentication failed: No auth client returned");
            throw new Error("Authentication with Google Slides API failed: No auth client returned");
        }
        console.log("✅ Successfully authenticated with Google Slides API");

        const slides = google.slides({ version: "v1", auth });
        const presentationId = "1tZF_Ax-e2BBeL3H7ZELy_rtzOUDwBjxFSoqQl13ygQc";

        // ✅ Verify the presentation exists and is accessible
        try {
            const presentation = await slides.presentations.get({ presentationId });
            console.log("✅ Presentation found:", presentation.data.title);
        } catch (error) {
            console.error("❌ Failed to access presentation:", error.message);
            if (error.response) {
                console.error("API Response:", error.response.data);
            }
            throw new Error(`Failed to access presentation: ${error.message}`);
        }

        console.log("🔄 Sending API request to update slides...");

        await slides.presentations.batchUpdate({
            presentationId: presentationId,
            requestBody: {
                requests: [
                    // 📜 Slide 4: System Overview
                    { deleteText: { objectId: "p4_i4", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p4_i4", text: `${params.solarSize} kW` } },
                    {
                        updateTextStyle: {
                            objectId: "p4_i4",
                            textRange: { type: "ALL" },
                            style: {
                                bold: true,
                                fontFamily: "Comfortaa",
                                fontSize: { magnitude: 51, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    { deleteText: { objectId: "p4_i7", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p4_i7", text: `${params.batterySize}` } },
                    {
                        updateTextStyle: {
                            objectId: "p4_i7",
                            textRange: { type: "ALL" },
                            style: {
                                bold: true,
                                fontFamily: "Comfortaa",
                                fontSize: { magnitude: 51, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    { deleteText: { objectId: "p4_i10", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p4_i10", text: `$${Number(params.systemCost).toLocaleString()}` } },
                    {
                        updateTextStyle: {
                            objectId: "p4_i10",
                            textRange: { type: "ALL" },
                            style: {
                                bold: true,
                                fontFamily: "Comfortaa",
                                fontSize: { magnitude: 51, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    // 📜 Slide 5: System Details
                    { deleteText: { objectId: "p5_i6", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p5_i6", text: `${params.solarSize} kW system size` } },
                    {
                        updateTextStyle: {
                            objectId: "p5_i6",
                            textRange: { type: "ALL" },
                            style: {
                                bold: false,
                                fontFamily: "Raleway",
                                fontSize: { magnitude: 19, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    { deleteText: { objectId: "p5_i7", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p5_i7", text: `${params.energyOffset} Energy Offset` } },
                    {
                        updateTextStyle: {
                            objectId: "p5_i7",
                            textRange: { type: "ALL" },
                            style: {
                                bold: false,
                                fontFamily: "Raleway",
                                fontSize: { magnitude: 19, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    { deleteText: { objectId: "p5_i8", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p5_i8", text: `${params.panelCount} Jinko Solar panels` } },
                    {
                        updateTextStyle: {
                            objectId: "p5_i8",
                            textRange: { type: "ALL" },
                            style: {
                                bold: false,
                                fontFamily: "Raleway",
                                fontSize: { magnitude: 19, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    { deleteText: { objectId: "p5_i19", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p5_i19", text: `$${Number(params.systemCost).toLocaleString()} financed` } },
                    {
                        updateTextStyle: {
                            objectId: "p5_i19",
                            textRange: { type: "ALL" },
                            style: {
                                bold: false,
                                fontFamily: "Raleway",
                                fontSize: { magnitude: 19, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                    { deleteText: { objectId: "p5_i20", textRange: { type: "ALL" } } },
                    { insertText: { objectId: "p5_i20", text: `$${Number(params.monthlyCost).toLocaleString()} per month` } },
                    {
                        updateTextStyle: {
                            objectId: "p5_i20",
                            textRange: { type: "ALL" },
                            style: {
                                bold: false,
                                fontFamily: "Raleway",
                                fontSize: { magnitude: 19, unit: "PT" },
                                foregroundColor: { opaqueColor: { rgbColor: { red: 0.843, green: 0.831, blue: 0.8 } } },
                            },
                            fields: "bold,fontFamily,fontSize,foregroundColor",
                        },
                    },
                ],
            },
        });

        console.log("✅ Google Slides updated successfully");

        // ✅ Export the presentation as PDF
        const drive = google.drive({ version: "v3", auth });
        const fileId = presentationId;
        const pptUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

        console.log("✅ PowerPoint URL:", pptUrl);
        return pptUrl;
    } catch (error) {
        console.error("❌ Failed to generate PowerPoint:", error.message);
        throw new Error(`Failed to generate PowerPoint: ${error.message}`);
    }
}

// ✅ Calculate Solar Size Endpoint
app.post("/api/calculateSolarSize", async (req, res) => {
    try {
        console.log("📊 Received calculation request:", req.body);

        // ✅ Extract parameters from request
        const {
            address,
            currentConsumption,
            currentMonthlyAverageBill,
            batteryCount,
            financingTerm,
            interestRate,
            systemCost,
            salesCommission,
            monthlyCost,
        } = req.body;

        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        // ✅ Geocode the address to get coordinates
        let latitude, longitude;
        try {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
                console.error("❌ Geocoding failed:", geocodeData);
                return res.status(400).json({ error: "Could not geocode address" });
            }

            const location = geocodeData.results[0].geometry.location;
            latitude = location.lat;
            longitude = location.lng;
            console.log("📍 Geocoded coordinates:", latitude, longitude);
        } catch (error) {
            console.error("❌ Geocoding error:", error);
            return res.status(500).json({ error: "Error geocoding address" });
        }

        // ✅ Get solar resource data from NREL API
        let annualSolarRadiation;
        try {
            const nrelUrl = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${nrelApiKey}&lat=${latitude}&lon=${longitude}`;
            const nrelResponse = await fetch(nrelUrl);
            const nrelData = await nrelResponse.json();

            if (!nrelData.outputs || !nrelData.outputs.avg_dni || !nrelData.outputs.avg_dni.annual) {
                console.error("❌ NREL API error:", nrelData);
                return res.status(500).json({ error: "Could not retrieve solar resource data" });
            }

            annualSolarRadiation = nrelData.outputs.avg_dni.annual;
            console.log("☀️ Annual Solar Radiation:", annualSolarRadiation, "kWh/m²/day");
        } catch (error) {
            console.error("❌ NREL API error:", error);
            return res.status(500).json({ error: "Error retrieving solar resource data" });
        }

        // ✅ Calculate solar system size based on consumption and solar radiation
        // Formula: System Size (kW) = Annual Consumption (kWh) / (Annual Solar Radiation (kWh/m²/day) * 365 days * Performance Ratio)
        const annualConsumption = currentConsumption || 12000; // Default to 12,000 kWh if not provided
        const solarSize = annualConsumption / (annualSolarRadiation * 365 * performanceRatio);
        const roundedSolarSize = Math.round(solarSize * 10) / 10; // Round to 1 decimal place

        // ✅ Calculate number of panels (assuming 400W panels)
        const panelWattage = 400; // 400W panels
        const panelCount = Math.ceil((roundedSolarSize * 1000) / panelWattage);

        // ✅ Calculate estimated annual production
        const estimatedAnnualProduction = roundedSolarSize * annualSolarRadiation * 365 * performanceRatio;
        const energyOffset = `${Math.min(100, Math.round((estimatedAnnualProduction / annualConsumption) * 100))}%`;

        // ✅ Calculate battery size
        const batterySize = batteryCount > 0 ? `${batteryCount} x 16 kWh` : "None";

        // ✅ Prepare response parameters
        const params = {
            address,
            latitude,
            longitude,
            annualSolarRadiation,
            solarSize: roundedSolarSize,
            panelCount,
            estimatedAnnualProduction,
            energyOffset,
            batterySize,
            batteryCount,
            systemCost,
            financingTerm,
            interestRate,
            monthlyCost,
            currentConsumption: annualConsumption,
            currentMonthlyAverageBill,
            salesCommission,
        };

        // ✅ Generate PowerPoint presentation if all required parameters are available
        let pptUrl = null;
        let pdfViewUrl = null;

        if (roundedSolarSize && systemCost) {
            // Create the auth object here
            const auth = new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "credentials.json",
                scopes: [
                    "https://www.googleapis.com/auth/presentations",
                    "https://www.googleapis.com/auth/drive",
                    "https://www.googleapis.com/auth/drive.readonly",
                ],
            });
        
            try {
                pptUrl = await generatePowerPoint(params, auth);
                console.log("✅ PowerPoint URL:", pptUrl);

                // ✅ Export the presentation as PDF
                try {
                    const drive = google.drive({ version: "v3", auth });
                    const presentationId = "1tZF_Ax-e2BBeL3H7ZELy_rtzOUDwBjxFSoqQl13ygQc";
                    const pdfFileName = `Brighthouse_Solar_Proposal_${uuidv4()}.pdf`;
                    const pdfFilePath = path.join(tempDir, pdfFileName);

                    console.log("📄 Exporting presentation as PDF...");
                    const pdfResponse = await drive.files.export({
                        fileId: presentationId,
                        mimeType: "application/pdf",
                    }, { responseType: "arraybuffer" });

                    fs.writeFileSync(pdfFilePath, Buffer.from(pdfResponse.data));
                    console.log("✅ PDF saved to:", pdfFilePath);

                    // ✅ Create a publicly accessible URL for the PDF
                    pdfViewUrl = `/api/viewPdf/${pdfFileName}`;
                    console.log("✅ PDF View URL:", pdfViewUrl);
                } catch (error) {
                    console.error("⚠️ PDF export failed:", error.message);
                    console.warn("⚠️ Skipping PDF export because PowerPoint generation failed.");
                }
            } catch (error) {
                console.error("⚠️ PowerPoint generation failed:", error);
                console.warn("⚠️ Skipping PDF export because PowerPoint generation failed.");
            }
        } else {
            console.log("⚠️ Skipping PowerPoint generation due to missing parameters");
        }

        // ✅ Send response
        res.json({
            success: true,
            params,
            pptUrl,
            pdfViewUrl,
        });
    } catch (error) {
        console.error("❌ Error in calculateSolarSize:", error);
        res.status(500).json({ error: "An error occurred during calculation" });
    }
});

// ✅ Serve PDF files
app.get("/api/viewPdf/:filename", (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(tempDir, filename);

        if (!fs.existsSync(filePath)) {
            console.error("❌ PDF file not found:", filePath);
            return res.status(404).send("PDF not found");
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error("❌ Error serving PDF:", error);
        res.status(500).send("Error serving PDF");
    }
});

// ✅ Serve static files from the current directory
app.use(express.static("."));

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Create a single reusable auth object for Google APIs
// Modified to use environment variable for credentials path if available
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "credentials.json",
    scopes: [
        "https://www.googleapis.com/auth/presentations",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.readonly",
    ],
});

// Log for debugging purposes
console.log("✅ Server initialization complete");
