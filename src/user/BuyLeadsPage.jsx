import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { BASE_URL } from '../baseurl';
import ConfirmationPopup from './ConfirmationPage';
import StripePaymentPopup from './StripePaymentPopup';

const UploadFilePage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showStripePopup, setShowStripePopup] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState(null);
  const [recordId,setRecordId]=useState("")
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type - accept CSV and Excel files
      const validExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload a CSV or Excel file (.csv, .xls, .xlsx)', { containerId: 'uploadPage' });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB', { containerId: 'uploadPage' });
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      
    }
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

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`${BASE_URL}/enrichifyFile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

    setRecordId(data.data.fileId)
        toast.success('File enriched successfully!', { containerId: 'uploadPage' });
        
        // Store enrichment data
        const enrichmentData = {
          fileId: data.data.fileId,
          passcode: data.data.passcode,
          totalRecords: data.data.totalRecords,
          successfulEnrichments: data.data.successfulEnrichments,
          failedEnrichments: data.data.failedEnrichments,
          successRate: data.data.successRate,
          enrichedFileUrl: data.data.enrichedFileUrl,
        };
        
        localStorage.setItem('enrichmentData', JSON.stringify(enrichmentData));
        
        // Set the enrichment result and show confirmation popup
        setEnrichmentResult(enrichmentData);
        setShowPaymentPopup(true);
        
     
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred. Please try again.', { containerId: 'uploadPage' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handlePaymentConfirm = () => {
    // Close confirmation popup and show Stripe payment popup
    setShowPaymentPopup(false);
    setShowStripePopup(true);
  };

  const handlePaymentCancel = () => {
    setShowPaymentPopup(false);
    setEnrichmentResult(null);
  };


  const handleDownloadSample = () => {
 
    const csvContent = 'url\nhttps://www.walmart.com/ip/Pokemon-Eevee-Model-Kit/204775177?classType=REGULAR&adsRedirect=true';
    
   
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
   
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_file.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Sample file downloaded!', { containerId: 'uploadPage' });
  };

  const handleStripeSuccess = async (paymentIntentId) => {
    try {
      // Update payment status on backend
      const token = localStorage.getItem('token');
      
        toast.success('Payment successful! Downloading file...', { containerId: 'uploadPage' });
        
        // Download the enriched file
        window.open(enrichmentResult.enrichedFileUrl, '_blank');
        
        // Close popup and reset
        setShowStripePopup(false);
        setEnrichmentResult(null);
        setFile(null);
        setFileName('');
    
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('An error occurred while processing payment', { containerId: 'uploadPage' });
    }
  };

  const handleStripeClose = () => {
    setShowStripePopup(false);
  };

  return (
    <>
      <ToastContainer containerId="uploadPage" />
      
      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPaymentPopup}
        onClose={handlePaymentCancel}
        onConfirm={handlePaymentConfirm}
        title="Enrichment Complete!"
        message={
          enrichmentResult ? (
            <div className="space-y-2">
              <p className="font-semibold">Your file has been processed successfully!</p>
              <div className="bg-blue-50 p-4 rounded-lg mt-4 text-left">
                <p className="text-sm"><strong>Total Records:</strong> {enrichmentResult.totalRecords}</p>
             
              </div>
              <p className="mt-4">Would you like to proceed to payment to download the enriched file?</p>
            </div>
          ) : (
            "Would you like to proceed to payment?"
          )
        }
        isLoading={false}
      />

      {/* Stripe Payment Popup */}
      <StripePaymentPopup
        isOpen={showStripePopup}
        onClose={handleStripeClose}
        recordId={recordId}
        onSuccess={handleStripeSuccess}
        amount={enrichmentResult ? enrichmentResult.totalRecords * 200 : 0} // $2.00 per record (200 cents) // $0.10 per record (10 cents = 10 in stripe's format)
        recordCount={enrichmentResult ? enrichmentResult.totalRecords : 0}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Enrich Your Data</h1>
              <p className="text-gray-600 mt-2">Upload your CSV or Excel file with product URLs to get enriched data</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Instructions:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Your file must contain a column with product URLs (named: url)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Supported file formats: CSV (.csv), Excel (.xls, .xlsx)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Supported URLs: Amazon and Walmart product pages</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">5.</span>
                  <span>You'll receive enriched data with product and seller information</span>
                </li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              
              {!fileName ? (
                <label htmlFor="file-upload" className="cursor-pointer">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileName('');
                    }}
                    className="ml-4 text-red-600 hover:text-red-700"
                    disabled={loading}
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
                  <span>Processing your file...</span>
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
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all shadow-lg ${
                file && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : 'Enrich Data'}
            </button>

            {/* Features */}
           

            {/* Sample File Link */}
           {/* Sample File Link */}
<div className="mt-8 text-center">
  <p className="text-sm text-gray-600 mb-2">Need a sample file format?</p>
  <button 
    onClick={handleDownloadSample}
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

export default UploadFilePage;