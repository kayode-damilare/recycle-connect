const Base_URL = "http://localhost:5000/api";

// Get HTML elements
const materialsContainer = document.getElementById("materials-container");
const locationDisplay = document.getElementById("location-display");
const useLocationBtn = document.getElementById("use-location-btn");
const nextBtn = document.getElementById("next-btn");

let selectedMaterials = [];
let currentLocation = "12 Greenview Estate, Lagos"; // Default location

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html"; // Redirect to login page if token is not found
}

// Fetch materials from the API and display them
async function loadMaterials() {
  try {
    const response = await fetch(`${Base_URL}/materials/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch materials");
    }
    
    // result.data = [{name: "Plastic",description: "...", id: "..."}]
    displayMaterials(result.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
}
function displayMaterials(materials) {
  materialsContainer.innerHTML = "";
    materials.forEach((material) => {
        const card = document.createElement("div");
        card.className = 'material-card flex flex-col h-[130px] w-[130px] rounded-xl shadow-sm bg-white items-center justify-center gap-2 border-1 border-[hsl(150,19%,88%)] hover:border-2 hover:border-[hsl(161,88%,25%)] hover:bg-[hsl(146,44%,94%)]';
        card.dataset.id = material.id;
        card.innerHTML = `
            <h3 class="text-[hsl(161,88%,25%)] font-semibold text-[14px]">${material.name}</h3>
            <p class="text-[12px] text-[hsl(150,19%,88%)]">${material.description}</p>
        `;
        // Add click event listener to toggle selection
        card.addEventListener("click", () => {
          card.classList.toggle("selected");

          if(selectedMaterials.includes(material.id)) {
            selectedMaterials = selectedMaterials.filter(id => id !== material.id);
          } else {
            selectedMaterials.push(material.id);
          }   
          console.log("Selected:",selectedMaterials);
        });
        materialsContainer.appendChild(card);
    });

    // use current location button
    useLocationBtn.addEventListener("click", () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
          locationDisplay.textContent = ` ${currentLocation}`;
        });
      });

    // Next button
    nextBtn.addEventListener("click", () => {
      if(selectedMaterials.length === 0) {
        alert("Please select at least one material.");
        return;
      }

       // 
       const draft = {
        materials: selectedMaterials,
        location: currentLocation
      };
      localStorage.setItem("draftRequest", JSON.stringify(draft));
      alert("Draft saved!"); // backend will handle the actual submission later
      // window.location.href = "/next-step.html"; // Redirect to the next step page
   });
  //  start
  loadMaterials();
