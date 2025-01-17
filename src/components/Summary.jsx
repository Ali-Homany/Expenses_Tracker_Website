import DailyBarChart from "./DailyBarChart";
import CategoriesPieChart from "./CategoriesPieChart";
import { Link } from 'react-router-dom';
import '../styling/summary.css';

export default function Summary({ expensesList }) {
    return (
        <div className="summary">
            <h2>Summary</h2>
            <Link to="/" className="back">
                <svg aria-hidden="true" data-prefix="fal" data-icon="caret-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                    <path d="M192 383.968v-255.93c0-28.425-34.488-42.767-54.627-22.627l-128 127.962c-12.496 12.496-12.497 32.758 0 45.255l128 127.968C157.472 426.695 192 412.45 192 383.968zM32 256l128-128v256L32 256z"></path>
                </svg>
            </Link>
            <div className="charts-container">
                <DailyBarChart expensesList={expensesList} />
                <CategoriesPieChart expensesList={expensesList} />
            </div>
        </div>
    )
}