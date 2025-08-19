import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = ({ handleLogout }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:3000/api/logs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err.message, err.response);
        setError(err.response?.data?.msg || 'Failed to fetch logs. Please try again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [navigate]);

  const handleDelete = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:3000/api/logs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLogs(logs.filter((log) => log._id !== id));
    } catch (err) {
      console.error('Delete error:', err.message, err.response);
      setError(err.response?.data?.msg || 'Failed to delete log. Please try again.');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = () => {
    if (typeof handleLogout === 'function') {
      handleLogout();
    } else {
      console.warn('handleLogout is not a function');
      localStorage.removeItem('token');
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Standup Logs</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            disabled={isLoading}
          >
            Logout
          </button>
        </div>
        <Link
          to="/create"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 mb-6"
        >
          Create New Log
        </Link>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-600">No logs available. Create a new log to get started!</p>
        ) : (
          <ul className="space-y-4">
            {logs.map((log) => (
              <li
                key={log._id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(log.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Yesterday:</span> {log.yesterday}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Today:</span> {log.today}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Blockers:</span> {log.blockers}
                </p>
                <div className="mt-2 flex space-x-2">
                  <Link
                    to={`/edit/${log._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="text-red-600 hover:underline"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;