import { useMemo, useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useToast } from "../hooks/useToast";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function DoctorManagement() {
  const { doctors, workSlots, generateSchedule } = useSchedule();
  const { success, error, warning } = useToast();

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    startTime: "08:00",
    endTime: "16:00",
    slotMinutes: 30,
    breakStart: "12:00",
    breakEnd: "13:00"
  });

  const doctorSchedules = useMemo(() => {
    return workSlots.filter((ws) => String(ws.doctorId) === String(selectedDoctorId));
  }, [workSlots, selectedDoctorId]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => String(d.id) === String(selectedDoctorId));
  }, [doctors, selectedDoctorId]);

  const hasScheduleOnDate = useMemo(() => {
    return doctorSchedules.some((ws) => ws.date === formData.date);
  }, [doctorSchedules, formData.date]);

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      warning("Выберите врача");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = generateSchedule(
      selectedDoctorId,
      formData.date,
      formData.startTime,
      formData.endTime,
      parseInt(formData.slotMinutes, 10),
      formData.breakStart,
      formData.breakEnd
    );

    setIsLoading(false);

    if (result.success) {
      success(
        `✅ Создано ${result.slotCount} слотов на ${dayjs(formData.date).format("DD.MM.YYYY")}`
      );

      setFormData({
        date: dayjs().format("YYYY-MM-DD"),
        startTime: "08:00",
        endTime: "16:00",
        slotMinutes: 30,
        breakStart: "12:00",
        breakEnd: "13:00"
      });
    } else {
      error(`❌ ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">👨‍⚕️ Управление врачами</h1>
        <p className="page-subtitle">Настройка расписания и интервалов приёма</p>
      </div>

      <div className="card">
        <h3 className="card-header">👥 Врачи клиники</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doctor) => {
            const doctorHasSchedule = workSlots.some(
              (ws) => String(ws.doctorId) === String(doctor.id)
            );

            const isSelected = String(selectedDoctorId) === String(doctor.id);

            return (
              <button
                key={doctor.id}
                type="button"
                onClick={() => setSelectedDoctorId(doctor.id)}
                className={[
                  "p-5 rounded-3xl border text-left transition-all",
                  isSelected
                    ? "border-primary-300 bg-primary-50/60 shadow-md"
                    : "border-slate-200 hover:border-primary-200 hover:bg-slate-50"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{doctor.fio}</p>
                    <p className="text-sm text-slate-600 mt-1">🏥 {doctor.specialty}</p>
                    <p className="text-sm text-slate-600">🚪 Кабинет {doctor.cabinet}</p>
                  </div>

                  {doctorHasSchedule && (
                    <span className="px-3 py-1 bg-success-50 text-success-800 text-xs rounded-full font-bold border border-success-200">
                      ✓ Есть расписание
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDoctor && doctorSchedules.length > 0 && (
        <div className="panel-soft p-6 border border-white/60">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📅 Существующее расписание</h3>

          <div className="space-y-2">
            {doctorSchedules.map((schedule, idx) => (
              <div
                key={idx}
                className="p-4 bg-white/70 backdrop-blur rounded-3xl border border-white/60 hover:bg-white transition-colors"
              >
                <p className="font-semibold text-slate-900">
                  {dayjs(schedule.date).format("DD.MM.YYYY (ddd)")}
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  ⏰ {schedule.startTime} — {schedule.endTime} ({schedule.slotMinutes} мин)
                </p>

                <p className="text-sm text-slate-600">
                  ☕ Перерыв: {schedule.breakStart} — {schedule.breakEnd}
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  📊 Слотов:{" "}
                  <span className="font-semibold text-slate-900">
                    {schedule.slots.length}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-header">➕ Создать расписание</h3>

        {hasScheduleOnDate && (
          <div className="p-4 mb-6 bg-warning-50 border border-warning-200 rounded-3xl text-warning-900">
            <p className="font-semibold">
              ⚠️ На дату {dayjs(formData.date).format("DD.MM.YYYY")} уже существует расписание для выбранного врача.
            </p>
            <p className="text-sm mt-1 text-warning-800">
              Выберите другую дату или удалите существующее расписание.
            </p>
          </div>
        )}

        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📅 Дата
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
              {hasScheduleOnDate && (
                <p className="text-xs text-danger-700 mt-1 font-semibold">
                  ⚠️ На эту дату уже есть расписание
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ⏱️ Длительность слота (минут)
              </label>
              <select
                value={formData.slotMinutes}
                onChange={(e) => setFormData({ ...formData, slotMinutes: e.target.value })}
                className="input-field"
              >
                <option value="15">15 минут</option>
                <option value="20">20 минут</option>
                <option value="30">30 минут</option>
                <option value="60">60 минут</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                🏢 Начало работы
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                🚪 Конец работы
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div />
          </div>

          <div className="bg-warning-50 border border-warning-200 rounded-3xl p-4">
            <p className="text-sm font-semibold text-warning-900 mb-3">☕ Обеденный перерыв</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Начало
                </label>
                <input
                  type="time"
                  value={formData.breakStart}
                  onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Конец
                </label>
                <input
                  type="time"
                  value={formData.breakEnd}
                  onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={[
              "w-full py-3 text-base font-semibold transition-all rounded-2xl",
              hasScheduleOnDate || isLoading
                ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                : "btn-primary"
            ].join(" ")}
            disabled={hasScheduleOnDate || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Создаём расписание...
              </span>
            ) : hasScheduleOnDate ? (
              "❌ Нельзя создать (уже есть расписание)"
            ) : (
              "✅ Создать расписание"
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 font-semibold">👥 Всего врачей</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{doctors.length}</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-600 font-semibold">📅 Расписаний создано</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{workSlots.length}</p>
        </div>
      </div>
    </div>
  );
}