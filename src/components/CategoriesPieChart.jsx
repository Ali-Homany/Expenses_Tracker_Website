import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getRandomColors } from '../utils/actions';

export default function CategoriesPieChart({ expensesList }) {
    const data = expensesList.reduce((acc, cur) => {
        const existing = acc.find(item => item.name === cur.category);
        if (existing) {
            existing.value += Number(cur.price);
        } else {
            acc.push({ name: cur.category, value: Number(cur.price) });
        }
        return acc;
    }, []);
    const COLORS = getRandomColors(data.length);
    
    return (
        <ResponsiveContainer height={400}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};