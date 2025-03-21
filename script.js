// 🌍 Switch between local and live backend by commenting/uncommenting the correct line:
// const apiUrl = "http://localhost:3000/api/calculateSolarSize";  // 🔧 Use for LOCAL TESTING
const apiUrl = "https://solar-calculator-zb73.onrender.com/api/calculateSolarSize";  // 🌍 Use for LIVE SERVER

// const backendUrl = "http://localhost:3000";
const backendUrl = "https://solar-calculator-zb73.onrender.com";

console.log(`🌐 Using API URL: ${apiUrl}`);
console.log(`🌐 Using Backend URL: ${backendUrl}`);

// Global form submission prevention
window.addEventListener('DOMContentLoaded', function() {
    // Prevent all forms from submitting
    document.addEventListener('submit', function(e) {
        console.log('Form submission intercepted globally');
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true); // Use capturing phase
});

// Initialize Places Autocomplete for both Wizard and Manual Entry modes
let googleMapsLoaded = false;

// Add a global variable to store the selected place object
let selectedPlace = null;

window.initMap = function() {
    console.log("✅ initMap called by Google Maps API");
    if (typeof initializeAutocomplete === "function") {
        initializeAutocomplete();
    } else {
        console.log("⏳ Waiting for initializeAutocomplete...");
        setTimeout(window.initMap, 500); // Retry after 500ms
    }
};

function initializeAutocomplete() {
    console.log("🔧 Initializing Google Places Autocomplete...");
    if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("❌ Google Maps Places library not loaded");
        return;
    }
    console.log("✅ Google Maps API is loaded, setting up Autocomplete");

    // Wizard Mode Autocomplete
    const fullAddressInput = document.getElementById("fullAddress");
    if (fullAddressInput) {
        const autocomplete = new google.maps.places.Autocomplete(fullAddressInput, {
            types: ["geocode"],
            componentRestrictions: { country: "us" }
        });
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) {
                console.error("❌ No place details found. Try selecting an address from the dropdown.");
                return;
            }
            console.log("📍 Selected Address:", place.formatted_address);
            fullAddressInput.dataset.address = place.formatted_address || "";
            selectedPlace = place; // ✅ Ensure `selectedPlace` is assigned correctly
        });
        

        // Log input events for debugging
        fullAddressInput.addEventListener("input", () => {
            console.log("Input event on fullAddress:", fullAddressInput.value);
            // Clear the selected place if the user modifies the input
            if (fullAddressInput.value !== fullAddressInput.dataset.address) {
                selectedPlace = null;
            }
        });
    }

    // Manual Entry Mode Autocomplete
    const manualFullAddressInput = document.getElementById("manualFullAddress");
    if (manualFullAddressInput) {
        const manualAutocomplete = new google.maps.places.Autocomplete(manualFullAddressInput, {
            types: ["geocode"],
            componentRestrictions: { country: "us" }
        });
        manualAutocomplete.addListener("place_changed", () => {
            const place = manualAutocomplete.getPlace();
            console.log("📍 Selected Address (Manual):", place.formatted_address);
            console.log("📍 Full place object (Manual):", place);
            manualFullAddressInput.dataset.address = place.formatted_address || "";
            // Store the full place object
            selectedPlace = place;
        });

        // Log input events for debugging
        manualFullAddressInput.addEventListener("input", () => {
            console.log("Input event on manualFullAddress:", manualFullAddressInput.value);
            // Clear the selected place if the user modifies the input
            if (manualFullAddressInput.value !== manualFullAddressInput.dataset.address) {
                selectedPlace = null;
            }
        });
    }

    console.log("✅ Autocomplete setup complete");
}

// ✅ Toggle Dropdown Functionality
function setupDropdown() {
    const dropdownHeader = document.querySelector(".dropdown-header");
    const dropdownContent = document.querySelector(".dropdown-content");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const resultsColumn = document.querySelector(".results-column");

    if (!dropdownHeader || !dropdownContent || !dropdownToggle || !resultsColumn) {
        console.error("❌ One or more dropdown elements not found!");
        return;
    }

    dropdownHeader.addEventListener("click", () => {
        const isExpanded = dropdownToggle.getAttribute("aria-expanded") === "true";
        dropdownToggle.setAttribute("aria-expanded", !isExpanded);
        dropdownContent.classList.toggle("hidden");

        if (isExpanded) {
            resultsColumn.style.margin = "0";
            resultsColumn.style.width = "100%";
        } else {
            resultsColumn.style.margin = "";
            resultsColumn.style.width = "";
        }
    });
}

// ✅ Handle Consumption Estimation Modal
function setupConsumptionHelp() {
    const helpText = document.getElementById("helpConsumptionText");
    const helpModal = document.getElementById("consumptionHelpModal");
    const estimateModal = document.getElementById("consumptionEstimateModal");
    const calculateConsumptionButton = document.getElementById("calculateConsumptionButton");
    const closeHelpModalButton = document.getElementById("closeHelpModalButton");
    const closeEstimateModalButton = document.getElementById("closeEstimateModalButton");

    if (!helpText || !helpModal || !estimateModal || !calculateConsumptionButton || !closeHelpModalButton || !closeEstimateModalButton) {
        console.warn("⚠️ One or more consumption help elements not found! Help feature may be unavailable.");
        return;
    }

    helpText.addEventListener("click", () => {
        helpModal.style.display = "flex";
    });

    closeHelpModalButton.addEventListener("click", () => {
        helpModal.style.display = "none";
    });

    calculateConsumptionButton.addEventListener("click", () => {
        const utilityRate = Number(document.getElementById("averageUtilityRate")?.value);
        const monthlyBill = Number(document.getElementById("modalMonthlyBill")?.value);

        if (!utilityRate || utilityRate <= 0 || !monthlyBill || monthlyBill <= 0) {
            alert("Please enter valid values for Utility Rate and Monthly Bill.");
            return;
        }

        const estimatedConsumption = Math.round((monthlyBill / utilityRate) * 12);

        const currentConsumptionInput = document.getElementById("currentConsumption");
        if (currentConsumptionInput) {
            currentConsumptionInput.value = estimatedConsumption;
        } else {
            console.error("❌ Current Consumption input not found!");
        }

        helpModal.style.display = "none";
        estimateModal.style.display = "flex";
        updateBuildSystemButtonState();
        updateCalculateButtonState();
    });

    closeEstimateModalButton.addEventListener("click", () => {
        estimateModal.style.display = "none";
        updateBuildSystemButtonState();
        updateCalculateButtonState();
    });
}

// ✅ Handle Utility Rate Estimation Modal
function setupUtilityRateHelp() {
    const helpUtilityRateText = document.getElementById("helpUtilityRateText");
    const utilityRateHelpModal = document.getElementById("utilityRateHelpModal");
    const utilityRateEstimateModal = document.getElementById("utilityRateEstimateModal");
    const estimateRateButton = document.getElementById("estimateRateButton");
    const closeUtilityRateModalButton = document.getElementById("closeUtilityRateModalButton");
    const closeRateEstimateModalButton = document.getElementById("closeRateEstimateModalButton");

    if (!helpUtilityRateText || !utilityRateHelpModal || !utilityRateEstimateModal || !estimateRateButton || !closeUtilityRateModalButton || !closeRateEstimateModalButton) {
        console.warn("⚠️ One or more utility rate help elements not found! Help feature may be unavailable.");
        return;
    }

    const rateTable = {
        "PG&E": { "No": 0.45, "Yes": 0.31 },
        "SDG&E": { "No": 0.385, "Yes": 0.2695 },
        "SCE": { "No": 0.42, "Yes": 0.294 }
    };

    helpUtilityRateText.addEventListener("click", () => {
        utilityRateHelpModal.style.display = "flex";
    });

    closeUtilityRateModalButton.addEventListener("click", () => {
        utilityRateHelpModal.style.display = "none";
    });

    estimateRateButton.addEventListener("click", () => {
        const utilityProvider = document.getElementById("utilityProvider")?.value;
        const careEnrollment = document.getElementById("careEnrollment")?.value;
        const estimatedUtilityRate = rateTable[utilityProvider][careEnrollment];

        const averageUtilityRateInput = document.getElementById("averageUtilityRate");
        if (averageUtilityRateInput) {
            averageUtilityRateInput.value = estimatedUtilityRate.toFixed(4);
        } else {
            console.error("❌ Average Utility Rate input not found!");
        }

        utilityRateHelpModal.style.display = "none";
        utilityRateEstimateModal.style.display = "flex";
    });

    closeRateEstimateModalButton.addEventListener("click", () => {
        utilityRateEstimateModal.style.display = "none";
    });
}

// ✅ Handle Monthly Bill Estimation Modal
function setupMonthlyBillHelp() {
    const helpMonthlyBillText = document.getElementById("helpMonthlyBillText");
    const monthlyBillHelpModal = document.getElementById("monthlyBillHelpModal");
    const monthlyBillEstimateModal = document.getElementById("monthlyBillEstimateModal");
    const estimateBillButton = document.getElementById("estimateBillButton");
    const closeMonthlyBillModalButton = document.getElementById("closeMonthlyBillModalButton");
    const closeBillEstimateModalButton = document.getElementById("closeBillEstimateModalButton");

    if (!helpMonthlyBillText || !monthlyBillHelpModal || !monthlyBillEstimateModal || !estimateBillButton || !closeMonthlyBillModalButton || !closeBillEstimateModalButton) {
        console.warn("⚠️ One or more monthly bill help elements not found! Help feature may be unavailable.");
        return;
    }

    helpMonthlyBillText.addEventListener("click", () => {
        monthlyBillHelpModal.style.display = "flex";
    });

    closeMonthlyBillModalButton.addEventListener("click", () => {
        monthlyBillHelpModal.style.display = "none";
    });

    estimateBillButton.addEventListener("click", () => {
        const summerBill = Number(document.getElementById("summerBill")?.value);
        const winterBill = Number(document.getElementById("winterBill")?.value);
        const fallSpringBill = Number(document.getElementById("fallSpringBill")?.value);

        if (!summerBill || summerBill < 0 || !winterBill || winterBill < 0 || !fallSpringBill || fallSpringBill < 0) {
            alert("Please enter valid values for all seasonal bills.");
            return;
        }

        const estimatedMonthlyBill = (summerBill * (3/12)) + (winterBill * (3/12)) + (fallSpringBill * (6/12));

        const modalMonthlyBillInput = document.getElementById("modalMonthlyBill");
        if (modalMonthlyBillInput) {
            modalMonthlyBillInput.value = estimatedMonthlyBill.toFixed(2);
        } else {
            console.error("❌ Modal Monthly Bill input not found!");
        }

        monthlyBillHelpModal.style.display = "none";
        monthlyBillEstimateModal.style.display = "flex";
    });

    closeBillEstimateModalButton.addEventListener("click", () => {
        monthlyBillEstimateModal.style.display = "none";
    });
}

// ✅ Handle Build System Button (Calculate Solar Size)
async function buildSystem() {
    const currentConsumption = Number(document.getElementById("currentConsumption")?.value);
    const desiredProduction = Number(document.getElementById("desiredProduction")?.value);
    const panelDirection = document.getElementById("panelDirection")?.value;
    const shadingElement = document.getElementById("shading");
    const shading = shadingElement ? shadingElement.value.toLowerCase() : "none";
    const fullAddressInput = document.getElementById("fullAddress");
    const fullAddress = fullAddressInput?.dataset.address || "";
    const systemSizeDisplay = document.getElementById("systemSizeDisplay");
    const addBatteriesButton = document.getElementById("addBatteriesButton");
    const salesCommission = Number(document.getElementById("salesCommissionModal")?.value) || 0;

    if (!systemSizeDisplay || !addBatteriesButton) {
        console.error("❌ System Size Display or Add Batteries Button not found!");
        return;
    }

    // Clear previous display
    systemSizeDisplay.innerHTML = "";
    document.getElementById("totalBatterySizeDisplay").innerHTML = "";

    // Input Validation
    if (!currentConsumption || isNaN(currentConsumption) || currentConsumption <= 0) {
        systemSizeDisplay.innerHTML = `<p class="error">Please enter a valid current annual consumption.</p>`;
        return;
    }
    if (!desiredProduction || isNaN(desiredProduction) || desiredProduction <= 0) {
        systemSizeDisplay.innerHTML = `<p class="error">Please enter a valid desired annual production.</p>`;
        return;
    }
    if (!fullAddress || !selectedPlace) {
        systemSizeDisplay.innerHTML = `<p class="error">Please select a valid address from the suggestions.</p>`;
        return;
    }
    if (!shading || !["none", "light", "medium", "heavy"].includes(shading.toLowerCase())) {
        systemSizeDisplay.innerHTML = `<p class="error">Please select a valid shading option.</p>`;
        return;
    }

    const requestBody = {
        currentConsumption,
        desiredProduction,
        panelDirection,
        shading,
        address: selectedPlace.formatted_address, // Send the formatted_address as a string under the "address" field
        batteryCount: 0,
        currentMonthlyAverageBill: 0,
        systemCost: 0,
        monthlyCost: 0,
        salesCommission
    };

    console.log("Sending requestBody to backend:", requestBody);

    try {
        systemSizeDisplay.innerHTML = "<p>Calculating...</p>";
        const response = await fetch(apiUrl, { // Updated to use apiUrl
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            systemSizeDisplay.innerHTML = `<p class="error">Error: ${errorData.error || "Server error"}</p>`;
            return;
        }

        const result = await response.json();
        const solarSize = result.params.solarSize;
        systemSizeDisplay.innerHTML = `System Size: ${solarSize} kW`;
        const systemSizeInput = document.getElementById("systemSizeInput");
        if (systemSizeInput) {
            systemSizeInput.value = solarSize;
        }
        const batterySizeInput = document.getElementById("batterySizeInput");
        if (batterySizeInput) {
            batterySizeInput.value = (solarSize * 2).toFixed(2); // 2 kWh per kW
        }
        // Ensure Add Batteries button is enabled after successful build
        addBatteriesButton.disabled = false;
        addBatteriesButton.style.backgroundColor = "#3b82f6";
        console.log("Add Batteries Button State: Enabled after build");
    } catch (error) {
        systemSizeDisplay.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

// ✅ Fetch Data and Generate Presentation (Full Calculation with PDF)
async function generatePresentation(event) {
    if (event) {
        event.preventDefault();
    }
    console.log("Starting generatePresentation...");
    try {
        // Determine active tab with null check
        const activeTabElement = document.querySelector(".tab-button.active");
        if (!activeTabElement) {
            console.error("❌ Active tab element not found!");
            const resultsDiv = document.getElementById("results");
            if (resultsDiv) {
                resultsDiv.innerHTML = `<p class="error">Configuration error: Unable to determine active tab. Please refresh the page and try again.</p>`;
            }
            return;
        }
        
        const activeTab = activeTabElement.dataset.tab;
        const isManualMode = activeTab === "manual-entry";

        // Get input values based on active tab with proper null checks
        const manualCurrentConsumptionElement = isManualMode ? document.getElementById("manualCurrentConsumption") : null;
        const currentConsumptionElement = !isManualMode ? document.getElementById("currentConsumption") : null;
        const currentConsumption = Number(
            (isManualMode && manualCurrentConsumptionElement) ? manualCurrentConsumptionElement.value : 
            (!isManualMode && currentConsumptionElement) ? currentConsumptionElement.value : 0
        );

        const manualDesiredProductionElement = isManualMode ? document.getElementById("manualDesiredProduction") : null;
        const desiredProductionElement = !isManualMode ? document.getElementById("desiredProduction") : null;
        const desiredProduction = Number(
            (isManualMode && manualDesiredProductionElement) ? manualDesiredProductionElement.value : 
            (!isManualMode && desiredProductionElement) ? desiredProductionElement.value : 0
        );

        const manualPanelDirectionElement = isManualMode ? document.getElementById("manualPanelDirection") : null;
        const panelDirectionElement = !isManualMode ? document.getElementById("panelDirection") : null;
        const panelDirection = 
            (isManualMode && manualPanelDirectionElement) ? manualPanelDirectionElement.value : 
            (!isManualMode && panelDirectionElement) ? panelDirectionElement.value : "S";

        const manualCurrentMonthlyAverageBillElement = isManualMode ? document.getElementById("manualCurrentMonthlyAverageBill") : null;
        const currentMonthlyAverageBillElement = !isManualMode ? document.getElementById("currentMonthlyAverageBill") : null;
        const currentMonthlyAverageBill = Number(
            (isManualMode && manualCurrentMonthlyAverageBillElement) ? manualCurrentMonthlyAverageBillElement.value : 
            (!isManualMode && currentMonthlyAverageBillElement) ? currentMonthlyAverageBillElement.value : 0
        );

        const manualBatteryCountElement = isManualMode ? document.getElementById("manualBatteryCount") : null;
        const batteryCountElement = !isManualMode ? document.getElementById("batteryCount") : null;
        const batteryCount = Number(
            (isManualMode && manualBatteryCountElement) ? manualBatteryCountElement.value : 
            (!isManualMode && batteryCountElement) ? batteryCountElement.value : 0
        );

        const manualShadingElement = isManualMode ? document.getElementById("manualShading") : null;
        const shadingElement = !isManualMode ? document.getElementById("shading") : null;
        const shading = 
            (isManualMode && manualShadingElement) ? manualShadingElement.value.toLowerCase() : 
            (!isManualMode && shadingElement) ? shadingElement.value.toLowerCase() : "none";

        const manualFullAddressElement = isManualMode ? document.getElementById("manualFullAddress") : null;
        const fullAddressElement = !isManualMode ? document.getElementById("fullAddress") : null;
        const fullAddress = 
            (isManualMode && manualFullAddressElement) ? manualFullAddressElement.dataset.address || "" : 
            (!isManualMode && fullAddressElement) ? fullAddressElement.dataset.address || "" : "";

        const manualSystemCostElement = isManualMode ? document.getElementById("manualSystemCost") : null;
        const systemCostElement = !isManualMode ? document.getElementById("systemCost") : null;
        const systemCost = Number(
            (isManualMode && manualSystemCostElement) ? manualSystemCostElement.value : 
            (!isManualMode && systemCostElement) ? systemCostElement.value : 0
        );

        const manualMonthlyCostElement = isManualMode ? document.getElementById("manualMonthlyCost") : null;
        const monthlyCostElement = !isManualMode ? document.getElementById("monthlyCost") : null;
        const monthlyCost = Number(
            (isManualMode && manualMonthlyCostElement) ? manualMonthlyCostElement.value : 
            (!isManualMode && monthlyCostElement) ? monthlyCostElement.value : 0
        );

        const salesCommissionElement = document.getElementById("salesCommissionModal");
        const salesCommission = salesCommissionElement ? Number(salesCommissionElement.value) || 0 : 0;

        // Log all input values for debugging
        console.log("Input Values for generatePresentation:", {
            isManualMode,
            currentConsumption,
            desiredProduction,
            panelDirection,
            currentMonthlyAverageBill,
            batteryCount,
            shading,
            fullAddress,
            systemCost,
            monthlyCost,
            salesCommission
        });

        // Get UI elements with null checks
        const resultsDiv = document.getElementById("results");
        const downloadLinkDiv = document.getElementById("downloadLink");
        const dropdownContent = document.querySelector(".dropdown-content");
        const dropdownToggle = document.querySelector(".dropdown-toggle");
        const resultsColumn = document.querySelector(".results-column");

        if (!resultsDiv) {
            console.error("❌ Results div not found!");
            return;
        }

        if (!downloadLinkDiv || !dropdownContent || !dropdownToggle || !resultsColumn) {
            console.warn("⚠️ Some UI elements not found, but continuing with available elements");
        }

        // Collapse the dropdown and center the results if elements exist
        if (dropdownToggle) dropdownToggle.setAttribute("aria-expanded", "false");
        if (dropdownContent) dropdownContent.classList.add("hidden");
        if (resultsColumn) {
            resultsColumn.style.margin = "0";
            resultsColumn.style.width = "100%";
        }

        // Clear existing content and show loading state
        resultsDiv.innerHTML = "<p>Loading...</p>";
        if (downloadLinkDiv) {
            downloadLinkDiv.innerHTML = "";
            downloadLinkDiv.style.display = "none";
        }

        // Input Validation with Upper Bounds
        if (!currentConsumption || isNaN(currentConsumption) || currentConsumption <= 0) {
            resultsDiv.innerHTML = `<p class="error">Please enter a valid current annual consumption (greater than 0).</p>`;
            return;
        }
        if (currentConsumption > 1000000) {
            resultsDiv.innerHTML = `<p class="error">Current annual consumption is too large. Please enter a value less than 1,000,000 kWh.</p>`;
            return;
        }

        if (!fullAddress || !selectedPlace) {
            resultsDiv.innerHTML = `<p class="error">Please select a valid address from the suggestions.</p>`;
            return;
        }

        if (!currentMonthlyAverageBill || isNaN(currentMonthlyAverageBill) || currentMonthlyAverageBill <= 0) {
            resultsDiv.innerHTML = `<p class="error">Please enter a valid Current Monthly Average Bill (greater than 0).</p>`;
            return;
        }
        if (currentMonthlyAverageBill > 10000) {
            resultsDiv.innerHTML = `<p class="error">Current Monthly Average Bill is too large. Please enter a value less than $10,000.</p>`;
            return;
        }

        if (isNaN(batteryCount) || batteryCount < 0) {
            resultsDiv.innerHTML = `<p class="error">Please enter a valid battery count (must be a non-negative number).</p>`;
            return;
        }
        if (batteryCount > 100) {
            resultsDiv.innerHTML = `<p class="error">Battery count is too large. Please enter a value less than 100.</p>`;
            return;
        }

        if (!systemCost || isNaN(systemCost) || systemCost <= 0) {
            resultsDiv.innerHTML = `<p class="error">Please enter a valid total system cost (must be greater than 0).</p>`;
            return;
        }
        if (systemCost > 1000000) {
            resultsDiv.innerHTML = `<p class="error">Total system cost is too large. Please enter a value less than $1,000,000.</p>`;
            return;
        }

        // Prepare API request
        const requestBody = {
            address: selectedPlace.formatted_address, // Send the formatted_address as a string
            currentConsumption,
            currentMonthlyAverageBill,
            batteryCount,
            financingTerm: 25,
            interestRate: 5.99,
            systemCost,
            salesCommission,
            monthlyCost,
        };

        console.log("Sending API request with body:", requestBody);

        // Improved fetch with better error handling
        try {
            const response = await fetch(apiUrl, { // Updated to use apiUrl
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
        
            console.log("📥 Response status:", response.status);
            console.log("📥 Response headers:", [...response.headers.entries()]);
        
            // Get the raw response body
            const rawResponse = await response.text();
            console.log("📥 Raw response body:", rawResponse);
        
            // Handle non-JSON responses
            let responseData;
            try {
                responseData = rawResponse ? JSON.parse(rawResponse) : null;
            } catch (jsonError) {
                console.error("❌ Failed to parse JSON response:", jsonError);
                resultsDiv.innerHTML = `<p class="error">Invalid server response: ${jsonError.message}. Raw response: ${rawResponse || "empty"}. Please check that the server is running.</p>`;
                return;
            }
        
            if (!response.ok) {
                console.error("❌ Server error:", response.status, response.statusText, responseData);
                resultsDiv.innerHTML = `<p class="error">Server error: ${response.status} ${response.statusText}. ${responseData?.error || "No error message provided."}</p>`;
                return;
            }
            
            console.log("📡 Server Response:", responseData);
            
            // Use responseData instead of result
            const solarSize = responseData.params?.solarSize || "Unknown";
            resultsDiv.innerHTML = `<p>Calculated Solar Size: ${solarSize} kW</p>`;
            
            const totalBatterySize = batteryCount * 16; // Assuming 16 kWh per battery

            // Dynamically calculate cost breakdown
            let salesRedline = Number(document.getElementById("salesRedline")?.value) || 0;
            let adderCosts = Number(document.getElementById("adderCosts")?.value) || 0;
            let batteryCostPerKWh = 1000; // $1000 per kWh

            // If in Wizard mode and System Cost Calculator was used, derive values
            if (!isManualMode && systemCostElement && systemCostElement.value) {
                const totalCost = systemCost;
                const batteryCost = totalBatterySize * batteryCostPerKWh;
                const solarCost = totalCost - batteryCost - adderCosts - salesCommission;
                if (solarSize > 0) {
                    salesRedline = solarCost / (solarSize * 1000); // Reverse calculate sales redline (solarCost = solarSize * 1000 * salesRedline)
                }
            } else if (isManualMode) {
                // In Manual mode, use the total system cost directly and estimate breakdown
                const totalCost = systemCost;
                const batteryCost = totalBatterySize * batteryCostPerKWh;
                adderCosts = 0; // Default to 0 unless specified (could be enhanced with a manual adder input)
                const solarCost = totalCost - batteryCost - salesCommission;
                if (solarSize > 0) {
                    salesRedline = solarCost / (solarSize * 1000); // Estimate sales redline
                }
            }

            // Calculate costs using the updated formula: solarCost = solarSize * 1000 * salesRedline
            const solarCost = solarSize * 1000 * salesRedline;
            const batteryCost = totalBatterySize * batteryCostPerKWh;
            const totalCost = solarCost + batteryCost + adderCosts + salesCommission;

            // Calculate percentage of original cost you're paying with solar
            const percentageOfOriginalCost = (monthlyCost / currentMonthlyAverageBill) * 100;
            const remainingPercentageText = `${percentageOfOriginalCost.toFixed(2)}%`;

            // Display results even if PDF generation fails
            resultsDiv.innerHTML = `
                <div class="results-card">
                    <h2 class="results-title">Your Solar Results</h2>
                    <div class="result-section">
                        <h3 class="section-title">System Overview</h3>
                        <ul>
                            <li>Solar System Size: <strong>${solarSize} kW</strong></li>
                            <li>Battery Size: <strong>${totalBatterySize} kWh (${batteryCount} x 16 kWh)</strong></li>
                            <li>Number of Panels: <strong>${responseData.params?.panelCount || "Unknown"}</strong></li>
                        </ul>
                    </div>
                    <div class="result-section">
                        <h3 class="section-title">Energy Overview</h3>
                        <ul>
                            <li>Estimated Annual Production: <strong>${Number(responseData.params?.estimatedAnnualProduction || 0).toLocaleString()} kWh</strong></li>
                            <li>Annual Consumption Before Solar: <strong>${Number(currentConsumption).toLocaleString()} kWh</strong></li>
                            <li>Energy Offset: <strong>${responseData.params?.energyOffset || "Unknown"}</strong></li>
                        </ul>
                    </div>
                    <div class="result-section">
                        <h3 class="section-title">Cost Summary</h3>
                        <ul>
                            <li>Solar Cost: <strong>$${Number(solarCost).toLocaleString()}</strong></li>
                            <li>Battery Cost: <strong>$${Number(batteryCost).toLocaleString()}</strong></li>
                            <li>Adders Cost: <strong>$${Number(adderCosts).toLocaleString()}</strong></li>
                            <li>Commission: <strong>$${Number(salesCommission).toLocaleString()}</strong></li>
                            <li>Total Cost: <strong>$${Number(totalCost).toLocaleString()}</strong></li>
                        </ul>
                    </div>
                    <div class="result-section">
                        <h3 class="section-title">Solar Savings</h3>
                        <ul>
                            <li>Monthly Cost Without Solar: <strong>$${Number(currentMonthlyAverageBill).toLocaleString()}</strong></li>
                            <li>Monthly Cost With Solar: <strong>$${Number(monthlyCost).toLocaleString()}</strong></li>
                            <li>What You're Getting: <strong>${responseData.params?.energyOffset || "Unknown"} of the electricity you're used to, while only paying ${remainingPercentageText} of what you're used to!</strong></li>
                        </ul>
                    </div>
                </div>
            `;

            // Handle PDF link (or lack thereof) if downloadLinkDiv exists
            if (downloadLinkDiv) {
                if (responseData.pdfViewUrl) {
                    // Construct the full PDF URL using backendUrl
                    const fullPdfUrl = `${backendUrl}${responseData.pdfViewUrl}`;
                    downloadLinkDiv.innerHTML = `<button id="downloadProposal" class="calculate-button">Download Proposal</button>`;
                    downloadLinkDiv.style.display = "block";
                    const downloadButton = document.getElementById("downloadProposal");
                    if (downloadButton) {
                        downloadButton.addEventListener("click", () => window.open(fullPdfUrl, "_blank"));
                    }
                } else if (responseData.pptUrl) {
                    console.warn("⚠️ PDF generation failed, but PowerPoint URL is available.");
                    downloadLinkDiv.innerHTML = `<p class="warning">Proposal PDF is unavailable at this time, but you can view the presentation here: <a href="${responseData.pptUrl}" target="_blank">Open Presentation</a></p>`;
                    downloadLinkDiv.style.display = "block";
                } else {
                    console.warn("⚠️ Both PDF and PowerPoint generation failed.");
                    downloadLinkDiv.innerHTML = `<p class="warning">Proposal PDF and presentation are unavailable at this time, but your results are shown above.</p>`;
                    downloadLinkDiv.style.display = "block";
                }
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            resultsDiv.innerHTML = `<p class="error">Network error. Please check that the server is running.</p>`;
            return;
        }
    } catch (error) {
        console.error("❌ Network error:", error);
        resultsDiv.innerHTML = `<p class="error">Network error: ${error.message}. Please check that the server is running.</p>`;
        return;
    }
}

// ✅ Handle Battery Sizing Help Modal
function setupBatteryHelp() {
    const helpBatteryText = document.getElementById("helpBatteryText");
    const batteryHelpModal = document.getElementById("batteryHelpModal");
    const applyRecommendationButton = document.getElementById("applyRecommendationButton");
    const overwriteRecommendationButton = document.getElementById("overwriteRecommendationButton");
    const recommendedBatteryCount = document.getElementById("recommendedBatteryCount");
    const recommendedBatteryStorage = document.getElementById("recommendedBatteryStorage");
    const systemSizeDisplay = document.getElementById("systemSizeDisplay");
    const batteryCountModal = document.getElementById("batteryCountModal");
    const batteryQuantity = document.getElementById("batteryQuantity");
    const totalStorage = document.getElementById("totalStorage");
    const applyBatteriesButton = document.getElementById("applyBatteriesButton");
    const batteryCountInput = document.getElementById("batteryCount");
    const totalBatterySizeDisplay = document.getElementById("totalBatterySizeDisplay");

    if (!helpBatteryText || !batteryHelpModal || !applyRecommendationButton || !overwriteRecommendationButton || !recommendedBatteryCount || !recommendedBatteryStorage || !systemSizeDisplay || !batteryCountModal || !batteryQuantity || !totalStorage || !applyBatteriesButton || !batteryCountInput || !totalBatterySizeDisplay) {
        console.warn("⚠️ One or more battery help elements not found! Add Batteries feature may be unavailable.");
        return;
    }

    // Function to open the battery help modal
    const openBatteryHelpModal = () => {
        // Check if system size is calculated
        const systemSizeText = systemSizeDisplay.textContent;
        const solarSizeMatch = systemSizeText.match(/System Size: (\d+\.\d+) kW/);
        if (!solarSizeMatch) {
            alert("Please calculate the system size first by clicking 'Build System'.");
            return;
        }

        const solarSize = parseFloat(solarSizeMatch[1]);
        if (isNaN(solarSize) || solarSize <= 0) {
            alert("Invalid system size. Please ensure the system size is calculated correctly.");
            return;
        }

        // Calculate recommended battery size
        const targetBatteryStorage = solarSize * 2; // 2:1 ratio
        const X = Math.ceil(targetBatteryStorage / 16); // Number of batteries (16 kWh each)
        const Y = X * 16; // Total kWh

        // Update modal with recommendations
        recommendedBatteryCount.textContent = X;
        recommendedBatteryStorage.textContent = Y;

        batteryHelpModal.style.display = "flex";
    };

    // Attach event listener to "Add Batteries" button
    const addBatteriesButton = document.getElementById("addBatteriesButton");
    if (addBatteriesButton) {
        addBatteriesButton.addEventListener("click", openBatteryHelpModal);
    } else {
        console.error("❌ Add Batteries button not found!");
    }

    // Attach event listener to "Need help sizing?" link
    helpBatteryText.addEventListener("click", openBatteryHelpModal);

    applyRecommendationButton.addEventListener("click", () => {
        const X = parseInt(recommendedBatteryCount.textContent);
        if (batteryCountInput) {
            batteryCountInput.value = X;
            if (totalBatterySizeDisplay) {
                totalBatterySizeDisplay.innerHTML = `Total Battery Size: ${X * 16} kWh`;
            }
            const batterySizeInput = document.getElementById("batterySizeInput");
            if (batterySizeInput) {
                batterySizeInput.value = X * 16;
            }
            window.cachedBatteryCount = X;
        }
        batteryHelpModal.style.display = "none";
        updateBuildSystemButtonState();
        updateCalculateButtonState();
    });

    overwriteRecommendationButton.addEventListener("click", () => {
        batteryHelpModal.style.display = "none";
        batteryCountModal.style.display = "flex";
        updateTotalStorage();
    });

    batteryQuantity.addEventListener("change", updateTotalStorage);

    function updateTotalStorage() {
        const quantity = parseInt(batteryQuantity.value) || 0;
        totalStorage.textContent = quantity * 16;
    }

    applyBatteriesButton.addEventListener("click", () => {
        const quantity = parseInt(batteryQuantity.value) || 0;
        if (batteryCountInput) {
            batteryCountInput.value = quantity;
            if (totalBatterySizeDisplay) {
                totalBatterySizeDisplay.innerHTML = `Total Battery Size: ${quantity * 16} kWh`;
            }
            const batterySizeInput = document.getElementById("batterySizeInput");
            if (batterySizeInput) {
                batterySizeInput.value = quantity * 16;
            }
            window.cachedBatteryCount = quantity;
        }
        batteryCountModal.style.display = "none";
        updateBuildSystemButtonState();
        updateCalculateButtonState();
    });
}

// ✅ Handle Current Monthly Utility Bill Estimation Modal
function setupCurrentMonthlyBillHelp() {
    const helpCurrentMonthlyBillText = document.getElementById("helpCurrentMonthlyBillText");
    const currentMonthlyBillHelpModal = document.getElementById("currentMonthlyBillHelpModal");
    const estimateCurrentBillButton = document.getElementById("estimateCurrentBillButton");
    const closeCurrentMonthlyBillModalButton = document.getElementById("closeCurrentMonthlyBillModalButton");
    const currentMonthlyAverageBillInput = document.getElementById("currentMonthlyAverageBill");

    if (!helpCurrentMonthlyBillText || !currentMonthlyBillHelpModal || !estimateCurrentBillButton || !closeCurrentMonthlyBillModalButton || !currentMonthlyAverageBillInput) {
        console.warn("⚠️ One or more current monthly bill help elements not found! Help feature may be unavailable.");
        return;
    }

    helpCurrentMonthlyBillText.addEventListener("click", () => {
        currentMonthlyBillHelpModal.style.display = "flex";
    });

    closeCurrentMonthlyBillModalButton.addEventListener("click", () => {
        currentMonthlyBillHelpModal.style.display = "none";
    });

    estimateCurrentBillButton.addEventListener("click", () => {
        const summerBill = Number(document.getElementById("currentSummerBill")?.value);
        const winterBill = Number(document.getElementById("currentWinterBill")?.value);
        const fallSpringBill = Number(document.getElementById("currentFallSpringBill")?.value);

        if (!summerBill || summerBill < 0 || !winterBill || winterBill < 0 || !fallSpringBill || fallSpringBill < 0) {
            alert("Please enter valid values for all seasonal bills.");
            return;
        }

        const estimatedMonthlyBill = (summerBill * (3/12)) + (winterBill * (3/12)) + (fallSpringBill * (6/12));
        currentMonthlyAverageBillInput.value = estimatedMonthlyBill.toFixed(2);
        currentMonthlyBillHelpModal.style.display = "none";
        updateBuildSystemButtonState();
        updateCalculateButtonState();
    });
}

// ✅ Handle System Cost Calculator Modal
function setupSystemCostHelp() {
    const helpSystemCostText = document.getElementById("helpSystemCostText");
    const systemCostHelpModal = document.getElementById("systemCostHelpModal");
    const calculateSystemCostButton = document.getElementById("calculateSystemCostButton");
    const closeSystemCostModalButton = document.getElementById("closeSystemCostModalButton");
    const salesRedlineInput = document.getElementById("salesRedline");
    const systemSizeInput = document.getElementById("systemSizeInput");
    const batterySizeInput = document.getElementById("batterySizeInput");
    const adderCostsInput = document.getElementById("adderCosts");
    const salesCommissionInput = document.getElementById("salesCommissionModal");
    const additionalNotesInput = document.getElementById("additionalNotes");
    const systemCostInput = document.getElementById("systemCost");

    if (!helpSystemCostText || !systemCostHelpModal || !calculateSystemCostButton || !closeSystemCostModalButton || !salesRedlineInput || !systemSizeInput || !batterySizeInput || !adderCostsInput || !salesCommissionInput || !additionalNotesInput || !systemCostInput) {
        console.warn("⚠️ One or more system cost help elements not found! Help feature may be unavailable.");
        return;
    }

    helpSystemCostText.addEventListener("click", () => {
        // Ensure system size is calculated before opening the modal
        const systemSizeText = document.getElementById("systemSizeDisplay")?.textContent;
        const solarSizeMatch = systemSizeText?.match(/System Size: (\d+\.\d+) kW/);
        if (!solarSizeMatch) {
            alert("Please calculate the system size first by clicking 'Build System'.");
            return;
        }

        const solarSize = parseFloat(solarSizeMatch[1]);
        if (isNaN(solarSize) || solarSize <= 0) {
            alert("Invalid system size. Please ensure the system size is calculated correctly.");
            return;
        }

        systemSizeInput.value = solarSize;
        batterySizeInput.value = Number(document.getElementById("batterySizeInput")?.value) || 0;
        systemCostHelpModal.style.display = "flex";
    });

    closeSystemCostModalButton.addEventListener("click", () => {
        systemCostHelpModal.style.display = "none";
    });

    calculateSystemCostButton.addEventListener("click", () => {
        const salesRedline = Number(salesRedlineInput.value) || 0;
        const systemSize = Number(systemSizeInput.value) || 0;
        const batterySize = Number(batterySizeInput.value) || 0;
        const adderCosts = Number(adderCostsInput.value) || 0;
        const salesCommission = Number(salesCommissionInput.value) || 0;
        const additionalNotes = additionalNotesInput.value || "";

        // Calculate battery cost: total battery size in kWh * 1000
        const batteryCost = batterySize * 1000;
        // Calculate solar cost: systemSize * 1000 * salesRedline (convert kW to W)
        const solarCost = systemSize * 1000 * salesRedline;
        // Calculate total system cost
        const baseCost = solarCost + batteryCost + adderCosts + salesCommission;
        if (systemCostInput) {
            systemCostInput.value = baseCost.toFixed(2);
            const changeEvent = new Event("change");
            systemCostInput.dispatchEvent(changeEvent);
        } else {
            console.error("❌ System Cost input not found!");
        }

        systemCostHelpModal.style.display = "none";
        updateBuildSystemButtonState();
        updateCalculateButtonState();
    });
}

// Function to update the state of the Calculate button in Wizard Mode
function updateCalculateButtonState() {
    const fullAddress = document.getElementById("fullAddress").value;
    const currentConsumption = document.getElementById("currentConsumption").value;
    const desiredProduction = document.getElementById("desiredProduction").value;
    const systemCost = document.getElementById("systemCost").value;
    const currentMonthlyAverageBill = document.getElementById("currentMonthlyAverageBill").value;
    const monthlyCost = document.getElementById("monthlyCost").value;
    const calculateButton = document.getElementById("calculateButton");

    const isFormValid = fullAddress && currentConsumption && desiredProduction && systemCost && currentMonthlyAverageBill && monthlyCost;
    calculateButton.disabled = !isFormValid;

    if (isFormValid) {
        calculateButton.style.backgroundColor = "#3b82f6";
    } else {
        calculateButton.style.backgroundColor = "#a3bffa";
    }
}

// Function to update the state of the Calculate button in Manual Entry Mode
function updateManualCalculateButtonState() {
    const manualFullAddress = document.getElementById("manualFullAddress").value;
    const manualCurrentConsumption = document.getElementById("manualCurrentConsumption").value;
    const manualDesiredProduction = document.getElementById("manualDesiredProduction").value;
    const manualSystemCost = document.getElementById("manualSystemCost").value;
    const manualCurrentMonthlyAverageBill = document.getElementById("manualCurrentMonthlyAverageBill").value;
    const manualMonthlyCost = document.getElementById("manualMonthlyCost").value;
    const manualCalculateButton = document.getElementById("manualCalculateButton");

    const isFormValid = manualFullAddress && manualCurrentConsumption && manualDesiredProduction && manualSystemCost && manualCurrentMonthlyAverageBill && manualMonthlyCost;
    manualCalculateButton.disabled = !isFormValid;

    if (isFormValid) {
        manualCalculateButton.style.backgroundColor = "#3b82f6";
    } else {
        manualCalculateButton.style.backgroundColor = "#a3bffa";
    }
}

// Function to update the state of the Build System button
function updateBuildSystemButtonState() {
    const fullAddress = document.getElementById("fullAddress").value;
    const currentConsumption = document.getElementById("currentConsumption").value;
    const desiredProduction = document.getElementById("desiredProduction").value;
    const buildSystemButton = document.getElementById("buildSystemButton");

    const isFormValid = fullAddress && currentConsumption && desiredProduction;
    buildSystemButton.disabled = !isFormValid;

    if (isFormValid) {
        buildSystemButton.style.backgroundColor = "#3b82f6";
    } else {
        buildSystemButton.style.backgroundColor = "#a3bffa";
    }
}

// ✅ Setup Tab Switching
function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));
            button.classList.add("active");
            document.getElementById(`${button.dataset.tab}-tab`).classList.add("active");
            updateCalculateButtonState(); // Update button states based on active tab
            updateBuildSystemButtonState();
        });
    });
}

// Function to toggle the dropdown (fallback if setupDropdown isn't used)
function toggleDropdown() {
    const dropdownContent = document.querySelector(".dropdown-content");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const isExpanded = dropdownToggle.getAttribute("aria-expanded") === "true";

    dropdownToggle.setAttribute("aria-expanded", !isExpanded);
    dropdownContent.style.display = isExpanded ? "none" : "block";
    dropdownToggle.querySelector(".dropdown-icon").style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
}

// Function to show a modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
    }
}

// Function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Function to calculate annual consumption (fallback if setupConsumptionHelp isn't used)
function calculateConsumption() {
    const monthlyBill = parseFloat(document.getElementById("modalMonthlyBill").value) || 0;
    const utilityRate = parseFloat(document.getElementById("averageUtilityRate").value) || 0;

    if (monthlyBill && utilityRate) {
        const annualConsumption = (monthlyBill * 12) / utilityRate;
        document.getElementById("currentConsumption").value = Math.round(annualConsumption);
        closeModal("consumptionHelpModal");
        showModal("consumptionEstimateModal");
    } else {
        alert("Please fill in both fields to calculate consumption.");
    }
}

// Function to estimate utility rate (fallback if setupUtilityRateHelp isn't used)
function estimateUtilityRate() {
    const utilityProvider = document.getElementById("utilityProvider").value;
    const careEnrollment = document.getElementById("careEnrollment").value;

    const rates = {
        "PG&E": { No: 0.45, Yes: 0.35 },
        "SDG&E": { No: 0.50, Yes: 0.40 },
        "SCE": { No: 0.42, Yes: 0.32 }
    };

    const estimatedRate = rates[utilityProvider][careEnrollment];
    document.getElementById("averageUtilityRate").value = estimatedRate;
    closeModal("utilityRateHelpModal");
    showModal("utilityRateEstimateModal");
}

// Function to estimate monthly bill (fallback if setupMonthlyBillHelp isn't used)
function estimateMonthlyBill(modalPrefix) {
    const summerBill = parseFloat(document.getElementById(`${modalPrefix}SummerBill`).value) || 0;
    const winterBill = parseFloat(document.getElementById(`${modalPrefix}WinterBill`).value) || 0;
    const fallSpringBill = parseFloat(document.getElementById(`${modalPrefix}FallSpringBill`).value) || 0;

    if (summerBill && winterBill && fallSpringBill) {
        const averageBill = (summerBill * 3 + winterBill * 3 + fallSpringBill * 6) / 12;
        if (modalPrefix === "current") {
            document.getElementById("currentMonthlyAverageBill").value = averageBill.toFixed(2);
        } else {
            document.getElementById("modalMonthlyBill").value = averageBill.toFixed(2);
        }
        closeModal(`${modalPrefix}MonthlyBillHelpModal`);
        showModal(`${modalPrefix}MonthlyBillEstimateModal`);
    } else {
        alert("Please fill in all fields to estimate the monthly bill.");
    }
}

// Function to calculate system cost (fallback if setupSystemCostHelp isn't used)
function calculateSystemCost() {
    const salesRedline = parseFloat(document.getElementById("salesRedline").value) || 0;
    const systemSize = parseFloat(document.getElementById("systemSizeInput").value) || 0;
    const batterySize = parseFloat(document.getElementById("batterySizeInput").value) || 0;
    const adderCosts = parseFloat(document.getElementById("adderCosts").value) || 0;
    const salesCommission = parseFloat(document.getElementById("salesCommissionModal").value) || 0;

    if (salesRedline && systemSize) {
        const baseCost = systemSize * salesRedline;
        const batteryCost = batterySize * 1000; // Assuming $1000 per kWh for battery
        const totalCost = baseCost + batteryCost + adderCosts + salesCommission;
        document.getElementById("systemCost").value = totalCost.toFixed(2);
        closeModal("systemCostHelpModal");
    } else {
        alert("Please fill in the required fields to calculate system cost.");
    }
}

// Function to recommend battery count (fallback if setupBatteryHelp isn't used)
function recommendBatteryCount() {
    const systemSizeText = document.getElementById("systemSizeDisplay").textContent;
    const solarSizeMatch = systemSizeText.match(/System Size: (\d+\.\d+) kW/);
    if (!solarSizeMatch) {
        alert("Please calculate the system size first by clicking 'Build System'.");
        return;
    }

    const systemSize = parseFloat(solarSizeMatch[1]) || 0;
    const recommendedStorage = systemSize * 2; // 2 kWh of battery storage per 1 kW of system size
    const batteryCount = Math.ceil(recommendedStorage / 16); // Assuming each battery is 16 kWh

    document.getElementById("recommendedBatteryCount").textContent = batteryCount;
    document.getElementById("recommendedBatteryStorage").textContent = (batteryCount * 16).toFixed(2);
    showModal("batteryHelpModal");
}

// Function to apply recommended battery count
function applyRecommendation() {
    const recommendedCount = parseInt(document.getElementById("recommendedBatteryCount").textContent) || 0;
    const batteryCountInput = document.getElementById("batteryCount");
    const totalBatterySizeDisplay = document.getElementById("totalBatterySizeDisplay");

    if (batteryCountInput && totalBatterySizeDisplay) {
        batteryCountInput.value = recommendedCount;
        totalBatterySizeDisplay.innerHTML = `Total Battery Size: ${recommendedCount * 16} kWh`;
        window.cachedBatteryCount = recommendedCount;
    } else {
        console.error("❌ Battery Count input or Total Battery Size Display not found!");
    }

    closeModal("batteryHelpModal");
    updateCalculateButtonState();
    updateBuildSystemButtonState();
}

// Function to overwrite battery recommendation
function overwriteRecommendation() {
    closeModal("batteryHelpModal");
    showModal("batteryCountModal");
    updateBatteryStorageDisplay();
}

// Function to update total battery storage display
function updateTotalBatterySize() {
    const batteryCount = parseInt(document.getElementById("batteryCount").value) || 0;
    const totalBatterySizeDisplay = document.getElementById("totalBatterySizeDisplay");

    if (totalBatterySizeDisplay) {
        totalBatterySizeDisplay.innerHTML = `Total Battery Size: ${batteryCount * 16} kWh`;
    } else {
        console.error("❌ Total Battery Size Display not found!");
    }
}

// Function to apply battery count from modal
function applyBatteries() {
    const batteryQuantity = parseInt(document.getElementById("batteryQuantity").value) || 0;
    const batteryCountInput = document.getElementById("batteryCount");
    const totalBatterySizeDisplay = document.getElementById("totalBatterySizeDisplay");

    if (batteryCountInput && totalBatterySizeDisplay) {
        batteryCountInput.value = batteryQuantity;
        totalBatterySizeDisplay.innerHTML = `Total Battery Size: ${batteryQuantity * 16} kWh`;
        window.cachedBatteryCount = batteryQuantity;
    } else {
        console.error("❌ Battery Count input or Total Battery Size Display not found!");
    }

    closeModal("batteryCountModal");
    updateCalculateButtonState();
    updateBuildSystemButtonState();
}

// Function to update battery storage display in modal
function updateBatteryStorageDisplay() {
    const batteryQuantity = parseInt(document.getElementById("batteryQuantity").value) || 0;
    const totalStorage = document.getElementById("totalStorage");

    if (totalStorage) {
        totalStorage.textContent = (batteryQuantity * 16).toFixed(2);
    } else {
        console.error("❌ Total Storage element not found!");
    }
}

// Function to reset the form and results
function resetForm() {
    const solarForm = document.getElementById("solarForm");
    const manualForm = document.getElementById("manualForm");
    const systemSizeDisplay = document.getElementById("systemSizeDisplay");
    const totalBatterySizeDisplay = document.getElementById("totalBatterySizeDisplay");
    const resultsDiv = document.getElementById("results");
    const downloadLinkDiv = document.getElementById("downloadLink");
    const addBatteriesButton = document.getElementById("addBatteriesButton");

    if (solarForm) solarForm.reset();
    if (manualForm) manualForm.reset();
    if (systemSizeDisplay) systemSizeDisplay.innerHTML = "";
    if (totalBatterySizeDisplay) totalBatterySizeDisplay.innerHTML = "";
    if (resultsDiv) resultsDiv.innerHTML = "";
    if (downloadLinkDiv) {
        downloadLinkDiv.innerHTML = "";
        downloadLinkDiv.style.display = "none";
    }
    if (addBatteriesButton) {
        addBatteriesButton.disabled = true;
        addBatteriesButton.style.backgroundColor = "#a3bffa";
    }

    // Reset selected place
    selectedPlace = null;

    // Reset button states
    updateCalculateButtonState();
    updateManualCalculateButtonState();
    updateBuildSystemButtonState();

    // Reset dropdown and layout
    const dropdownContent = document.querySelector(".dropdown-content");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const resultsColumn = document.querySelector(".results-column");

    if (dropdownToggle) dropdownToggle.setAttribute("aria-expanded", "true");
    if (dropdownContent) dropdownContent.classList.remove("hidden");
    if (resultsColumn) {
        resultsColumn.style.margin = "";
        resultsColumn.style.width = "";
    }
}

// Initialize Google Maps Autocomplete when the API is loaded
window.initAutocomplete = function() {
    if (!googleMapsLoaded) {
        googleMapsLoaded = true;
        initializeAutocomplete();
    }
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Initializing UI Components...");

    // Ensure all elements are available before setting up
    const requiredFields = [
        "currentConsumption", "desiredProduction", "fullAddress", "currentMonthlyAverageBill",
        "systemCost", "monthlyCost", "manualCurrentConsumption", "manualDesiredProduction",
        "manualFullAddress", "manualCurrentMonthlyAverageBill", "manualSystemCost", "manualMonthlyCost",
        "batteryCount"
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.error(`❌ Required field ${fieldId} not found!`);
        }
    });

    // ✅ Setup all necessary UI functions
    setupDropdown();
    setupConsumptionHelp();
    setupUtilityRateHelp();
    setupMonthlyBillHelp();
    setupBatteryHelp(); // 🔋 Handles Add Batteries
    setupCurrentMonthlyBillHelp();
    setupSystemCostHelp();
    setupTabs();

    // ✅ Attach event listeners to main buttons
    const buildSystemButton = document.getElementById("buildSystemButton");
    if (buildSystemButton) {
        buildSystemButton.addEventListener("click", buildSystem);
        console.log("✅ Build System button event listener attached");
    } else {
        console.error("❌ Build System button not found!");
    }

    const addBatteriesButton = document.getElementById("addBatteriesButton");
    if (addBatteriesButton) {
        addBatteriesButton.addEventListener("click", () => {
            console.log("🔋 Add Batteries button clicked!");
            addBatteries();
        });
        console.log("✅ Add Batteries button event listener attached");
    } else {
        console.error("❌ Add Batteries button not found!");
    }

    const calculateButton = document.getElementById("calculateButton");
    if (calculateButton) {
        calculateButton.addEventListener("click", generatePresentation);
        console.log("✅ Calculate button event listener attached");
    } else {
        console.error("❌ Calculate button not found!");
    }

    const manualCalculateButton = document.getElementById("manualCalculateButton");
    if (manualCalculateButton) {
        manualCalculateButton.addEventListener("click", generatePresentation);
        console.log("✅ Manual Calculate button event listener attached");
    } else {
        console.error("❌ Manual Calculate button not found!");
    }

    // ✅ Monitor required fields for changes and update buttons
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener("input", () => {
                updateBuildSystemButtonState();
                updateCalculateButtonState();
            });
            field.addEventListener("change", () => {
                updateBuildSystemButtonState();
                updateCalculateButtonState();
            });
        }
    });

    // ✅ Initialize button states after DOM is fully loaded
    updateBuildSystemButtonState();
    updateCalculateButtonState();
    window.lastBuildSystemButtonState = buildSystemButton ? buildSystemButton.disabled : false; // Initialize state tracker

    console.log("✅ UI Initialization Complete.");
});
