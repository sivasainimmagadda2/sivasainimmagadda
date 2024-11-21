import * as React from 'react';
import './LoadingSpinner.css'; // Import the CSS file for styling

const LoadingSpinner = () => {
    return (
        <div className='Loading_background'>
            <div className='loading'>
                <div className="custom-loader"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
