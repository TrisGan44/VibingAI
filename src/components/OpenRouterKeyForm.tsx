import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface OpenRouterKeyFormProps {
  apiKey: string;
  onSave: (key: string) => void;
  onClear: () => void;
}

const OpenRouterKeyForm = ({ apiKey, onSave, onClear }: OpenRouterKeyFormProps) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onSave(localKey.trim());
  };

  const handleClear = () => {
    setLocalKey("");
    onClear();
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            OpenRouter API Key
          </CardTitle>
          <CardDescription>
            Stored locally in your browser. Enter your <code>sk-or-*</code> key to enable AI responses.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="openrouter-key">API key</Label>
          <div className="flex items-center gap-2">
            <Input
              id="openrouter-key"
              type={showKey ? "text" : "password"}
              placeholder="sk-or-..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              autoComplete="off"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave} disabled={!localKey.trim()}>
            Save key
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenRouterKeyForm;
