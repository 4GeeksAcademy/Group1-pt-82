import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const accessToken = store?.session?.token;

	const handleLogout = () => {
		localStorage.removeItem("token");
		dispatch && dispatch({ type: "logout" }); // if you have a logout action
		navigate("/");
	};

	return accessToken ? (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">
						WhiteGlove <span className="text-primary">BnB</span>
					</span>
				</Link>
				<div className="ml-auto">
					<button className="btn btn-danger" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</div>
		</nav>
	) : (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">
						WhiteGlove <span className="text-primary">BnB</span>
					</span>
				</Link>

				<div className="ml-auto">
					<Link to="/login" style={{ marginRight: 8 }}>
						<button className="btn btn-outline-secondary">Log in</button>
					</Link>
					<Link to="/signup">
						<button className="btn btn-primary">Get Started</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};
