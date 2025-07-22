import React, { useState, useEffect } from 'react';

// Turkish month names
const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TURKISH_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// Calendar component
export const Calendar = ({ currentMonth, currentYear, onDateClick, workData, paymentData }) => {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  const getDayStyle = (day) => {
    if (!day) return '';
    
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const workDay = workData[dateKey];
    const payment = paymentData[dateKey];
    
    if (payment) return 'bg-green-500 text-white'; // Payment received
    if (workDay) {
      if (workDay.overtime) return 'bg-orange-400 text-white'; // Overtime day
      return 'bg-blue-500 text-white'; // Regular work day
    }
    
    return 'hover:bg-gray-100';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {TURKISH_DAYS.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              h-12 flex items-center justify-center cursor-pointer rounded-md transition-all
              ${day ? getDayStyle(day) : ''}
              ${day ? 'border border-gray-200' : ''}
            `}
            onClick={() => day && onDateClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Normal Çalışma</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded"></div>
          <span>Mesai</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Ödeme Alındı</span>
        </div>
      </div>
    </div>
  );
};

// Work Entry Modal
export const WorkEntryModal = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSave, 
  jobs,
  currentMonth,
  currentYear 
}) => {
  const [selectedJob, setSelectedJob] = useState('');
  const [workHours, setWorkHours] = useState('8');
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [overtimeRate, setOvertimeRate] = useState('1.5');
  const [dailyRate, setDailyRate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  
  const formatDate = (date) => {
    return `${date} ${TURKISH_MONTHS[currentMonth]} ${currentYear}`;
  };
  
  const handleSave = () => {
    const workData = {
      job: selectedJob,
      hours: parseFloat(workHours),
      isOvertime: isOvertime,
      overtimeHours: parseFloat(overtimeHours),
      overtimeRate: parseFloat(overtimeRate),
      dailyRate: parseFloat(dailyRate),
      isHalfDay: isHalfDay,
      totalEarnings: calculateEarnings()
    };
    
    onSave(selectedDate, workData);
    onClose();
    resetForm();
  };
  
  const calculateEarnings = () => {
    const baseRate = parseFloat(dailyRate) || 0;
    const regularHours = parseFloat(workHours) || 0;
    const overtimeHrs = parseFloat(overtimeHours) || 0;
    const overtimeMultiplier = parseFloat(overtimeRate) || 1.5;
    
    let total = baseRate;
    
    if (isOvertime && overtimeHrs > 0) {
      const overtimeEarnings = (baseRate / 8) * overtimeHrs * overtimeMultiplier;
      total += overtimeEarnings;
    }
    
    if (isHalfDay) {
      total = total * 0.5;
    }
    
    return total;
  };
  
  const resetForm = () => {
    setSelectedJob('');
    setWorkHours('8');
    setIsOvertime(false);
    setOvertimeHours('0');
    setOvertimeRate('1.5');
    setDailyRate('');
    setIsHalfDay(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {formatDate(selectedDate)} - İş Kaydı
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İş Seçin
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">İş Seçin...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.name}>
                    {job.name} - {job.dailyRate}₺/gün
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Günlük Ücret (₺)
              </label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: 500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çalışma Saati
              </label>
              <input
                type="number"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.5"
                step="0.5"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="halfDay"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="halfDay" className="text-sm text-gray-700">
                Yarım Gün
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="overtime"
                checked={isOvertime}
                onChange={(e) => setIsOvertime(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="overtime" className="text-sm text-gray-700">
                Mesai Var
              </label>
            </div>
            
            {isOvertime && (
              <div className="space-y-3 pl-6 border-l-2 border-orange-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesai Saati
                  </label>
                  <input
                    type="number"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0.5"
                    step="0.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesai Katsayısı
                  </label>
                  <select
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1.5">1.5x (Normal Mesai)</option>
                    <option value="2">2x (Hafta Sonu/Tatil)</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-gray-600 mb-1">Toplam Kazanç:</div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateEarnings().toLocaleString('tr-TR')} ₺
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!selectedJob || !dailyRate}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Entry Modal
export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSave, 
  currentMonth, 
  currentYear 
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  
  const formatDate = (date) => {
    return `${date} ${TURKISH_MONTHS[currentMonth]} ${currentYear}`;
  };
  
  const handleSave = () => {
    const paymentData = {
      amount: parseFloat(paymentAmount),
      note: paymentNote,
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    };
    
    onSave(selectedDate, paymentData);
    onClose();
    setPaymentAmount('');
    setPaymentNote('');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {formatDate(selectedDate)} - Ödeme Kaydı
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ödeme Tutarı (₺)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Örn: 5000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Not (Opsiyonel)
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Ödeme notu..."
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!paymentAmount}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Management Modal
export const JobManagementModal = ({ 
  isOpen, 
  onClose, 
  jobs, 
  onSaveJob, 
  onDeleteJob 
}) => {
  const [jobName, setJobName] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const handleSave = () => {
    if (!jobName || !dailyRate) return;
    
    const jobData = {
      id: isEditing ? editingId : Date.now(),
      name: jobName,
      dailyRate: parseFloat(dailyRate)
    };
    
    onSaveJob(jobData);
    resetForm();
  };
  
  const handleEdit = (job) => {
    setJobName(job.name);
    setDailyRate(job.dailyRate.toString());
    setIsEditing(true);
    setEditingId(job.id);
  };
  
  const resetForm = () => {
    setJobName('');
    setDailyRate('');
    setIsEditing(false);
    setEditingId(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">İş Yönetimi</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">
                {isEditing ? 'İş Düzenle' : 'Yeni İş Ekle'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İş Adı
                  </label>
                  <input
                    type="text"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: İnşaat İşçisi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Ücret (₺)
                  </label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: 500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={!jobName || !dailyRate}
                  >
                    {isEditing ? 'Güncelle' : 'Ekle'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Mevcut İşler</h3>
              <div className="space-y-2">
                {jobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-gray-600">{job.dailyRate}₺/gün</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Henüz iş eklenmemiş
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Stats Component
export const SummaryStats = ({ workData, paymentData, currentMonth, currentYear }) => {
  const calculateStats = () => {
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    let totalEarnings = 0;
    let totalPayments = 0;
    let workDays = 0;
    let overtimeDays = 0;
    
    // Calculate work earnings
    Object.entries(workData).forEach(([date, work]) => {
      if (date.startsWith(currentMonthKey)) {
        totalEarnings += work.totalEarnings || 0;
        workDays++;
        if (work.isOvertime) overtimeDays++;
      }
    });
    
    // Calculate payments
    Object.entries(paymentData).forEach(([date, payment]) => {
      if (date.startsWith(currentMonthKey)) {
        totalPayments += payment.amount || 0;
      }
    });
    
    const remainingAmount = totalEarnings - totalPayments;
    
    return {
      totalEarnings,
      totalPayments,
      remainingAmount,
      workDays,
      overtimeDays
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm text-blue-600 font-medium">Toplam Kazanç</div>
        <div className="text-2xl font-bold text-blue-700">
          {stats.totalEarnings.toLocaleString('tr-TR')} ₺
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-sm text-green-600 font-medium">Alınan Ödeme</div>
        <div className="text-2xl font-bold text-green-700">
          {stats.totalPayments.toLocaleString('tr-TR')} ₺
        </div>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="text-sm text-orange-600 font-medium">Kalan Alacak</div>
        <div className="text-2xl font-bold text-orange-700">
          {stats.remainingAmount.toLocaleString('tr-TR')} ₺
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-sm text-purple-600 font-medium">Çalışılan Gün</div>
        <div className="text-2xl font-bold text-purple-700">
          {stats.workDays} gün
          {stats.overtimeDays > 0 && (
            <span className="text-sm font-normal"> ({stats.overtimeDays} mesai)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export { TURKISH_MONTHS };