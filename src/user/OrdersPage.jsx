import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { BASE_URL } from '../baseurl';
import StripePaymentPopup from './StripePaymentPopup';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view orders');
        navigate('/');
        return;
      }

      const response = await fetch(`${BASE_URL}/getAllFacebookOrders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Transform the data to match the UI structure
        if (data.allFiles && Array.isArray(data.allFiles)) {
          const formattedOrders = data.allFiles.map(file => ({
            id: file._id,
            quantity: file.recordLength || 0,
            total: (file.recordLength || 0) * 2, // $2 per record
            date: new Date(file.createdAt).toLocaleDateString(),
            status: file.paid ? 'PAID' : 'PENDING',
            enrichedFileUrl: file.output,
            recordCount: file.recordCount,
            passcode: file.passcode
          }));
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      } else {
        toast.error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (order) => {
    if (order.status === 'PAID') {
      // If paid, download directly
      if (order.enrichedFileUrl) {
        window.open(order.enrichedFileUrl, '_blank');
      } else {
        toast.error('Download link not available');
      }
    } else {
      // If not paid, show payment popup
      setSelectedOrder(order);
      setShowPaymentPopup(true);
    }
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    toast.success('Payment successful! Your file is now ready for download.');
    setShowPaymentPopup(false);
    setSelectedOrder(null);
    // Refresh orders to get updated payment status
    fetchOrders();
  };

  const handleBuyMore = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
                <p className="text-gray-600 mt-2">View and download your enriched files</p>
              </div>
              <button
                onClick={handleBuyMore}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                Upload More Files
              </button>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[300px]">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            File #{order.id.substring(0, 8)}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'PAID'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Records:</span>{' '}
                            <span className="font-medium">{order.quantity.toLocaleString()}</span>
                          </div>
                          {order.recordCount && (
                            <div>
                              <span className="text-gray-600">Record Info:</span>{' '}
                              <span className="font-medium">{order.recordCount}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Cost:</span>{' '}
                            <span className="font-medium text-blue-600">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>{' '}
                            <span className="font-medium">{order.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'PAID' ? (
                          <button
                            onClick={() => handleDownload(order)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownload(order)}
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {orders.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-700">{orders.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Records</p>
                    <p className="text-2xl font-bold text-green-700">
                      {orders.reduce((sum, order) => sum + order.quantity, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-700">
                      ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Popup */}
      {selectedOrder && (
        <StripePaymentPopup
          recordId={selectedOrder.id}
          isOpen={showPaymentPopup}
          onClose={() => {
            setShowPaymentPopup(false);
            setSelectedOrder(null);
          }}
          onSuccess={handlePaymentSuccess}
          amount={selectedOrder.total * 100} // Convert to cents
          recordCount={selectedOrder.quantity}
        />
      )}
    </>
  );
};

export default OrdersPage;