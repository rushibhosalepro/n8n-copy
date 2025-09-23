"use client";

import { Mail, Trash } from "lucide-react";
import { FC } from "react";

interface Props {
  onSave: (data: any) => void;
  onClose: () => void;
}
const GmailCredForm: FC<Props> = ({ onClose, onSave }) => {
  const startOAuth = () => {
    window.open(
      "http://localhost:3001/auth/google",
      "_blank",
      "width=500,height=600"
    );
  };

  return (
    <div className="p-4  w-full ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mail className="w-12 h-12 text-[#ff6f5c]" />
          <div>
            <h2 className="text-xl font-semibold">Gmail Account</h2>
            <p className="text-sm text-gray-500">Gmail OAuth2 API</p>
          </div>
        </div>
        <Trash className="w-5 h-5 text-[#ff6f5c] cursor-pointer" />
      </div>

      <div className="flex flex-col items-start gap-3">
        <h3 className="text-lg font-medium">Sign In</h3>
        <p className="text-sm text-gray-600">
          Grant access to send emails from your Gmail account.
        </p>
        <button
          onClick={startOAuth}
          className="bg-[#ff6f5c] text-white px-4 py-2 rounded mt-2"
        >
          Connect Gmail
        </button>
      </div>
    </div>
  );
};

export default GmailCredForm;
