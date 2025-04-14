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
    // console.log("UniformManagementPage rendering..."); // Keep logs for debugging if needed

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
        // console.log("fetchItems called with filters:", filters);
        setIsLoading(true);
        // setError(null); // Error is cleared in useEffect now
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) { queryParams.append(key, value); }
        });
        const queryString = queryParams.toString();
        // console.log(`Workspaceing: /api/uniform?${queryString}`);

        try {
            const response = await fetch(`/api/uniform?${queryString}`);
            // console.log("Fetch response status:", response.status);

            if (!response.ok) {
                 const errData = await response.json().catch(()=>({ message: "Failed to parse error response" }));
                 // console.error("Fetch error response data:", errData);
                 throw new Error(errData.message || `Failed to fetch items: ${response.statusText}`);
            }
            const data: ApiUniformItem[] = await response.json();
            // console.log("Fetched data:", data);
            setItems(data);
        } catch (err: any) {
            // console.error("Error caught in fetchItems:", err);
            setError(err.message);
            setItems([]);
        } finally {
            // console.log("Setting isLoading to false");
            setIsLoading(false);
        }
    };

    // Fetch initially and whenever filters change
    useEffect(() => {
        // console.log("useEffect triggered. Clearing error and calling fetchItems.");
        setError(null); // Clear error state on load/filter change
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]); // Re-fetch when filters object changes

    // --- Event Handlers ---
    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // console.log(`Filter changed - ${name}: ${value}`);
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteItem = async (itemId: string, itemType: ItemType) => {
         // console.log(`Attempting to delete item ID: ${itemId}, Type: ${itemType}`);
        if (!confirm(`Are you sure you want to delete this ${itemType} (ID: ${itemId})?`)) {
            return;
        }
        setError(null); // Clear previous errors before attempting delete

        try {
             const response = await fetch(`/api/uniform/${itemId}`, { method: 'DELETE' });
             // console.log(`Delete response status for ${itemId}:`, response.status);

             if (!response.ok && response.status !== 204) { // 204 No Content is success for DELETE
                  const result = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                  // console.error("Delete error response data:", result);
                 throw new Error(result.message || `Error: ${response.statusText}`);
             }
             // console.log(`Item ${itemId} deleted. Refetching items...`);
             fetchItems(); // Refresh list after successful deletion
             // alert('Item deleted successfully.'); // Optional feedback

        } catch (err: any) {
             // console.error("Delete item error:", err);
             setError(err.message); // Show deletion error
        }
    };

    // --- Print Handler ---
    const handlePrint = () => {
        window.print(); // Triggers browser print dialog
    };

    // --- Render Logic ---
    // console.log("Rendering component state - isLoading:", isLoading, "error:", error);

    return (
        // Added ID for potential print targeting
        <div id="uniform-page-content">
            <h1>Uniform Items</h1>

            {/* Links and Print Button - hidden on print */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="print-hide">
                <Link href="/uniform/add">
                    <button>Add New Uniform Item</button>
                </Link>
                 <Link href="/uniform/bulk-add">
                    <button>Bulk Add Items</button>
                </Link>
                <button onClick={handlePrint} style={{ marginLeft: 'auto' }}>
                    Print Current View
                </button>
            </div>

            <h2>Item List</h2>
            {/* Error display - hidden on print */}
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', marginBottom: '1rem' }} className="print-hide">Error: {error}</p>}

            {/* Filter Controls - hidden on print */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} className="print-hide">
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


            {/* Item Table Section */}
            {isLoading ? <p className="print-hide" style={{ padding: '20px', fontWeight: 'bold' }}>Loading uniform items...</p> : ( // Hide loading message on print
                // Added ID for potential print targeting
                <div id="uniform-table-container" style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ccc', background: '#f8f8f8' }}>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Size</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Serial No.</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Condition</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Location</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Added</th>
                                {/* Actions column - hidden on print */}
                                <th style={{ padding: '10px 15px', textAlign: 'left' }} className="print-hide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && !error ? (
                                 <tr><td colSpan={7} style={{ padding: '10px 15px', textAlign: 'center' }}>No items found matching filters.</td></tr> // Adjusted colspan
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px 15px' }}>{item.type.replace(/_/g, ' ')}</td> {/* Display formatted type */}
                                        <td style={{ padding: '10px 15px' }}>{item.size ?? 'N/A'}</td>
                                        <td style={{ padding: '10px 15px' }}>{item.serialNumber ?? 'N/A'}</td>
                                        <td style={{ padding: '10px 15px' }}>{item.condition}</td>
                                        <td style={{ padding: '10px 15px' }}>{item.location ?? 'N/A'}</td>
                                        <td style={{ padding: '10px 15px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        {/* Actions data cell - hidden on print */}
                                        <td style={{ padding: '10px 15px' }} className="print-hide">
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