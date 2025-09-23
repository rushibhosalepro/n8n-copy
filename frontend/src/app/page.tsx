import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-end max-w-7xl mx-auto p-10">
      <Button>
        <Link href={"/signIn"} className="">
          sign in
        </Link>
      </Button>
    </div>
  );
}
