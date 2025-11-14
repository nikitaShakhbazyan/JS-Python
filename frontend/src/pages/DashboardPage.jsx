import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { logout } = useAuth();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Trial Dashboard Home</h1>
                <button 
                    onClick={logout}
                    style={styles.logoutButton}
                >
                    Logout
                </button>
            </div>
            
            <p style={{ marginTop: '20px' }}>Welcome! Navigate to the Participants module to manage trial data.</p>

            <div style={styles.linkContainer}>
                
                <Link to="/participants" style={styles.linkStyle}>
                    <h3>👥 Manage Participants</h3>
                    <p>View, add, edit, and delete participant records (CRUD).</p>
                </Link>
                
                <div style={styles.linkStyleInactive}>
                    <h3>📈 Trial Metrics</h3>
                    <p>Advanced analytics and visualizations (Future Feature).</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '50px auto', border: '1px solid #eee', borderRadius: '8px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' },
    logoutButton: { padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    linkContainer: { marginTop: '30px', display: 'flex', gap: '20px' },
    linkStyle: {
        padding: '20px', border: '1px solid #007bff', borderRadius: '8px', textDecoration: 'none', color: '#333', flex: 1, cursor: 'pointer'
    },
    linkStyleInactive: {
        padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', color: '#888', flex: 1, cursor: 'not-allowed'
    }
};

export default DashboardPage;