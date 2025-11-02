'use client';

import { Button } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Github, Key } from 'lucide-react';
import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }
    
    // Basic validation - FASHN API keys typically start with 'fa-'
    if (!apiKey.trim().startsWith('fa-')) {
      setError('FASHN API keys typically start with "fa-"');
      return;
    }

    onSave(apiKey.trim());
    setApiKey('');
    setError('');
  };

  const handleCancel = () => {
    setApiKey('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-600" />
            Enter FASHN API Key
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
            To use the virtual try-on feature, you need a FASHN API key. Your key will be stored locally in your browser.
          </p>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-open-sans">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="fa-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-open-sans"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-open-sans">
                {error}
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-open-sans">
              Don&apos;t have an API key yet?
            </p>
            <a
              href="https://docs.fashn.ai/?utm_source=nextjs-tryon-app&utm_medium=modal&utm_campaign=api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
            >
              Get your API key from FASHN
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Want to run this yourself?
            </p>
            <a
              href="https://github.com/fashn-AI/tryon-nextjs-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
            >
              View source code on GitHub
              <Github className="h-3 w-3" />
            </a>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              Save API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}