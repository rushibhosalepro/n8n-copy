import GeminiCredForm from "@/components/credentials/GeminiCredForm";
import GmailCredForm from "@/components/credentials/GmailCredForm";
import OpenAICredForm from "@/components/credentials/OpenAICredForm";
import TelegramCredForm from "@/components/credentials/TelegramCredForm";
import api from "@/lib/api";

const DEFUALT_NAMES = {
  GmailNode: "Gmail Account",
  TelegramNode: "Telegram Account",
  OpenAINode: "OpenAI Account",
  GeminiNode: "Gemini Account",
};

const AvailableForms = {
  GmailNode: GmailCredForm,
  TelegramNode: TelegramCredForm,
  OpenAINode: OpenAICredForm,
  GeminiNode: GeminiCredForm,
};

type AvailableFormKey = keyof typeof AvailableForms;
type AvailableNamesKey = keyof typeof DEFUALT_NAMES;

const Create = ({
  selectedNode,
  onClose,
}: {
  selectedNode: string | null;
  onClose?: () => void;
}) => {
  if (!selectedNode) return null;

  const key = selectedNode as AvailableFormKey;
  const SelectedForm = AvailableForms[key];

  const saveCredential = async (nodeType: string, data: any) => {
    const name = nodeType as AvailableNamesKey;
    try {
      await api.post("/credentials", {
        type: nodeType,
        data,
        name: DEFUALT_NAMES[name],
      });
      onClose?.();
    } catch (err) {
      console.error("Failed to save credential", err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[50%] h-[50%] rounded-lg shadow-xl border border-gray-200 p-6 overflow-y-auto"
      >
        <SelectedForm onSave={(data) => saveCredential(selectedNode, data)} />
      </div>
    </div>
  );
};

export default Create;
