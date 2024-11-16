import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DailyBarChart({ expensesList }) {
    const startDate = new Date(Math.min(...expensesList.map(item => new Date(item.date))));
    const endDate = new Date(Math.max(...expensesList.map(item => new Date(item.date))));
    const secondsInDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil((endDate - startDate) / secondsInDay);
    const dailyExpenses = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate.getTime() + (i * secondsInDay));
        const existing = expensesList.find(item => item.date === date.toISOString().split('T')[0]);
        return {
            x: date.toISOString().split('T')[0],
            y: existing ? Number(existing.price) : 0
        };
    });


    return (
        <div style={{ overflowX: 'scroll', overflowY: 'hidden'}}>
            <div style={{ width: `${dailyExpenses.length * 100}px` }}>
                {/* Set the chart width larger than the container for scrolling */}
                <ResponsiveContainer height={300}>
                <BarChart data={dailyExpenses}>
                    <XAxis dataKey="x" />
                    <YAxis  orientation="right" />
                    <Tooltip />
                    <Bar dataKey="y" fill="#800000" />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};