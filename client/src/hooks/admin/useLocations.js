// Add Location handlers
import { useEffect, useState} from "react";
import {apiGetLocations, apiCreateLocation, apiUpdateLocation} from "../../services/api";



function useLocations() {
    const [locations, setLocations] = useState([]);

    const [error, setError] = useState(""); //stores an error message if loading locations fail


    //Loads locations from the backend when the page first opens
    useEffect(() => {
        async function loadLocations() {
            //Requests all locations form the backend api
            try {
                const data = await apiGetLocations();
            
            //converts database fields into the format used by the dashboard
            const formattedLocations = data.locations.map((location) => ({
                ...location,
                address: [
                    location.streetAddress,
                    location.city,
                    location.state,
                    location.zipCode,
                ].filter(Boolean).join(", "),
                phone: location.phone || "", 
                status: location.active === false ? "Inactive" : "Active",

            }));

            //Updates the locations displayed on the dashboard
            setLocations(formattedLocations);


        } catch (err) {

            //saves the error if the request fails
            setError(err.message);
            console.error("Failed to load locations:", err);
        }
    }

    loadLocations();
},[]);

    const [editingLocationId, setEditingLocationId] =
        useState(null);

    const [editForm, setEditForm] = useState({
        name: "", streetAddress: "", phone: "", status: "", city: "", state: "", zipCode: ""
    });

    const [showLocationForm, setShowLocationForm] = useState(false);

    const [locationForm, setLocationForm] = useState({
        name: "", streetAddress: "", city: "", state: "", phone: "", status: "", zipCode: "",
    });

    // Opens the edit form with an existing Location's information
    const handleEditClick = (location) => {
        setEditingLocationId(location.id);
        setEditForm({
            name: location.name,
            streetAddress: location.streetAddress || "",
            city: location.city || "",
            state: location.state || "",
            zipCode: location.zipCode || "",

            phone: location.phone || "",
            status: location.status || "",
        });
    };

    // Updates a field in the edit form
    const handleEditFormChange = (field, value) => {
        setEditForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

// Saves changes to an existing location in the database
const handleSaveLocation = async (id) => {
    try {
        setError("");

        // Sends the updated location information to the backend
        const data = await apiUpdateLocation(id, {
            name: editForm.name.trim(),
            streetAddress: editForm.streetAddress.trim(),
            city: editForm.city.trim(),
            state: editForm.state.trim(),
            zipCode: editForm.zipCode.trim(),
        });

        // Formats the updated location for the dashboard
        const updatedLocation = {
            ...data.location,
            address: [
                data.location.streetAddress,
                data.location.city,
                data.location.state,
                data.location.zipCode,
            ].filter(Boolean).join(", "),
            phone: data.location.phone || "",
            status: data.location.active === false ? "Inactive" : "Active",
        };

        // Updates the displayed location after the database saves successfully
        setLocations((currentLocations) =>
            currentLocations.map((location) =>
                location.id === id ? updatedLocation : location
            )
        );

        // Closes the edit form
        setEditingLocationId(null);

    } catch (err) {
        // Displays an error if updating the location fails
        setError(err.message);
        console.error("Failed to update location:", err);
    }
};

    // Closes the edit form without saving changes
    const handleCancelEdit = () => {
        setEditingLocationId(null);
    };

    // Clears the Add Location form upon Cancel
    const resetLocationForm = () => {
        setLocationForm({
            name: "", streetAddress: "", phone: "", status: "", city: "", state: "", zipCode: "", 
        });
    };

    // Updates a field in the Add Location form
    const handleLocationFormChange = (event) => {
        const { name, value } = event.target;

        setLocationForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    // Opens a blank Add Location form.
    const handleOpenAddLocation = () => {
        resetLocationForm();
        setShowLocationForm(true);
    };

    // Closes the Add Location form without adding anything.
    const handleCancelAddLocation = () => {
        resetLocationForm();
        setShowLocationForm(false);
    };

 // Adds a new location to the database
const handleAddLocation = async (event) => {
    event.preventDefault();

    // Gets the information entered in the form
    const locationName = locationForm.name.trim();
    const streetAddress = locationForm.streetAddress.trim();
    const city = locationForm.city.trim();
    const state = locationForm.state.trim();
    const zipCode = locationForm.zipCode.trim();

    // Makes sure all required database fields are filled out
    if (!locationName || !streetAddress || !city || !state || !zipCode) {
        setError("Please fill out all required fields.");
        return;
    }

    try {
        setError("");

        // Sends the new location to the backend and saves it in Supabase
        const data = await apiCreateLocation({
            name: locationName,
            streetAddress,
            city,
            state,
            zipCode,
        });

        // Adds the saved location to the dashboard
        const newLocation = {
            ...data.location,
            address: [streetAddress, city, state, zipCode].join(", "),
            phone: "",
            status: "Active",
        };

        setLocations((currentLocations) => [
            ...currentLocations,
            newLocation,
        ]);

        // Clears and closes the form after saving
        resetLocationForm();
        setShowLocationForm(false);

    } catch (err) {
        // Displays an error if saving fails
        setError(err.message);
        console.error("Failed to add location:", err);
    }
};

    return {
        locations,
        error,
        editingLocationId,
        editForm,
        showLocationForm,
        locationForm,
        handleEditClick,
        handleEditFormChange,
        handleSaveLocation,
        handleCancelEdit,
        handleLocationFormChange,
        handleOpenAddLocation,
        handleCancelAddLocation,
        handleAddLocation,
    };
}

export default useLocations;