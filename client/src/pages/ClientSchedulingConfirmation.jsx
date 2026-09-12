import { useLocation, useNavigate } from "react-router-dom";
import "../styles/scheduling.css";

export function ClientSchedulingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { appointment, isLoggedIn } = location.state || {};

  if (!appointment) {
    return (
      <div className="content">
        <p>No appointment data found.</p>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="section-box">
        <h2>Appointment Scheduled!</h2>

        <p className="desc">
          Your appointment request has been received. We will contact you shortly to confirm.
        </p>

        <div style={{ marginTop: "20px" }}>
          <p><strong>Name:</strong> {appointment.fullName}</p>
          <p><strong>Service:</strong> {appointment.serviceType}</p>
          <p><strong>Date:</strong> {new Date(appointment.date).toDateString()}</p>
          <p><strong>Time:</strong> {appointment.timeSlot}</p>
        </div>

        <div style={{ marginTop: "20px" }}>
          {isLoggedIn ? (
            <button
              className="btn-primary"
              onClick={() => navigate('/portal')}
            >
              Return to Dashboard
            </button>
          ) : (
            <>
              <button
                className="btn-primary"
                onClick={() => navigate('/')}
              >
                Return Home
              </button>

              <button
                className="btn-secondary"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
