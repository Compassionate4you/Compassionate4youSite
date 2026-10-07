//Locations tab functinonality
function LocationsTab({
    showLocationForm,
    locationForm,
    locations,
    editingLocationId,
    editForm,
    onOpenAddLocation,
    onSubmitAddLocation,
    onLocationFormChange,
    onCancelAddLocation,
    onEditLocation,
    onEditFormChange,
    onSaveLocation,
    onCancelEdit,
}) {
    return (
        <div className="admin-locations-section">
            <div className="admin-locations-header">
                <div>
                    <h2>Location Management</h2>

                    <p>
                        Manage office locations and contact information
                    </p>
                </div>
                {/* Add Location Button */}
                <button
                    type="button"
                    className="admin-location-add-button"
                    onClick={onOpenAddLocation}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>

                    Add Location
                </button>
            </div>
            {/* Add Location form */}
            {showLocationForm && (
                <form
                    className="admin-location-add-form"
                    onSubmit={onSubmitAddLocation}
                >
                    <div className="admin-location-form-heading">
                        <h3>Add Location</h3>
                        <p>Enter the new office location information.</p>
                    </div>
                    {/* New Form fields */}
                    <div className="admin-location-form-grid">
                        <div className="admin-location-form-field">
                            <label htmlFor="location-name">
                                Location title
                            </label>
                            {/* Placeholder exmaples */}
                            <input
                                id="location-name"
                                type="text"
                                name="name"
                                value={locationForm.name}
                                onChange={onLocationFormChange}
                                placeholder="Example: Sacramento Office"
                                required
                            />
                        </div>

                        <div className="admin-location-form-field">
                            <label htmlFor="location-phone">
                                Phone number
                            </label>

                            <input
                                id="location-phone"
                                type="tel"
                                name="phone"
                                value={locationForm.phone}
                                onChange={onLocationFormChange}
                                placeholder="Example: (916) 555-0123"
                                required
                            />
                        </div>

                        <div className="admin-location-form-field admin-location-address-field">
                            <label htmlFor="location-address">
                                Full address
                            </label>

                            <input
                                id="location-address"
                                type="text"
                                name="address"
                                value={locationForm.address}
                                onChange={onLocationFormChange}
                                placeholder="Street, suite, city, state, and ZIP code"
                                required
                            />
                        </div>

                        <div className="admin-location-form-field">
                            <label htmlFor="location-status">
                                Status
                            </label>

                            <select
                                id="location-status"
                                name="status"
                                value={locationForm.status}
                                onChange={onLocationFormChange}
                                required
                            >
                                <option value="">
                                    Select a status
                                </option>

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>
                    {/* New Form Add and cancel buttons */}
                    <div className="admin-location-add-actions">
                        <button
                            type="button"
                            className="admin-location-cancel-button"
                            onClick={onCancelAddLocation}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="admin-location-submit-button"
                        >
                            Add Location
                        </button>
                    </div>
                </form>
            )}
            {/* Edit Location */}
            <div className="admin-locations-list">
                {locations.map((location) => (
                    <div
                        key={location.id}
                        className="admin-location-card"
                    >
                        {editingLocationId === location.id ? (
                            <div className="admin-location-edit-form">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(event) =>
                                        onEditFormChange(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Location name"
                                    className="admin-location-form-control"
                                />

                                <input
                                    type="text"
                                    value={editForm.address}
                                    onChange={(event) =>
                                        onEditFormChange(
                                            "address",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Address"
                                    className="admin-location-form-control"
                                />

                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(event) =>
                                        onEditFormChange(
                                            "phone",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Phone"
                                    className="admin-location-form-control"
                                />
                                {/* Drop down menu for Inactive or Active choice */}
                                <select
                                    value={editForm.status}
                                    onChange={(event) =>
                                        onEditFormChange(
                                            "status",
                                            event.target.value
                                        )
                                    }
                                    className="admin-location-form-control"
                                >
                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                                    {/* Edit Save button */}
                                <div className="admin-location-form-actions">
                                    <button
                                        type="button"
                                        className="admin-location-save-button"
                                        onClick={() =>
                                            onSaveLocation(location.id)
                                        }
                                    >
                                        Save
                                    </button>
                                    {/* Edit Cancel button */}
                                    <button
                                        type="button"
                                        className="admin-location-cancel-button"
                                        onClick={onCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="admin-location-details">
                                <div>
                                    <h3 className="admin-location-name">
                                        {location.name}
                                    </h3>

                                    <p className="admin-location-address">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {location.address}
                                    </p>

                                    <p className="admin-location-phone">
                                        Phone: {location.phone}
                                    </p>

                                    <span
                                        className={`admin-location-status admin-location-status-${location.status.toLowerCase()}`}
                                    >
                                        {location.status}
                                    </span>
                                </div>
                                {/* Edit Location button */}
                                <button
                                    type="button"
                                    className="admin-location-edit-button"
                                    onClick={() =>
                                        onEditLocation(location)
                                    }
                                    aria-label={`Edit ${location.name}`}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        aria-hidden="true"
                                    >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LocationsTab;