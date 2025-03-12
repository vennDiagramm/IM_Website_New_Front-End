/* SWALLL */
const mySwalala = Swal.mixin({
    background: "#bfbfbf",
    color: "#1a1a1a",
    confirmButtonColor: "#007bff" // Bootstrap blue
});


// Update time and date
async function updateDateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
    document.getElementById('current-date').textContent = now.toLocaleDateString();
}

// Update time every second
setInterval(updateDateTime, 1000);

// Initial update
updateDateTime();

// Get current apartment based on active slide
async function getCurrentApartment() {
    const slides = document.querySelectorAll('.slide');
    let activeIndex = 0;
    
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].classList.contains('active')) {
            activeIndex = i;
            break;
        }
    }
    
    // Return apartment ID based on active slide || 1 - Matina, 2 - Sesame, 3 - Nabua
    switch (activeIndex) {
        case 0: return 2; // Sesame is first slide (index 0)
        case 1: return 1; // Matina is second slide (index 1)
        case 2: return 3; // Nabua is third slide (index 2)
        default: return 2; // Default to Sesame
    }
}


// Change apartment background and location text
async function changeApartment(locationName, slideIndex) {
    // Update the location text
    document.getElementById('currentLocation').textContent = locationName.toUpperCase();
    
    // Remove active class from all slides
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Add active class to selected slide
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
    }
    
    // Return the apartment id
    return await getCurrentApartment();
}

// When the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update time and date
    updateDateTime();
    fetchRooms() // just to load
    
    // Setup click handlers for apartment locations in dropdown
    const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
    
    dropdownItems.forEach(item => {
        const text = item.textContent.trim();
        
        if (text === 'Matina Crossing') {
            item.addEventListener('click', async function(e) {
                e.preventDefault();
                const apartmentId = await changeApartment('Matina', 1);
                console.log('Current apartment ID:', apartmentId);
            });
        } else if (text === 'Sesame Street') {
            item.addEventListener('click', async function(e) {
                e.preventDefault();
                const apartmentId = await changeApartment('Sesame', 0);
                console.log('Current apartment ID:', apartmentId);
            });
        } else if (text === 'Nabua Street') {
            item.addEventListener('click', async function(e) {
                e.preventDefault();
                const apartmentId = await changeApartment('Nabua', 2);
                console.log('Current apartment ID:', apartmentId);
            });
        }
    });

    // For Modals
    const modalClick = document.querySelector('.modal');
    modalClick.addEventListener('click', (e) => {
        e.stopPropagation(); 
    });

    // Add tenant form
    const addTenantBtn = document.getElementById("addTenantBtn");
    const mainContentArea = document.getElementById("mainContentArea");
    const addTenantFormContainer = document.getElementById("addTenantFormContainer");

    if (addTenantBtn && mainContentArea && addTenantFormContainer) {
        addTenantBtn.addEventListener("click", function () {
            mainContentArea.innerHTML = "";
            addTenantFormContainer.style.display = "block";
            mainContentArea.appendChild(addTenantFormContainer);

            // for drop downs || NOTES: For add and remove(dismiss), we need to make it fetch dynamically.
            updateRoomDropdown();
        });
    }

    // Edit Tenant
    const editTenantBtn = document.getElementById("editTenantBtn");
    const editTenantFormContainer = document.getElementById("editTenantFormContainer");

    if(editTenantBtn && mainContentArea && editTenantFormContainer){
        editTenantBtn.addEventListener("click", function(){
            mainContentArea.innerHTML="";
            editTenantFormContainer.style.display="block";
            mainContentArea.appendChild(editTenantFormContainer);
        })
    }

    // Dismiss Tenant Form
    const dismissTenentBtn = document.getElementById("dismissTenantBtn");
    const dismissTenantFormContainer = document.getElementById("dismissTenantFormContainer");

    if (dismissTenentBtn && mainContentArea && dismissTenantFormContainer) {
        dismissTenentBtn.addEventListener("click", function () {
            mainContentArea.innerHTML = "";
            dismissTenantFormContainer.style.display = "block";
            mainContentArea.appendChild(dismissTenantFormContainer);
        });
    }

    //Room Management
    const roomsBtn = document.getElementById("roomsBtn");
    const roomsFormContainer = document.getElementById("roomsFormContainer");

    if (roomsBtn && mainContentArea && roomsFormContainer){
        roomsBtn.addEventListener("click",function(){
            mainContentArea.innerHTML ="";
            roomsFormContainer.style.display = "block";
            mainContentArea.appendChild(roomsFormContainer);

            // for drop downs
            updateRoomDropdown();
        })
    }

    // get room view via apartment || see what rooms are available
    roomsBtn.addEventListener("click", async function () {
        const aptLocId = await getCurrentApartment();
        
        const response = await fetch(`/getFullRoomView/${aptLocId}`);
        const rooms = await response.json();
        populateRoomTable(rooms);
    });


    // Payment
    const paymentBtn = document.getElementById("paymentBtn");

    //Reports
    const reportBtn = document.getElementById("reportBtn");


    /* ---- OTHER FUNCTIONALITIES ---- */
    // Form Submissions
    const removeTenantForm = document.getElementById("removeTenantForm");
    removeTenantForm.addEventListener('submit', removeTenant);

    const addRoomForm = document.getElementById('addRoomForm');
    addRoomForm.addEventListener('submit', addRoom);

    const updateRoomForm = document.getElementById('updateRoomsForm');
    updateRoomForm.addEventListener('submit', updateRoom);

    const deleteRoomForm = document.getElementById('deleteRoomForm');
    deleteRoomForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const roomId = document.getElementById("roomIdDelete").value;
        const success = await deleteRoom(roomId);
        
        if (success) {
            // Only reset if deletion was successful
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteRoomModal'));
            modal.hide();
            this.reset();
            fetchRooms();
        }
    });

    
});


// Remove a Tenant
async function removeTenant(event) {
    event.preventDefault();
    try {
        const personId = document.getElementById('personId').value;
        
        if (!personId) {
            alert("Please enter a valid Person ID!");
            return;
        }
  
        // Confirm removal
        const confirmRemoval = confirm("Are you sure you want to remove this tenant?");
        if (!confirmRemoval) {
            return;
        }
  
        // Send remove request to backend
        const response = await fetch(`/remove-tenant/${personId}`, {
            method: 'DELETE'
        });
  
        if (!response.ok) {
            throw new Error('Failed to remove tenant');
        }
  
        alert('Tenant removed successfully!');
        
        // Close modal and reset form
        closeModal('removeTenantModal');
        event.target.reset();
        
        // Refresh rooms to update the display
        fetchRooms();
    } catch (error) {
        console.error("Error removing tenant:", error);
        alert("Failed to remove tenant. " + error.message);
    }
}
// End of Remove a Tenant Function

// Add Room
async function addRoom(event) {
    event.preventDefault();

    const floor = parseInt(document.getElementById("roomFloorAdd").value, 10);
    const maxRenters = parseInt(document.getElementById("maxRentersAdd").value, 10);
    const price = parseFloat(document.getElementById("roomPriceAdd").value);
    const status = parseInt(document.getElementById("roomStatusAdd").value, 10);
    let number_of_Renters = 0;
    
    // Get the apartment name
    const apt_loc = await getCurrentApartment();
    
    // Validate apartment ID
    if (!apt_loc) {
        mySwalala.fire({
            title: "Error!",
            text: "Invalid apartment location.",
            icon: "error",
            iconColor: "#8B0000",
            background: "#222",
            color: "#fff",
            confirmButtonColor: "#dc3545"
        });
        return;
    }
    
    // Validate input fields
    if (isNaN(floor) || floor <= 0) {
        mySwalala.fire({ 
            title: "Error!", 
            text: "Floor must be a non-negative number.", 
            icon: "error", 
            iconColor: "#8B0000",
            background: "#222", 
            color: "#fff", 
            confirmButtonColor: "#8B0000" 
        });
        return;
    }
    if (isNaN(maxRenters) || maxRenters < 1) {
        mySwalala.fire({ 
            title: "Error!", 
            text: "Max renters must be at least 1.", 
            icon: "error", 
            iconColor: "#8B0000",
            background: "#222", 
            color: "#fff", 
            confirmButtonColor: "#8B0000" 
        });
        return;
    }
    if (isNaN(price) || price <= 0) {
        mySwalala.fire({ 
            title: "Error!", 
            text: "Price must be a non-negative number.", 
            icon: "error", 
            iconColor: "#8B0000",
            background: "#222", 
            color: "#fff", 
            confirmButtonColor: "#8B0000" 
        });
        return;
    }
    if (isNaN(status)) {
        mySwalala.fire({ 
            title: "Error!", 
            text: "Status is required.", 
            icon: "error", 
            iconColor: "#8B0000",
            background: "#222", 
            color: "#fff", 
            confirmButtonColor: "#8B0000" 
        });
        return;
    }

    // Prepare request payload
    const newRoom = { 
        floor, 
        tenants: number_of_Renters, 
        max_renters: maxRenters, 
        status, 
        price, 
        apt_loc
    };
    
    try {
        const response = await fetch("/addRoom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRoom)
        });

        if (response.ok) {
            mySwalala.fire({
                title: "Success!",
                text: "Room added successfully!",
                icon: "success",
                iconColor: "#006400"
            }).then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
                modal.hide();
                event.target.reset();
                fetchRooms(); // Refresh room list
            });
        } else {
            mySwalala.fire({
                title: "Failed!",
                text: "Failed to add room.",
                icon: "error",
                iconColor: "#8B0000",
                confirmButtonColor: "#dc3545"
            });
        }
    } catch (error) {
        console.error("Error adding room:", error);
        mySwalala.fire({
            title: "Error!",
            text: "Something went wrong. Please try again.",
            icon: "error",
            iconColor: "#8B0000",
            confirmButtonColor: "#dc3545"
        });
    }
}
// End of Add Room Function

// Update Room Details
async function updateRoom(event) {
    event.preventDefault();
    // IF IN the rooms modal || Change
    const selectedRoomId = document.querySelector('.roomId').value;
    const floor = parseInt(document.getElementById("roomFloor").value, 10);
    const tenants = parseInt(document.getElementById("numTenants").value, 10);
    const maxRenters = parseInt(document.getElementById("maxRenters").value, 10);
    const price = parseFloat(document.getElementById("roomPrice") ? document.getElementById("roomPrice").value : "0.00");
    const status = parseInt(document.getElementById("roomStatus").value, 10);

    console.log("Selected status:", status); // Debugging log

    // If any field is invalid, show a single error message
    if (!selectedRoomId) {
        mySwalala.fire({
            title: "Error!",
            text: "Room ID is required.",
            icon: "error",
            iconColor: "#8B0000"
        });
        return;
    }
    if (isNaN(floor) || floor <= 0) {
        mySwalala.fire({
            title: "Error!",
            text: "Floor must be a non-negative number.",
            icon: "error",
            iconColor: "#8B0000"
        });
        return;
    }
    if (isNaN(tenants) || tenants < 0) {
        mySwalala.fire({
            title: "Error!",
            text: "Tenants must be a non-negative number.",
            icon: "error",
            iconColor: "#8B0000"
        });
        return;
    }
    if (isNaN(maxRenters) || maxRenters < 1) {
        mySwalala.fire({
            title: "Error!",
            text: "Max renters must be at least 1.",
            icon: "error",
            iconColor: "#8B0000"
        });
        return;
    }
    if (isNaN(price) || price <= 0) {
        mySwalala.fire({
            title: "Error!",
            text: "Price must be a non-negative number.",
            icon: "error",
            iconColor: "#8B0000"
        });
        return;
    }
    if (isNaN(status)) {
        mySwalala.fire({
            title: "Error!",
            text: "Status is required.",
            icon: "error",
            iconColor: "#8B0000"
        });
        return;
    }

    // Gather validated values
    const updatedRoom = {
        floor,
        tenants,
        max_renters: maxRenters,
        status,
        price,
        room_id: selectedRoomId
    };

    try {
        const response = await fetch("/updateRoom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRoom)
        });
    
        if (response.ok) {
            mySwalala.fire({
                title: "Success!",
                text: "Room updated successfully!",
                icon: "success",
                iconColor: "#006400",
                confirmButtonText: "OK"
            }).then(() => {
                event.target.reset(); // Reset form fields
                fetchRooms(); // Refresh the available rooms
                updateRoomDropdown(); // Update dropdowns dynamically
            });
        } else {
            mySwalala.fire({
                title: "Error!",
                text: "Failed to update room.",
                icon: "error",
                iconColor: "#8B0000",
                confirmButtonText: "OK"
            });
        }
    
        // Refresh rooms to update the display
        fetchRooms();
        } catch (error) {
            console.error("Error updating room:", error);
            mySwalala.fire({
                title: "Error!",
                text: "An unexpected error occurred.",
                icon: "error",
                iconColor: "#8B0000",
                confirmButtonText: "OK"
            });
        }
}
// End of Update Room Details Function

// Delete Room
async function deleteRoom(roomId) {
    if (!roomId) {
        mySwalala.fire({
            title: "Error!",
            text: "Please enter a valid Room ID!",
            icon: "error",
            iconColor: "#8B0000",
            background: "#222",
            color: "#fff",
            confirmButtonColor: "#8B0000"
        });
        return;
    }

    // Confirm deletion using Swal
    const result = await mySwalala.fire({
        title: "Are you sure?",
        text: `Do you really want to delete Room ${roomId}?`,
        icon: "warning",
        iconColor: "#8B0000",
        background: "#222",
        color: "#fff",
        showCancelButton: true,
        confirmButtonColor: "#8B0000",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return; // Stop if user cancels

    try {
        const response = await fetch(`/deleteRoom/${roomId}`, { method: "DELETE" });

        if (!response.ok) {
            const errorData = await response.json(); 
            mySwalala.fire({
                title: "Error!",
                text: errorData.error,
                icon: "error",
                iconColor: "#8B0000",
                background: "#222",
                color: "#fff",
                confirmButtonColor: "#8B0000"
            });
            return false;
        }

        mySwalala.fire({
            title: "Deleted!",
            text: `Room ${roomId} has been successfully deleted.`,
            icon: "success",
            iconColor: "#006400",
            background: "#222",
            color: "#fff",
            confirmButtonColor: "#006400"
        });

        // Reset input field
        document.getElementById("roomIdDelete").value = "";

        // Refresh room list
        fetchRooms();

        return true;
    } catch (error) {
        console.error("Error deleting room:", error);
        mySwalala.fire({
            title: "Error!",
            text: "An unexpected error occurred while deleting the room.",
            icon: "error",
            iconColor: "#8B0000",
            background: "#222",
            color: "#fff",
            confirmButtonColor: "#8B0000"
        });
        return false;
    }
}
// End of Delete Room Function

// Populate the room table with room details || pag open sa rooms
async function populateRoomTable(rooms) {
    const tbody = document.getElementById('roomTable').querySelector('tbody');
    tbody.innerHTML = '';  // Clear existing table data
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.Room_ID}</td>
            <td>${room.Room_floor}</td>
            <td>${room.Number_of_Renters}</td>
            <td>${room.Room_maxRenters}</td>
            <td>₱${room.Room_Price.toLocaleString()}</td>
            <td>${room.Room_Status_Desc}</td>
        `;
        tbody.appendChild(row);
    });
}
// End of Populate room with details

// View All Rooms || Inside rooms >> view all
async function viewAllRooms(rooms) {
    const tbody = document.getElementById('allRoomsTable').querySelector('tbody');
    tbody.innerHTML = '';  // Clear existing table data
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.Room_ID}</td>
            <td>${room.Room_floor}</td>
            <td>${room.Number_of_Renters}</td>
            <td>${room.Room_maxRenters}</td>
            <td>₱${room.Room_Price.toLocaleString()}</td>
            <td>${room.Room_Status_Desc}</td>
            <td>${room.Apt_Location}</td>
        `;
        tbody.appendChild(row);
    });
}
// End of View All Rooms Function

// For the view all rooms button in the room management
const viewRooms = document.getElementById("viewRooms");
viewRooms.addEventListener("click", async function() {
    console.log("viewRooms:", viewRooms);
    fetchRooms();;
    const response = await fetch("/viewAll")
    .then(response => response.json())
    .then(data => {
        console.log("Calling viewAllRooms with data:", data);
        viewAllRooms(data);
    })
    .catch(error => console.error("Fetch error:", error));
  
    const rooms = await response.json();
    await viewAllRooms(rooms);
})  

// Update room dropdown based on selected apartment
async function updateRoomDropdown() {
    const aptLocId = await getCurrentApartment(); // Get the current apartment number
    if (!aptLocId) return; // Exit if no valid apartment ID

    console.log('Current apt_ID: ', aptLocId)

    const roomDropdowns = document.querySelectorAll(".roomId"); // Select multiple elements
    if (roomDropdowns.length === 0) return;


    roomDropdowns.forEach(dropdown => {
        dropdown.innerHTML = ""; // Clear existing options

        // Fetch available rooms from the database
        fetch(`/getRooms/${aptLocId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    let option = document.createElement("option");
                    option.textContent = "No available rooms";
                    dropdown.appendChild(option);
                } else {
                    data.forEach(room => {
                        let option = document.createElement("option");
                        option.value = room.Room_ID;
                        option.textContent = `Room ${room.Room_ID}`;
                        dropdown.appendChild(option);
                    });
                }
            })
            .catch(error => console.error("Error fetching rooms:", error));
    });
}
// End of Update room dropdown based on selected apartment


// Search Function
document.addEventListener('DOMContentLoaded', function() {
    const searchTenantBtn = document.getElementById("searchTenantBtn");
    const mainContentArea = document.getElementById("mainContentArea");
    const searchTenantFormContainer = document.getElementById("searchTenantFormContainer");
    const searchForm = document.getElementById("searchTenantForm");
    
    // Flag to track if the search interface has been initialized
    let searchInterfaceInitialized = false;
    
    // Search Tenant Button Click
    if (searchTenantBtn && mainContentArea && searchTenantFormContainer) {
      searchTenantBtn.addEventListener("click", function() {
        // Only create the search interface once
        if (!searchInterfaceInitialized) {
          // Clear main content area
          mainContentArea.innerHTML = "";
          
          // Create the search results container
          const resultsContainer = document.createElement("div");
          resultsContainer.id = "searchResultsContainer";
          resultsContainer.className = "mt-4";
          resultsContainer.innerHTML = `
            <h2>Search a Tenant</h2>
            <div class="table-responsive">
              <table class="table table-dark table-striped table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Room</th>
                    <th>Contact</th>
                    <th>Move-in Date</th>
                    <th>Contract End</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="tenantResultsBody">
                  <!-- Initially empty -->
                </tbody>
              </table>
            </div>
          `;
          
          // Make form visible and add the results container
          searchTenantFormContainer.style.display = "block";
          searchTenantFormContainer.insertBefore(resultsContainer, searchTenantFormContainer.firstChild);
          
          // Add to main content area
          mainContentArea.appendChild(searchTenantFormContainer);
          
          // Set flag to indicate search interface is initialized
          searchInterfaceInitialized = true;
        } else {
          // Just show the form container if it's already been created
          searchTenantFormContainer.style.display = "block";
          
          // Make sure it's in the main content area
          if (!mainContentArea.contains(searchTenantFormContainer)) {
            mainContentArea.innerHTML = "";
            mainContentArea.appendChild(searchTenantFormContainer);
          }
          
          // Clear previous search results
          const resultsBody = document.getElementById("tenantResultsBody");
          if (resultsBody) {
            resultsBody.innerHTML = '';
          }
        }
      });
    }
    
    // Rest of the code remains the same
    if (searchForm) {
      searchForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Sample data - would come from your backend in a real app
        const sampleTenants = [
          {
            id: 'T001',
            name: 'John Doe',
            room: '101',
            contact: '555-1234',
            moveInDate: '2024-01-15',
            contractEnd: '2025-01-14',
            status: 'Active'
          },
          {
            id: 'T002',
            name: 'Jane Smith',
            room: '202',
            contact: '555-5678',
            moveInDate: '2023-11-01',
            contractEnd: '2024-10-31',
            status: 'Active'
          }
        ];
        
        // Get reference to results body
        const resultsBody = document.getElementById("tenantResultsBody");
        if (resultsBody) {
          // Clear previous results
          resultsBody.innerHTML = '';
          
          // Populate table with results
          sampleTenants.forEach(tenant => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${tenant.id}</td>
              <td>${tenant.name}</td>
              <td>${tenant.room}</td>
              <td>${tenant.contact}</td>
              <td>${tenant.moveInDate}</td>
              <td>${tenant.contractEnd}</td>
              <td><span class="badge bg-success">${tenant.status}</span></td>
              <td>
                <button class="action-btn" title="View Details"><i class="bi bi-eye"></i></button>
                <button class="action-btn" title="Edit"><i class="bi bi-pencil"></i></button>
              </td>
            `;
            resultsBody.appendChild(row);
          });
        }
      });
    }
  });
// End of Search Function


// Check Rooms
async function fetchRooms() {
    try {
        const response = await fetch('/rooms'); // Fetch all rooms
        const rooms = await response.json();
        console.log("Fetched rooms:", rooms);
        return rooms; // Return the fetched rooms
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return []; // Return an empty array if there's an error
    }
}



// Payment Function
document.addEventListener('DOMContentLoaded', function () {
    const paymentTenantBtn = document.getElementById("paymentBtn");
    const mainContentArea = document.getElementById("mainContentArea");
    const paymentTenantFormContainer = document.getElementById("paymentTenantFormContainer");
    const resultsContainerId = "paymentResultsContainer";
    const paymentForm = document.getElementById("paymentForm"); // Make sure this element exists

    // Ensure the payment results container and table exist
    function ensureResultsContainer() {
        let resultsContainer = document.getElementById(resultsContainerId);

        if (!resultsContainer) {
            resultsContainer = document.createElement("div");
            resultsContainer.id = resultsContainerId;
            resultsContainer.className = "mt-4";
            resultsContainer.innerHTML = `
                <h2>Payment</h2>
                <div class="table-responsive">
                    <table class="table table-dark table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Room ID</th>
                                <th>Name</th>
                                <th>Rent Status</th>
                            </tr>
                        </thead>
                        <tbody id="tenantResultsBody">
                            <!-- Initially empty -->
                        </tbody>
                    </table>
                </div>
            `;

            paymentTenantFormContainer.style.display = "block";
            paymentTenantFormContainer.insertBefore(resultsContainer, paymentTenantFormContainer.firstChild);
        }
    }

    // Sample data
    const sampleTenants = [
        { id: "101", name: 'John Doe', rent: 'Paid' },
        { id: "102", name: 'Jane Doe', rent: 'Not yet Paid' }
    ];

    // Function to populate the table
    function populateTable() {
        ensureResultsContainer(); // Ensure table exists before accessing it
        const resultsBody = document.getElementById("tenantResultsBody");

        if (resultsBody) {
            resultsBody.innerHTML = ''; // Clear previous content

            sampleTenants.forEach(tenant => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tenant.id}</td>
                    <td>${tenant.name}</td>
                    <td>${tenant.rent}</td>
                `;
                resultsBody.appendChild(row);
            });
        }
    }

    // Payment Tenant Button Click
    if (paymentTenantBtn && mainContentArea && paymentTenantFormContainer) {
        paymentTenantBtn.addEventListener("click", function () {
            // Clear main content area
            mainContentArea.innerHTML = "";
            
            // Hide payment form container initially
            paymentTenantFormContainer.style.display = "none";
            
            // Add to main content area
            mainContentArea.appendChild(paymentTenantFormContainer);
            
            // Now show it and populate the table
            paymentTenantFormContainer.style.display = "block";
            populateTable();
        });
    }

    // Form submission
    if (paymentForm) {
        paymentForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Get reference to results body again (might have been recreated)
            const resultsBody = document.getElementById("tenantResultsBody");

            if (resultsBody) {
                // Clear previous results
                resultsBody.innerHTML = '';

                // Populate table with results
                sampleTenants.forEach(tenant => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${tenant.id}</td>
                        <td>${tenant.name}</td>
                        <td>${tenant.rent}</td>
                        <td>
                            <button class="action-btn" title="View Details"><i class="bi bi-eye"></i></button>
                            <button class="action-btn" title="Edit"><i class="bi bi-pencil"></i></button>
                        </td>
                    `;
                    resultsBody.appendChild(row);
                });
            }
        });
    }
});
// End of Payment Function