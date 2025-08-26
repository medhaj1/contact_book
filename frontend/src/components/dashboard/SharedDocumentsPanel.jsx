import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';

const SharedDocumentsPanel = ({ currentUser }) => {
  const [sharedDocs, setSharedDocs] = useState([]);

  useEffect(() => {
    const fetchSharedDocs = async () => {
      if (!currentUser?.id) return;
      const { data, error } = await supabase
        .from('shared_documents')
        .select('*')
        .eq('sender_id', currentUser.id)
        .order('uploaded_at', { ascending: false });
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
        Shared Documents ({sharedDocs.length})
      </h3>
      {sharedDocs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span role="img" aria-label="book">📖</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-lg mb-2">No shared documents yet</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Documents you have shared with others will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedDocs.map(doc => (
            <div key={doc.id} className="bg-white border border-blue-100 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1">
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
                  <p className="text-xs text-slate-400 mt-1">Shared with: {doc.receiver_email || doc.receiver_id}</p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedDocumentsPanel;
