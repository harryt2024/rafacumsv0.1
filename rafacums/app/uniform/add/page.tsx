// app/uniform/add/page.tsx
'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ItemType, Condition, UniformItem } from '@prisma/client';

type ApiUniformItem = Omit<UniformItem, 'createdAt' | 'updatedAt' | 'addedById'> & {
    createdAt: string;
    updatedAt: string;
    addedById?: string | null;
};

interface NewItemFormState {
    type: ItemType;
    size: string;
    condition: Condition;
    location: string;
    notes: string;
}

export default function AddUniformItemPage() {
    const router = useRouter();
    const [newItem, setNewItem] = useState<NewItemFormState>({
        type: ItemType.MENS_WEDGEWOOD_SHIRT,
        size: '',
        condition: Condition.GOOD,
        location: '',
        notes: '',
    });

    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [lastAddedItem, setLastAddedItem] = useState<ApiUniformItem | null>(null);

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


    const handleItemInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name in newItem) {
             setNewItem(prev => ({ ...prev, [name]: value }));
        } else { console.warn(`Input name "${name}" does not match any key in newItem state.`); }
    };

    const handleAddItemSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setIsAdding(true); setAddError(null); setLastAddedItem(null);
        try {
            const response = await fetch('/api/uniform', { /* ... */
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem),
             });
            const result: ApiUniformItem | { message: string } = await response.json();
            if (!response.ok) { throw new Error((result as { message: string }).message || `Error: ${response.statusText}`); }
            setLastAddedItem(result as ApiUniformItem);
            setNewItem({ type: ItemType.MENS_WEDGEWOOD_SHIRT, size: '', condition: Condition.GOOD, location: '', notes: '', }); // Reset form
        } catch (err: any) { setAddError(err.message); } finally { setIsAdding(false); }
    };

    const handleDeleteLastAdded = async () => {
        if (!lastAddedItem) return;
        if (!confirm(`Are you sure you want to delete the last added item: ${lastAddedItem.type} (ID: ${lastAddedItem.id})? This cannot be undone.`)) { return; }
        setAddError(null);
        try {
            const response = await fetch(`/api/uniform/${lastAddedItem.id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) { /* ... */ throw new Error(/* ... */); }
            setLastAddedItem(null);
            alert('Last added item deleted successfully.');
        } catch (err: any) { setAddError(`Failed to delete item: ${err.message}`); }
    };

    return (
        <div>
            <h1>Add New Uniform Item</h1>
            <p>Use Tab to navigate between fields and Enter to submit.</p>

            {/* --- Styled Add Item Form --- */}
            <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <form onSubmit={handleAddItemSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="type" style={labelStyle}>Type*:</label>
                        <select id="type" name="type" value={newItem.type} onChange={handleItemInputChange} required style={inputStyle}>
                            {Object.values(ItemType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="size" style={labelStyle}>Size:</label>
                        <input id="size" type="text" name="size" value={newItem.size} onChange={handleItemInputChange} style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="condition" style={labelStyle}>Condition*:</label>
                        <select id="condition" name="condition" value={newItem.condition} onChange={handleItemInputChange} required style={inputStyle}>
                            {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="location" style={labelStyle}>Location:</label>
                        <input id="location" type="text" name="location" value={newItem.location} onChange={handleItemInputChange} style={inputStyle}/>
                    </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="notes" style={labelStyle}>Notes:</label>
                        <textarea id="notes" name="notes" value={newItem.notes} onChange={handleItemInputChange} style={{...inputStyle, verticalAlign: 'top'}}></textarea> {/* Apply style, adjust alignment */}
                    </div>

                   <button type="submit" disabled={isAdding} style={isAdding ? disabledButtonStyle : buttonStyle}>
                        {isAdding ? 'Adding...' : 'Add Item'}
                   </button>
                    {addError && <p style={{ color: 'red', marginLeft: '85px' }}>{addError}</p>}
               </form>
            </div>


            {/* --- Display Last Added Item (Styled slightly) --- */}
            {lastAddedItem && (
                <div style={{ marginTop: '2rem', padding: '15px', border: '1px solid green', borderRadius: '5px', backgroundColor: '#f0fff0' }}>
                    <h2 style={{marginTop: 0}}>Last Item Added:</h2>
                    {/* Consider making these display inline or using definition lists */}
                    <p style={{margin: '5px 0'}}><strong style={{display: 'inline-block', width:'90px'}}>ID:</strong> {lastAddedItem.id}</p>
                    <p style={{margin: '5px 0'}}><strong style={{display: 'inline-block', width:'90px'}}>Type:</strong> {lastAddedItem.type.replace(/_/g, ' ')}</p>
                    <p style={{margin: '5px 0'}}><strong style={{display: 'inline-block', width:'90px'}}>Size:</strong> {lastAddedItem.size ?? 'N/A'}</p>
                    <p style={{margin: '5px 0'}}><strong style={{display: 'inline-block', width:'90px'}}>Condition:</strong> {lastAddedItem.condition}</p>
                    <p style={{margin: '5px 0'}}><strong style={{display: 'inline-block', width:'90px'}}>Location:</strong> {lastAddedItem.location ?? 'N/A'}</p>
                    <p style={{margin: '5px 0'}}><strong style={{display: 'inline-block', width:'90px'}}>Added At:</strong> {new Date(lastAddedItem.createdAt).toLocaleString()}</p>
                    <button onClick={handleDeleteLastAdded} style={{ ...buttonStyle, marginLeft: 0, marginTop: '15px', backgroundColor: '#dc3545', borderColor: '#dc3545' }}> {/* Styled Delete Btn */}
                        Delete This Item (Mistake?)
                    </button>
                </div>
            )}
        </div>
    );
}