import { useMemo, useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import dayjs from "dayjs";
import { getUtilizationByDoctor, getUtilizationByDate } from "../utils/scheduleUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import "dayjs/locale/ru";

dayjs.locale("ru");

const extractLastName = (fullName) => {
  if (!fullName) return "Unknown";
  const parts = fullName.trim().split(/\s+/);
  return parts[0];
};

export default function Reports() {
  const { doctors, workSlots, appointments } = useSchedule();

  const [reportType, setReportType] = useState("by-doctor");
  const [dateFrom, setDateFrom] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  if (!doctors || !workSlots || !appointments) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-600">Загрузка данных...</p>
      </div>
    );
  }

  const utilizationByDoctor = getUtilizationByDoctor(
    doctors,
    workSlots,
    appointments,
    dateFrom,
    dateTo
  );

  const utilizationByDate = getUtilizationByDate(workSlots, appointments, dateFrom, dateTo);

  const filteredDoctors = useMemo(() => {
    return selectedSpecialty === "all"
      ? utilizationByDoctor
      : utilizationByDoctor.filter((d) => d.specialty === selectedSpecialty);
  }, [utilizationByDoctor, selectedSpecialty]);

  const uniqueSpecialties = useMemo(() => {
    return [...new Set(doctors.map((d) => d.specialty))];
  }, [doctors]);

  const chartDataByDoctor = useMemo(() => {
    return filteredDoctors.map((doc, index) => ({
      key: `${doc.doctorId}-${index}`,
      name: extractLastName(doc.doctorName),
      fullName: doc.doctorName,
      utilization: doc.utilization,
      booked: doc.bookedSlots,
      total: doc.totalSlots,
      specialty: doc.specialty
    }));
  }, [filteredDoctors]);

  const chartDataByDate = useMemo(() => {
    return utilizationByDate.map((d) => ({
      date: dayjs(d.date).format("DD.MM"),
      utilization: d.utilization,
      booked: d.bookedSlots,
      total: d.totalSlots
    }));
  }, [utilizationByDate]);

  const handleExportCSV = () => {
    let csv = "Врач,Специальность,Слотов всего,Записей,Отмены,Завершено,Утилизация %\n";

    filteredDoctors.forEach((doc) => {
      csv += `"${doc.doctorName}","${doc.specialty}",${doc.totalSlots},${doc.bookedSlots},${doc.canceledSlots},${doc.completedSlots},${doc.utilization}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    // eslint-disable-next-line no-undef
    if (navigator.msSaveBlob) {
      // eslint-disable-next-line no-undef
      navigator.msSaveBlob(blob, `report_${dateFrom}_${dateTo}.csv`);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = `report_${dateFrom}_${dateTo}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const tableRows = reportType === "by-doctor" ? filteredDoctors : utilizationByDate;
  const hasChartData =
    (reportType === "by-doctor" ? chartDataByDoctor : chartDataByDate).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">📊 Отчёты и аналитика</h1>
        <p className="page-subtitle">Анализ утилизации расписания и загрузки врачей</p>
      </div>

      <div className="panel-soft p-6 border border-white/60">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Фильтры отчёта</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Тип отчёта
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="by-doctor">По врачам</option>
              <option value="by-date">По датам</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              С даты
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              По дату
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field"
            />
          </div>

          {reportType === "by-doctor" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Специальность
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="input-field"
              >
                <option value="all">Все специальности</option>
                {uniqueSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="button" onClick={handleExportCSV} className="mt-4 btn-primary">
          📥 Экспортировать CSV
        </button>
      </div>

      <div className="card">
        <h3 className="card-header">
          {reportType === "by-doctor" ? "📈 Утилизация по врачам" : "📈 Утилизация по датам"}
        </h3>

        {hasChartData ? (
          <ResponsiveContainer width="100%" height={400}>
            {reportType === "by-doctor" ? (
              <BarChart data={chartDataByDoctor} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" type="category" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid rgba(226,232,240,1)",
                    borderRadius: "12px"
                  }}
                  cursor={{ fill: "rgba(2,6,23,0.04)" }}
                  formatter={(value) => value}
                  labelFormatter={(label) => `Фамилия: ${label}`}
                />
                <Legend />
                <Bar dataKey="utilization" fill="#268bff" name="Утилизация %" radius={[10, 10, 0, 0]} />
                <Bar dataKey="booked" fill="#10b981" name="Записей" radius={[10, 10, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartDataByDate} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid rgba(226,232,240,1)",
                    borderRadius: "12px"
                  }}
                  formatter={(value) => value}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke="#268bff"
                  strokeWidth={2}
                  name="Утилизация %"
                  dot={{ fill: "#268bff", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-600">
            <p>Нет данных для отображения графика</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-header">📋 Детали отчёта</h3>

        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {reportType === "by-doctor" ? (
                    <>
                      <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                        ФИО врача
                      </th>
                      <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                        Специальность
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                        Дата
                      </th>
                      <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                        День недели
                      </th>
                    </>
                  )}

                  <th className="text-center py-3 px-4 text-slate-700 font-semibold">Слотов</th>
                  <th className="text-center py-3 px-4 text-slate-700 font-semibold">Записей</th>

                  {reportType === "by-doctor" && (
                    <>
                      <th className="text-center py-3 px-4 text-slate-700 font-semibold">
                        Отменено
                      </th>
                      <th className="text-center py-3 px-4 text-slate-700 font-semibold">
                        Завершено
                      </th>
                    </>
                  )}

                  <th className="text-center py-3 px-4 text-slate-700 font-semibold">
                    Утилизация
                  </th>
                </tr>
              </thead>

              <tbody>
                {reportType === "by-doctor"
                  ? filteredDoctors.map((doc) => (
                      <tr
                        key={doc.doctorId}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {doc.doctorName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{doc.specialty}</td>
                        <td className="py-3 px-4 text-center text-slate-900 font-semibold">
                          {doc.totalSlots}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-900 font-semibold">
                          {doc.bookedSlots}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {doc.canceledSlots}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {doc.completedSlots}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={[
                              "inline-block px-3 py-1 rounded-full text-sm font-semibold border",
                              doc.utilization >= 80
                                ? "bg-success-50 text-success-800 border-success-200"
                                : doc.utilization >= 60
                                ? "bg-warning-50 text-warning-800 border-warning-200"
                                : "bg-danger-50 text-danger-800 border-danger-200"
                            ].join(" ")}
                          >
                            {doc.utilization}%
                          </span>
                        </td>
                      </tr>
                    ))
                  : utilizationByDate.map((d) => (
                      <tr
                        key={d.date}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {d.date}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{d.dayName}</td>
                        <td className="py-3 px-4 text-center text-slate-900 font-semibold">
                          {d.totalSlots}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-900 font-semibold">
                          {d.bookedSlots}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={[
                              "inline-block px-3 py-1 rounded-full text-sm font-semibold border",
                              d.utilization >= 80
                                ? "bg-success-50 text-success-800 border-success-200"
                                : d.utilization >= 60
                                ? "bg-warning-50 text-warning-800 border-warning-200"
                                : "bg-danger-50 text-danger-800 border-danger-200"
                            ].join(" ")}
                          >
                            {d.utilization}%
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-600">
            <p>📭 Нет данных для отображения в таблице</p>
            <p className="text-sm mt-2">Создайте расписание и записи, чтобы увидеть отчёт</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 font-semibold">📊 Всего слотов</p>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {workSlots.reduce((sum, ws) => sum + ws.slots.length, 0)}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-600 font-semibold">✅ Записей</p>
          <p className="text-3xl font-bold text-success-700 mt-3">
            {appointments.filter((a) => a.status === "booked").length}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-600 font-semibold">📈 Средняя утилизация</p>
          <p className="text-3xl font-bold text-primary-800 mt-3">
            {utilizationByDoctor.length > 0
              ? Math.round(
                  utilizationByDoctor.reduce((sum, d) => sum + d.utilization, 0) /
                    utilizationByDoctor.length
                )
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
}