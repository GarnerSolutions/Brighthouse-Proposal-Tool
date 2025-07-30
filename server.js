// Complete fixed server.js with parameter validation for PowerPoint generation

// 🌍 Load environment variables from .env FIRST
import "dotenv/config";

// ✅ Import dependencies
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import fetch from "node-fetch";
import fs from "fs";
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
        origin: function (origin, callback) {
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

        // ✅ Initialize the Google Slides API
        const slides = google.slides({ version: "v1", auth });
        const presentationId = "1tZF_Ax-e2BBeL3H7ZELy_rtzOUDwBjxFSoqQl13ygQc";

        // ✅ Get the presentation to check if it exists
        try {
            const presentation = await slides.presentations.get({ presentationId });
            console.log("✅ Presentation found:", presentation.data.title);
        } catch (error) {
            console.error("❌ Failed to access presentation:", error.message);
            throw new Error(`Failed to access presentation: ${error.message}`);
        }

        // ✅ Prepare the batch update requests
        const requests = [
            // ✅ Update the address on slide 1
            {
                replaceAllText: {
                    containsText: { text: "{{ADDRESS}}" },
                    replaceText: params.address || "Your Address",
                },
            },
            // ✅ Update the system size on slide 2
            {
                replaceAllText: {
                    containsText: { text: "{{SYSTEM_SIZE}}" },
                    replaceText: `${params.solarSize} kW`,
                },
            },
            // ✅ Update the panel count on slide 2
            {
                replaceAllText: {
                    containsText: { text: "{{PANEL_COUNT}}" },
                    replaceText: `${params.panelCount}`,
                },
            },
            // ✅ Update the battery size on slide 2
            {
                replaceAllText: {
                    containsText: { text: "{{BATTERY_SIZE}}" },
                    replaceText: params.batterySize || "None",
                },
            },
            // ✅ Update the annual production on slide 3
            {
                replaceAllText: {
                    containsText: { text: "{{ANNUAL_PRODUCTION}}" },
                    replaceText: `${Math.round(params.estimatedAnnualProduction).toLocaleString()} kWh`,
                },
            },
            // ✅ Update the energy offset on slide 3
            {
                replaceAllText: {
                    containsText: { text: "{{ENERGY_OFFSET}}" },
                    replaceText: params.energyOffset || "100%",
                },
            },
            // ✅ Update the system cost on slide 4
            {
                replaceAllText: {
                    containsText: { text: "{{SYSTEM_COST}}" },
                    replaceText: `$${Number(params.systemCost).toLocaleString()}`,
                },
            },
            // ✅ Update the monthly payment on slide 4
            {
                replaceAllText: {
                    containsText: { text: "{{MONTHLY_PAYMENT}}" },
                    replaceText: `$${Number(params.monthlyCost).toLocaleString()}`,
                },
            },
            // ✅ Update the current bill on slide 4
            {
                replaceAllText: {
                    containsText: { text: "{{CURRENT_BILL}}" },
                    replaceText: `$${Number(params.currentMonthlyAverageBill).toLocaleString()}`,
                },
            },
            // ✅ Update the financing term on slide 4
            {
                replaceAllText: {
                    containsText: { text: "{{FINANCING_TERM}}" },
                    replaceText: `${params.financingTerm || 25} years`,
                },
            },
            // ✅ Update the interest rate on slide 4
            {
                replaceAllText: {
                    containsText: { text: "{{INTEREST_RATE}}" },
                    replaceText: `${params.interestRate || 5.99}%`,
                },
            },
        ];

        // ✅ Send the batch update request
        console.log("🔄 Sending API request to update slides...");
        await slides.presentations.batchUpdate({
            presentationId: presentationId,
            requestBody: {
                requests: requests,
            },
        });

        console.log("✅ Google Slides updated successfully");

        // ✅ Return the URL to the presentation
        return `https://docs.google.com/presentation/d/${presentationId}/edit?usp=sharing`;
    } catch (error) {
        console.error("❌ Failed to generate PowerPoint:", error.message);
        throw new Error(`Failed to generate PowerPoint: ${error.message}`);
    }
}


app.post("/api/calculateSolarSize", async (req, res) => {
    try {
        console.log("📊 Received calculation request:", req.body);

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

        // Validate required parameters
        if (!address || typeof address !== "string" || address.trim() === "") {
            console.log("❌ Validation failed: Invalid address");
            return res.status(400).json({ error: "A valid address is required. Please select an address from the suggestions." });
        }

        if (isNaN(systemCost) || systemCost < 0) {
            console.log("❌ Validation failed: Invalid system cost");
            return res.status(400).json({ error: "Valid system cost is required (must be a non-negative number)" });
        }

        if (!currentConsumption || isNaN(currentConsumption) || currentConsumption <= 0) {
            console.log("❌ Validation failed: Invalid current consumption");
            return res.status(400).json({ 
                error: "Valid current consumption is required",
                message: "Please enter your current annual electricity consumption in kWh"
            });
        }

        // Geocode the address to get coordinates
        let latitude, longitude;
        try {
            console.log("📍 Geocoding address:", address);
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;
            console.log("📍 Geocoding URL:", geocodeUrl);
            const geocodeResponse = await fetch(geocodeUrl);
            console.log("📍 Geocoding response status:", geocodeResponse.status);

            if (!geocodeResponse.ok) {
                console.error("❌ Geocoding HTTP error:", geocodeResponse.status, geocodeResponse.statusText);
                return res.status(500).json({ error: "Geocoding service unavailable", status: geocodeResponse.status });
            }

            const geocodeData = await geocodeResponse.json();
            console.log("📍 Geocoding response data:", geocodeData);

            if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
                console.error("❌ Geocoding failed:", geocodeData);
                return res.status(400).json({ error: "Could not geocode address", details: geocodeData });
            }

            const location = geocodeData.results[0].geometry.location;
            latitude = location.lat;
            longitude = location.lng;
            console.log("📍 Geocoded coordinates:", latitude, longitude);
        } catch (error) {
            console.error("❌ Geocoding error:", error.message);
            return res.status(500).json({ error: "Error geocoding address", details: error.message });
        }

        // Get solar resource data from NREL API
        let annualSolarRadiation;
        try {
            console.log("☀️ Fetching solar resource data from NREL API...");
            const nrelUrl = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${nrelApiKey}&lat=${latitude}&lon=${longitude}`;
            console.log("☀️ NREL API URL:", nrelUrl);
            const nrelResponse = await fetch(nrelUrl);
            console.log("☀️ NREL response status:", nrelResponse.status);

            if (!nrelResponse.ok) {
                console.error("❌ NREL API HTTP error:", nrelResponse.status, nrelResponse.statusText);
                return res.status(500).json({ error: "NREL API service unavailable", status: nrelResponse.status });
            }

            const nrelData = await nrelResponse.json();
            console.log("☀️ NREL response data:", nrelData);

            if (!nrelData.outputs || !nrelData.outputs.avg_dni || !nrelData.outputs.avg_dni.annual) {
                console.error("❌ NREL API error:", nrelData);
                return res.status(500).json({ error: "Could not retrieve solar resource data", details: nrelData });
            }

            annualSolarRadiation = nrelData.outputs.avg_dni.annual;
            console.log("☀️ Annual Solar Radiation:", annualSolarRadiation, "kWh/m²/day");
        } catch (error) {
            console.error("❌ NREL API error:", error.message);
            return res.status(500).json({ error: "Error retrieving solar resource data", details: error.message });
        }

        // Calculate solar system size based on consumption and solar radiation
        console.log("📈 Calculating solar system size...");
        const annualConsumption = Number(currentConsumption);
        const solarSize = annualConsumption / (annualSolarRadiation * 365 * performanceRatio);
        const roundedSolarSize = Math.round(solarSize * 10) / 10;

        // Calculate number of panels (assuming 400W panels)
        const panelWattage = 400;
        const panelCount = Math.ceil((roundedSolarSize * 1000) / panelWattage);

        // Calculate estimated annual production
        const estimatedAnnualProduction = roundedSolarSize * annualSolarRadiation * 365 * performanceRatio;
        const energyOffset = `${Math.min(100, Math.round((estimatedAnnualProduction / annualConsumption) * 100))}%`;

        // Calculate battery size
        const batterySize = batteryCount > 0 ? `${batteryCount} x 10 kWh` : "None";

        // Prepare response parameters
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

        // Generate PowerPoint presentation if all required parameters are available
        let pptUrl = null;
        let pdfViewUrl = null;

        if (roundedSolarSize > 0 && systemCost > 0) {
            if (!auth) {
                console.error("⚠️ Skipping PowerPoint generation: Google Auth not initialized");
            } else {
                try {
                    console.log("📊 Generating PowerPoint...");
                    pptUrl = await generatePowerPoint(params, auth);
                    console.log("✅ PowerPoint URL:", pptUrl);

                    // Export the presentation as PDF
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

                        pdfViewUrl = `/api/viewPdf/${pdfFileName}`;
                        console.log("✅ PDF View URL:", pdfViewUrl);
                    } catch (error) {
                        console.error("⚠️ PDF export failed:", error.message);
                        console.warn("⚠️ Skipping PDF export due to error.");
                    }
                } catch (error) {
                    console.error("⚠️ PowerPoint generation failed:", error.message);
                    console.warn("⚠️ Skipping PowerPoint generation due to error.");
                }
            }
        } else {
            console.log("⚠️ Skipping PowerPoint generation due to missing or invalid parameters");
        }

        // Send response
        const responseBody = {
            success: true,
            params,
            pptUrl,
            pdfViewUrl,
        };
        console.log("📤 Sending response to client:", responseBody);
        res.json(responseBody);
    } catch (error) {
        console.error("❌ Error in calculateSolarSize:", error.message);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// ✅ Serve PDF files
app.get("/api/viewPdf/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(tempDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "PDF not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Initialize Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "credentials.json",
    scopes: [
        "https://www.googleapis.com/auth/presentations",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.readonly",
    ],
});

console.log("GOOGLE_CLOUD_CREDENTIALS (RAW):", process.env.GOOGLE_CLOUD_CREDENTIALS);
