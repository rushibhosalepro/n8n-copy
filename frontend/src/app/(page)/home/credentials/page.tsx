"use client";

import NewCredential from "@/components/credentials/NewCredential";
import api from "@/lib/api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [credentials, setCredentials] = useState<any[]>([]);

  const param = searchParams.get("create");
  const initialOpen = param === "true";

  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    setIsOpen(param === "true");
  }, [param]);

  useEffect(() => {
    const getStoreCreds = async () => {
      try {
        const res = await api.get("/credentials");
        console.log(res);
        setCredentials(res.data);
      } catch (error) {}
    };
    getStoreCreds();
  }, []);
  const handleClose = () => {
    setIsOpen(false);
    const url = pathname;
    router.replace(url, { scroll: false });
  };

  return (
    <div>
      {isOpen && <NewCredential onClose={handleClose} />}

      <ul className="divide-y space-y-4 divide-gray-200">
        {credentials.map((cred) => (
          <li
            key={cred.id}
            className="bg-[#ddd] border p-6 rounded-lg flex justify-between"
          >
            <span className="font-semibold">{cred.name}</span>
            <span className="text-sm text-gray-700">{cred.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
