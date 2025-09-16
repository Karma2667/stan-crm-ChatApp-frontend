// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading, error, getAppAuth } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setMessage("Пароли не совпадают!");
          return;
        }

        await register({
          email,
          username,
          password,
          passwordConfirmation: confirmPassword,
        });

        setMessage("✅ Регистрация успешна! Проверьте почту.");
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setIsRegister(false);
      } else {
        await login({ email, password });
        if (getAppAuth()) {
          navigate("/", { replace: true });
        } else {
          setMessage("Ошибка: токен не получен");
        }
      }
    } catch (err: any) {
      setMessage(err.message || "Ошибка запроса");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-white">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          {isRegister ? "Регистрация" : "Вход"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {isRegister && (
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {isRegister && (
            <input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg transition-colors ${
              isRegister ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>

        {(message || error) && (
          <p className="mt-4 text-center text-red-500 text-sm">{message || error}</p>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setEmail("");
              setUsername("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isRegister ? "У меня уже есть аккаунт" : "У меня нет аккаунта"}
          </button>
        </div>
      </div>
    </div>
  );
}
