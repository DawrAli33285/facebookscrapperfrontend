import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { BASE_URL } from '../baseurl';
import ConfirmationPopup from './ConfirmationPage';

const UploadItemIdsPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type - accept CSV and Excel files
      const validExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload a CSV or Excel file (.csv, .xls, .xlsx)', { containerId: 'uploadPage' });
        // Clear the input
        e.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB', { containerId: 'uploadPage' });
        // Clear the input
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const resetFileInput = () => {
    // Reset the file input element
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    setFile(null);
    setFileName('');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first', { containerId: 'uploadPage' });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to upload files', { containerId: 'uploadPage' });
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Updated endpoint for item IDs enrichment
      const response = await fetch(`${BASE_URL}/enrichifyItemIds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      console.log("DATA", data);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Map backend response to frontend expected format
      const enrichmentData = {
        fileId: data.data.passcode, // Use passcode as fileId
        passcode: data.data.passcode,
        totalRecords: data.data.totalRecords,
        successfulEnrichments: data.data.successfulEnrichments,
        partialEnrichments: data.data.partialEnrichments || 0,
        failedEnrichments: data.data.failedEnrichments,
        successRate: data.data.totalRecords > 0 
          ? `${((data.data.successfulEnrichments / data.data.totalRecords) * 100).toFixed(1)}%`
          : '0%',
        enrichedFileUrl: data.data.cloudinaryUrl || data.data.outputFile,
      };

      toast.success('Item IDs enriched successfully!', { containerId: 'uploadPage' });
      
      // Store enrichment data
      localStorage.setItem('enrichmentData', JSON.stringify(enrichmentData));
      
      // Set the enrichment result and show result popup
      setEnrichmentResult(enrichmentData);
      setShowResultPopup(true);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'An error occurred. Please try again.', { containerId: 'uploadPage' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Don't allow drops while loading

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDownloadFile = () => {
    try {
      if (enrichmentResult && enrichmentResult.enrichedFileUrl) {
        window.open(enrichmentResult.enrichedFileUrl, '_blank');
        toast.success('Download started!', { containerId: 'uploadPage' });
      } else {
        toast.error('Download URL not found', { containerId: 'uploadPage' });
      }
      
      // Close popup and reset
      setShowResultPopup(false);
      setEnrichmentResult(null);
      resetFileInput(); // Use the new reset function
    } catch (error) {
      console.error('Download error:', error);
      toast.error('An error occurred while downloading', { containerId: 'uploadPage' });
    }
  };

  const handleClosePopup = () => {
    setShowResultPopup(false);
    setEnrichmentResult(null);
    resetFileInput(); // Use the new reset function
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    resetFileInput();
  };

  const handleDownloadSample = () => {
    // Sample CSV with url column
    const csvContent = 'url\nhttps://www.facebook.com/marketplace/item/1183872860274064/?ref=category_feed&referral_code=undefined&referral_story_type=listing&tracking=%7B%22qid%22%3A%22-7810702591512038115%22%2C%22mf_story_key%22%3A%2224982878751322261%22%2C%22commerce_rank_obj%22%3A%22%7B%5C%22target_id%5C%22%3A24982878751322261%2C%5C%22target_type%5C%22%3A0%2C%5C%22primary_position%5C%22%3A14%2C%5C%22ranking_signature%5C%22%3A8938706053305031700%2C%5C%22ranking_request_id%5C%22%3A5688992423925612525%2C%5C%22commerce_channel%5C%22%3A504%2C%5C%22value%5C%22%3A0.020986441867027%2C%5C%22candidate_retrieval_source_map%5C%22%3A%7B%5C%2224982878751322261%5C%22%3A111%7D%7D%22%7D';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_itemids_file.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Sample file downloaded!', { containerId: 'uploadPage' });
  };

  return (
    <>
      <ToastContainer containerId="uploadPage" />
      
      {/* Result Popup */}
      <ConfirmationPopup
        isOpen={showResultPopup}
        onClose={handleClosePopup}
        onConfirm={handleDownloadFile}
        title="Enrichment Complete!"
        confirmText="Download File"
        cancelText="Close"
        message={
          enrichmentResult ? (
            <div className="space-y-2">
              <p className="font-semibold">Your item IDs have been processed successfully!</p>
              <div className="bg-blue-50 p-4 rounded-lg mt-4 text-left">
                <p className="text-sm"><strong>Total Records:</strong> {enrichmentResult.totalRecords}</p>
                <p className="text-sm"><strong>Successful:</strong> {enrichmentResult.successfulEnrichments}</p>
                {enrichmentResult.partialEnrichments > 0 && (
                  <p className="text-sm"><strong>Partial:</strong> {enrichmentResult.partialEnrichments}</p>
                )}
                <p className="text-sm"><strong>Failed:</strong> {enrichmentResult.failedEnrichments}</p>
                <p className="text-sm"><strong>Success Rate:</strong> {enrichmentResult.successRate}</p>
                <p className="text-sm mt-2"><strong>Passcode:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{enrichmentResult.passcode}</span></p>
              </div>
              <p className="mt-4">Click "Download File" to get your enriched data.</p>
            </div>
          ) : (
            "Processing complete!"
          )
        }
        isLoading={false}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Enrich Seller IDs</h1>
              <p className="text-gray-600 mt-2">Upload your CSV or Excel file with Facebook listing item url to get enriched product and seller data</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Instructions:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Your file must contain a column named <strong>"url"</strong> with Facebook marketplace listing URLs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Supported file formats: CSV (.csv), Excel (.xls, .xlsx)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>URLs should be complete Facebook marketplace item URLs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">5.</span>
                  <span>You'll receive enriched data with seller ID and product details</span>
                </li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 text-center hover:border-blue-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
                key={fileName || 'empty'} // Force re-render when fileName changes
              />
              
              {!fileName ? (
                <label htmlFor="file-upload" className={loading ? 'cursor-not-allowed' : 'cursor-pointer'}>
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-2">Drop your file here or click to browse</p>
                    <p className="text-sm text-gray-500">CSV or Excel files (.csv, .xls, .xlsx) up to 10MB</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-lg font-medium text-gray-800">{fileName}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-4 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    type="button"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing your item IDs...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This may take a few minutes depending on the file size...
                </p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              type="button"
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all shadow-lg ${
                file && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : 'Enrich Item IDs'}
            </button>

            {/* Sample File Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-2">Need a sample file format?</p>
              <button 
                onClick={handleDownloadSample}
                type="button"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Download Sample File
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadItemIdsPage;