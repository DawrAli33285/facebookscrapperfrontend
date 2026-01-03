// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast, ToastContainer } from 'react-toastify';
// import { BASE_URL } from '../baseurl';
// import ConfirmationPopup from './ConfirmationPage';

// const UploadItemIdsPage = () => {
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [showResultPopup, setShowResultPopup] = useState(false);
//   const [enrichmentResult, setEnrichmentResult] = useState(null);
//   const navigate = useNavigate();

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       // Validate file type - accept CSV and Excel files
//       const validExtensions = ['.csv', '.xls', '.xlsx'];
//       const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
//       if (!validExtensions.includes(fileExtension)) {
//         toast.error('Please upload a CSV or Excel file (.csv, .xls, .xlsx)', { containerId: 'uploadPage' });
//         // Clear the input
//         e.target.value = '';
//         return;
//       }

//       // Validate file size (max 10MB)
//       const maxSize = 10 * 1024 * 1024; // 10MB
//       if (selectedFile.size > maxSize) {
//         toast.error('File size must be less than 10MB', { containerId: 'uploadPage' });
//         // Clear the input
//         e.target.value = '';
//         return;
//       }

//       setFile(selectedFile);
//       setFileName(selectedFile.name);
//     }
//   };

//   const resetFileInput = () => {
//     // Reset the file input element
//     const fileInput = document.getElementById('file-upload');
//     if (fileInput) {
//       fileInput.value = '';
//     }
//     setFile(null);
//     setFileName('');
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       toast.error('Please select a file first', { containerId: 'uploadPage' });
//       return;
//     }

//     setLoading(true);
//     setProgress(0);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       // Get token from localStorage
//       const token = localStorage.getItem('token');

//       if (!token) {
//         toast.error('Please login to upload files', { containerId: 'uploadPage' });
//         setTimeout(() => navigate('/'), 1500);
//         return;
//       }

//       // Simulate progress
//       const progressInterval = setInterval(() => {
//         setProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return 90;
//           }
//           return prev + 10;
//         });
//       }, 500);

//       // Updated endpoint for item IDs enrichment
//       const response = await fetch(`${BASE_URL}/enrichifyItemIds`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       clearInterval(progressInterval);
//       setProgress(100);

//       const data = await response.json();
//       console.log("DATA", data);

//       if (!response.ok) {
//         throw new Error(data.error || 'Upload failed');
//       }

//       // Map backend response to frontend expected format
//       const enrichmentData = {
//         fileId: data.data.passcode, // Use passcode as fileId
//         passcode: data.data.passcode,
//         totalRecords: data.data.totalRecords,
//         successfulEnrichments: data.data.successfulEnrichments,
//         partialEnrichments: data.data.partialEnrichments || 0,
//         failedEnrichments: data.data.failedEnrichments,
//         successRate: data.data.totalRecords > 0 
//           ? `${((data.data.successfulEnrichments / data.data.totalRecords) * 100).toFixed(1)}%`
//           : '0%',
//         enrichedFileUrl: data.data.cloudinaryUrl || data.data.outputFile,
//       };

//       toast.success('Item IDs enriched successfully!', { containerId: 'uploadPage' });
      
//       // Store enrichment data
//       localStorage.setItem('enrichmentData', JSON.stringify(enrichmentData));
      
//       // Set the enrichment result and show result popup
//       setEnrichmentResult(enrichmentData);
//       setShowResultPopup(true);
      
//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error(error.message || 'An error occurred. Please try again.', { containerId: 'uploadPage' });
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (loading) return; // Don't allow drops while loading

//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile) {
//       const fakeEvent = { target: { files: [droppedFile] } };
//       handleFileChange(fakeEvent);
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDownloadFile = () => {
//     try {
//       if (enrichmentResult && enrichmentResult.enrichedFileUrl) {
//         window.open(enrichmentResult.enrichedFileUrl, '_blank');
//         toast.success('Download started!', { containerId: 'uploadPage' });
//       } else {
//         toast.error('Download URL not found', { containerId: 'uploadPage' });
//       }
      
//       // Close popup and reset
//       setShowResultPopup(false);
//       setEnrichmentResult(null);
//       resetFileInput(); // Use the new reset function
//     } catch (error) {
//       console.error('Download error:', error);
//       toast.error('An error occurred while downloading', { containerId: 'uploadPage' });
//     }
//   };

//   const handleClosePopup = () => {
//     setShowResultPopup(false);
//     setEnrichmentResult(null);
//     resetFileInput(); // Use the new reset function
//   };

//   const handleRemoveFile = (e) => {
//     e.stopPropagation();
//     resetFileInput();
//   };

//   const handleDownloadSample = () => {
//     // Sample CSV with url column
//     const csvContent = 'url\nhttps://www.facebook.com/marketplace/item/1183872860274064/?ref=category_feed&referral_code=undefined&referral_story_type=listing&tracking=%7B%22qid%22%3A%22-7810702591512038115%22%2C%22mf_story_key%22%3A%2224982878751322261%22%2C%22commerce_rank_obj%22%3A%22%7B%5C%22target_id%5C%22%3A24982878751322261%2C%5C%22target_type%5C%22%3A0%2C%5C%22primary_position%5C%22%3A14%2C%5C%22ranking_signature%5C%22%3A8938706053305031700%2C%5C%22ranking_request_id%5C%22%3A5688992423925612525%2C%5C%22commerce_channel%5C%22%3A504%2C%5C%22value%5C%22%3A0.020986441867027%2C%5C%22candidate_retrieval_source_map%5C%22%3A%7B%5C%2224982878751322261%5C%22%3A111%7D%7D%22%7D';
    
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
    
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'sample_itemids_file.csv');
//     link.style.visibility = 'hidden';
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     toast.success('Sample file downloaded!', { containerId: 'uploadPage' });
//   };

//   return (
//     <>
//       <ToastContainer containerId="uploadPage" />
      
//       {/* Result Popup */}
//       <ConfirmationPopup
//         isOpen={showResultPopup}
//         onClose={handleClosePopup}
//         onConfirm={handleDownloadFile}
//         title="Enrichment Complete!"
//         confirmText="Download File"
//         cancelText="Close"
//         message={
//           enrichmentResult ? (
//             <div className="space-y-2">
//               <p className="font-semibold">Your item IDs have been processed successfully!</p>
//               <div className="bg-blue-50 p-4 rounded-lg mt-4 text-left">
//                 <p className="text-sm"><strong>Total Records:</strong> {enrichmentResult.totalRecords}</p>
//                 <p className="text-sm"><strong>Successful:</strong> {enrichmentResult.successfulEnrichments}</p>
//                 {enrichmentResult.partialEnrichments > 0 && (
//                   <p className="text-sm"><strong>Partial:</strong> {enrichmentResult.partialEnrichments}</p>
//                 )}
//                 <p className="text-sm"><strong>Failed:</strong> {enrichmentResult.failedEnrichments}</p>
//                 <p className="text-sm"><strong>Success Rate:</strong> {enrichmentResult.successRate}</p>
//                 <p className="text-sm mt-2"><strong>Passcode:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{enrichmentResult.passcode}</span></p>
//               </div>
//               <p className="mt-4">Click "Download File" to get your enriched data.</p>
//             </div>
//           ) : (
//             "Processing complete!"
//           )
//         }
//         isLoading={false}
//       />
      
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
//         <div className="max-w-4xl mx-auto pt-8">
//           {/* Header */}
//           <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
//             <div className="mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">Enrich Seller IDs</h1>
//               <p className="text-gray-600 mt-2">Upload your CSV or Excel file with Facebook listing item url to get enriched product and seller data</p>
//             </div>

//             {/* Instructions */}
//             <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
//               <h3 className="font-semibold text-blue-900 mb-3">📋 Instructions:</h3>
//               <ul className="space-y-2 text-sm text-blue-800">
//                 <li className="flex items-start">
//                   <span className="mr-2">1.</span>
//                   <span>Your file must contain a column named <strong>"url"</strong> with Facebook marketplace listing URLs</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">2.</span>
//                   <span>Supported file formats: CSV (.csv), Excel (.xls, .xlsx)</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">3.</span>
//                   <span>URLs should be complete Facebook marketplace item URLs</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">4.</span>
//                   <span>Maximum file size: 10MB</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">5.</span>
//                   <span>You'll receive enriched data with seller ID and product details</span>
//                 </li>
//               </ul>
//             </div>

//             {/* File Upload Area */}
//             <div
//               onDrop={handleDrop}
//               onDragOver={handleDragOver}
//               className={`border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 text-center hover:border-blue-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//             >
//               <input
//                 type="file"
//                 accept=".csv,.xls,.xlsx"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="file-upload"
//                 disabled={loading}
//                 key={fileName || 'empty'} // Force re-render when fileName changes
//               />
              
//               {!fileName ? (
//                 <label htmlFor="file-upload" className={loading ? 'cursor-not-allowed' : 'cursor-pointer'}>
//                   <div className="flex flex-col items-center">
//                     <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                     </svg>
//                     <p className="text-lg font-medium text-gray-700 mb-2">Drop your file here or click to browse</p>
//                     <p className="text-sm text-gray-500">CSV or Excel files (.csv, .xls, .xlsx) up to 10MB</p>
//                   </div>
//                 </label>
//               ) : (
//                 <div className="flex items-center justify-center">
//                   <svg className="w-12 h-12 text-green-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <div className="text-left">
//                     <p className="text-lg font-medium text-gray-800">{fileName}</p>
//                     <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
//                   </div>
//                   <button
//                     onClick={handleRemoveFile}
//                     className="ml-4 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={loading}
//                     type="button"
//                   >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Progress Bar */}
//             {loading && (
//               <div className="mb-6">
//                 <div className="flex justify-between text-sm text-gray-600 mb-2">
//                   <span>Processing your item IDs...</span>
//                   <span>{progress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                   <div
//                     className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
//                     style={{ width: `${progress}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2 text-center">
//                   This may take a few minutes depending on the file size...
//                 </p>
//               </div>
//             )}

//             {/* Upload Button */}
//             <button
//               onClick={handleUpload}
//               disabled={!file || loading}
//               type="button"
//               className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all shadow-lg ${
//                 file && !loading
//                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
//                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               }`}
//             >
//               {loading ? 'Processing...' : 'Enrich Item IDs'}
//             </button>

//             {/* Sample File Link */}
//             <div className="mt-8 text-center">
//               <p className="text-sm text-gray-600 mb-2">Need a sample file format?</p>
//               <button 
//                 onClick={handleDownloadSample}
//                 type="button"
//                 className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
//               >
//                 Download Sample File
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UploadItemIdsPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { BASE_URL } from '../baseurl';
import StripePaymentPopup from './StripePaymentPopup'; // Your existing Stripe component

const UploadItemIdsPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
const [downloadData, setDownloadData] = useState(null);
const [showResultsPage, setShowResultsPage] = useState(false);  

  const navigate = useNavigate();


  const handleDownloadEnrichedFile = async () => {
    try {
      if (downloadData && downloadData.enrichedFileUrl) {
        // Option 1: Open in new tab (for Cloudinary URLs)
        window.open(downloadData.enrichedFileUrl, '_blank');
        
        // Option 2: If you want to force download with a specific name
        // const link = document.createElement('a');
        // link.href = downloadData.enrichedFileUrl;
        // link.download = `enriched_data_${downloadData.jobId}.csv`;
        // link.click();
        
        toast.success('Download started!', { containerId: 'uploadPage' });
      } else {
        toast.error('File URL not found', { containerId: 'uploadPage' });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file', { containerId: 'uploadPage' });
    }
  };
  
  const handleCloseDownloadModal = () => {
    setShowDownloadModal(false);
    setDownloadData(null);
    resetFileInput();
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const validExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload a CSV or Excel file (.csv, .xls, .xlsx)', { containerId: 'uploadPage' });
        e.target.value = '';
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB', { containerId: 'uploadPage' });
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const resetFileInput = () => {
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

      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to upload files', { containerId: 'uploadPage' });
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Call the enrichment endpoint
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

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // CRITICAL: Map backend response to payment-ready job format
      // Backend should return: jobId, totalRecords, successfulEnrichments, failedEnrichments, previewData, cloudinaryUrl
      
      console.log('=== BACKEND RESPONSE DEBUG ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      
      // Your backend structure: { message: "...", data: { totalRecords, successfulEnrichments, ... } }
      const responseData = data.data || data;
      
      console.log('Response data being used:', responseData);
      console.log('Available fields:', Object.keys(responseData));
      
      // Extract values with your exact backend field names
      const totalRecords = responseData.totalRecords || 0;
      const successfulEnrichments = responseData.successfulEnrichments || 0;
      const partialEnrichments = responseData.partialEnrichments || 0;
      const failedEnrichments = responseData.failedEnrichments || 0;
      
      console.log('=== EXTRACTED VALUES ===');
      console.log('totalRecords:', totalRecords);
      console.log('successfulEnrichments:', successfulEnrichments);
      console.log('partialEnrichments:', partialEnrichments);
      console.log('failedEnrichments:', failedEnrichments);
      console.log('========================');
      
      // Create preview data from the enriched records if not provided
      let previewData = [];
      
      // Your backend doesn't return previewData in the response
      // We need to either:
      // 1. Add it to backend response, OR
      // 2. Fetch it separately, OR
      // 3. Skip preview for now
      
      // For now, create mock preview data structure
      if (!responseData.previewData && successfulEnrichments > 0) {
        console.log('⚠️ Backend did not return previewData - preview will be empty');
        previewData = [];
      } else {
        previewData = responseData.previewData || [];
      }
      
      console.log("RESPONSE DATA")
      console.log(responseData)
      const processedJob = {
        jobId: responseData.documentId || responseData.passcode || 'unknown',
        passcode: responseData.passcode,
        totalUrls: totalRecords,
        resolvedIds: successfulEnrichments,
        partialIds: partialEnrichments,
        failedIds: failedEnrichments,
        totalPrice: successfulEnrichments * 2.00, // $2.00 per resolved ID
        status: 'ready_for_payment',
        previewData: previewData,
        enrichedFileUrl: responseData.cloudinaryUrl || responseData.outputFile || '',
        createdAt: new Date().toISOString(),
      };
      
      console.log('=== PROCESSED JOB DATA ===');
      console.log('jobId:', processedJob.jobId);
      console.log('totalPrice:', processedJob.totalPrice);
      console.log('resolvedIds:', processedJob.resolvedIds);
      console.log('===========================');
      
      // Validate that we have resolved IDs
      if (successfulEnrichments === 0) {
        toast.error('⚠️ No IDs were successfully resolved. All records failed or no seller IDs were found.', { 
          containerId: 'uploadPage',
          autoClose: 8000 
        });
        console.error('❌ ZERO IDs RESOLVED');
        console.error('This could mean:');
        console.error('1. Facebook login failed');
        console.error('2. All URLs were invalid');
        console.error('3. Seller IDs could not be extracted');
        console.error('4. Facebook blocked the requests');
      }

      toast.success('ID Resolution complete!', { containerId: 'uploadPage' });
      setJobData(processedJob);
      setShowSummaryModal(true);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'An error occurred. Please try again.', { containerId: 'uploadPage' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };


  const handlePayLater = () => {
    setShowSummaryModal(false);
    setShowPaymentPopup(false);
    toast.info('You can complete payment from the Jobs History page', { containerId: 'uploadPage' });
    resetFileInput();
    // Optionally navigate to jobs history
    // navigate('/jobs-history');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

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

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    resetFileInput();
  };

  const handleDownloadSample = () => {
    const csvContent = 'url\nhttps://www.facebook.com/marketplace/item/1183872860274064/?ref=category_feed&referral_code=undefined&referral_story_type=listing';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_facebook_urls.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Sample file downloaded!', { containerId: 'uploadPage' });
  };

  return (
    <>
      <ToastContainer containerId="uploadPage" />
      
   
   
{showResultsPage && downloadData ? (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
    <div className="max-w-7xl mx-auto pt-8">
      {/* Success Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">🎉 Payment Successful!</h1>
        <p className="text-center text-gray-600 text-lg">Your enriched file is ready for download</p>
      </div>

      {/* Summary Stats Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Processing Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">URLs Processed</p>
            <p className="text-3xl font-bold text-blue-600">{downloadData.totalUrls}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">IDs Resolved</p>
            <p className="text-3xl font-bold text-green-600">{downloadData.resolvedIds}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Partial Results</p>
            <p className="text-3xl font-bold text-yellow-600">{downloadData.partialIds}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Amount Paid</p>
            <p className="text-3xl font-bold text-purple-600">${downloadData.totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Job Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📋 Job ID:</strong> <span className="font-mono bg-white px-2 py-1 rounded ml-2">{downloadData.jobId}</span>
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Save this ID to access your file later from Jobs History
          </p>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💾 Download Your File</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
          <p className="text-sm text-green-800 mb-3">
            <strong>✅ Your enriched CSV file includes 14 columns:</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-green-700">
            <div>• url</div>
            <div>• original_facebook_url</div>
            <div>• facebook_item_id</div>
            <div>• facebook_seller_id</div>
            <div>• facebook_seller_name</div>
            <div>• facebook_seller_profile_url</div>
            <div>• facebook_listing_title</div>
            <div>• facebook_price</div>
            <div>• facebook_location</div>
            <div>• facebook_images_count</div>
            <div>• extraction_methods</div>
            <div>• enrichment_status</div>
            <div>• enrichment_error</div>
            <div>• enriched_at</div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleDownloadEnrichedFile}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Enriched CSV
          </button>
          <button
            onClick={handleCloseDownloadModal}
            className="px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Start New Upload
          </button>
        </div>
      </div>

      {/* Data Table Section */}
      {downloadData.previewData && downloadData.previewData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Data Preview</h2>
          <p className="text-gray-600 mb-6">Preview of first 3 enriched records (scroll horizontally to see all columns):</p>
          
          {/* Table Container with Horizontal Scroll */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">Original URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Item ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Seller ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Seller Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">Profile URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[250px]">Listing Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Images</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">Extraction Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">Error</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[180px]">Enriched At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {downloadData.previewData.slice(0, 3).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <a 
                        href={row.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px]"
                        title={row.url}
                      >
                        {row.url ? row.url.substring(0, 50) + '...' : 'N/A'}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <a 
                        href={row.original_facebook_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px]"
                        title={row.original_facebook_url}
                      >
                        {row.original_facebook_url ? row.original_facebook_url.substring(0, 50) + '...' : 'N/A'}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">{row.facebook_item_id || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">{row.facebook_seller_id || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{row.facebook_seller_name || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {row.facebook_seller_profile_url ? (
                        <a 
                          href={row.facebook_seller_profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Profile
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{row.facebook_listing_title || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-semibold">{row.facebook_price || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{row.facebook_location || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 text-center">{row.facebook_images_count || 0}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{row.extraction_methods || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        row.enrichment_status === 'success' ? 'bg-green-100 text-green-700' :
                        row.enrichment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.enrichment_status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{row.enrichment_error || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{row.enriched_at || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Note */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Note:</strong> This is a preview of the first 3 records. Your downloaded CSV file contains all {downloadData.totalUrls} records with complete data.
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
) :<>
         {/* Stripe Payment Popup */}
         <StripePaymentPopup
  isOpen={showPaymentPopup}
  onClose={() => setShowPaymentPopup(false)}
  recordId={jobData?.jobId}
  amount={jobData ? Math.round(jobData.totalPrice * 100) : 0}
  recordCount={jobData?.resolvedIds || 0}
  onPaymentSuccess={(jobId) => {
    console.log('Payment completed for job:', jobId);
    setShowPaymentPopup(false);
    
    // Show results page instead of modal
    setDownloadData(jobData);
    setShowResultsPage(true);
  }}
/>
      {/* Payment Summary Modal (Shows BEFORE Stripe popup) */}
      {showSummaryModal && jobData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🎉 ID Resolution Complete!</h2>
            
            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">URLs Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{jobData.totalUrls}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">IDs Resolved (Success)</p>
                <p className="text-2xl font-bold text-green-600">{jobData.resolvedIds}</p>
              </div>
              {jobData.partialIds > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Partial (No Seller ID)</p>
                  <p className="text-2xl font-bold text-yellow-600">{jobData.partialIds}</p>
                </div>
              )}
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{jobData.failedIds}</p>
              </div>
              <div className={`bg-purple-50 p-4 rounded-lg ${jobData.partialIds > 0 ? '' : 'col-span-1'}`}>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-purple-600">${jobData.totalPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Pricing Calculation */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                💰 <strong>Pricing:</strong> $2.00 per resolved ID × {jobData.resolvedIds} IDs = <strong>${jobData.totalPrice.toFixed(2)}</strong>
              </p>
              {jobData.partialIds > 0 && (
                <p className="text-xs text-yellow-700 mt-2">
                  Note: {jobData.partialIds} partial enrichments (listing data only, no seller ID) are included in the file but not charged.
                </p>
              )}
            </div>

            {/* Preview Data Table */}
            {jobData.previewData && jobData.previewData.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Preview (First 3 Results)</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-80 overflow-y-auto">
                  {jobData.previewData.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="bg-white p-4 rounded border border-gray-200 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div><strong>Seller ID:</strong> {row.facebook_seller_id || 'N/A'}</div>
                        <div><strong>Seller Name:</strong> {row.facebook_seller_name || 'N/A'}</div>
                        <div><strong>Item ID:</strong> {row.facebook_item_id || 'N/A'}</div>
                        <div><strong>Price:</strong> {row.facebook_price || 'N/A'}</div>
                        <div className="col-span-2"><strong>Title:</strong> {row.facebook_listing_title || 'N/A'}</div>
                        <div className="col-span-2"><strong>Location:</strong> {row.facebook_location || 'N/A'}</div>
                     
                        <div><strong>Status:</strong> {row.enrichment_status || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Columns List */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">📄 Your enriched file includes these 14 columns:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>✓ url</div>
                  <div>✓ original_facebook_url</div>
                  <div>✓ facebook_item_id</div>
                  <div>✓ facebook_seller_id</div>
                  <div>✓ facebook_seller_name</div>
                  <div>✓ facebook_seller_profile_url</div>
                  <div>✓ facebook_listing_title</div>
                  <div>✓ facebook_price</div>
                  <div>✓ facebook_location</div>
                  <div>✓ facebook_images_count</div>
                  <div>✓ extraction_methods</div>
                  <div>✓ enrichment_status</div>
                  <div>✓ enrichment_error</div>
                  <div>✓ enriched_at</div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📌 Important:</strong> After payment, your file will be unlocked and available for download. You can also access it later from your Jobs History.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePayLater}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Pay Later
              </button>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setShowPaymentPopup(true);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Pay ${jobData.totalPrice.toFixed(2)} Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Facebook ID Resolution</h1>
              <p className="text-gray-600 mt-2">Upload your CSV with Facebook listing URLs to resolve seller IDs and product details</p>
              <p className="text-sm text-purple-600 font-semibold mt-1">💵 Pricing: $2.00 per successfully resolved ID</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">📋 How It Works:</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2 font-bold">1.</span>
                  <span>Upload a CSV/Excel file with a column named <strong>"url"</strong> containing Facebook marketplace listing URLs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">2.</span>
                  <span>We'll process each URL and resolve Facebook seller IDs and listing details</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">3.</span>
                  <span>Review the summary showing total URLs, IDs resolved, and total price</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">4.</span>
                  <span>Pay only for successfully resolved IDs ($2.00 each) via Stripe</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">5.</span>
                  <span>Download your enriched CSV with 14 data columns per listing</span>
                </li>
              </ol>
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
                key={fileName || 'empty'}
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
                  <span>Processing URLs and resolving IDs...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This may take a few minutes depending on the number of URLs...
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
              {loading ? 'Processing URLs...' : 'Start ID Resolution'}
            </button>

            {/* Sample File Download */}
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
      
      </>}
    </>
  );
};

export default UploadItemIdsPage;