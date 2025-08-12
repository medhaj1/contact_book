import React, { useState } from 'react';
import { Upload, FileUp, X } from 'lucide-react';
import { importContacts } from '../../services/importExportService';

const ImportModal = ({ userId, onImportComplete, onClose }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const result = await importContacts(file, userId);
      if (result.success) {
        setImportMessage(`Success! Imported ${result.count} contacts.`);
        onImportComplete();
        // Clear the file input
        event.target.value = '';
        // Auto-close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setImportMessage(`Import failed: ${result.error}`);
      }
    } catch (error) {
      setImportMessage(`Import error: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Import Contacts
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-slate-500" />
                <p className="mb-2 text-sm text-slate-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">CSV or VCF files only</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.vcf"
                onChange={handleFileImport}
                disabled={isImporting}
              />
            </label>
          </div>

          {isImporting && (
            <div className="text-center text-blue-600">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Importing contacts...
            </div>
          )}

          {importMessage && (
            <div className={`text-center p-3 rounded-lg ${
              importMessage.includes('Success')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {importMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
