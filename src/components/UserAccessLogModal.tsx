import React, { useState, useMemo } from 'react';
import { UserAccessLog } from '../services/accessLogService';
import { Language } from '../types';
import {
  ShieldAlert,
  Smartphone,
  Laptop,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Search,
  RefreshCw,
  Download,
  X,
  Activity,
  ShieldCheck,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface UserAccessLogModalProps {
  onClose: () => void;
  logs: UserAccessLog[];
  currentLang: Language;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const UserAccessLogModal: React.FC<UserAccessLogModalProps> = ({
  onClose,
  logs,
  currentLang,
  onRefresh,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop'>('all');

  // Filter logs according to search and status
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.userName?.toLowerCase().includes(q) ||
        log.userId?.toLowerCase().includes(q) ||
        log.deviceInfo?.phoneModel?.toLowerCase().includes(q) ||
        log.deviceInfo?.brand?.toLowerCase().includes(q) ||
        log.deviceInfo?.os?.toLowerCase().includes(q) ||
        log.lastAction?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'online' && log.status === 'online') ||
        (statusFilter === 'offline' && log.status !== 'online');

      const matchDevice =
        deviceFilter === 'all' ||
        (deviceFilter === 'mobile' && (log.deviceInfo?.deviceType === 'mobile' || log.deviceInfo?.deviceType === 'tablet')) ||
        (deviceFilter === 'desktop' && log.deviceInfo?.deviceType === 'desktop');

      return matchSearch && matchStatus && matchDevice;
    });
  }, [logs, searchTerm, statusFilter, deviceFilter]);

  // Key Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const online = logs.filter((l) => l.status === 'online').length;
    const mobileCount = logs.filter(
      (l) => l.deviceInfo?.deviceType === 'mobile' || l.deviceInfo?.deviceType === 'tablet'
    ).length;
    const pcCount = logs.filter((l) => l.deviceInfo?.deviceType === 'desktop').length;

    return { total, online, mobileCount, pcCount };
  }, [logs]);

  // Export to Excel
  const handleExport = () => {
    try {
      const rows = filteredLogs.map((log) => ({
        'User ID': log.userId,
        'ឈ្មោះអ្នកប្រើប្រាស់ (User Name)': log.userName,
        'តួនាទី (Role)': log.userRole,
        'ម៉ូដេលទូរស័ព្ទ / ឧបករណ៍ (Phone Model)': log.deviceInfo?.phoneModel || 'Unknown',
        'ប្រភេទឧបករណ៍ (Device Type)': log.deviceInfo?.deviceTypeName || 'Mobile',
        'ប្រព័ន្ធប្រតិបត្តិការ (OS)': log.deviceInfo?.os || '',
        'កម្មវិធីរុករក (Browser)': log.deviceInfo?.browser || '',
        'កម្រិតភាពច្បាស់ (Resolution)': log.deviceInfo?.screenResolution || '',
        'ពេលចូល (Login Time)': log.loginTimeString,
        'ពេលចេញ (Logout Time)': log.logoutTimeString || 'កំពុងប្រើប្រាស់ (Active Online)',
        'រយៈពេលប្រើប្រាស់ (Duration)': log.durationMinutes ? `${log.durationMinutes} នាទី` : 'កំពុងដំណើរការ',
        'ស្ថានភាព (Status)': log.status === 'online' ? 'Online (កំពុងប្រើ)' : 'Offline (បានចាកចេញ)',
        'សកម្មភាពចុងក្រោយ (Last Action)': log.lastAction || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'User_Access_Logs');
      XLSX.writeFile(workbook, `Sela_MES_User_Access_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export logs error', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-lg shadow-2xl flex flex-col border border-slate-300 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0e3a6b] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#0a2c52]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  {currentLang === 'km'
                    ? 'កំណត់ត្រា និងតាមដានអ្នកចូលប្រើប្រាស់ (Admin)'
                    : currentLang === 'en'
                    ? 'User Access & Device Tracking (Admin Only)'
                    : '用户访问及设备追踪记录 (仅管理员)'}
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {currentLang === 'km'
                  ? 'បង្ហាញឈ្មោះអ្នកប្រើប្រាស់ ម៉ូដេលទូរស័ព្ទជាក់ស្តែង ពេលចូល និងពេលចេញពីប្រព័ន្ធ MES'
                  : 'Real-time user monitoring, exact phone models, login & logout history'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Total Logins */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-500 font-medium">
                {currentLang === 'km' ? 'ចំនួនចូលសរុប' : 'Total Accesses'}
              </div>
              <div className="text-xl font-bold text-slate-800 font-mono">{stats.total}</div>
            </div>
          </div>

          {/* Active Online Devices */}
          <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="text-emerald-700 font-medium">
                {currentLang === 'km' ? 'កំពុង Online ឥឡូវនេះ' : 'Online Devices'}
              </div>
              <div className="text-xl font-bold text-emerald-600 font-mono">
                {stats.online} <span className="text-xs text-slate-400 font-normal">ឧបករណ៍</span>
              </div>
            </div>
          </div>

          {/* Mobile Phone Devices */}
          <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-indigo-700 font-medium">
                {currentLang === 'km' ? 'ស្មាតហ្វូន (Phones)' : 'Mobile Phones'}
              </div>
              <div className="text-xl font-bold text-indigo-600 font-mono">{stats.mobileCount}</div>
            </div>
          </div>

          {/* PC / Laptop Devices */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-500 font-medium">
                {currentLang === 'km' ? 'កុំព្យូទ័រ (PC)' : 'Desktop / PC'}
              </div>
              <div className="text-xl font-bold text-slate-800 font-mono">{stats.pcCount}</div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Action Buttons */}
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  currentLang === 'km'
                    ? 'ស្វែងរកតាមឈ្មោះ, ID, ម៉ូដេលទូរស័ព្ទ (iPhone, Samsung...)'
                    : 'Search user, ID, phone model...'
                }
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex rounded border border-slate-300 bg-slate-50 p-0.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ទាំងអស់ ({logs.length})
              </button>
              <button
                onClick={() => setStatusFilter('online')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'online' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online ({stats.online})
              </button>
              <button
                onClick={() => setStatusFilter('offline')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === 'offline' ? 'bg-slate-700 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ចាកចេញ (Offline)
              </button>
            </div>

            {/* Device Filter */}
            <div className="flex rounded border border-slate-300 bg-slate-50 p-0.5">
              <button
                onClick={() => setDeviceFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  deviceFilter === 'all' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                គ្រប់ឧបករណ៍
              </button>
              <button
                onClick={() => setDeviceFilter('mobile')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  deviceFilter === 'mobile' ? 'bg-indigo-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                ទូរស័ព្ទ
              </button>
              <button
                onClick={() => setDeviceFilter('desktop')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  deviceFilter === 'desktop' ? 'bg-slate-700 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3 h-3" />
                កុំព្យូទ័រ
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh access records from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{currentLang === 'km' ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{currentLang === 'km' ? 'ទាញយក Excel' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* Access Logs Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 w-28 text-center">ស្ថានភាព (Status)</th>
                  <th className="py-2.5 px-4">ឈ្មោះអ្នកប្រើប្រាស់ (User)</th>
                  <th className="py-2.5 px-4">ម៉ូដេលទូរស័ព្ទ / ឧបករណ៍ (Device & Model)</th>
                  <th className="py-2.5 px-4">ពេលចូល (Login Time)</th>
                  <th className="py-2.5 px-4">ពេលចេញ (Logout Time)</th>
                  <th className="py-2.5 px-4">រយៈពេល / សកម្មភាពចុងក្រោយ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-sans">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Smartphone className="w-8 h-8 text-slate-300" />
                        <span className="font-medium text-sm">មិនមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកទេ</span>
                        <span className="text-xs text-slate-400">No user access records matched your criteria.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => {
                    const isOnline = log.status === 'online';
                    const isMobile = log.deviceInfo?.deviceType === 'mobile' || log.deviceInfo?.deviceType === 'tablet';

                    return (
                      <tr
                        key={log.id || index}
                        className={`hover:bg-blue-50/60 transition-colors ${
                          isOnline ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Online</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Offline</span>
                            </span>
                          )}
                        </td>

                        {/* User Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                              {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{log.userName}</span>
                                {log.userRole === 'Admin' && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>ID: {log.userId}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone Model & Device Details */}
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                              {isMobile ? (
                                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                              ) : (
                                <Laptop className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              {/* Highlighted Phone Model */}
                              <span className="text-[#0e3a6b] font-semibold">
                                {log.deviceInfo?.phoneModel || 'Smartphone'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium text-[10px]">
                                {log.deviceInfo?.os || 'Mobile OS'}
                              </span>
                              <span>·</span>
                              <span>{log.deviceInfo?.browser}</span>
                              <span>·</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {log.deviceInfo?.screenResolution}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Login Time */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{log.loginTimeString}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            បានចូលប្រើប្រាស់
                          </span>
                        </td>

                        {/* Logout Time */}
                        <td className="py-3 px-4">
                          {log.logoutTimeString ? (
                            <div>
                              <div className="flex items-center gap-1.5 font-mono text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{log.logoutTimeString}</span>
                              </div>
                              <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                                បានចាកចេញពីប្រព័ន្ធ
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                កំពុងស្ថិតក្នុងប្រព័ន្ធ
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                ចុងក្រោយ: {log.lastActiveTimeString || 'ពេលនេះ'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Duration & Last Action */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 text-[11px] truncate max-w-[220px]" title={log.lastAction}>
                            {log.lastAction || 'ពិនិត្យមើលទិន្នផល'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {log.durationMinutes ? (
                              <span className="text-indigo-600 font-medium">
                                រយៈពេល: {log.durationMinutes} នាទី
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">
                                កំពុងដំណើរការ...
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {currentLang === 'km'
                ? 'ទិន្នន័យនេះត្រូវបានការពារដោយប្រព័ន្ធសុវត្ថិភាព ហើយអាចមើលឃើញតែ Admin ប៉ុណ្ណោះ។'
                : 'Secured access log. Visible strictly to system administrators.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded transition-colors cursor-pointer"
            >
              {currentLang === 'km' ? 'បិទផ្ទាំង (Close)' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
