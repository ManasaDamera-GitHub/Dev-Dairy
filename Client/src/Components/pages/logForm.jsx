import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const LogForm = () => {
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode

  useEffect(() => {
    if (id) {
      const fetchLog = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await axios.get(`http://localhost:3000/api/logs/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setYesterday(res.data.yesterday);
          setToday(res.data.today);
          setBlockers(res.data.blockers);
        } catch (err) {
          console.error("Error fetching log:", err.message, err.response);
          if (err.response?.status === 404) {
            setError("Log not found. Redirecting to dashboard...");
            setTimeout(() => navigate("/dashboard"), 2000);
          } else if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            setError(
              err.response?.data?.msg || "Failed to load log. Please try again."
            );
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchLog();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate inputs
    if (!yesterday.trim() || !today.trim() || !blockers.trim()) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    const data = { yesterday, today, blockers };
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/logs/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post("http://localhost:3000/api/logs", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      setYesterday("");
      setToday("");
      setBlockers("");
      navigate("/dashboard");
    } catch (err) {
      console.error("Save error:", err.message, err.response);
      if (err.response?.status === 404) {
        setError("Log not found. Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.msg || "Failed to save log. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {id ? "Edit Log" : "Create Log"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="yesterday"
                className="block text-sm font-medium text-gray-700"
              >
                What did you do yesterday?
              </label>
              <textarea
                id="yesterday"
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                placeholder="What did you do yesterday?"
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label
                htmlFor="today"
                className="block text-sm font-medium text-gray-700"
              >
                What will you do today?
              </label>
              <textarea
                id="today"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                placeholder="What will you do today?"
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label
                htmlFor="blockers"
                className="block text-sm font-medium text-gray-700"
              >
                Any blockers?
              </label>
              <textarea
                id="blockers"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Any blockers?"
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                disabled={isLoading}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                  {id ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{id ? "Update" : "Create"} Log</>
              )}
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </a>
        </p>
      </div>
    </div>
  );
};

export default LogForm;
