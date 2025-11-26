import '../styles/LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', color = 'primary' }) {
    return (
        <div className={`spinner spinner-${size} spinner-${color}`}>
            <div className="spinner-circle"></div>
        </div>
    );
}

export default LoadingSpinner;
