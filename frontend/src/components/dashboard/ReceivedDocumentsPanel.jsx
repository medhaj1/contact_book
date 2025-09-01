import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ReceivedDocumentsPanel = ({ currentUser }) => {
  const [sharedDocs, setSharedDocs] = useState([]);
    const handleDeleteSharedDoc = async (doc) => {
      if (!window.confirm(`Delete ${doc.file_name}?`)) return;
      try {
        // Remove from storage
        const { error: storageError } = await supabase.storage
          .from('shared_documents')
          .remove([`public/${doc.file_name}`]);
        if (storageError) {
          console.error('Delete from storage failed:', storageError.message);
          alert('Failed to delete file from storage: ' + storageError.message);
          return;
        }
        // Remove from DB
        const { error: dbError } = await supabase
          .from('shared_documents')
          .delete()
          .eq('id', doc.id);
        if (dbError) {
          console.error('Delete from DB failed:', dbError.message);
          alert('Failed to delete document metadata: ' + dbError.message);
          return;
        }
        // Refresh list
        setSharedDocs(prev => prev.filter(d => d.id !== doc.id));
      } catch (error) {
        console.error('Error deleting shared document:', error);
        alert('Error deleting document: ' + error.message);
      }
    };

  useEffect(() => {
    console.log('Current user id:', currentUser?.id); // <-- Add this line
    const fetchSharedDocs = async () => {
      if (!currentUser?.id) return;
      const { data, error } = await supabase
        .from('shared_documents')
        .select('*')
        .eq('receiver_id', currentUser.id)
        .order('uploaded_at', { ascending: false });

      console.log('Shared documents fetched:', data, error); // <-- Already present

      if (error) {
        console.error('Error fetching shared documents:', error.message);
        setSharedDocs([]);
      } else {
        // Deduplicate by file_name
        const uniqueDocs = [];
        const seen = new Set();
        for (const doc of data || []) {
          if (!seen.has(doc.file_name)) {
            uniqueDocs.push(doc);
            seen.add(doc.file_name);
          }
        }
        setSharedDocs(uniqueDocs);
      }
    };
    fetchSharedDocs();
  }, [currentUser?.id]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300 mb-4">
        Received Documents ({sharedDocs.length})
      </h3>
      {sharedDocs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span role="img" aria-label="book">📖</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-lg mb-2">No received documents yet</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Documents received via chat will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedDocs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-[#161b22] border border-blue-100 dark:border-slate-700 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span role="img" aria-label="book">📖</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={doc.file_name}>
                    {doc.file_name}
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
                <div className="flex gap-2">
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
                download={doc.file_name}
              >
                📎 Download
              </a>
                  <button
                    className="flex items-center gap-1 justify-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm"
                    onClick={() => handleDeleteSharedDoc(doc)}
                    title="Delete Document"
                  >
                    🗑️ Delete
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedDocumentsPanel;
