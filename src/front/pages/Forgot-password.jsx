import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://probable-memory-q76jw5rqjpqrcxx5q-3001.app.github.dev/forgot-password";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [favoritePet, setFavoritePet] = useState("");
    const [busy, setBusy] = useState(false);

    // Step 2 (after verification)
    const [verified, setVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [updating, setUpdating] = useState(false);

    // Messaging
    const [message, setMessage] = useState("");      // success / info
    const [error, setError] = useState("");          // errors for either step

    // Step 1: verify email + favorite pet
    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setBusy(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    favorite_pet: favoritePet.trim(),
                }),
            });

            if (res.ok) {
                // We don't reveal any password. A 200 means verification OK.
                setVerified(true);
                setMessage("Identity verified. Please set a new password below.");
            } else {
                setError("The information entered is incorrect, please contact the administrator.");
            }
        } catch (err) {
            setError("The information entered is incorrect, please contact the administrator.");
        } finally {
            setBusy(false);
        }
    };

    // Step 2: submit new password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Basic client-side validation (adjust to your policy)
        if (!newPassword || newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setUpdating(true);
        try {
            // Adjust endpoint/body as needed for your backend
            const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    new_password: newPassword,
                }),
            });

            if (res.ok) {
                setMessage("Your password has been updated successfully. You can now sign in.");
                // Optionally clear fields
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const text = await res.text().catch(() => "");
                setError(text || "Unable to update password. Please try again or contact the administrator.");
            }
        } catch {
            setError("Unable to update password. Please try again or contact the administrator.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column bg-light">
            <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4 p-md-5">
                            <h1 className="h4 text-center mb-2">Forgot Password</h1>
                            <p className="text-muted text-center mb-4">
                                Enter your Email and Favorite Pet to verify your identity.
                            </p>

                            {/* STEP 1: Verify identity */}
                            <form onSubmit={handleVerify} noValidate>
                                <fieldset disabled={busy || verified}>
                                    <div className="mb-3 text-center">
                                        <label htmlFor="fpEmail" className="form-label">Email</label>
                                        <input
                                            id="fpEmail"
                                            type="email"
                                            className="form-control mx-auto"
                                            style={{ maxWidth: 420 }}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                            required
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div className="mb-3 text-center">
                                        <label htmlFor="fpPet" className="form-label">Favorite Pet</label>
                                        <input
                                            id="fpPet"
                                            type="text"
                                            className="form-control mx-auto"
                                            style={{ maxWidth: 420 }}
                                            value={favoritePet}
                                            onChange={(e) => setFavoritePet(e.target.value)}
                                            autoComplete="off"
                                            required
                                            placeholder="e.g., Luna"
                                        />
                                    </div>

                                    <div className="text-center">
                                        <button type="submit" className="btn btn-primary" disabled={busy || verified}>
                                            {busy ? "Checking..." : "Submit"}
                                        </button>
                                    </div>
                                </fieldset>
                            </form>

                            {/* Messages */}
                            {(error || message) && (
                                <div
                                    className={`mt-3 mx-auto text-center alert ${error ? "alert-danger" : "alert-success"}`}
                                    style={{ maxWidth: 420 }}
                                    role="status"
                                    aria-live="polite"
                                >
                                    {error || message}
                                </div>
                            )}

                            {/* STEP 2: New password fields (only after verification succeeds) */}
                            {verified && (
                                <form onSubmit={handleUpdatePassword} className="mt-4">
                                    <div className="mb-3 text-center">
                                        <label htmlFor="fpNew" className="form-label">New Password</label>
                                        <input
                                            id="fpNew"
                                            type="password"
                                            className="form-control mx-auto"
                                            style={{ maxWidth: 420 }}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <div className="form-text">Must be at least 8 characters.</div>
                                    </div>

                                    <div className="mb-3 text-center">
                                        <label htmlFor="fpConfirm" className="form-label">Confirm New Password</label>
                                        <input
                                            id="fpConfirm"
                                            type="password"
                                            className="form-control mx-auto"
                                            style={{ maxWidth: 420 }}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-type new password"
                                            required
                                        />
                                    </div>

                                    <div className="text-center">
                                        <button type="submit" className="btn btn-success" disabled={updating}>
                                            {updating ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>

                                    {/* Link back to sign-in below the second box */}
                                    <div className="text-center mt-3">
                                        <Link to="/login">Return to sign-in page</Link>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};