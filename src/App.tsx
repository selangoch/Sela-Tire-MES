import React, { useState, useMemo, useEffect } from 'react';
import { FilterState, Language, UFMachineData } from './types';
import { machinesList } from './data/initialData';
import { authService, UserSession } from './services/authService';
import { mesDataService } from './services/mesDataService';
import { accessLogService, UserAccessLog } from './services/accessLogService';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { DataTable } from './components/DataTable';
import { ChartSection } from './components/ChartSection';
import { DataEntryModal } from './components/DataEntryModal';
import { KpiEntryModal } from './components/KpiEntryModal';
import { Cycle26Modal } from './components/Cycle26Modal';
import { OEEDashboard } from './components/OEEDashboard';
import { UserSettingsModal } from './components/UserSettingsModal';
import { UserAccessLogModal } from './components/UserAccessLogModal';
import { StatusBar } from './components/StatusBar';
import { getCycle26Range, aggregateCycleData } from './utils/cycleUtils';
import { getTodayDateString, formatDateToString } from './utils/dateUtils';
import * as XLSX from 'xlsx';
import { CheckCircle2, Cloud } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return authService.getCurrentSession();
  });

  // App UI State
  const [currentLang, setCurrentLang] = useState<Language>('zh');
  const [machines] = useState(machinesList);
  const [activeTab, setActiveTab] = useState<'output' | 'oee'>('output');

  // Filters (defaults to current login/today date)
  const [filters, setFilters] = useState<FilterState>(() => {
    const defaultDate = currentUser?.loginTime
      ? formatDateToString(currentUser.loginTime)
      : getTodayDateString();
    return {
      date: defaultDate,
      workshop: '5#车间',
      shift: 'all',
      machineId: 'Pto2',
    };
  });

  // Target per shift & UI settings (1200–1250 PCR = 100%)
  const [targetPerShift, setTargetPerShift] = useState<number>(1200);
  const [showBrowserBar, setShowBrowserBar] = useState<boolean>(true);
  const [movingAverageVal, setMovingAverageVal] = useState<string>('5#MES动均  172.16');

  // Modals & Selection
  const [selectedMachine, setSelectedMachine] = useState<UFMachineData | null>(null);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState<boolean>(false);
  const [isKpiEntryOpen, setIsKpiEntryOpen] = useState<boolean>(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAccessLogsOpen, setIsAccessLogsOpen] = useState<boolean>(false);
  const [accessLogs, setAccessLogs] = useState<UserAccessLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if active user is Admin
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.userId === '733445';

  // Real-time access logs subscription for Admin
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const unsubscribe = accessLogService.subscribeToAccessLogs((logs) => {
      setAccessLogs(logs);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, isAdmin]);

  // Periodic heartbeat activity update & exit tracking
  useEffect(() => {
    if (!currentUser) return;

    // Send initial active heartbeat
    accessLogService.updateHeartbeat('ពិនិត្យផ្ទាំងផលិតកម្ម MES');

    // Heartbeat every 45s
    const interval = setInterval(() => {
      accessLogService.updateHeartbeat();
    }, 45000);

    const handleBeforeUnload = () => {
      accessLogService.recordLogout();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  // Online active devices count
  const activeOnlineCount = useMemo(() => {
    return accessLogs.filter((l) => l.status === 'online').length || 1;
  }, [accessLogs]);

  // UF Machine Data state synchronized across Table & Chart
  const [ufDataState, setUfDataState] = useState<UFMachineData[]>(() => {
    const userId = currentUser?.userId || '733445';
    const initialDate = currentUser?.loginTime
      ? formatDateToString(currentUser.loginTime)
      : getTodayDateString();
    return mesDataService.getInitialMachines(userId, initialDate);
  });

  // 26th-to-26th Cycle Range derived from current filter date
  const cycleRange = useMemo(() => {
    return getCycle26Range(filters.date);
  }, [filters.date]);

  // Multi-date map stored for cycle calculations
  const [cycleDataMap, setCycleDataMap] = useState<Record<string, UFMachineData[]>>({});

  // Real-time Firestore subscription for Current Date
  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const userId = currentUser.userId || '733445';

    // Subscribe to Firestore changes in real-time
    const unsubscribe = mesDataService.subscribeToUFMachineData(
      userId,
      filters.date,
      (updatedData) => {
        setUfDataState(updatedData);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [filters.date, currentUser]);

  // Real-time Firestore subscription for 26th-to-26th Cycle records
  useEffect(() => {
    if (!currentUser) return;
    const userId = currentUser.userId || '733445';

    const unsubscribe = mesDataService.subscribeToCycleData(
      userId,
      cycleRange,
      (dataMap) => {
        setCycleDataMap(dataMap);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [cycleRange, currentUser]);

  // Compute aggregated 26th-to-26th Cycle Summary Data
  const cycleSummaryData = useMemo(() => {
    return aggregateCycleData(cycleRange, cycleDataMap, ufDataState, filters.date);
  }, [cycleRange, cycleDataMap, ufDataState, filters.date]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Handlers
  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    const loginDate = session.loginTime ? formatDateToString(session.loginTime) : getTodayDateString();
    setFilters((prev) => ({ ...prev, date: loginDate }));
    showToast(
      currentLang === 'km'
        ? `បានចូលគណនីជោគជ័យ! កាលបរិច្ឆេទថ្ងៃនេះ៖ ${loginDate}`
        : currentLang === 'en'
        ? `Login successful! Switched to today (${loginDate})`
        : `登录成功！已自动切换至今日日期 (${loginDate})`
    );
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsDataEntryOpen(false);
    setIsSettingsOpen(false);
    showToast('已成功退出 MES 系统');
  };

  // Filter Change
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Query Data Button
  const handleQuery = () => {
    setIsLoading(true);
    if (currentUser) {
      // Trigger snapshot refresh or notify user
      setTimeout(() => {
        setIsLoading(false);
        showToast('已从云端数据库获取最新生产数据');
      }, 300);
    }
  };

  // Save 15 machine records for date to Central Cloud Database
  const handleSaveUFData = async (dateStr: string, updatedList: UFMachineData[]) => {
    const userId = currentUser?.userId || '733445';
    try {
      await mesDataService.saveUFMachineDataForDate(dateStr, updatedList, userId);
      showToast('UF1–UF15 生产数据已同步更新至云端数据库！');
    } catch (e) {
      console.error(e);
      showToast('保存至云端失败，已保存至本地');
    }
  };

  // Update single cell inline in Cloud Database
  const handleUpdateUFCell = async (machineCode: string, shift: 'day' | 'night', val: number) => {
    const userId = currentUser?.userId || '733445';
    try {
      await mesDataService.updateSingleMachineCell(
        filters.date,
        machineCode,
        shift,
        val,
        ufDataState,
        userId
      );
      showToast(`${machineCode} ${shift === 'day' ? '早班' : '夜班'} 产量已实时同步至云端！`);
    } catch (e) {
      console.error(e);
      showToast('更新失败');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const exportRows = ufDataState.map((item) => {
        const machineTotal = item.day_shift + item.night_shift;
        const targetTotal = (item.target || targetPerShift) * 2;
        const pct = targetTotal > 0 ? Math.round((machineTotal / targetTotal) * 100) : 0;

        return {
          '用户ID (User ID)': currentUser?.userId || '733445',
          '日期 (Date)': filters.date,
          '机台编号 (Code)': item.machineCode,
          '机台名称 (Machine)': item.machineName,
          '早班产量 (Day Shift)': item.day_shift,
          '夜班产量 (Night Shift)': item.night_shift,
          '机台总产量 (Machine Total)': machineTotal,
          '班次目标 (Target/Shift)': item.target || targetPerShift,
          '达标率 (Achievement %)': `${pct}%`,
          'KPI Dollar Value ($)': `$${(item.kpi_usd ?? 0).toFixed(2)}`,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'UF1-UF15机台产量');

      XLSX.writeFile(
        workbook,
        `Sela_Tire_MES_UF_Production_${currentUser?.userId}_${filters.date}.xlsx`
      );
      showToast('Excel 导出成功！');
    } catch (err) {
      console.error(err);
      showToast('导出 Excel 失败');
    }
  };

  // Summary Statistics derived directly from 15 UF machines
  const summaryStats = useMemo(() => {
    let totalDay = 0;
    let totalNight = 0;
    let targetAchievedCount = 0;
    let maxMachine = { code: 'UF1', name: 'UF-DB-01', val: 0 };

    ufDataState.forEach((d) => {
      const dayVal = d.day_shift || 0;
      const nightVal = d.night_shift || 0;
      totalDay += dayVal;
      totalNight += nightVal;

      const machineTotal = dayVal + nightVal;
      if (machineTotal > maxMachine.val) {
        maxMachine = { code: d.machineCode, name: d.machineName, val: machineTotal };
      }

      const totalTarget = (d.target || targetPerShift) * 2;
      if (machineTotal >= totalTarget) {
        targetAchievedCount++;
      }
    });

    const totalCombined = totalDay + totalNight;
    const count = ufDataState.length || 15;

    return {
      totalDay,
      totalNight,
      totalCombined,
      avgMachine: Math.round(totalCombined / count),
      targetAchievedCount,
      maxMachine,
    };
  }, [ufDataState, targetPerShift]);

  const currentMachine = machines.find((m) => m.id === filters.machineId) || machines[0];

  // Protect MES Dashboard: Require authenticated user session
  if (!currentUser) {
    return (
      <LoginPage
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#e8e9ec] flex flex-col font-sans select-none text-slate-800">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-3 right-3 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-md shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAccessLogs={isAdmin ? () => setIsAccessLogsOpen(true) : undefined}
        activeOnlineCount={activeOnlineCount}
        currentMachineName={`${currentMachine.id}机每日产量`}
        showBrowserBar={showBrowserBar}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Query Toolbar */}
      <Toolbar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onQuery={handleQuery}
        onExportExcel={handleExportExcel}
        onOpenDataEntry={() => setIsDataEntryOpen(true)}
        onOpenKpiEntry={() => setIsKpiEntryOpen(true)}
        onOpenCycleModal={() => setIsCycleModalOpen(true)}
        onOpenAccessLogs={isAdmin ? () => setIsAccessLogsOpen(true) : undefined}
        cycleRange={cycleRange}
        machines={machines}
        currentLang={currentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-white flex flex-col">
        {activeTab === 'output' ? (
          <>
            {/* Top Table Area */}
            <div className="w-full">
              <DataTable
                data={ufDataState}
                shiftFilter={filters.shift}
                currentLang={currentLang}
                onSelectMachine={(m) => setSelectedMachine(m)}
                selectedMachineCode={selectedMachine?.machineCode}
                stats={summaryStats}
                onOpenEditModal={() => setIsDataEntryOpen(true)}
                isAdmin={true}
                onUpdateCell={handleUpdateUFCell}
                targetPerShift={targetPerShift}
                cycleData={cycleSummaryData}
                onOpenCycleModal={() => setIsCycleModalOpen(true)}
              />
            </div>

            {/* Bottom Bar Chart Area */}
            <div className="w-full border-t border-slate-200 bg-white">
              <ChartSection
                data={ufDataState}
                shiftFilter={filters.shift}
                currentLang={currentLang}
                onSelectMachine={(m) => setSelectedMachine(m)}
                selectedMachineCode={selectedMachine?.machineCode}
                targetPerShift={targetPerShift}
              />
            </div>
          </>
        ) : (
          <OEEDashboard
            machines={machines}
            currentLang={currentLang}
            selectedMachineId={filters.machineId}
            onSelectMachine={(id) => handleFilterChange('machineId', id)}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <StatusBar
        currentLang={currentLang}
        adminStatusText="admine:shitou"
        cornerTagText={movingAverageVal}
      />

      {/* 26th-to-26th Cycle Summary Modal */}
      {isCycleModalOpen && (
        <Cycle26Modal
          onClose={() => setIsCycleModalOpen(false)}
          cycleData={cycleSummaryData}
          currentLang={currentLang}
          userId={currentUser?.userId || '733445'}
        />
      )}

      {/* Data Entry Modal */}
      {isDataEntryOpen && (
        <DataEntryModal
          onClose={() => setIsDataEntryOpen(false)}
          onSaveData={handleSaveUFData}
          currentLang={currentLang}
          currentDate={filters.date}
          existingUFData={ufDataState}
        />
      )}

      {/* KPI Entry Modal */}
      {isKpiEntryOpen && (
        <KpiEntryModal
          onClose={() => setIsKpiEntryOpen(false)}
          onSaveKpiData={handleSaveUFData}
          currentLang={currentLang}
          currentDate={filters.date}
          existingUFData={ufDataState}
        />
      )}

      {/* User Settings Modal */}
      {isSettingsOpen && (
        <UserSettingsModal
          onClose={() => setIsSettingsOpen(false)}
          targetPerShift={targetPerShift}
          onUpdateTarget={setTargetPerShift}
          showBrowserBar={showBrowserBar}
          onToggleBrowserBar={setShowBrowserBar}
          movingAverageVal={movingAverageVal}
          onUpdateMovingAverage={setMovingAverageVal}
          currentLang={currentLang}
        />
      )}

      {/* Admin Only: User Access & Device/Phone Model Tracking Modal */}
      {isAccessLogsOpen && isAdmin && (
        <UserAccessLogModal
          onClose={() => setIsAccessLogsOpen(false)}
          logs={accessLogs}
          currentLang={currentLang}
          onRefresh={() => {
            accessLogService.subscribeToAccessLogs((logs) => setAccessLogs(logs));
            showToast(
              currentLang === 'km'
                ? 'បានទាញយកទិន្នន័យអ្នកចូលប្រើប្រាស់ចុងក្រោយ'
                : currentLang === 'en'
                ? 'User access logs refreshed from cloud'
                : '已获取最新用户访问记录'
            );
          }}
        />
      )}
    </div>
  );
}
