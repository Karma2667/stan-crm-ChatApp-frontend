// src/components/Header.tsx
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  username: string;
  avatar?: string;
  online: boolean;
}

function Header({ username, avatar, online }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Логотип */}
        <Link to="/" className="text-xl font-bold text-white">
          CRM-Чат
        </Link>

        {/* Навигация */}
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-white hover:underline">
            Главная
          </Link>
          <Link to="/chat" className="text-white hover:underline">
            Чаты
          </Link>
        </nav>

        {/* Профиль */}
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-400 flex items-center justify-center text-lg font-bold text-white">
                {username?.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Индикатор онлайн */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-blue-600 ${
                online ? "bg-green-400" : "bg-gray-400"
              }`}
            ></span>
          </div>
          <span className="text-white font-medium">{username}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
