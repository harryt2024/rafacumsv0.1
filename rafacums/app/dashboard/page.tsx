// app/dashboard/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma'; // Adjust path if needed
import { ItemType } from '@prisma/client'; // Import enum for filtering

// Optional: Define a simple StatBox component for reuse
interface StatBoxProps {
    title: string;
    value: number | string; // Allow string for loading/error states if needed
    bgColor?: string; // Optional background color
}

const StatBox: React.FC<StatBoxProps> = ({ title, value, bgColor = '#f0f0f0' }) => {
    const boxStyle: React.CSSProperties = {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: bgColor,
        minWidth: '180px', // Ensure boxes have some minimum width
    };
    const valueStyle: React.CSSProperties = {
        fontSize: '2rem',
        fontWeight: 'bold',
        display: 'block', // Ensure value is on its own line
        margin: '5px 0',
    };
     const titleStyle: React.CSSProperties = {
        fontSize: '1rem',
        color: '#555',
    };

    return (
        <div style={boxStyle}>
            <span style={valueStyle}>{value}</span>
            <span style={titleStyle}>{title}</span>
        </div>
    );
};


// The Dashboard Page component (Server Component - no 'use client')
export default async function DashboardPage() {

    // --- Fetch Statistics ---
    // We'll use Promise.all to run counts concurrently
    let stats = {
        totalItems: 0,
        mensShirtCount: 0,
        mensTrousersCount: 0,
        ladiesShirtCount: 0,
        ladiesTrousersCount: 0,
    };
    let fetchError: string | null = null;

    try {
        const [
            totalItems,
            mensShirtCount,
            mensTrousersCount,
            ladiesShirtCount,
            ladiesTrousersCount,
        ] = await Promise.all([
            // 1. Total Items
            prisma.uniformItem.count(),

            // 2. Mens Shirts (Combine Wedgewood + Working Blues)
            prisma.uniformItem.count({
                where: {
                    type: {
                        in: [ItemType.MENS_WEDGEWOOD_SHIRT, ItemType.MENS_WORKING_BLUES_SHIRT]
                    }
                }
            }),

            // 3. Mens Trousers
            prisma.uniformItem.count({ where: { type: ItemType.MENS_TROUSERS } }),

            // 4. Ladies Shirts (Combine Wedgewood + Working Blues)
            prisma.uniformItem.count({
                where: {
                    type: {
                        in: [ItemType.LADIES_WEDGEWOOD_SHIRT, ItemType.LADIES_WORKING_BLUES_SHIRT]
                    }
                }
            }),

            // 5. Ladies Trousers
            prisma.uniformItem.count({ where: { type: ItemType.LADIES_TROUSERS } }),
        ]);

        // Assign fetched counts to the stats object
        stats = { totalItems, mensShirtCount, mensTrousersCount, ladiesShirtCount, ladiesTrousersCount };

    } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        fetchError = "Could not load dashboard statistics.";
        // Keep default stats (zeros) or handle error display differently
    }


    // --- Render Page ---
    return (
        <div>
            <h1>Dashboard</h1>

            {fetchError && (
                <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
                    {fetchError}
                </p>
            )}

            {/* Container for the stat boxes (using Flexbox for layout) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>

                {/* Display the stats using the StatBox component */}
                <StatBox title="Total Uniform Items" value={stats.totalItems} bgColor="#e7f5ff" />
                <StatBox title="Men's Shirts" value={stats.mensShirtCount} bgColor="#e6fffa" />
                <StatBox title="Men's Trousers" value={stats.mensTrousersCount} bgColor="#e6fffa" />
                <StatBox title="Ladies' Shirts" value={stats.ladiesShirtCount} bgColor="#fff0f6" />
                <StatBox title="Ladies' Trousers" value={stats.ladiesTrousersCount} bgColor="#fff0f6" />

                {/* Add more StatBox components here for other stats if needed */}

            </div>

            {/* You can add other dashboard elements below */}
            {/* <div style={{ marginTop: '40px' }}>
                <h2>Recent Activity</h2>
                 <p>...</p>
            </div> */}
        </div>
    );
}