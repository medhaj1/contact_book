import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';


const DocumentsPanel = ({ currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  // Removed tab state; parent controls which panel is shown


  // Fetch documents from Supabase
  const fetchDocuments = useCallback(async () => {
  // Fetch only 'My Documents' from Supabase
    try {
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', currentUser?.id)
        .order('uploaded_at', { ascending: false });
      if (error) {
        console.error('Error fetching documents:', error?.message);
        setDocuments([]);
      } else {
        setDocuments(docs || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [currentUser?.id]);

  const handleUploadDocuments = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        // 1. Upload to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(`public/${file.name}`, file, { upsert: true });
        
        if (storageError) {
          console.error(`Failed to upload ${file.name}:`, storageError.message);
          errorCount++;
          continue;
        }

        // 2. Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(`public/${file.name}`);

        // 3. Insert metadata into documents table
        const { error: dbError } = await supabase
          .from('documents')
          .insert([{
            name: file.name,
            url: urlData.publicUrl,
            uploaded_by: currentUser?.id,
            uploaded_at: new Date().toISOString()
          }]);

        if (dbError) {
          console.error(`Failed to save ${file.name} metadata:`, dbError.message);
          errorCount++;
        } else {
          uploadedCount++;
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errorCount++;
      }
    }

    // Refresh documents list
    await fetchDocuments();
    setIsUploading(false);

    // Show result message
    if (uploadedCount > 0) {
      const message = `${uploadedCount} document${uploadedCount > 1 ? 's' : ''} uploaded successfully!`;
      if (errorCount > 0) {
        toast.error(`${message} (${errorCount} failed)`);
      } else {
        toast.success(message);
      }
    } else if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} document${errorCount > 1 ? 's' : ''}.`);
    }

    // Clear the file input
    e.target.value = '';
  };

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm(`Delete ${doc.name}?`)) return;

    try {
      // 1. Remove from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([`public/${doc.name}`]);
      
      if (storageError) {
        console.error('Delete from storage failed:', storageError.message);
        toast.error('Failed to delete file from storage: ' + storageError.message);
        return;
      }

      // 2. Remove from DB
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);
      
      if (dbError) {
        console.error('Delete from DB failed:', dbError.message);
        toast.error('Failed to delete document metadata: ' + dbError.message);
        return;
      }

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document: ' + error.message);
    }
  };

  const getFileIcon = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('.pdf')) {
      return (
        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (name.includes('.doc')) {
      return (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const cardBorderClass = "bg-white dark:bg-[#161b22] border border-blue-100 dark:border-slate-700 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1";

  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Upload Section */}
      <div className="bg-white dark:bg-[#161b22] border border-blue-100 dark:border-slate-700 p-6 rounded-2xl flex-shrink-0">{/* Prevent shrinking */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300 mb-4">Upload Documents</h3>
        <div className="relative border-2 border-dashed border-blue-200 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-300 dark:hover:border-slate-300 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                PDF, DOC, DOCX, TXT files up to 10MB
              </p>
              {isUploading && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Uploading documents...
                </p>
              )}
            </div>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleUploadDocuments}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>

  {/* Removed tabs UI; parent controls which panel is shown */}

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto min-h-0">{/* Scrollable documents list */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300 mb-4">
          My Documents ({documents.length})
        </h3>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-lg mb-2">No documents found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className={cardBorderClass}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <button
                    className="flex items-center justify-center p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    onClick={() => handleDeleteDocument(doc)}
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPanel;
