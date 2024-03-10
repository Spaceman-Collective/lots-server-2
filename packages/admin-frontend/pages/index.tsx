import type { NextPage } from 'next';
import { useState } from 'react';

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [notification, setNotification] = useState({ message: '', type: '' }); // New state for notification
  const [showNotification, setShowNotification] = useState(false); // Visibility of notification

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
  
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }
  
      const result = await response.json();
      setNotification({ message: result.message, type: 'success' });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload items.';
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  };

  const handleDownload = async () => {
    const response = await fetch('/api/download');
    const data = await response.json();
    
    const jsonString = JSON.stringify(data, null, 2);
  
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'item-data.json'; 
    document.body.appendChild(a); 
    a.click(); 
  
    // Cleanup: remove the anchor element and revoke the object URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {showNotification && (
        <div className={`absolute top-0 left-0 right-0 text-white py-2 px-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
      <div className="w-full max-w-xl bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-semibold ${activeTab === 'upload' ? 'text-white bg-blue-700' : 'text-gray-300 bg-gray-700'} rounded hover:bg-blue-800`}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2 font-semibold ${activeTab === 'download' ? 'text-white bg-blue-700' : 'text-gray-300 bg-gray-700'} rounded hover:bg-blue-800 ml-2`}
          >
            Download
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' && (
            <>
              <h1 className="text-xl font-bold mb-4">Upload JSON Items</h1>
              <form onSubmit={handleUpload} className="space-y-4">
                <label className="block w-full text-sm text-gray-500 bg-blue-50 text-blue-700 py-2 px-4 rounded cursor-pointer hover:bg-blue-100 hover:text-blue-800 font-semibold text-center">
                  Choose Files
                  <input
                    type="file"
                    name="files"
                    accept=".json"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button type="submit" className="px-4 py-2 w-full bg-green-500 text-white font-bold rounded hover:bg-green-600">
                  Upload Items
                </button>
              </form>

              {files.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold">Files to upload:</h2>
                  <ul className="list-disc pl-5">
                    {files.map((file, index) => (
                      <li key={index} className="text-gray-700">{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {activeTab === 'download' && (
            <>
              <h1 className="text-xl font-bold mb-4">Download JSON Items</h1>
              <button onClick={handleDownload} className="px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 w-full">
                Download Items
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
