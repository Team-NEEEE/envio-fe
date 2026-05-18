import { useAuthStore } from "@/store/authStore";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";

export default function App() {
  const { user } = useAuthStore();

  if (user) {
    return <Dashboard />;
  }

  return <Login />;
}