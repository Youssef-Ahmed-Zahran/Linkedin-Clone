import { useState } from "react";
import toast from "react-hot-toast";
import { Loader, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query
import { useLoginUser } from "../../../store/auth";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { mutate: loginUser, isPending } = useLoginUser();

  const handleSubmit = (e) => {
    e.preventDefault();

    loginUser(
      { username, password },
      {
        onSuccess: () => {
          toast.success("Loggedin successfully! ✅");
          setUsername("");
          setPassword("");
          navigate("/");
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message || "Login failed. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input input-bordered w-full bg-[#F3F2EF] placeholder-gray-400 text-black"
        required
      />

      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full bg-[#F3F2EF] placeholder-gray-400 text-black pr-12"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full bg-[#0A66C2] border-none"
        disabled={isPending}
      >
        {isPending ? <Loader className="size-5 animate-spin" /> : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
