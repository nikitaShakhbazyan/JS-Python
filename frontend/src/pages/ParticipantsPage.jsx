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
                                    <tr key={participant.participant_id} style={styles.tr}>
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
                                                    participant.status === 'completed' ? '#28a745' : '#ffc107'
                                            }}>
                                                {participant.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleDelete(participant.participant_id)}
                                                style={styles.deleteButton}
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
        padding: '20px',
        maxWidth: '1200px',
        margin: '20px auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '2px solid #eee'
    },
    homeButton: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
        marginRight: '10px',
        display: 'inline-block'
    },
    logoutButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    error: {
        padding: '12px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    actions: {
        marginBottom: '20px'
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    formContainer: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
    },
    form: {
        marginTop: '15px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        marginBottom: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    input: {
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '14px',
        marginTop: '5px'
    },
    formActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#6c757d'
    },
    tableContainer: {
        overflowX: 'auto',
        border: '1px solid #dee2e6',
        borderRadius: '4px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white'
    },
    th: {
        padding: '12px',
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontWeight: '600',
        fontSize: '14px'
    },
    tr: {
        borderBottom: '1px solid #dee2e6'
    },
    td: {
        padding: '12px',
        fontSize: '14px'
    },
    badge: {
        padding: '4px 8px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block'
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '40px',
        color: '#6c757d',
        fontStyle: 'italic'
    }
};

export default ParticipantsPage;
