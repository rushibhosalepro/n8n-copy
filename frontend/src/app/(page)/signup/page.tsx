"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/register", { email, password });
      setLoading(false);
      router.push("/home/workflows");
    } catch (error: any) {
      alert(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-sm w-full shadow p-4 border">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
        <form action="" className="space-y-4" onSubmit={register}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="***"
          />
          <Button type="submit" className="w-full">
            {loading ? "registering" : "register"}
          </Button>
          <Link className="text-red-500" href={"/signup"}>
            sign in
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Page;
