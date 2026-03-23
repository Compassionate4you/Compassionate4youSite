import './styles/portal.css';

function LoginPage() {
    return (
        <div>
            {/* DT-64: Login / Sign in page */}
            <div className="navbar">
                <div className="navbar-title">Customer Portal</div>
            </div>

            <div className="content">
                <div className="section-box">
                    <h2>Sign In</h2>
                    <p className="desc">Enter your credentials to continue.</p>

                    <div className="field">
                        <label>Email Address</label>
                        <input type="email" placeholder="you@example.com" />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" />
                    </div>

                    <button className="btn-primary">Sign In</button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;