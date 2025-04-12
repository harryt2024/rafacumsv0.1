// app/uniform/page.tsx
'use client'; // Needs to be client for state, effects, event handlers

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link'; // Import Link for navigation
import { UniformItem, ItemType, Condition } from '@prisma/client'; // Import generated types

// Define type for data received from API (dates might be strings)
type ApiUniformItem = Omit<UniformItem, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};

export default function UniformManagementPage() {
    console.log("UniformManagementPage rendering..."); // Log: Component rendering

    // State for the list of items
    const [items, setItems] = useState<ApiUniformItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filter inputs
    const [filters, setFilters] = useState({
        type: '',
        size: '',
        condition: '',
        location: '',
        serialNumber: '',
    });

    // --- Fetching Data ---
    const fetchItems = async () => {
        console.log("fetchItems called with filters:", filters); // Log: fetchItems starts
        setIsLoading(true);
        setError(null);
        // Construct query params from filter state
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) { // Only add non-empty filters
                queryParams.append(key, value);
            }
        });
        const queryString = queryParams.toString();
        console.log(`Workspaceing: /api/uniform?${queryString}`); // Log: The URL being fetched

        try {
            const response = await fetch(`/api/uniform?${queryString}`);
            console.log("Fetch response status:", response.status); // Log: Response status

            if (!response.ok) {
                 const errData = await response.json().catch(()=>({ message: "Failed to parse error response" }));
                 console.error("Fetch error response data:", errData); // Log: Error data
                 throw new Error(errData.message || `Failed to fetch items: ${response.statusText}`);
            }
            const data: ApiUniformItem[] = await response.json();
            console.log("Fetched data:", data); // Log: Success data
            setItems(data);
        } catch (err: any) {
            console.error("Error caught in fetchItems:", err); // Log: Catch block error
            setError(err.message);
            setItems([]); // Clear items on error
        } finally {
            console.log("Setting isLoading to false"); // Log: Finally block
            setIsLoading(false);
        }
    };

    // Fetch initially and whenever filters change
    useEffect(() => {
        console.log("useEffect triggered. Calling fetchItems."); // Log: useEffect runs
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]); // Re-fetch when filters object changes

    // --- Event Handlers ---
    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(`Filter changed - ${name}: ${value}`); // Log: Filter input change
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handle deleting an item from the list
    const handleDeleteItem = async (itemId: string, itemType: ItemType) => {
         console.log(`Attempting to delete item ID: ${itemId}, Type: ${itemType}`); // Log: Delete attempt
        if (!confirm(`Are you sure you want to delete this ${itemType} (ID: ${itemId})?`)) {
            return;
        }
        setError(null);

        try {
             const response = await fetch(`/api/uniform/${itemId}`, { method: 'DELETE' });
             console.log(`Delete response status for ${itemId}:`, response.status); // Log: Delete response status

             if (!response.ok && response.status !== 204) {
                  const result = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                  console.error("Delete error response data:", result); // Log: Delete error data
                 throw new Error(result.message || `Error: ${response.statusText}`);
             }
             console.log(`Item ${itemId} deleted. Refetching items...`); // Log: Delete success
             fetchItems(); // Refresh list
             // alert('Item deleted successfully.'); // Alert might be annoying, use console/toast later

        } catch (err: any) {
             console.error("Delete item error:", err); // Log: Delete catch block
             setError(err.message);
        }
    };

    // --- Render Logic ---
    console.log("Rendering component state - isLoading:", isLoading, "error:", error); // Log: Render state

    return (
        <div>
            <h1>Stores Overview</h1>

            {/* Link to the Add New Item page */}

            <h2>Filters</h2>
            {/* Display error state more prominently during debugging */}
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Error: {error}</p>}

            {/* Filter Controls */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                 <select name="type" value={filters.type} onChange={handleFilterChange}>
                     <option value="">All Types</option>
                     {Object.values(ItemType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                 </select>
                 <input type="text" name="size" placeholder="Filter by Size..." value={filters.size} onChange={handleFilterChange} />
                 <input type="text" name="serialNumber" placeholder="Filter by Serial No..." value={filters.serialNumber} onChange={handleFilterChange} />
                  <select name="condition" value={filters.condition} onChange={handleFilterChange}>
                     <option value="">All Conditions</option>
                     {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <input type="text" name="location" placeholder="Filter by Location..." value={filters.location} onChange={handleFilterChange} />
            </div>


            {/* Item Table */}
            {/* Ensure Loading message is clearly distinct */}
            {isLoading ? <p style={{ padding: '20px', fontWeight: 'bold' }}>Loading uniform items...</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ccc', background: '#f8f8f8' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Size</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Serial No.</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Condition</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Location</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Added</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && !error ? ( // Added !error condition here
                                 <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center' }}>No items found matching filters.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px' }}>{item.type.replace(/_/g, ' ')}</td> {/* Display formatted type */}
                                        <td style={{ padding: '8px' }}>{item.size ?? 'N/A'}</td>
                                        <td style={{ padding: '8px' }}>{item.serialNumber ?? 'N/A'}</td>
                                        <td style={{ padding: '8px' }}>{item.condition}</td>
                                        <td style={{ padding: '8px' }}>{item.location ?? 'N/A'}</td>
                                        <td style={{ padding: '8px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                              onClick={() => handleDeleteItem(item.id, item.type)}
                                              style={{ color: 'red', marginLeft: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
                                              title={`Delete ${item.type} (ID: ${item.id})`}
                                             >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}