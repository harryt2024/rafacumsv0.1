// app/uniform/bulk-add/page.tsx
'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ItemType, Condition } from '@prisma/client'; // Import enums

interface BulkAddResult {
    message: string;
    count: number;
    addedType: ItemType;
}

export default function BulkAddUniformPage() {
    const router = useRouter();
    const [itemDetails, setItemDetails] = useState({
        type: ItemType.MENS_WEDGEWOOD_SHIRT,
        size: '',
        // serialNumber: '', // Omit for bulk add simplicity
        condition: Condition.GOOD,
        location: '',
        notes: '',
    });
    const [quantity, setQuantity] = useState<number | string>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<BulkAddResult | null>(null);

    // --- Reusable Styles (copied from admin users page) ---
    const inputStyle: React.CSSProperties = {
        border: '1px solid #ccc', padding: '8px 10px', borderRadius: '4px',
        fontSize: '0.9rem', marginLeft: '5px',
    };
    const labelStyle: React.CSSProperties = {
        marginRight: '5px', display: 'inline-block', width: '80px', // Adjust width if needed
        textAlign: 'right', fontSize: '0.9rem',
    };
    const buttonStyle: React.CSSProperties = {
        padding: '10px 15px', border: '1px solid #007bff', backgroundColor: '#007bff',
        color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem',
        marginLeft: '85px', // Adjust alignment based on label width + margin
        marginTop: '10px',
    };
    const disabledButtonStyle: React.CSSProperties = {
       ...buttonStyle, backgroundColor: '#a0cfff', borderColor: '#a0cfff', cursor: 'not-allowed',
    };
    // --- End Styles ---


    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         // Ensure 'name' exists as key before setting state
         if (name in itemDetails) {
              setItemDetails(prev => ({ ...prev, [name]: value }));
         } else {
             console.warn(`Input name "${name}" does not match any key in itemDetails state.`);
         }
    };

    const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
         setQuantity(e.target.value);
    };

    const handleBulkSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setIsSubmitting(true); setError(null); setLastResult(null);
        const parsedQuantity = parseInt(quantity as string, 10);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) { /* ... error handling ... */
            setError('Please enter a valid quantity greater than 0.'); setIsSubmitting(false); return;
         }
        try {
            const response = await fetch('/api/uniform/bulk', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...itemDetails, quantity: parsedQuantity }),
            });
            const result: BulkAddResult | { message: string } = await response.json();
            if (!response.ok) { throw new Error((result as { message: string }).message || `Error: ${response.statusText}`); }
            setLastResult(result as BulkAddResult);
            // Reset specific fields, keep Type, maybe Condition/Location
            setItemDetails(prev => ({
                ...prev, size: '', notes: '', // Reset size and notes
                // Keep type, location, condition by using prev values
                location: prev.location, condition: prev.condition, type: prev.type,
            }));
            setQuantity(1); // Reset quantity
            // alert(`Successfully added ${parsedQuantity} items.`); // Optional

        } catch (err: any) { setError(err.message); } finally { setIsSubmitting(false); }
    };

    return (
        <div>
            <h1>Bulk Add Uniform Items</h1>
            <p>Select the item type, fill in the common details for a batch, specify the quantity, and add.</p>
            <p>The Item Type will remain selected after adding a batch.</p>

            {/* --- Styled Bulk Add Form --- */}
            <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <form onSubmit={handleBulkSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="type" style={labelStyle}>Item Type*:</label>
                        <select id="type" name="type" value={itemDetails.type} onChange={handleInputChange} required style={inputStyle}>
                            {Object.values(ItemType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                     <div style={{ marginBottom: '12px' }}>
                         <label htmlFor="size" style={labelStyle}>Size:</label>
                         <input id="size" type="text" name="size" value={itemDetails.size} onChange={handleInputChange} style={inputStyle} />
                     </div>
                    {/* Serial Number omitted for bulk add simplicity */}
                     <div style={{ marginBottom: '12px' }}>
                         <label htmlFor="condition" style={labelStyle}>Condition*:</label>
                         <select id="condition" name="condition" value={itemDetails.condition} onChange={handleInputChange} required style={inputStyle}>
                             {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                     </div>
                     <div style={{ marginBottom: '12px' }}>
                         <label htmlFor="location" style={labelStyle}>Location:</label>
                         <input id="location" type="text" name="location" value={itemDetails.location} onChange={handleInputChange} style={inputStyle}/>
                     </div>
                       <div style={{ marginBottom: '12px' }}>
                         <label htmlFor="notes" style={labelStyle}>Notes:</label>
                         <textarea id="notes" name="notes" value={itemDetails.notes} onChange={handleInputChange} style={{...inputStyle, verticalAlign: 'top'}}></textarea>
                     </div>
                    <div style={{ marginBottom: '12px' }}>
                         <label htmlFor="quantity" style={labelStyle}>Quantity*:</label>
                         <input id="quantity" type="number" name="quantity" value={quantity} onChange={handleQuantityChange} min="1" step="1" required style={inputStyle}/>
                    </div>

                    <button type="submit" disabled={isSubmitting} style={isSubmitting ? disabledButtonStyle : buttonStyle}>
                         {isSubmitting ? 'Adding Batch...' : 'Add Batch'}
                    </button>
                     {error && <p style={{ color: 'red', marginLeft: '85px' }}>{error}</p>}
                </form>
            </div>

             {/* --- Display Last Result (Styled slightly) --- */}
             {lastResult && (
                <div style={{ marginTop: '1rem', padding: '15px', border: '1px solid blue', borderRadius: '5px', backgroundColor: '#f0f8ff' }}>
                    <h2>Last Batch Added:</h2>
                    <p>{lastResult.message}</p>
                    <p>(Type: {lastResult.addedType.replace(/_/g, ' ')})</p>
                </div>
            )}

        </div>
    );
}