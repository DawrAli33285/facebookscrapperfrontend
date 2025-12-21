import React, { useState, useEffect } from 'react';

const SuccessPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real implementation:
    // 1. Get orderId from URL params (e.g., ?orderId=1001)
    // 2. Fetch order details from backend
    // 3. Verify order belongs to current user
    // 4. Check order status is PAID
    // fetch(`/api/orders/${orderId}`)
    
    // Mock: simulate fetching order details
    setTimeout(() => {
      setOrder({
        id: 1001,
        quantity: 500,
        total: 1000,
        status: 'PAID',
        date: new Date().toISOString().split('T')[0],
        dateTime: new Date().toISOString()
      });
      setLoading(false);
    }, 800);
  }, []);

  const handleDownload = () => {
    if (!order || order.status !== 'PAID') {
      alert('Order not ready for download yet.');
      return;
    }

    // In real implementation:
    // fetch(`/api/orders/${order.id}/download`)
    
    // Mock CSV download
    const csvContent = `Name,Phone,Email
John Smith,+1-555-0100,john.smith@example.com
Jane Doe,+1-555-0101,jane.doe@example.com
Michael Johnson,+1-555-0102,michael.j@example.com
Sarah Williams,+1-555-0103,sarah.w@example.com
David Brown,+1-555-0104,david.brown@example.com
Emily Davis,+1-555-0105,emily.davis@example.com
Robert Miller,+1-555-0106,robert.m@example.com
Lisa Anderson,+1-555-0107,lisa.a@example.com
Christopher Wilson,+1-555-0108,chris.wilson@example.com
Jessica Moore,+1-555-0109,jessica.m@example.com`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_order_${order.id}_${order.quantity}_contacts.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find this order. Please try again.</p>
          <a
            href="/buy-leads"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
          >
            Back to Buy Leads
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Confirmed!</h1>
          <p className="text-gray-600 text-lg">Your order has been successfully processed</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Order Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID</span>
              <span className="font-semibold text-gray-800">#{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contacts Purchased</span>
              <span className="font-semibold text-gray-800">{order.quantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Paid</span>
              <span className="font-semibold text-green-600 text-lg">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-800">{order.date}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-gray-600">Status</span>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="space-y-4 mb-6">
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV File
          </button>

          <a
            href="/orders"
            className="block w-full text-center border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View All Orders
          </a>
        </div>

        {/* CSV Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">CSV File Format</p>
              <p className="text-sm text-blue-700 mb-2">
                Your download includes {order.quantity.toLocaleString()} verified contacts with:
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white rounded border border-blue-300 text-blue-800 font-medium">
                  Name
                </span>
                <span className="px-2 py-1 bg-white rounded border border-blue-300 text-blue-800 font-medium">
                  Phone
                </span>
                <span className="px-2 py-1 bg-white rounded border border-blue-300 text-blue-800 font-medium">
                  Email
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-3">Need more leads?</p>
          <a
            href="/buy-leads"
            className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
          >
            Purchase Another Batch →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;