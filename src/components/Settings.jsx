import { useState } from "react";
import { importData, downloadData } from "../utils/actions";
import { Link } from 'react-router-dom';
import '../styling/settings.css';

export default function Settings({ setIsDarkTheme, nb_expenses, deleteExpensesList }) {
    const [ downloadFormat, setDownloadFormat ] = useState('json');
    return (
        <div className="settings">
            <h1>Settings</h1>
            <Link to="/" className="back">
                <svg aria-hidden="true" data-prefix="fal" data-icon="caret-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                    <path d="M192 383.968v-255.93c0-28.425-34.488-42.767-54.627-22.627l-128 127.962c-12.496 12.496-12.497 32.758 0 45.255l128 127.968C157.472 426.695 192 412.45 192 383.968zM32 256l128-128v256L32 256z"></path>
                </svg>
            </Link>
            <svg onClick={ () => setIsDarkTheme((isDarkTheme) => !isDarkTheme) } id="theme-btn" aria-hidden="true" data-prefix="fas" data-icon="adjust" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="svg-inline--fa fa-adjust fa-w-16 fa-7x"><path d="M8 256c0 136.966 111.033 248 248 248s248-111.034 248-248S392.966 8 256 8 8 119.033 8 256zm248 184V72c101.705 0 184 82.311 184 184 0 101.705-82.311 184-184 184z"></path></svg>
            <div className="controls">
                <button id="import" onClick={() => importData()}>Import Data</button>
                { (nb_expenses !==0) ?
                    <>
                        <button id="delete" onDoubleClick={ deleteExpensesList }>Delete All Data</button>
                        <div id="download">
                            <select name="download-format" id="format-chooser" value={ downloadFormat } onChange={ (e) => setDownloadFormat(e.target.value) }>
                                <option value="json">JSON</option>
                                <option value="csv">CSV</option>
                                <option value="xlsx">Excel</option>
                            </select>
                            <button id="download-btn" onClick={() => downloadData(downloadFormat)}>Download Your Data</button>
                        </div>
                    </>
                    : <></>
                }
            </div>
        </div>
    )
}