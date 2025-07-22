import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Calendar, 
  WorkEntryModal, 
  PaymentModal, 
  JobManagementModal, 
  SummaryStats,
  TURKISH_MONTHS 
} from './components';

function App() {
  // Current date state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Modal states
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  
  // Data states
  const [workData, setWorkData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [jobs, setJobs] = useState([
    { id: 1, name: 'İnşaat İşçisi', dailyRate: 500 },
    { id: 2, name: 'Boyacı', dailyRate: 600 },
    { id: 3, name: 'Temizlik', dailyRate: 400 }
  ]);
  
  // Action menu state
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedWorkData = localStorage.getItem('yevmiyelerim_work_data');
    const savedPaymentData = localStorage.getItem('yevmiyelerim_payment_data');
    const savedJobs = localStorage.getItem('yevmiyelerim_jobs');
    
    if (savedWorkData) {
      setWorkData(JSON.parse(savedWorkData));
    }
    
    if (savedPaymentData) {
      setPaymentData(JSON.parse(savedPaymentData));
    }
    
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('yevmiyelerim_work_data', JSON.stringify(workData));
  }, [workData]);
  
  useEffect(() => {
    localStorage.setItem('yevmiyelerim_payment_data', JSON.stringify(paymentData));
  }, [paymentData]);
  
  useEffect(() => {
    localStorage.setItem('yevmiyelerim_jobs', JSON.stringify(jobs));
  }, [jobs]);
  
  const formatDateKey = (day) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setActionMenuOpen(true);
  };
  
  const handleWorkSave = (day, data) => {
    const dateKey = formatDateKey(day);
    setWorkData(prev => ({
      ...prev,
      [dateKey]: data
    }));
    setActionMenuOpen(false);
  };
  
  const handlePaymentSave = (day, data) => {
    const dateKey = formatDateKey(day);
    setPaymentData(prev => ({
      ...prev,
      [dateKey]: data
    }));
    setActionMenuOpen(false);
  };
  
  const handleJobSave = (jobData) => {
    if (jobData.id && jobs.find(j => j.id === jobData.id)) {
      // Update existing job
      setJobs(prev => prev.map(j => j.id === jobData.id ? jobData : j));
    } else {
      // Add new job
      setJobs(prev => [...prev, jobData]);
    }
  };
  
  const handleJobDelete = (jobId) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };
  
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };
  
  const resetData = () => {
    if (window.confirm('Tüm verileri sıfırlamak istediğinizden emin misiniz?')) {
      setWorkData({});
      setPaymentData({});
      localStorage.removeItem('yevmiyelerim_work_data');
      localStorage.removeItem('yevmiyelerim_payment_data');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Yevmiyelerim</h1>
              <p className="text-sm text-gray-600">Günlük kazanç takibim</p>
            </div>
            <button
              onClick={() => setJobModalOpen(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {TURKISH_MONTHS[currentMonth]} {currentYear}
            </h2>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Summary Stats */}
        <SummaryStats 
          workData={workData}
          paymentData={paymentData}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
        
        {/* Calendar */}
        <Calendar
          currentMonth={currentMonth}
          currentYear={currentYear}
          onDateClick={handleDateClick}
          workData={workData}
          paymentData={paymentData}
        />
        
        {/* Reset Data Button */}
        <div className="mt-6 text-center">
          <button
            onClick={resetData}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Tüm Verileri Sıfırla
          </button>
        </div>
      </div>
      
      {/* Action Menu Modal */}
      {actionMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                {selectedDate} {TURKISH_MONTHS[currentMonth]} {currentYear}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setWorkModalOpen(true);
                    setActionMenuOpen(false);
                  }}
                  className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  İş Kaydı Ekle
                </button>
                
                <button
                  onClick={() => {
                    setPaymentModalOpen(true);
                    setActionMenuOpen(false);
                  }}
                  className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ödeme Kaydı Ekle
                </button>
                
                <button
                  onClick={() => setActionMenuOpen(false)}
                  className="w-full p-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      <WorkEntryModal
        isOpen={workModalOpen}
        onClose={() => setWorkModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleWorkSave}
        jobs={jobs}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
      
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handlePaymentSave}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
      
      <JobManagementModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        jobs={jobs}
        onSaveJob={handleJobSave}
        onDeleteJob={handleJobDelete}
      />
    </div>
  );
}

export default App;