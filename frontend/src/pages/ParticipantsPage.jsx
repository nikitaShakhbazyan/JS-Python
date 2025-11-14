import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ParticipantsPage = () => {
    const { token, logout, API_BASE_URL } = useAuth();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        subject_id: '',
        study_group: 'treatment',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        age: '',
        gender: 'M'
    });

    const fetchParticipants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/participants/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipants(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch participants');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token]);

    useEffect(() => {
        fetchParticipants();
    }, [fetchParticipants]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (editingId) {
                // For update, we would need a PUT endpoint
                // Since we don't have it, we'll skip update for now
                setError('Update functionality not implemented in backend');
                return;
            } else {
                await axios.post(
                    `${API_BASE_URL}/participants/`,
                    { ...formData, age: parseInt(formData.age) },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            resetForm();
            fetchParticipants();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save participant');
        }
    };

    const handleDelete = async (participantId) => {
        if (!window.confirm('Are you sure you want to delete this participant?')) {
            return;
        }

        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/participants/${participantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchParticipants();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete participant');
        }
    };

    const resetForm = () => {
        setFormData({
            subject_id: '',
            study_group: 'treatment',
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'active',
            age: '',
            gender: 'M'
        });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Participants Management</h1>
                <div>
                    <Link to="/" style={styles.homeButton}>
                        Home
                    </Link>
                    <button onClick={logout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.actions}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={styles.addButton}
                >
                    {showForm ? 'Cancel' : '+ Add New Participant'}
                </button>
            </div>

            {showForm && (
                <div style={styles.formContainer}>
                    <h3>{editingId ? 'Edit Participant' : 'Add New Participant'}</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Subject ID *</label>
                                <input
                                    type="text"
                                    name="subject_id"
                                    value={formData.subject_id}
                                    onChange={handleInputChange}
                                    maxLength={10}
                                    required
                                    style={styles.input}
                                    placeholder="e.g., P001"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label>Study Group *</label>
                                <select
                                    name="study_group"
                                    value={formData.study_group}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                >
                                    <option value="treatment">Treatment</option>
                                    <option value="control">Control</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Age *</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="120"
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label>Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Enrollment Date *</label>
                                <input
                                    type="date"
                                    name="enrollment_date"
                                    value={formData.enrollment_date}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label>Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="withdrawn">Withdrawn</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formActions}>
                            <button type="submit" style={styles.submitButton}>
                                {editingId ? 'Update' : 'Create'} Participant
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>Loading participants...</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Subject ID</th>
                                <th style={styles.th}>Study Group</th>
                                <th style={styles.th}>Age</th>
                                <th style={styles.th}>Gender</th>
                                <th style={styles.th}>Enrollment Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={styles.emptyMessage}>
                                        No participants found. Click "Add New Participant" to create one.
                                    </td>
                                </tr>
                            ) : (
                                participants.map((participant) => (
                                    <tr
                                        key={participant.participant_id}
                                        style={styles.tr}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <td style={styles.td}>{participant.subject_id}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: participant.study_group === 'treatment' ? '#28a745' : '#6c757d'
                                            }}>
                                                {participant.study_group}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{participant.age}</td>
                                        <td style={styles.td}>{participant.gender}</td>
                                        <td style={styles.td}>{participant.enrollment_date}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor:
                                                    participant.status === 'active' ? '#007bff' :
                                                    participant.status === 'completed' ? '#28a745' : '#ffc107',
                                                color: participant.status === 'withdrawn' ? '#000' : 'white'
                                            }}>
                                                {participant.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleDelete(participant.participant_id)}
                                                style={styles.deleteButton}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                                                title="Delete participant"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '0',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0',
        paddingBottom: '20px',
        borderBottom: '3px solid #4a90e2',
        backgroundColor: 'white',
        padding: '20px 40px',
        borderRadius: '0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    homeButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        textDecoration: 'none',
        marginRight: '10px',
        display: 'inline-block',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    error: {
        padding: '15px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        margin: '20px 40px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    actions: {
        marginBottom: '20px',
        padding: '20px 40px 0'
    },
    addButton: {
        padding: '12px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 6px rgba(40, 167, 69, 0.3)'
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        margin: '0 40px 30px',
        border: '1px solid #e0e6ed',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
    },
    form: {
        marginTop: '15px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '18px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    input: {
        padding: '10px 12px',
        border: '1px solid #d1d9e0',
        borderRadius: '6px',
        fontSize: '14px',
        marginTop: '5px',
        transition: 'border-color 0.3s ease',
        backgroundColor: 'white'
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px'
    },
    submitButton: {
        padding: '12px 24px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 6px rgba(0, 123, 255, 0.3)'
    },
    cancelButton: {
        padding: '12px 24px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#6c757d',
        backgroundColor: 'white',
        borderRadius: '8px',
        margin: '0 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    tableContainer: {
        overflowX: 'auto',
        borderRadius: '10px',
        margin: '0 40px 40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white'
    },
    th: {
        padding: '16px 12px',
        textAlign: 'left',
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        borderBottom: '2px solid #34495e',
        fontWeight: '600',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tr: {
        borderBottom: '1px solid #e9ecef',
        transition: 'background-color 0.2s ease'
    },
    td: {
        padding: '14px 12px',
        fontSize: '14px',
        color: '#2c3e50',
        backgroundColor: 'white'
    },
    badge: {
        padding: '5px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
        textTransform: 'capitalize',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    deleteButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '50px',
        color: '#6c757d',
        fontStyle: 'italic',
        fontSize: '15px',
        backgroundColor: '#f8f9fa'
    }
};

export default ParticipantsPage;
