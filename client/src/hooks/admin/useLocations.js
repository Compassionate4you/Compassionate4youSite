// Add Location handlers
import { useState } from "react";

function useLocations() {
    const [locations, setLocations] = useState([
        {
            id: 1,
            name: "Main Office",
            address:  "1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596",
            phone: "(925) 425-7104",
            status: "Active",
        },
    ]);

    const [editingLocationId, setEditingLocationId] =
        useState(null);

    const [editForm, setEditForm] = useState({
        name: "", address: "", phone: "", status: "",
    });

    const [showLocationForm, setShowLocationForm] = useState(false);

    const [locationForm, setLocationForm] = useState({
        name: "", address: "", phone: "", status: "", 
    });

    // Opens the edit form with an existing Location's information
    const handleEditClick = (location) => {
        setEditingLocationId(location.id);
        setEditForm({
            name: location.name,
            address: location.address,
            phone: location.phone,
            status: location.status,
        });
    };

    // Updates a field in the edit form
    const handleEditFormChange = (field, value) => {
        setEditForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    // Saves changes made to an existing Location
    const handleSaveLocation = (id) => {
        setLocations((currentLocations) =>
            currentLocations.map((location) =>
                location.id === id
                    ? {
                          ...location,
                          ...editForm,
                      }
                    : location
            )
        );
        setEditingLocationId(null);
    };

    // Closes the edit form without saving changes
    const handleCancelEdit = () => {
        setEditingLocationId(null);
    };

    // Clears the Add Location form upon Cancel
    const resetLocationForm = () => {
        setLocationForm({
            name: "", address: "", phone: "", status: "", 
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

    // Adds a temporary Location to React state.
    const handleAddLocation = (event) => {
        event.preventDefault();
        const locationName = locationForm.name.trim();
        const address = locationForm.address.trim();
        const phone = locationForm.phone.trim();
        if (
            !locationName || !address || !phone || !locationForm.status
        ) {
            return;
        }

        const newLocation = {
            id: Date.now(),
            name: locationName,
            address,
            phone,
            status: locationForm.status,
        };

        setLocations((currentLocations) => [
            ...currentLocations,
            newLocation,
        ]);
        resetLocationForm();
        setShowLocationForm(false);
    };

    return {
        locations,
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