import { useMemo, useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import { getUtilizationByDoctor } from "../utils/scheduleUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "dayjs/locale/ru";

dayjs.locale("ru");

const extractLastName = (fullName) => {
  if (!fullName) return "Unknown";
  const parts = fullName.trim().split(/\s+/);
  return parts[0];
};

const metricConfig = {
  utilization: { label: "Утилизация, %", barColor: "#268bff" },
  booked: { label: "Записи", barColor: "#10b981" }
};

export default function Dashboard() {
  const { doctors, workSlots, appointments } = useSchedule();
  const { user } = useAuth();

  const [chartMetric, setChartMetric] = useState("utilization"); // utilization | booked

  const dateFrom = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const dateTo = dayjs().format("YYYY-MM-DD");

  const utilizationByDoctor = getUtilizationByDoctor(
    doctors,
    workSlots,
    appointments,
    dateFrom,
    dateTo
  );

  const chartData = useMemo(() => {
    return utilizationByDoctor.map((doc) => ({
      name: extractLastName(doc.doctorName),
      utilization: doc.utilization,
      booked: doc.bookedSlots,
      total: doc.totalSlots
    }));
  }, [utilizationByDoctor]);

  const totalSlots = workSlots.reduce((sum, ws) => sum + ws.slots.length, 0);
  const bookedAppointments = appointments.filter((a) => a.status === "booked").length;
  const canceledAppointments = appointments.filter((a) => a.status === "canceled").length;

  const avgUtilization =
    utilizationByDoctor.length > 0
      ? Math.round(
          utilizationByDoctor.reduce((sum, d) => sum + d.utilization, 0) /
            utilizationByDoctor.length
        )
      : 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  const roleText =
    user?.role === "admin"
      ? "Администратор"
      : user?.role === "doctor"
      ? "Врач"
      : user?.role === "registrar"
      ? "Регистратор"
      : user?.role;

  const topDoctors = useMemo(() => {
    return utilizationByDoctor
      .slice()
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 3);
  }, [utilizationByDoctor]);

  const metric = metricConfig[chartMetric];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel-soft p-6 border border-white/60">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {greeting}, {user?.name}! 👋
            </h1>

            <p className="text-slate-600 mt-2">
              Вы вошли как{" "}
              <span className="font-semibold text-primary-700">{roleText}</span>
            </p>

            <p className="text-sm text-slate-500 mt-1">
              {dayjs().format("dddd, DD MMMM YYYY")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/60 text-sm font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-success-500" />
              Система активна
            </span>
          </div>
        </div>
      </div>

      {/* KPI cards — equal height */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="card h-full border border-slate-200 bg-white/70 backdrop-blur hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Всего слотов</p>
              <p className="text-3xl font-bold text-slate-900 mt-3">{totalSlots}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 grid place-items-center text-2xl">
              📅
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Общее количество в системе</p>
        </div>

        <div className="card h-full border border-slate-200 bg-white/70 backdrop-blur hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Активные записи</p>
              <p className="text-3xl font-bold text-success-700 mt-3">{bookedAppointments}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success-50 border border-success-200 grid place-items-center text-2xl">
              📝
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Статус: записан</p>
        </div>

        <div className="card h-full border border-slate-200 bg-white/70 backdrop-blur hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Средняя утилизация</p>
              <p className="text-3xl font-bold text-primary-800 mt-3">{avgUtilization}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 grid place-items-center text-2xl">
              📊
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">За последние 7 дней</p>
        </div>

        <div className="card h-full border border-slate-200 bg-white/70 backdrop-blur hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Отмены</p>
              <p className="text-3xl font-bold text-danger-700 mt-3">{canceledAppointments}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-danger-50 border border-danger-200 grid place-items-center text-2xl">
              🚫
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Статус: отменено</p>
        </div>
      </div>

      {/* Main: equal-height columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Chart (left) */}
        <section className="lg:col-span-8">
          <div className="card h-full border border-slate-200 bg-white/70 backdrop-blur flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">📈 Показатели по врачам</h3>
                <p className="text-sm text-slate-600 mt-1">Период: последние 7 дней</p>
              </div>

              <div className="panel-soft p-2 border border-white/60 inline-flex gap-2">
                <button
                  type="button"
                  onClick={() => setChartMetric("utilization")}
                  className={[
                    "px-4 py-2 font-semibold transition-all rounded-full",
                    chartMetric === "utilization"
                      ? "bg-primary-600 text-white"
                      : "bg-white/60 text-slate-700 hover:bg-white"
                  ].join(" ")}
                >
                  Утилизация %
                </button>

                <button
                  type="button"
                  onClick={() => setChartMetric("booked")}
                  className={[
                    "px-4 py-2 font-semibold transition-all rounded-full",
                    chartMetric === "booked"
                      ? "bg-primary-600 text-white"
                      : "bg-white/60 text-slate-700 hover:bg-white"
                  ].join(" ")}
                >
                  Записи
                </button>
              </div>
            </div>

            {/* Make chart area consume remaining height to match right column */}
            <div className="flex-1 min-h-[380px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      type="category"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: "#475569", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.96)",
                        border: "1px solid rgba(226,232,240,1)",
                        borderRadius: "18px",
                        boxShadow: "0 12px 40px rgba(2,6,23,0.10)"
                      }}
                      cursor={{ fill: "rgba(2,6,23,0.04)" }}
                      formatter={(value) => value}
                    />
                    <Legend />
                    <Bar
                      dataKey={chartMetric}
                      fill={metric.barColor}
                      name={metric.label}
                      radius={[14, 14, 0, 0]}
                      isAnimationActive
                      animationDuration={600}
                    />
                    <Bar
                      dataKey={chartMetric === "utilization" ? "booked" : "utilization"}
                      fill={chartMetric === "utilization" ? "#10b981" : "#268bff"}
                      name={chartMetric === "utilization" ? "Записи" : "Утилизация, %"}
                      radius={[14, 14, 0, 0]}
                      isAnimationActive
                      animationDuration={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-slate-600">
                  <div>
                    <p className="text-lg">📭 Нет данных для отображения</p>
                    <p className="text-sm mt-2">Создайте расписание, чтобы увидеть график</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top doctors (right) */}
        <aside className="lg:col-span-4">
          <div className="card h-full border border-slate-200 bg-white/70 backdrop-blur flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">🏆 Лучшие врачи</h3>
              <p className="text-sm text-slate-600 mt-1">По утилизации (7 дней)</p>
            </div>

            {/* Stretch list to keep visual balance; cards stay compact */}
            <div className="flex-1">
              {topDoctors.length > 0 ? (
                <div className="space-y-3">
                  {topDoctors.map((doc, idx) => {
                    const color =
                      doc.utilization >= 80
                        ? "bg-success-500"
                        : doc.utilization >= 60
                        ? "bg-warning-500"
                        : "bg-danger-500";

                    const textColor =
                      doc.utilization >= 80
                        ? "text-success-700"
                        : doc.utilization >= 60
                        ? "text-warning-700"
                        : "text-danger-700";

                    return (
                      <div
                        key={doc.doctorId}
                        className="p-4 border border-slate-200 rounded-[28px] bg-white/70 backdrop-blur hover:bg-white transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {doc.doctorName}
                              </p>
                              <p className="text-sm text-slate-600 truncate">{doc.specialty}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={["text-xl font-bold", textColor].join(" ")}>
                              {doc.utilization}%
                            </p>
                            <p className="text-[11px] text-slate-600">
                              {doc.bookedSlots}/{doc.totalSlots}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full transition-[width] duration-700 ease-out`}
                              style={{ width: `${Math.min(100, Math.max(0, doc.utilization))}%` }}
                              title={`${doc.utilization}%`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-slate-600">
                  <p className="py-8">📭 Нет данных</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* System Info */}
      <div className="panel-soft p-6 border border-white/60">
        <h3 className="text-lg font-bold text-slate-900 mb-4">ℹ️ Информация о системе</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="card border border-slate-200 bg-white/70 backdrop-blur p-5 hover:shadow-sm">
            <p className="text-slate-600">👥 Врачей в системе</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{doctors.length}</p>
          </div>

          <div className="card border border-slate-200 bg-white/70 backdrop-blur p-5 hover:shadow-sm">
            <p className="text-slate-600">📅 Расписаний создано</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{workSlots.length}</p>
          </div>

          <div className="card border border-slate-200 bg-white/70 backdrop-blur p-5 hover:shadow-sm">
            <p className="text-slate-600">📝 Всего записей</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}