import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query
import { useRegisterUser } from "../../../store/auth.js";

function RegisterForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { mutate: registerUser, isPending } = useRegisterUser();

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = {
      name,
      username,
      email,
      password,
    };

    try {
      registerUser(userData, {
        onSuccess: () => {
          toast.success("Account created successfully! ✅");
          setName("");
          setUsername("");
          setEmail("");
          setPassword("");
          navigate("/login");
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            "Registration failed. Please try again.";
          toast.error(errorMessage);
        },
      });
    } catch (error) {
      console.error("Error in register user:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input input-bordered w-full bg-[#F3F2EF] placeholder-gray-400 text-black"
        required
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input input-bordered w-full bg-[#F3F2EF] placeholder-gray-400 text-black"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input input-bordered w-full bg-[#F3F2EF] placeholder-gray-400 text-black"
        required
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full bg-[#F3F2EF] placeholder-gray-400 text-black"
          style={{ paddingRight: "2.5rem" }}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary bg-[#0A66C2] w-full text-white border-none"
      >
        {isPending ? (
          <Loader className="size-5 animate-spin" />
        ) : (
          "Agree & Join"
        )}
      </button>
    </form>
  );
}

export default RegisterForm;
