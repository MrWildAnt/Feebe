import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase.js";
import disk from "../../../assets/disk.png";
import "./loginregistration.css";

export default function LoginRegister({ mode = "login" }) {
  // Satu komponen dipakai untuk halaman login dan registrasi.
  const isRegister = mode === "register";
  const navigate = useNavigate();
  // Link dari email reset membuka halaman login dalam mode ganti password.
  const [isResetting, setIsResetting] = useState(
    () => new URLSearchParams(window.location.search).get("reset") === "true",
  );
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    // Supabase belum siap jika variabel environment belum diisi.
    if (!supabase) {
      setNotice({
        type: "error",
        message:
          "Autentikasi belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ke file .env.",
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const trimmedEmail = email.trim();
    const password = formData.get("password").toString();

    setIsSubmitting(true);

    try {
      if (isRegister) {
        // Simpan nama sebagai metadata akun; sesi langsung masuk jika konfirmasi email nonaktif.
        const name = formData.get("name").toString().trim();
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { full_name: name } },
        });

        if (error) throw error;

        if (data.session) {
          navigate("/dashboard");
        } else {
          setNotice({
            type: "success",
            message: "Akun berhasil dibuat. Cek email kamu untuk verifikasi sebelum login.",
          });
        }
      } else if (isResetting) {
        // Pengguna sudah membuka tautan reset dari email dan mengirim password baru.
        const { error } = await supabase.auth.updateUser({ password });

        if (error) throw error;
        setNotice({
          type: "success",
          message: "Password berhasil diperbarui. Silakan masuk dengan password baru.",
        });
        setIsResetting(false);
        navigate("/login", { replace: true });
      } else {
        // Login biasa menggunakan email dan password.
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Terjadi kesalahan. Coba lagi sebentar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setNotice(null);

    if (!supabase) {
      setNotice({
        type: "error",
        message:
          "Autentikasi belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ke file .env.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Supabase mengarahkan pengguna ke Google lalu kembali ke dashboard.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });

      if (error) throw error;
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Tidak dapat masuk dengan Google. Coba lagi sebentar.",
      });
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setNotice(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setNotice({
        type: "error",
        message: "Masukkan email kamu terlebih dahulu untuk reset kata sandi.",
      });
      return;
    }

    if (!supabase) {
      setNotice({
        type: "error",
        message:
          "Autentikasi belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ke file .env.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Email reset mengarahkan kembali ke halaman login dalam mode reset.
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) throw error;
      setNotice({
        type: "success",
        message: "Tautan reset kata sandi sudah dikirim. Cek email kamu.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Tidak dapat mengirim tautan reset. Coba lagi sebentar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label={isRegister ? "Buat akun Feebe" : "Masuk ke Feebe"}>
        <div className="auth-artwork" aria-hidden="true">
          <div className="auth-artwork-glow" />
          <img className="auth-record" src={disk} alt="" />
          <div className="auth-artwork-copy">
            <span>FEEBE</span>
            <p>Feel The Beat</p>
          </div>
        </div>

        <div className="auth-panel">
          <Link to="/dashboard" className="auth-brand" aria-label="FeeBe, ke beranda">
            <span className="auth-brand-mark"><Icon icon="mdi:music-note" /></span>
            <span>FeeBe</span>
          </Link>

          <div className="auth-heading">
            <h1>
              {isResetting ? "Reset Password" : isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p>
              {isResetting
                ? "Buat password baru untuk akunmu."
                : isRegister
                  ? "Buat akun dan mulai dengarkan musik."
                  : "Masuk dan lanjutkan musik favoritmu."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="auth-field">
                <span>Nama lengkap</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Nama lengkap"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            {!isResetting && (
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Kata sandi</span>
              <input
                type="password"
                name="password"
                placeholder={isResetting ? "Password baru" : "Password"}
                autoComplete={isRegister || isResetting ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </label>

            {!isRegister && !isResetting && (
              <button
                className="auth-forgot"
                type="button"
                onClick={handleForgotPassword}
                disabled={isSubmitting}
              >
                Lupa password?
              </button>
            )}

            {notice && (
              <p className={`auth-notice ${notice.type}`} role="status">
                <Icon
                  icon={notice.type === "success" ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}
                  aria-hidden="true"
                />
                {notice.message}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Memproses..."
                : isResetting
                  ? "Simpan Password Baru"
                  : isRegister
                    ? "Create Account"
                    : "LogIn"}
            </button>
          </form>

          {!isResetting && <div className="auth-divider"><span>or</span></div>}

          {!isResetting && (
            <button
              className="auth-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <Icon icon="logos:google-icon" aria-hidden="true" />
              Google
            </button>
          )}

          <p className="auth-switch">
            {isResetting
              ? "Sudah ingat password?"
              : isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
            <Link
              to={isResetting || isRegister ? "/login" : "/registration"}
              onClick={() => {
                if (isResetting) setIsResetting(false);
              }}
            >
              {isResetting ? "Kembali ke login" : isRegister ? "LogIn" : "SignUp"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
